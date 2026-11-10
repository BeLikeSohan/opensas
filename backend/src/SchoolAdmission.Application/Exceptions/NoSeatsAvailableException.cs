namespace SchoolAdmission.Application.Exceptions;

public sealed class NoSeatsAvailableException(Guid classId)
    : Exception($"No seats are available in class '{classId}'.");
