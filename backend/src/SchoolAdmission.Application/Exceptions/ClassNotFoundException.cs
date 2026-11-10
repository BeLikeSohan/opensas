namespace SchoolAdmission.Application.Exceptions;

public sealed class ClassNotFoundException(Guid classId)
    : Exception($"Class '{classId}' was not found.");
