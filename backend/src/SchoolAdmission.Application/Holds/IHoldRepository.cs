using SchoolAdmission.Application.Exceptions;

namespace SchoolAdmission.Application.Holds;

public interface IHoldRepository
{
    /// <summary>Marks the class's HELD holds that expired at or before <paramref name="now"/> as EXPIRED.</summary>
    Task<int> ExpireStaleAsync(Guid classId, DateTime now, CancellationToken cancellationToken);

    /// <summary>Marks every HELD hold, across all classes, that expired at or before <paramref name="now"/> as EXPIRED.</summary>
    Task<int> ExpireAllStaleAsync(DateTime now, CancellationToken cancellationToken);

    /// <summary>Whether the student has a confirmed hold, or a HELD hold unexpired at <paramref name="now"/>, for the class.</summary>
    Task<bool> HasActiveHoldAsync(Guid classId, string studentId, DateTime now, CancellationToken cancellationToken);

    /// <summary>Counts seats taken in the class: confirmed holds plus HELD holds unexpired at <paramref name="now"/>.</summary>
    Task<int> CountOccupiedSeatsAsync(Guid classId, DateTime now, CancellationToken cancellationToken);

    /// <summary>Gets a hold with its class loaded, or null if it does not exist.</summary>
    Task<Hold?> GetWithClassAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>Lists the student's holds across all classes, newest first, with their classes loaded.</summary>
    Task<IReadOnlyList<Hold>> ListByStudentAsync(string studentId, CancellationToken cancellationToken);

    /// <summary>Gets a hold without its class, or null if it does not exist.</summary>
    Task<Hold?> GetAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Atomically confirms the hold if it belongs to the student, is HELD, and is unexpired at <paramref name="now"/>.
    /// Returns the number of rows updated (0 or 1).
    /// </summary>
    Task<int> TryConfirmAsync(Guid id, string studentId, DateTime now, CancellationToken cancellationToken);

    /// <summary>
    /// Atomically cancels the hold if it belongs to the student, is HELD, and is unexpired at <paramref name="now"/>.
    /// Returns the number of rows updated (0 or 1).
    /// </summary>
    Task<int> TryCancelAsync(Guid id, string studentId, DateTime now, CancellationToken cancellationToken);

    /// <summary>Persists a new hold.</summary>
    /// <exception cref="ActiveHoldExistsException">The student already has an active or confirmed hold for the class.</exception>
    Task AddAsync(Hold hold, CancellationToken cancellationToken);
}
