using InsuranceAgency.Data.Context;
using InsuranceAgency.Domain.Entities;
using InsuranceAgency.Domain.Enums;
using InsuranceAgency.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InsuranceAgency.Data.Repositories;

// ═══════════════════════════════════════════════════════
//  BASE REPOSITORY
// ═══════════════════════════════════════════════════════
public abstract class BaseRepository<T> : IRepository<T> where T : class
{
    protected readonly InsuranceDbContext _context;
    protected readonly DbSet<T> _dbSet;

    protected BaseRepository(InsuranceDbContext context)
    {
        _context = context;
        _dbSet   = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _dbSet.FindAsync(new object[] { id }, ct);

    public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default)
        => await _dbSet.AsNoTracking().ToListAsync(ct);

    public virtual async Task AddAsync(T entity, CancellationToken ct = default)
        => await _dbSet.AddAsync(entity, ct);

    public virtual void Update(T entity)
        => _dbSet.Update(entity);

    public virtual void Delete(T entity)
        => _dbSet.Remove(entity);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _context.SaveChangesAsync(ct);
}

// ═══════════════════════════════════════════════════════
//  CLIENT REPOSITORY
// ═══════════════════════════════════════════════════════
public class ClientRepository : BaseRepository<Client>, IClientRepository
{
    public ClientRepository(InsuranceDbContext context) : base(context) { }

    public async Task<Client?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await _context.Clients
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Email == email, ct);

    public async Task<Client?> GetWithPoliciesAsync(int clientId, CancellationToken ct = default)
        => await _context.Clients
            .Include(c => c.Policies)
                .ThenInclude(p => p.LifePolicy)
            .Include(c => c.Policies)
                .ThenInclude(p => p.FuneralPolicy)
            .Include(c => c.Policies)
                .ThenInclude(p => p.LegalPolicy)
            .FirstOrDefaultAsync(c => c.ClientID == clientId, ct);

    public async Task<IEnumerable<Client>> SearchAsync(string searchTerm, CancellationToken ct = default)
    {
        var term = searchTerm.ToLower().Trim();
        return await _context.Clients
            .AsNoTracking()
            .Where(c => c.FirstName.ToLower().Contains(term) ||
                        c.LastName.ToLower().Contains(term)  ||
                        c.Email.ToLower().Contains(term))
            .ToListAsync(ct);
    }
}

// ═══════════════════════════════════════════════════════
//  POLICY REPOSITORY
// ═══════════════════════════════════════════════════════
public class PolicyRepository : BaseRepository<Policy>, IPolicyRepository
{
    public PolicyRepository(InsuranceDbContext context) : base(context) { }

    public async Task<Policy?> GetByPolicyNumberAsync(string policyNumber, CancellationToken ct = default)
        => await _context.Policies
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PolicyNumber == policyNumber, ct);

    public async Task<Policy?> GetWithDetailsAsync(int policyId, CancellationToken ct = default)
        => await _context.Policies
            .Include(p => p.Client)
            .Include(p => p.LifePolicy)
            .Include(p => p.FuneralPolicy)
            .Include(p => p.LegalPolicy)
            .Include(p => p.Claims)
            .FirstOrDefaultAsync(p => p.PolicyID == policyId, ct);

    public async Task<IEnumerable<Policy>> GetByClientIdAsync(int clientId, CancellationToken ct = default)
        => await _context.Policies
            .AsNoTracking()
            .Include(p => p.LifePolicy)
            .Include(p => p.FuneralPolicy)
            .Include(p => p.LegalPolicy)
            .Where(p => p.ClientID == clientId)
            .ToListAsync(ct);

    public async Task<IEnumerable<Policy>> GetByTypeAsync(PolicyType type, CancellationToken ct = default)
        => await _context.Policies
            .AsNoTracking()
            .Where(p => p.PolicyType == type)
            .ToListAsync(ct);

    public async Task<IEnumerable<Policy>> GetByStatusAsync(PolicyStatus status, CancellationToken ct = default)
        => await _context.Policies
            .AsNoTracking()
            .Where(p => p.Status == status)
            .ToListAsync(ct);

    public async Task<IEnumerable<Policy>> GetExpiringAsync(int daysAhead, CancellationToken ct = default)
    {
        var cutoff = DateTime.UtcNow.AddDays(daysAhead);
        return await _context.Policies
            .AsNoTracking()
            .Include(p => p.Client)
            .Where(p => p.Status == PolicyStatus.Active && p.EndDate <= cutoff)
            .OrderBy(p => p.EndDate)
            .ToListAsync(ct);
    }
}

// ═══════════════════════════════════════════════════════
//  CLAIM REPOSITORY
// ═══════════════════════════════════════════════════════
public class ClaimRepository : BaseRepository<Claim>, IClaimRepository
{
    public ClaimRepository(InsuranceDbContext context) : base(context) { }

    public async Task<IEnumerable<Claim>> GetByPolicyIdAsync(int policyId, CancellationToken ct = default)
        => await _context.Claims
            .AsNoTracking()
            .Where(c => c.PolicyID == policyId)
            .OrderByDescending(c => c.ClaimDate)
            .ToListAsync(ct);

    public async Task<IEnumerable<Claim>> GetByStatusAsync(ClaimStatus status, CancellationToken ct = default)
        => await _context.Claims
            .AsNoTracking()
            .Include(c => c.Policy)
                .ThenInclude(p => p.Client)
            .Where(c => c.Status == status)
            .OrderByDescending(c => c.ClaimDate)
            .ToListAsync(ct);

    public async Task<IEnumerable<Claim>> GetByClientIdAsync(int clientId, CancellationToken ct = default)
        => await _context.Claims
            .AsNoTracking()
            .Include(c => c.Policy)
            .Where(c => c.Policy.ClientID == clientId)
            .OrderByDescending(c => c.ClaimDate)
            .ToListAsync(ct);

    public async Task<decimal> GetTotalClaimedByPolicyAsync(int policyId, CancellationToken ct = default)
        => await _context.Claims
            .Where(c => c.PolicyID == policyId &&
                        (c.Status == ClaimStatus.Approved || c.Status == ClaimStatus.Paid))
            .SumAsync(c => c.Amount, ct);
}
