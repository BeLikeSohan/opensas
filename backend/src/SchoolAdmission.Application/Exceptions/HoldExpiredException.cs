namespace SchoolAdmission.Application.Exceptions;

public sealed class HoldExpiredException(Guid holdId)
    : Exception($"Hold '{holdId}' has expired and can no longer be confirmed.");
