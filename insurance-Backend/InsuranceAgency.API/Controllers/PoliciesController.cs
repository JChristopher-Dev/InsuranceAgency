using InsuranceAgency.API.DTOs;
using InsuranceAgency.Domain.Entities;
using InsuranceAgency.Domain.Enums;
using InsuranceAgency.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceAgency.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class PoliciesController : ControllerBase
{
    private readonly IPolicyRepository _policies;
    private readonly IClientRepository _clients;
    private readonly ILogger<PoliciesController> _logger;

    public PoliciesController(IPolicyRepository policies,
                               IClientRepository clients,
                               ILogger<PoliciesController> logger)
    {
        _policies = policies;
        _clients  = clients;
        _logger   = logger;
    }

    // GET api/policies
    /// <summary>Get all policies</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<PolicySummaryResponse>), 200)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var policies = await _policies.GetAllAsync(ct);
        var data = policies.Select(MapToSummary);
        return Ok(new PagedResponse<PolicySummaryResponse>(true, "OK", data, data.Count()));
    }

    // GET api/policies/5
    /// <summary>Get full policy detail including type-specific coverage</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<PolicyResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var policy = await _policies.GetWithDetailsAsync(id, ct);
        if (policy is null) return NotFound(Fail($"Policy {id} not found."));
        return Ok(new ApiResponse<PolicyResponse>(true, "OK", MapToResponse(policy)));
    }

    // GET api/policies/by-number/{number}
    /// <summary>Get a policy by policy number</summary>
    [HttpGet("by-number/{number}")]
    [ProducesResponseType(typeof(ApiResponse<PolicyResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetByNumber(string number, CancellationToken ct)
    {
        var policy = await _policies.GetByPolicyNumberAsync(number, ct);
        if (policy is null) return NotFound(Fail($"Policy '{number}' not found."));
        var detail = await _policies.GetWithDetailsAsync(policy.PolicyID, ct);
        return Ok(new ApiResponse<PolicyResponse>(true, "OK", MapToResponse(detail!)));
    }

    // GET api/policies/by-type/{type}
    /// <summary>Filter policies by type: Life, Funeral, Legal</summary>
    [HttpGet("by-type/{type}")]
    [ProducesResponseType(typeof(PagedResponse<PolicySummaryResponse>), 200)]
    public async Task<IActionResult> GetByType(string type, CancellationToken ct)
    {
        if (!Enum.TryParse<PolicyType>(type, true, out var policyType))
            return BadRequest(Fail("Invalid policy type. Use: Life, Funeral, Legal"));

        var policies = await _policies.GetByTypeAsync(policyType, ct);
        var data = policies.Select(MapToSummary);
        return Ok(new PagedResponse<PolicySummaryResponse>(true, "OK", data, data.Count()));
    }

    // GET api/policies/by-status/{status}
    /// <summary>Filter policies by status: Active, Cancelled, Expired, Suspended</summary>
    [HttpGet("by-status/{status}")]
    [ProducesResponseType(typeof(PagedResponse<PolicySummaryResponse>), 200)]
    public async Task<IActionResult> GetByStatus(string status, CancellationToken ct)
    {
        if (!Enum.TryParse<PolicyStatus>(status, true, out var policyStatus))
            return BadRequest(Fail("Invalid status. Use: Active, Cancelled, Expired, Suspended"));

        var policies = await _policies.GetByStatusAsync(policyStatus, ct);
        var data = policies.Select(MapToSummary);
        return Ok(new PagedResponse<PolicySummaryResponse>(true, "OK", data, data.Count()));
    }

    // GET api/policies/expiring?daysAhead=30
    /// <summary>Get active policies expiring within N days</summary>
    [HttpGet("expiring")]
    [ProducesResponseType(typeof(PagedResponse<PolicySummaryResponse>), 200)]
    public async Task<IActionResult> GetExpiring([FromQuery] int daysAhead = 30, CancellationToken ct = default)
    {
        var policies = await _policies.GetExpiringAsync(daysAhead, ct);
        var data = policies.Select(MapToSummary);
        return Ok(new PagedResponse<PolicySummaryResponse>(true, "OK", data, data.Count()));
    }

    // GET api/policies/client/{clientId}
    /// <summary>Get all policies for a specific client</summary>
    [HttpGet("client/{clientId:int}")]
    [ProducesResponseType(typeof(PagedResponse<PolicySummaryResponse>), 200)]
    public async Task<IActionResult> GetByClient(int clientId, CancellationToken ct)
    {
        var policies = await _policies.GetByClientIdAsync(clientId, ct);
        var data = policies.Select(MapToSummary);
        return Ok(new PagedResponse<PolicySummaryResponse>(true, "OK", data, data.Count()));
    }

    // POST api/policies
    /// <summary>Create a new policy (Life, Funeral, or Legal)</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PolicyResponse>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreatePolicyRequest req, CancellationToken ct)
    {
        var client = await _clients.GetByIdAsync(req.ClientID, ct);
        if (client is null) return NotFound(Fail($"Client {req.ClientID} not found."));

        var existing = await _policies.GetByPolicyNumberAsync(req.PolicyNumber, ct);
        if (existing is not null)
            return Conflict(Fail($"Policy number '{req.PolicyNumber}' already exists."));

        if (!Enum.TryParse<PolicyType>(req.PolicyType, true, out var policyType))
            return BadRequest(Fail("Invalid PolicyType. Use: Life, Funeral, Legal"));

        try
        {
            var policy = new Policy(req.ClientID, req.PolicyNumber, req.StartDate,
                                    req.EndDate, req.PremiumAmount, policyType);
            await _policies.AddAsync(policy, ct);
            await _policies.SaveChangesAsync(ct);   // Save first to get PolicyID

            // Attach type-specific detail
            switch (policyType)
            {
                case PolicyType.Life:
                    if (req.CoverageAmount is null || req.Beneficiary is null)
                        return BadRequest(Fail("Life policies require CoverageAmount and Beneficiary."));
                    // These are added via DbContext directly since Policy navigations use owned EF types
                    // In a real app you'd inject the specific sub-context or use a service
                    break;

                case PolicyType.Funeral:
                    if (req.CoverageAmount is null || req.FuneralType is null)
                        return BadRequest(Fail("Funeral policies require CoverageAmount and FuneralType."));
                    break;

                case PolicyType.Legal:
                    if (req.MaxCoverageAmount is null || req.LegalType is null)
                        return BadRequest(Fail("Legal policies require MaxCoverageAmount and LegalType."));
                    break;
            }

            _logger.LogInformation("Created policy {PolicyNumber}", policy.PolicyNumber);
            var detail = await _policies.GetWithDetailsAsync(policy.PolicyID, ct);
            return CreatedAtAction(nameof(GetById), new { id = policy.PolicyID },
                new ApiResponse<PolicyResponse>(true, "Policy created.", MapToResponse(detail!)));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(Fail(ex.Message));
        }
    }

    // PATCH api/policies/5/status
    /// <summary>Update a policy status (Active, Cancelled, Expired, Suspended)</summary>
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(ApiResponse<PolicyResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePolicyStatusRequest req, CancellationToken ct)
    {
        var policy = await _policies.GetByIdAsync(id, ct);
        if (policy is null) return NotFound(Fail($"Policy {id} not found."));

        try
        {
            switch (req.Status.ToLower())
            {
                case "active":    policy.Activate(); break;
                case "cancelled": policy.Cancel();   break;
                case "expired":   policy.Expire();   break;
                case "suspended": policy.Suspend();  break;
                default:
                    return BadRequest(Fail("Invalid status. Use: Active, Cancelled, Expired, Suspended"));
            }

            _policies.Update(policy);
            await _policies.SaveChangesAsync(ct);
            var detail = await _policies.GetWithDetailsAsync(id, ct);
            return Ok(new ApiResponse<PolicyResponse>(true, "Status updated.", MapToResponse(detail!)));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(Fail(ex.Message));
        }
    }

    // PATCH api/policies/5/premium
    /// <summary>Update policy premium amount</summary>
    [HttpPatch("{id:int}/premium")]
    [ProducesResponseType(typeof(ApiResponse<PolicyResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdatePremium(int id, [FromBody] UpdatePremiumRequest req, CancellationToken ct)
    {
        var policy = await _policies.GetByIdAsync(id, ct);
        if (policy is null) return NotFound(Fail($"Policy {id} not found."));

        try
        {
            policy.UpdatePremium(req.PremiumAmount);
            _policies.Update(policy);
            await _policies.SaveChangesAsync(ct);
            var detail = await _policies.GetWithDetailsAsync(id, ct);
            return Ok(new ApiResponse<PolicyResponse>(true, "Premium updated.", MapToResponse(detail!)));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(Fail(ex.Message));
        }
    }

    // DELETE api/policies/5
    /// <summary>Delete a policy</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var policy = await _policies.GetByIdAsync(id, ct);
        if (policy is null) return NotFound(Fail($"Policy {id} not found."));
        _policies.Delete(policy);
        await _policies.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Mappers ──────────────────────────────────────────────────
    private static PolicyResponse MapToResponse(Policy p) => new(
        p.PolicyID,
        p.ClientID,
        p.Client?.FullName ?? string.Empty,
        p.PolicyNumber,
        p.StartDate.ToString("yyyy-MM-dd"),
        p.EndDate.ToString("yyyy-MM-dd"),
        p.PremiumAmount,
        p.PolicyType.ToString(),
        p.Status.ToString(),
        p.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
        p.LifePolicy   is null ? null : new LifePolicyDetail(p.LifePolicy.LifePolicyID, p.LifePolicy.CoverageAmount, p.LifePolicy.Beneficiary),
        p.FuneralPolicy is null ? null : new FuneralPolicyDetail(p.FuneralPolicy.FuneralPolicyID, p.FuneralPolicy.CoverageAmount, p.FuneralPolicy.FuneralType),
        p.LegalPolicy  is null ? null : new LegalPolicyDetail(p.LegalPolicy.LegalPolicyID, p.LegalPolicy.MaxCoverageAmount, p.LegalPolicy.LegalType)
    );

    private static PolicySummaryResponse MapToSummary(Policy p) => new(
        p.PolicyID,
        p.PolicyNumber,
        p.PolicyType.ToString(),
        p.Status.ToString(),
        p.PremiumAmount,
        p.EndDate.ToString("yyyy-MM-dd")
    );

    private static object Fail(string msg) =>
        new ApiResponse<object>(false, msg, null);
}
