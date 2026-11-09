namespace SchoolAdmission.Application.Classes;

/// <summary>Read model: a class with its raw held and confirmed seat counts.</summary>
public sealed record ClassSeatCounts(Guid Id, string Name, int TotalSeats, int HeldSeats, int ConfirmedSeats);
