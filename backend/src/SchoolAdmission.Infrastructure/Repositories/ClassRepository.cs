using Microsoft.EntityFrameworkCore;
using Npgsql;
using SchoolAdmission.Application.Classes;
using SchoolAdmission.Application.Exceptions;

namespace SchoolAdmission.Infrastructure.Repositories;

internal sealed class ClassRepository(AppDbContext db) : IClassRepository
{
    public async Task AddAsync(SchoolClass schoolClass, CancellationToken cancellationToken)
    {
        db.Classes.Add(schoolClass);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            throw new DuplicateClassException(schoolClass.Name);
        }
    }

    public async Task<IReadOnlyList<ClassSeatCounts>> ListWithSeatCountsAsync(DateTime now, CancellationToken cancellationToken)
    {
        return await db.Classes
            .AsNoTracking()
            .OrderBy(c => c.CreatedAt)
            .ThenBy(c => c.Id)
            .Select(c => new ClassSeatCounts(
                c.Id,
                c.Name,
                c.Capacity,
                db.Holds.Count(h => h.ClassId == c.Id && h.Status == HoldStatus.HELD && h.ExpiresAt > now),
                db.Holds.Count(h => h.ClassId == c.Id && h.Status == HoldStatus.CONFIRMED)))
            .ToListAsync(cancellationToken);
    }

    public async Task<ClassSeatCounts?> GetWithSeatCountsAsync(Guid id, DateTime now, CancellationToken cancellationToken)
    {
        return await db.Classes
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new ClassSeatCounts(
                c.Id,
                c.Name,
                c.Capacity,
                db.Holds.Count(h => h.ClassId == c.Id && h.Status == HoldStatus.HELD && h.ExpiresAt > now),
                db.Holds.Count(h => h.ClassId == c.Id && h.Status == HoldStatus.CONFIRMED)))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<SchoolClass?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken)
    {
        // No LINQ operators after FromSql: composing would wrap the FOR UPDATE in a subquery.
        var rows = await db.Classes
            .FromSql($"""SELECT * FROM "Classes" WHERE "Id" = {id} FOR UPDATE""")
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return rows.SingleOrDefault();
    }
}
