using Microsoft.EntityFrameworkCore;
using Npgsql;
using SchoolAdmission.Application.Exceptions;
using SchoolAdmission.Application.Holds;

namespace SchoolAdmission.Infrastructure.Repositories;

internal sealed class HoldRepository(AppDbContext db) : IHoldRepository
{
    public Task<int> ExpireStaleAsync(Guid classId, DateTime now, CancellationToken cancellationToken) =>
        db.Holds
            .Where(h => h.ClassId == classId && h.Status == HoldStatus.HELD && h.ExpiresAt <= now)
            .ExecuteUpdateAsync(s => s.SetProperty(h => h.Status, HoldStatus.EXPIRED), cancellationToken);

    public Task<bool> HasActiveHoldAsync(Guid classId, string studentId, DateTime now, CancellationToken cancellationToken) =>
        db.Holds.AnyAsync(
            h => h.ClassId == classId && h.StudentId == studentId &&
                 (h.Status == HoldStatus.CONFIRMED || (h.Status == HoldStatus.HELD && h.ExpiresAt > now)),
            cancellationToken);

    public Task<int> CountOccupiedSeatsAsync(Guid classId, DateTime now, CancellationToken cancellationToken) =>
        db.Holds.CountAsync(
            h => h.ClassId == classId &&
                 (h.Status == HoldStatus.CONFIRMED || (h.Status == HoldStatus.HELD && h.ExpiresAt > now)),
            cancellationToken);

    public Task<Hold?> GetWithClassAsync(Guid id, CancellationToken cancellationToken) =>
        db.Holds
            .AsNoTracking()
            .Include(h => h.Class)
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);

    public async Task AddAsync(Hold hold, CancellationToken cancellationToken)
    {
        db.Holds.Add(hold);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // Backstop for the filtered unique index on (ClassId, StudentId).
            throw new ActiveHoldExistsException(hold.ClassId, hold.StudentId);
        }
    }
}
