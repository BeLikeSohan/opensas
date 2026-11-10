namespace SchoolAdmission.Application.Holds;

public sealed record CreateHoldCommand(Guid ClassId, string StudentId);
