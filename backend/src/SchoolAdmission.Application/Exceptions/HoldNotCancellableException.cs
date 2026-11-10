namespace SchoolAdmission.Application.Exceptions;

public sealed class HoldNotCancellableException(Guid holdId, HoldStatus status)
    : Exception($"Hold '{holdId}' is {status} and cannot be cancelled.");
