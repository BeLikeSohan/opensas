using SchoolAdmission.Application.Holds;

namespace SchoolAdmission.Api.Contracts.Holds;

public sealed record HoldResponse(
    Guid Id,
    Guid ClassId,
    string ClassName,
    string StudentId,
    HoldStatus Status,
    DateTime CreatedAt,
    DateTime ExpiresAt)
{
    public static HoldResponse From(HoldDto dto) =>
        new(dto.Id, dto.ClassId, dto.ClassName, dto.StudentId, dto.Status, dto.CreatedAt, dto.ExpiresAt);
}
