using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Api.Contracts.Classes;

public sealed record CreateClassRequest(
    [Required, StringLength(200)] string Name,
    [Range(1, int.MaxValue)] int TotalSeats);
