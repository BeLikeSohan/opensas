namespace SchoolAdmission.Application.Abstractions;

public interface IUnitOfWork
{
    /// <summary>Starts a database transaction. Disposing it without committing rolls it back.</summary>
    Task<ITransaction> BeginTransactionAsync(CancellationToken cancellationToken);
}
