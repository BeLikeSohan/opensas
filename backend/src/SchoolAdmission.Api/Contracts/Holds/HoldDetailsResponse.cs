using SchoolAdmission.Application.Holds;

namespace SchoolAdmission.Api.Contracts.Holds;

public sealed record HoldDetailsResponse(
    Guid HoldId,
    Guid ClassId,
    HoldStatus Status,
    DateTime ExpiresAt)
{
    public static HoldDetailsResponse From(HoldDto dto) =>
        new(dto.Id, dto.ClassId, dto.Status, dto.ExpiresAt);
}
