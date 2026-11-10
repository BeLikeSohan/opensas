namespace SchoolAdmission.Application.Classes;

internal sealed class ClassService(IClassRepository classes, TimeProvider timeProvider) : IClassService
{
    public async Task<ClassDto> CreateAsync(CreateClassCommand command, CancellationToken cancellationToken)
    {
        var schoolClass = new SchoolClass
        {
            Id = Guid.NewGuid(),
            Name = command.Name.Trim(),
            Capacity = command.TotalSeats,
            CreatedAt = timeProvider.GetUtcNow().UtcDateTime
        };

        await classes.AddAsync(schoolClass, cancellationToken);

        return new ClassDto(schoolClass.Id, schoolClass.Name, schoolClass.Capacity);
    }

    public async Task<IReadOnlyList<ClassSummaryDto>> ListAsync(CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var counts = await classes.ListWithSeatCountsAsync(now, cancellationToken);

        return counts.Select(ClassSummaryDto.From).ToList();
    }

    public async Task<ClassSummaryDto?> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var counts = await classes.GetWithSeatCountsAsync(id, now, cancellationToken);

        return counts is null ? null : ClassSummaryDto.From(counts);
    }
}
