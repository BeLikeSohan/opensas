namespace SchoolAdmission.Application.Classes;

public sealed record ClassSummaryDto(
    Guid Id,
    string Name,
    int TotalSeats,
    int HeldSeats,
    int ConfirmedSeats,
    int AvailableSeats)
{
    public static ClassSummaryDto From(ClassSeatCounts counts) =>
        new(
            counts.Id,
            counts.Name,
            counts.TotalSeats,
            counts.HeldSeats,
            counts.ConfirmedSeats,
            AvailableSeats: counts.TotalSeats - counts.HeldSeats - counts.ConfirmedSeats);
}
