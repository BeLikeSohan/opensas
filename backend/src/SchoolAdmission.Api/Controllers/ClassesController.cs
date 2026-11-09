using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.Contracts.Classes;
using SchoolAdmission.Application.Classes;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController(IClassService classService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<ClassResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(CreateClassRequest request, CancellationToken cancellationToken)
    {
        var created = await classService.CreateAsync(
            new CreateClassCommand(request.Name, request.TotalSeats), cancellationToken);

        var response = ClassResponse.From(created);
        return Created($"/classes/{response.Id}", response);
    }
}
