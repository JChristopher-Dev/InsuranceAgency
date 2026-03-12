using InsuranceAgency.API.DTOs;
using InsuranceAgency.Domain.Entities;
using InsuranceAgency.Domain.Enums;
using InsuranceAgency.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceAgency.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ClaimsController : ControllerBase
{
    private readonly IClaimRepository  _claims;
    private readonly IPolicyRepository _policies;
    private readonly ILogger<ClaimsController> _logger;

    public ClaimsController(IClaimRepository claims,
                             IPolicyRepository policies,
                             ILogger<ClaimsController> logger)
    {
        _claims   = claims;
        _policies = policies;
        _logger   = logger;
    }

    // GET api/claims
    /// <summary>Get all claims</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<ClaimResponse>), 200)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var claims = await _claims.GetAllAsync(ct);
        var data   = claims.Select(MapToResponse);
        return Ok(new PagedResponse<ClaimResponse>(true, "OK", data, data.Count()));
    }

    // GET api/claims/5
    /// <summary>Get a single claim by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ClaimResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var claim = await _claims.GetByIdAsync(id, ct);
        if (claim is null) return NotFound(Fail($"Claim {id} not found."));
        return Ok(new ApiResponse<ClaimResponse>(true, "OK", MapToResponse(claim)));
    }

    // GET api/claims/policy/{policyId}
    /// <summary>Get all claims for a specific policy</summary>
    [HttpGet("policy/{policyId:int}")]
    [ProducesResponseType(typeof(PagedResponse<ClaimResponse>), 200)]
    public async Task<IActionResult> GetByPolicy(int policyId, CancellationToken ct)
    {
        var claims = await _claims.GetByPolicyIdAsync(policyId, ct);
        var data   = claims.Select(MapToResponse);
        return Ok(new PagedResponse<ClaimResponse>(true, "OK", data, data.Count()));
    }

    // GET api/claims/client/{clientId}
    /// <summary>Get all claims for a specific client across all their policies</summary>
    [HttpGet("client/{clientId:int}")]
    [ProducesResponseType(typeof(PagedResponse<ClaimResponse>), 200)]
    public async Task<IActionResult> GetByClient(int clientId, CancellationToken ct)
    {
        var claims = await _claims.GetByClientIdAsync(clientId, ct);
        var data   = claims.Select(MapToResponse);
        return Ok(new PagedResponse<ClaimResponse>(true, "OK", data, data.Count()));
    }

    // GET api/claims/by-status/{status}
    /// <summary>Filter claims by status: Pending, Approved, Rejected, Paid</summary>
    [HttpGet("by-status/{status}")]
    [ProducesResponseType(typeof(PagedResponse<ClaimResponse>), 200)]
    public async Task<IActionResult> GetByStatus(string status, CancellationToken ct)
    {
        if (!Enum.TryParse<ClaimStatus>(status, true, out var claimStatus))
            return BadRequest(Fail("Invalid status. Use: Pending, Approved, Rejected, Paid"));

        var claims = await _claims.GetByStatusAsync(claimStatus, ct);
        var data   = claims.Select(MapToResponse);
        return Ok(new PagedResponse<ClaimResponse>(true, "OK", data, data.Count()));
    }

    // GET api/claims/policy/{policyId}/total
    /// <summary>Get total approved/paid claims amount for a policy</summary>
    [HttpGet("policy/{policyId:int}/total")]
    [ProducesResponseType(typeof(ApiResponse<decimal>), 200)]
    public async Task<IActionResult> GetTotalClaimed(int policyId, CancellationToken ct)
    {
        var total = await _claims.GetTotalClaimedByPolicyAsync(policyId, ct);
        return Ok(new ApiResponse<decimal>(true, "OK", total));
    }

    // POST api/claims
    /// <summary>Submit a new claim against an active policy</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ClaimResponse>), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Create([FromBody] CreateClaimRequest req, CancellationToken ct)
    {
        var policy = await _policies.GetByIdAsync(req.PolicyID, ct);
        if (policy is null)
            return NotFound(Fail($"Policy {req.PolicyID} not found."));

        if (!policy.IsActive)
            return BadRequest(Fail($"Claims can only be made on Active policies. Current status: {policy.Status}."));

        try
        {
            var claim = new Claim(req.PolicyID, req.Amount, req.Description);
            await _claims.AddAsync(claim, ct);
            await _claims.SaveChangesAsync(ct);

            _logger.LogInformation("Claim {ClaimID} submitted for policy {PolicyID}", claim.ClaimID, req.PolicyID);
            return CreatedAtAction(nameof(GetById), new { id = claim.ClaimID },
                new ApiResponse<ClaimResponse>(true, "Claim submitted.", MapToResponse(claim)));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(Fail(ex.Message));
        }
    }

    // PATCH api/claims/5/status
    /// <summary>Update claim status — Approve, Reject (with reason), or mark Paid</summary>
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(ApiResponse<ClaimResponse>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateClaimStatusRequest req, CancellationToken ct)
    {
        var claim = await _claims.GetByIdAsync(id, ct);
        if (claim is null) return NotFound(Fail($"Claim {id} not found."));

        try
        {
            switch (req.Status.ToLower())
            {
                case "approved":
                    claim.Approve();
                    break;
                case "rejected":
                    if (string.IsNullOrWhiteSpace(req.RejectionReason))
                        return BadRequest(Fail("RejectionReason is required when rejecting a claim."));
                    claim.Reject(req.RejectionReason);
                    break;
                case "paid":
                    claim.MarkPaid();
                    break;
                default:
                    return BadRequest(Fail("Invalid status. Use: Approved, Rejected, Paid"));
            }

            _claims.Update(claim);
            await _claims.SaveChangesAsync(ct);
            _logger.LogInformation("Claim {ClaimID} status → {Status}", id, req.Status);
            return Ok(new ApiResponse<ClaimResponse>(true, $"Claim {req.Status}.", MapToResponse(claim)));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(Fail(ex.Message));
        }
    }

    // DELETE api/claims/5
    /// <summary>Delete a claim (only Pending claims can be deleted)</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var claim = await _claims.GetByIdAsync(id, ct);
        if (claim is null) return NotFound(Fail($"Claim {id} not found."));

        if (claim.Status != ClaimStatus.Pending)
            return BadRequest(Fail("Only Pending claims can be deleted."));

        _claims.Delete(claim);
        await _claims.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Mappers ──────────────────────────────────────────────────
    private static ClaimResponse MapToResponse(Claim c) => new(
        c.ClaimID,
        c.PolicyID,
        c.Policy?.PolicyNumber ?? string.Empty,
        c.Policy?.Client?.FullName ?? string.Empty,
        c.ClaimDate.ToString("yyyy-MM-dd"),
        c.Amount,
        c.Status.ToString(),
        c.Description
    );

    private static object Fail(string msg) =>
        new ApiResponse<object>(false, msg, null);
}
