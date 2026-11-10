namespace SchoolAdmission.Application.Holds;

public sealed record HoldDto(
    Guid Id,
    Guid ClassId,
    string ClassName,
    string StudentId,
    HoldStatus Status,
    DateTime CreatedAt,
    DateTime ExpiresAt)
{
    public static HoldDto From(Hold hold, string className) =>
        new(hold.Id, hold.ClassId, className, hold.StudentId, hold.Status, hold.CreatedAt, hold.ExpiresAt);
}
