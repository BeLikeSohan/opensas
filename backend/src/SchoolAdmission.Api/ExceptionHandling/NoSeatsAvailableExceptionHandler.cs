using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Application.Exceptions;

namespace SchoolAdmission.Api.ExceptionHandling;

internal sealed class NoSeatsAvailableExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not NoSeatsAvailableException)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status409Conflict;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status409Conflict,
            Title = "No seats available",
            Detail = exception.Message
        }, cancellationToken);

        return true;
    }
}
