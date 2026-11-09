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
}
