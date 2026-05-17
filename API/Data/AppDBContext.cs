using System;
using API.Entities;
using Humanizer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data;

public class AppDBContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Member> Members { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<MemberLike> Likes { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<Connection> Connections { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<IdentityRole>()
            .HasData(
                new IdentityRole { Id = "member-id", Name = "Member", ConcurrencyStamp = "member-id-stamp", NormalizedName = "MEMBER" },
                new IdentityRole { Id = "moderator-id", Name = "Moderator", ConcurrencyStamp = "moderator-id-stamp", NormalizedName = "MODERATOR" },
                new IdentityRole { Id = "admin-id", Name = "Admin", ConcurrencyStamp = "admin-id-stamp", NormalizedName = "ADMIN" }
            );

        modelBuilder.Entity<Message>()
        .HasOne(x => x.Recipient)
        .WithMany(y => y.MessagesReceived)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Message>()
        .HasOne(x => x.Sender)
        .WithMany(y => y.MessagesSent)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MemberLike>()
        .HasKey(k => new { k.SourceMemberId, k.TargetMemberId });

        // This code is part of the Fluent API in Entity Framework Core. It is used to explicitly define how a "Many-to-Many" relationship works when a table relates back to itself (a self-referencing relationship).
        // Since a User can like many other Users, and a User can be liked by many other Users, EF Core needs these instructions to understand which "direction" the data is flowing.
        // This maps the SourceMemberId. It tells EF: "Look at the list of people I have liked."
        modelBuilder.Entity<MemberLike>()
        .HasOne(s => s.SourceMember)        // Each 'Like' has one member who started it
        .WithMany(t => t.LikedMembers)     // That member can have many 'Likes' they sent out
        .HasForeignKey(s => s.SourceMemberId) // Use this column to link them
        .OnDelete(DeleteBehavior.Cascade);  // If a User is deleted, delete their sent likes too

        // This maps the TargetMemberId. It tells EF: "Look at the list of people who have liked me."
        modelBuilder.Entity<MemberLike>()
        .HasOne(s => s.TargetMember)       // Each 'Like' has one member who received it
        .WithMany(t => t.LikedByMembers)   // That member can have many people who liked them
        .HasForeignKey(s => s.TargetMemberId) // Use this column to link them
        .OnDelete(DeleteBehavior.NoAction); // If a User is deleted, no action because please check it below

        // The Problem of "Multiple Cascade Paths"SQL Server (the most common database used with .NET) has a strict rule: 
        // A single table cannot have more than one cascade path from the same parent.
        // In our case:
        // Path 1: User A is deleted rightarrow Delete all rows in MemberLike where User A is the SourceMemberId.
        // Path 2: User A is deleted $\rightarrow$ Delete all rows in MemberLike where User A is the TargetMemberId.
        // Because both paths end up at the same table (MemberLike), the database engine gets worried about "infinite loops" or "cycles." It blocks the migration to protect the integrity of the data.
        // By setting one to NoAction, you satisfy the database's rules, and your application remains stable.

        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
        );

        var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? v.Value.ToUniversalTime() : null,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null
        );

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(nullableDateTimeConverter);
                }
            }
        }
    }
}
