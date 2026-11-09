using Microsoft.Extensions.DependencyInjection;
using SchoolAdmission.Application.Classes;

namespace SchoolAdmission.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<IClassService, ClassService>();
        return services;
    }
}
