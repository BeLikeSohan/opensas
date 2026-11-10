using SchoolAdmission.Application.Holds;

namespace SchoolAdmission.Api.Contracts.Holds;

public sealed record HoldResponse(
    Guid HoldId,
    Guid ClassId,
    string StudentId,
    HoldStatus Status,
    DateTime ExpiresAt)
{
    public static HoldResponse From(HoldDto dto) =>
        new(dto.Id, dto.ClassId, dto.StudentId, dto.Status, dto.ExpiresAt);
}
