using SchoolAdmission.Application.Classes;

namespace SchoolAdmission.Api.Contracts.Classes;

public sealed record ClassResponse(Guid Id, string Name, int TotalSeats)
{
    public static ClassResponse From(ClassDto dto) => new(dto.Id, dto.Name, dto.TotalSeats);
}
