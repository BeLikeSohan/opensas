using SchoolAdmission.Application.Exceptions;

namespace SchoolAdmission.Application.Holds;

public interface IHoldService
{
    /// <summary>Holds one seat in the class for the student.</summary>
    /// <exception cref="ClassNotFoundException">The class does not exist.</exception>
    /// <exception cref="ActiveHoldExistsException">The student already has an active or confirmed hold for the class.</exception>
    /// <exception cref="NoSeatsAvailableException">The class has no free seats.</exception>
    Task<HoldDto> CreateAsync(CreateHoldCommand command, CancellationToken cancellationToken);
}
