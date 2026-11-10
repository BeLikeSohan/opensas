namespace SchoolAdmission.Application.Exceptions;

public sealed class HoldNotConfirmableException(Guid holdId, HoldStatus status)
    : Exception($"Hold '{holdId}' is {status} and cannot be confirmed.");
