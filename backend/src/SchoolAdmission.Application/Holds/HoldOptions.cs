namespace SchoolAdmission.Application.Holds;

public sealed class HoldOptions
{
    /// <summary>Configuration key (environment variable) for the hold duration in seconds.</summary>
    public const string DurationSecondsKey = "HOLD_DURATION_SECONDS";

    public const int DefaultDurationSeconds = 600;

    public int DurationSeconds { get; set; } = DefaultDurationSeconds;

    public TimeSpan Duration => TimeSpan.FromSeconds(DurationSeconds);
}
