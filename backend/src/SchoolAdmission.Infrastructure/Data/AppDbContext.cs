using Microsoft.EntityFrameworkCore;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<SchoolClass> Classes => Set<SchoolClass>();
    public DbSet<Hold> Holds => Set<Hold>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<SchoolClass>().HasIndex(c => c.Name).IsUnique();
        b.Entity<SchoolClass>().ToTable(t => t.HasCheckConstraint("CK_Capacity", "\"Capacity\" > 0"));

        b.Entity<Hold>().Property(h => h.Status).HasConversion<string>().HasMaxLength(16);
        b.Entity<Hold>().HasIndex(h => new { h.ClassId, h.Status, h.ExpiresAt });
        b.Entity<Hold>().HasIndex(h => h.StudentId);
        
        b.Entity<Hold>().HasIndex(h => new { h.ClassId, h.StudentId })
            .IsUnique()
            .HasFilter("\"Status\" IN ('HELD','CONFIRMED')");
    }
}
