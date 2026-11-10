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

    public async Task<HoldDto?> GetAsync(Guid holdId, CancellationToken cancellationToken)
    {
        var hold = await holds.GetWithClassAsync(holdId, cancellationToken);
        if (hold is null)
        {
            return null;
        }

        var dto = HoldDto.From(hold, hold.Class.Name);

        // Read-only: report lazy expiry without writing; the row is updated on the next write path.
        var now = timeProvider.GetUtcNow().UtcDateTime;
        return dto.Status == HoldStatus.HELD && dto.ExpiresAt <= now
            ? dto with { Status = HoldStatus.EXPIRED }
            : dto;
    }

    public async Task ConfirmAsync(Guid holdId, string studentId, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;

        // Confirming doesn't change seat occupancy (an unexpired HELD hold already counts as taken),
        // so no class lock is needed; the conditional update alone is race-safe.
        if (await holds.TryConfirmAsync(holdId, studentId, now, cancellationToken) == 1)
        {
            return;
        }

        // Nothing updated: work out why.
        var hold = await holds.GetAsync(holdId, cancellationToken);

        // Another student's hold is reported as not found so its existence isn't revealed.
        if (hold is null || hold.StudentId != studentId)
        {
            throw new HoldNotFoundException(holdId);
        }

        switch (hold.Status)
        {
            case HoldStatus.CONFIRMED:
                return; // Idempotent replay.
            case HoldStatus.CANCELLED:
                throw new HoldNotConfirmableException(holdId, hold.Status);
            default:
                // EXPIRED, or HELD past its expiry and not yet swept.
                throw new HoldExpiredException(holdId);
        }
    }

    public async Task CancelAsync(Guid holdId, string studentId, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;

        // Cancelling only frees a seat, so like confirm it needs no class lock.
        if (await holds.TryCancelAsync(holdId, studentId, now, cancellationToken) == 1)
        {
            return;
        }

        var hold = await holds.GetAsync(holdId, cancellationToken);

        if (hold is null || hold.StudentId != studentId)
        {
            throw new HoldNotFoundException(holdId);
        }

        switch (hold.Status)
        {
            case HoldStatus.CANCELLED:
                return; // Idempotent replay.
            case HoldStatus.CONFIRMED:
                throw new HoldNotCancellableException(holdId, hold.Status);
            default:
                // EXPIRED, or HELD past its expiry and not yet swept.
                throw new HoldNotCancellableException(holdId, HoldStatus.EXPIRED);
        }
    }
}
