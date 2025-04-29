using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Postgres.Scaffolding
{
    public partial class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public virtual DbSet<User>          Users    { get; set; }
        public virtual DbSet<SchoolContact> Contacts { get; set; }
        public virtual DbSet<SchoolEvent>   Events   { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureUser(modelBuilder.Entity<User>());
            ConfigureContact(modelBuilder.Entity<SchoolContact>());
            ConfigureEvent(modelBuilder.Entity<SchoolEvent>());

            OnModelCreatingPartial(modelBuilder);
        }

        // ── users ──────────────────────────────────────────────────────────
        private static void ConfigureUser(EntityTypeBuilder<User> e)
        {
            e.HasKey(u => u.Id).HasName("user_pkey");
            e.ToTable("user", "crazyrobot");

            e.Property(u => u.Id)   .HasColumnName("id");
            e.Property(u => u.Email).HasColumnName("email");
            e.Property(u => u.Hash) .HasColumnName("hash");
            e.Property(u => u.Role) .HasColumnName("role");
            e.Property(u => u.Salt) .HasColumnName("salt");
        }

        // ── contacts ──────────────────────────────────────────────────────
        private static void ConfigureContact(EntityTypeBuilder<SchoolContact> e)
        {
            e.HasKey(c => c.Id).HasName("contacts_pkey");
            e.ToTable("contacts", "crazyrobot");

            e.Property(c => c.Id)         .HasColumnName("id");
            e.Property(c => c.Name)       .HasColumnName("name").IsRequired();
            e.Property(c => c.Role)       .HasColumnName("role");
            e.Property(c => c.Department) .HasColumnName("department");
            e.Property(c => c.Email)      .HasColumnName("email");
            e.Property(c => c.Phone)      .HasColumnName("phone");
            e.Property(c => c.ImageUrl)   .HasColumnName("imageUrl");
        }

        // ── events ────────────────────────────────────────────────────────
        private static void ConfigureEvent(EntityTypeBuilder<SchoolEvent> e)
        {
            e.HasKey(ev => ev.Id).HasName("events_pkey");
            e.ToTable("events", "crazyrobot");

            e.Property(ev => ev.Id)          .HasColumnName("id");
            e.Property(ev => ev.Title)       .HasColumnName("title").IsRequired();
            e.Property(ev => ev.Description) .HasColumnName("description");
            e.Property(ev => ev.Date)        .HasColumnName("date").HasColumnType("date");
            e.Property(ev => ev.Time)        .HasColumnName("time");
            e.Property(ev => ev.Location)    .HasColumnName("location");
            e.Property(ev => ev.Category)    .HasColumnName("category");
            e.Property(ev => ev.Status)      .HasColumnName("status")
                                             .HasConversion<string>();   // enum ⇄ text
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
