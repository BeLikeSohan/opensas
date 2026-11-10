using SchoolAdmission.Application.Exceptions;

namespace SchoolAdmission.Application.Holds;

public interface IHoldRepository
{
    /// <summary>Whether the student has a confirmed hold, or a HELD hold unexpired at <paramref name="now"/>, for the class.</summary>
    Task<bool> HasActiveHoldAsync(Guid classId, string studentId, DateTime now, CancellationToken cancellationToken);

    /// <summary>Counts seats taken in the class: confirmed holds plus HELD holds unexpired at <paramref name="now"/>.</summary>
    Task<int> CountOccupiedSeatsAsync(Guid classId, DateTime now, CancellationToken cancellationToken);

    /// <summary>Persists a new hold.</summary>
    /// <exception cref="ActiveHoldExistsException">The student already has an active or confirmed hold for the class.</exception>
    Task AddAsync(Hold hold, CancellationToken cancellationToken);
}
