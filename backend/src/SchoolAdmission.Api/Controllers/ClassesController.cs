using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.Contracts.Classes;
using SchoolAdmission.Application.Classes;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController(IClassService classService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<ClassSummaryResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var classes = await classService.ListAsync(cancellationToken);
        return Ok(classes.Select(ClassSummaryResponse.From));
    }

    [HttpGet("{classId:guid}")]
    [ProducesResponseType<ClassSummaryResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(Guid classId, CancellationToken cancellationToken)
    {
        var schoolClass = await classService.GetAsync(classId, cancellationToken);
        return schoolClass is null ? NotFound() : Ok(ClassSummaryResponse.From(schoolClass));
    }

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
