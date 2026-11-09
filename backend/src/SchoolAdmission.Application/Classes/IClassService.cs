namespace SchoolAdmission.Application.Classes;

public interface IClassService
{
    Task<ClassDto> CreateAsync(CreateClassCommand command, CancellationToken cancellationToken);
}
