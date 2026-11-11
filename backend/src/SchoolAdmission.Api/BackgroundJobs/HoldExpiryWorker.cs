using SchoolAdmission.Application.Holds;

namespace SchoolAdmission.Api.BackgroundJobs;

internal sealed class HoldExpiryWorker(
    IServiceScopeFactory scopeFactory,
    TimeProvider timeProvider,
    ILogger<HoldExpiryWorker> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval, timeProvider);

        // Sweep once on startup, then on every tick.
        do
        {
            await SweepAsync(stoppingToken);
        }
        while (await WaitForNextTickAsync(timer, stoppingToken));
    }

    private async Task SweepAsync(CancellationToken stoppingToken)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var holdService = scope.ServiceProvider.GetRequiredService<IHoldService>();

            var expired = await holdService.ExpireStaleHoldsAsync(stoppingToken);
            if (expired > 0)
            {
                logger.LogInformation("Marked {Count} stale hold(s) as expired.", expired);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Hold expiry sweep failed.");
        }
    }

    private static async Task<bool> WaitForNextTickAsync(PeriodicTimer timer, CancellationToken stoppingToken)
    {
        try
        {
            return await timer.WaitForNextTickAsync(stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }
}
