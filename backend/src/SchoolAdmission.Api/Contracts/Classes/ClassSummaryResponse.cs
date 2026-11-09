using SchoolAdmission.Application.Classes;

namespace SchoolAdmission.Api.Contracts.Classes;

public sealed record ClassSummaryResponse(
    Guid Id,
    string Name,
    int TotalSeats,
    int HeldSeats,
    int ConfirmedSeats,
    int AvailableSeats)
{
    public static ClassSummaryResponse From(ClassSummaryDto dto) =>
        new(dto.Id, dto.Name, dto.TotalSeats, dto.HeldSeats, dto.ConfirmedSeats, dto.AvailableSeats);
}
