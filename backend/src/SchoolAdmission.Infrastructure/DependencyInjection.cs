using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SchoolAdmission.Application.Abstractions;
using SchoolAdmission.Application.Classes;
using SchoolAdmission.Application.Holds;
using SchoolAdmission.Infrastructure.Data;
using SchoolAdmission.Infrastructure.Repositories;

namespace SchoolAdmission.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("ConnectionStrings:Default is not configured.");

        services.AddDbContext<AppDbContext>(o => o.UseNpgsql(connectionString));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IClassRepository, ClassRepository>();
        services.AddScoped<IHoldRepository, HoldRepository>();

        return services;
    }
}
