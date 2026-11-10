namespace SchoolAdmission.Application.Abstractions;

public interface ITransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken);
}
