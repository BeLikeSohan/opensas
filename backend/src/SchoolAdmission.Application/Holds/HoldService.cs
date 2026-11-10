using Microsoft.Extensions.Options;
using SchoolAdmission.Application.Abstractions;
using SchoolAdmission.Application.Classes;
using SchoolAdmission.Application.Exceptions;

namespace SchoolAdmission.Application.Holds;

internal sealed class HoldService(
    IUnitOfWork unitOfWork,
    IClassRepository classes,
    IHoldRepository holds,
    IOptions<HoldOptions> options,
    TimeProvider timeProvider) : IHoldService
{
    public async Task<HoldDto> CreateAsync(CreateHoldCommand command, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;

        await using var transaction = await unitOfWork.BeginTransactionAsync(cancellationToken);

        // Locking the class row serializes hold creation per class across every backend instance,
        // so the checks and the insert below cannot interleave with another request for this class.
        var schoolClass = await classes.GetForUpdateAsync(command.ClassId, cancellationToken)
            ?? throw new ClassNotFoundException(command.ClassId);

        // Expiry is evaluated lazily: release stale holds first, which also frees the student's
        // slot in the filtered unique (ClassId, StudentId) index if their previous hold expired.
        await holds.ExpireStaleAsync(command.ClassId, now, cancellationToken);

        if (await holds.HasActiveHoldAsync(command.ClassId, command.StudentId, now, cancellationToken))
        {
            throw new ActiveHoldExistsException(command.ClassId, command.StudentId);
        }

        var occupied = await holds.CountOccupiedSeatsAsync(command.ClassId, now, cancellationToken);
        if (occupied >= schoolClass.Capacity)
        {
            throw new NoSeatsAvailableException(command.ClassId);
        }

        var hold = new Hold
        {
            Id = Guid.NewGuid(),
            ClassId = command.ClassId,
            StudentId = command.StudentId,
            Status = HoldStatus.HELD,
            CreatedAt = now,
            ExpiresAt = now + options.Value.Duration
        };

        await holds.AddAsync(hold, cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return HoldDto.From(hold, schoolClass.Name);
    }
}
