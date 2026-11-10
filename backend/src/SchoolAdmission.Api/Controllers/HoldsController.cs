using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.Contracts.Holds;
using SchoolAdmission.Application.Holds;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
public class HoldsController(IHoldService holdService) : ControllerBase
{
    private const string StudentIdHeader = "X-Student-Id";
    private const int StudentIdLength = 17;

    [HttpPost("classes/{classId:guid}/holds")]
    [ProducesResponseType<HoldResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        Guid classId,
        [FromHeader(Name = StudentIdHeader)]
        [Required(ErrorMessage = $"The {StudentIdHeader} header is required.")]
        [StringLength(StudentIdLength, MinimumLength = StudentIdLength,
            ErrorMessage = $"The {StudentIdHeader} header must be exactly 17 characters.")]
        string studentId,
        CancellationToken cancellationToken)
    {
        var hold = await holdService.CreateAsync(new CreateHoldCommand(classId, studentId), cancellationToken);

        var response = HoldResponse.From(hold);
        return Created($"/holds/{response.HoldId}", response);
    }

    [HttpGet("holds/{holdId:guid}")]
    [ProducesResponseType<HoldDetailsResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(Guid holdId, CancellationToken cancellationToken)
    {
        var hold = await holdService.GetAsync(holdId, cancellationToken);
        return hold is null ? NotFound() : Ok(HoldDetailsResponse.From(hold));
    }

    [HttpPost("holds/{holdId:guid}/confirm")]
    [ProducesResponseType<ConfirmHoldResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Confirm(
        Guid holdId,
        [FromHeader(Name = StudentIdHeader)]
        [Required(ErrorMessage = $"The {StudentIdHeader} header is required.")]
        [StringLength(StudentIdLength, MinimumLength = StudentIdLength,
            ErrorMessage = $"The {StudentIdHeader} header must be exactly 17 characters.")]
        string studentId,
        CancellationToken cancellationToken)
    {
        await holdService.ConfirmAsync(holdId, studentId, cancellationToken);
        return Ok(new ConfirmHoldResponse(holdId, HoldStatus.CONFIRMED));
    }
}
