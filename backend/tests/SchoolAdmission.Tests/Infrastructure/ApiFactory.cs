using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Testcontainers.PostgreSql;

namespace SchoolAdmission.Tests.Infrastructure;

/// <summary>
/// Runs the real API in memory against a throwaway Postgres container. Program.cs applies
/// migrations on startup, so the schema (including the filtered unique index) is real.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:17-alpine")
        .Build();

    public async Task InitializeAsync() => await _postgres.StartAsync();

    async Task IAsyncLifetime.DisposeAsync()
    {
        await DisposeAsync();
        await _postgres.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:Default", _postgres.GetConnectionString());

        builder.ConfigureTestServices(services =>
        {
            // The expiry sweep would mutate holds in the background while tests run.
            var worker = services.Single(d =>
                d.ServiceType == typeof(IHostedService) &&
                d.ImplementationType?.Name == "HoldExpiryWorker");
            services.Remove(worker);
        });
    }
}

[CollectionDefinition(Name)]
public sealed class ApiCollection : ICollectionFixture<ApiFactory>
{
    public const string Name = "api";
}
