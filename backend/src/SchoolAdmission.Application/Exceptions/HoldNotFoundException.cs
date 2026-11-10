namespace SchoolAdmission.Application.Exceptions;

public sealed class HoldNotFoundException(Guid holdId)
    : Exception($"Hold '{holdId}' was not found.");
