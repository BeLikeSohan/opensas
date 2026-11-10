namespace SchoolAdmission.Application.Classes;

public interface IClassService
{
    Task<ClassDto> CreateAsync(CreateClassCommand command, CancellationToken cancellationToken);

    Task<IReadOnlyList<ClassSummaryDto>> ListAsync(CancellationToken cancellationToken);

    /// <summary>Gets one class with seat counts, or null if it does not exist.</summary>
    Task<ClassSummaryDto?> GetAsync(Guid id, CancellationToken cancellationToken);
}
