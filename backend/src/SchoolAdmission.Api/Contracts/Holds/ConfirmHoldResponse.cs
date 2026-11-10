namespace SchoolAdmission.Api.Contracts.Holds;

public sealed record ConfirmHoldResponse(Guid HoldId, HoldStatus Status);
