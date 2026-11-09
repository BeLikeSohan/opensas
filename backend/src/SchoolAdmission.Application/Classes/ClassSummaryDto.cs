namespace SchoolAdmission.Application.Classes;

public sealed record ClassSummaryDto(
    Guid Id,
    string Name,
    int TotalSeats,
    int HeldSeats,
    int ConfirmedSeats,
    int AvailableSeats);
