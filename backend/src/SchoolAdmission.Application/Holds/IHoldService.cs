using SchoolAdmission.Application.Exceptions;

namespace SchoolAdmission.Application.Holds;

public interface IHoldService
{
    /// <summary>Holds one seat in the class for the student.</summary>
    /// <exception cref="ClassNotFoundException">The class does not exist.</exception>
    /// <exception cref="ActiveHoldExistsException">The student already has an active or confirmed hold for the class.</exception>
    /// <exception cref="NoSeatsAvailableException">The class has no free seats.</exception>
    Task<HoldDto> CreateAsync(CreateHoldCommand command, CancellationToken cancellationToken);

    /// <summary>
    /// Gets a hold, or null if it does not exist. A HELD hold whose expiry has passed is reported as EXPIRED.
    /// </summary>
    Task<HoldDto?> GetAsync(Guid holdId, CancellationToken cancellationToken);

    /// <summary>
    /// Confirms the student's unexpired HELD hold. Idempotent: confirming an already confirmed hold succeeds.
    /// </summary>
    /// <exception cref="HoldNotFoundException">The hold does not exist or belongs to another student.</exception>
    /// <exception cref="HoldExpiredException">The hold has expired.</exception>
    /// <exception cref="HoldNotConfirmableException">The hold was cancelled.</exception>
    Task ConfirmAsync(Guid holdId, string studentId, CancellationToken cancellationToken);
}
