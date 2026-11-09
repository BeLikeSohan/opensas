using SchoolAdmission.Application.Exceptions;

namespace SchoolAdmission.Application.Classes;

public interface IClassRepository
{
    /// <summary>
    /// Persists a new class.
    /// </summary>
    /// <exception cref="DuplicateClassException">A class with the same name already exists.</exception>
    Task AddAsync(SchoolClass schoolClass, CancellationToken cancellationToken);
}
