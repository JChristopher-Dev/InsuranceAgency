using InsuranceAgency.Domain.Entities;
using InsuranceAgency.Domain.Enums;

namespace InsuranceAgency.Domain.Interfaces;

// ─────────────────────────────────────────────
//  Generic base
// ─────────────────────────────────────────────
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Delete(T entity);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

// ─────────────────────────────────────────────
//  Client repository
// ─────────────────────────────────────────────
public interface IClientRepository : IRepository<Client>
{
    Task<Client?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<Client?> GetWithPoliciesAsync(int clientId, CancellationToken ct = default);
    Task<IEnumerable<Client>> SearchAsync(string searchTerm, CancellationToken ct = default);
}

// ─────────────────────────────────────────────
//  Policy repository
// ─────────────────────────────────────────────
public interface IPolicyRepository : IRepository<Policy>
{
    Task<Policy?> GetByPolicyNumberAsync(string policyNumber, CancellationToken ct = default);
    Task<Policy?> GetWithDetailsAsync(int policyId, CancellationToken ct = default);
    Task<IEnumerable<Policy>> GetByClientIdAsync(int clientId, CancellationToken ct = default);
    Task<IEnumerable<Policy>> GetByTypeAsync(PolicyType type, CancellationToken ct = default);
    Task<IEnumerable<Policy>> GetByStatusAsync(PolicyStatus status, CancellationToken ct = default);
    Task<IEnumerable<Policy>> GetExpiringAsync(int daysAhead, CancellationToken ct = default);
}

// ─────────────────────────────────────────────
//  Claim repository
// ─────────────────────────────────────────────
public interface IClaimRepository : IRepository<Claim>
{
    Task<IEnumerable<Claim>> GetByPolicyIdAsync(int policyId, CancellationToken ct = default);
    Task<IEnumerable<Claim>> GetByStatusAsync(ClaimStatus status, CancellationToken ct = default);
    Task<IEnumerable<Claim>> GetByClientIdAsync(int clientId, CancellationToken ct = default);
    Task<decimal> GetTotalClaimedByPolicyAsync(int policyId, CancellationToken ct = default);
}
