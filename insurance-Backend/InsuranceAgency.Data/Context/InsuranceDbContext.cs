using InsuranceAgency.Domain.Entities;
using InsuranceAgency.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace InsuranceAgency.Data.Context;

public class InsuranceDbContext : DbContext
{
    public InsuranceDbContext(DbContextOptions<InsuranceDbContext> options) : base(options) { }

    public DbSet<Client>        Clients        => Set<Client>();
    public DbSet<Policy>        Policies       => Set<Policy>();
    public DbSet<LifePolicy>    LifePolicies   => Set<LifePolicy>();
    public DbSet<FuneralPolicy> FuneralPolicies => Set<FuneralPolicy>();
    public DbSet<LegalPolicy>   LegalPolicies  => Set<LegalPolicy>();
    public DbSet<Claim>         Claims         => Set<Claim>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);

        // ── Clients ────────────────────────────────────────────────
        model.Entity<Client>(e =>
        {
            e.HasKey(c => c.ClientID);
            e.Property(c => c.FirstName).HasMaxLength(50).IsRequired();
            e.Property(c => c.LastName).HasMaxLength(50).IsRequired();
            e.Property(c => c.Email).HasMaxLength(100).IsRequired();
            e.HasIndex(c => c.Email).IsUnique();
            e.Property(c => c.Phone).HasMaxLength(20);
            e.Property(c => c.Address).HasMaxLength(200);
            e.Property(c => c.CreatedAt).HasDefaultValueSql("GETDATE()");
        });

        // ── Policies ───────────────────────────────────────────────
        model.Entity<Policy>(e =>
        {
            e.HasKey(p => p.PolicyID);
            e.Property(p => p.PolicyNumber).HasMaxLength(20).IsRequired();
            e.HasIndex(p => p.PolicyNumber).IsUnique();
            e.Property(p => p.PremiumAmount).HasColumnType("decimal(10,2)");
            e.Property(p => p.PolicyType)
             .HasConversion(v => v.ToString(), v => Enum.Parse<PolicyType>(v))
             .HasMaxLength(20);
            e.Property(p => p.Status)
             .HasConversion(v => v.ToString(), v => Enum.Parse<PolicyStatus>(v))
             .HasMaxLength(20);
            e.Property(p => p.CreatedAt).HasDefaultValueSql("GETDATE()");

            e.HasOne(p => p.Client)
             .WithMany(c => c.Policies)
             .HasForeignKey(p => p.ClientID)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Life Policies ──────────────────────────────────────────
        model.Entity<LifePolicy>(e =>
        {
            e.HasKey(lp => lp.LifePolicyID);
            e.Property(lp => lp.CoverageAmount).HasColumnType("decimal(15,2)");
            e.Property(lp => lp.Beneficiary).HasMaxLength(100).IsRequired();

            e.HasOne(lp => lp.Policy)
             .WithOne(p => p.LifePolicy)
             .HasForeignKey<LifePolicy>(lp => lp.PolicyID)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Funeral Policies ───────────────────────────────────────
        model.Entity<FuneralPolicy>(e =>
        {
            e.HasKey(fp => fp.FuneralPolicyID);
            e.Property(fp => fp.CoverageAmount).HasColumnType("decimal(15,2)");
            e.Property(fp => fp.FuneralType).HasMaxLength(50).IsRequired();

            e.HasOne(fp => fp.Policy)
             .WithOne(p => p.FuneralPolicy)
             .HasForeignKey<FuneralPolicy>(fp => fp.PolicyID)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Legal Policies ─────────────────────────────────────────
        model.Entity<LegalPolicy>(e =>
        {
            e.HasKey(lp => lp.LegalPolicyID);
            e.Property(lp => lp.MaxCoverageAmount).HasColumnType("decimal(15,2)");
            e.Property(lp => lp.LegalType).HasMaxLength(50).IsRequired();

            e.HasOne(lp => lp.Policy)
             .WithOne(p => p.LegalPolicy)
             .HasForeignKey<LegalPolicy>(lp => lp.PolicyID)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Claims ─────────────────────────────────────────────────
        model.Entity<Claim>(e =>
        {
            e.HasKey(c => c.ClaimID);
            e.Property(c => c.Amount).HasColumnType("decimal(15,2)");
            e.Property(c => c.Description).HasMaxLength(500);
            e.Property(c => c.Status)
             .HasConversion(v => v.ToString(), v => Enum.Parse<ClaimStatus>(v))
             .HasMaxLength(20);

            e.HasOne(c => c.Policy)
             .WithMany(p => p.Claims)
             .HasForeignKey(c => c.PolicyID)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
