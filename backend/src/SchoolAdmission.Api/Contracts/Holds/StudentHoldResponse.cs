using SchoolAdmission.Application.Holds;

namespace SchoolAdmission.Api.Contracts.Holds;

public sealed record StudentHoldResponse(
    Guid HoldId,
    Guid ClassId,
    string ClassName,
    HoldStatus Status,
    DateTime ExpiresAt)
{
    public static StudentHoldResponse From(HoldDto dto) =>
        new(dto.Id, dto.ClassId, dto.ClassName, dto.Status, dto.ExpiresAt);
}
