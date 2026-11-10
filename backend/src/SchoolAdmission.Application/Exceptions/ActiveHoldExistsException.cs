namespace SchoolAdmission.Application.Exceptions;

public sealed class ActiveHoldExistsException(Guid classId, string studentId)
    : Exception($"Student '{studentId}' already has an active or confirmed application for class '{classId}'.");
