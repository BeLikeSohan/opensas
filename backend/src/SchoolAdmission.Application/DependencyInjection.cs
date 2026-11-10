using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SchoolAdmission.Application.Classes;
using SchoolAdmission.Application.Holds;

namespace SchoolAdmission.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton(TimeProvider.System);

        services.AddOptions<HoldOptions>()
            .Configure(o => o.DurationSeconds =
                configuration.GetValue(HoldOptions.DurationSecondsKey, HoldOptions.DefaultDurationSeconds))
            .Validate(o => o.DurationSeconds > 0, $"{HoldOptions.DurationSecondsKey} must be a positive number of seconds.")
            .ValidateOnStart();

        services.AddScoped<IClassService, ClassService>();
        services.AddScoped<IHoldService, HoldService>();

        return services;
    }
}
