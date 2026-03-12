using InsuranceAgency.API.DTOs;
using InsuranceAgency.Domain.Entities;
using InsuranceAgency.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceAgency.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ClientsController : ControllerBase
{
    private readonly IClientRepository _clients;
    private readonly ILogger<ClientsController> _logger;

    public ClientsController(IClientRepository clients, ILogger<ClientsController> logger)
    {
        _clients = clients;
        _logger  = logger;
    }

    // GET api/clients
    /// <summary>Get all clients</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<ClientSummaryResponse>), 200)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var clients = await _clients.GetAllAsync(ct);
        var data = clients.Select(MapToSummary);
        return Ok(new PagedResponse<ClientSummaryResponse>(true, "OK", data, data.Count()));
    }

    // GET api/clients/5
    /// <summary>Get a client by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ClientResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var client = await _clients.GetByIdAsync(id, ct);
        if (client is null) return NotFound(Fail($"Client {id} not found."));
        return Ok(Ok(new ApiResponse<ClientResponse>(true, "OK", MapToResponse(client))));
    }

    // GET api/clients/5/policies
    /// <summary>Get a client together with all their policies</summary>
    [HttpGet("{id:int}/policies")]
    [ProducesResponseType(typeof(ApiResponse<ClientResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetWithPolicies(int id, CancellationToken ct)
    {
        var client = await _clients.GetWithPoliciesAsync(id, ct);
        if (client is null) return NotFound(Fail($"Client {id} not found."));
        return Ok(new ApiResponse<ClientResponse>(true, "OK", MapToResponse(client)));
    }

    // GET api/clients/search?q=john
    /// <summary>Search clients by name or email</summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(PagedResponse<ClientSummaryResponse>), 200)]
    public async Task<IActionResult> Search([FromQuery] string q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(Fail("Search term is required."));

        var results = await _clients.SearchAsync(q, ct);
        var data = results.Select(MapToSummary);
        return Ok(new PagedResponse<ClientSummaryResponse>(true, "OK", data, data.Count()));
    }

    // POST api/clients
    /// <summary>Create a new client</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ClientResponse>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateClientRequest req, CancellationToken ct)
    {
        // Check duplicate email
        var existing = await _clients.GetByEmailAsync(req.Email, ct);
        if (existing is not null)
            return Conflict(Fail($"A client with email '{req.Email}' already exists."));

        try
        {
            var client = new Client(req.FirstName, req.LastName, req.DateOfBirth,
                                    req.Email, req.Phone, req.Address);
            await _clients.AddAsync(client, ct);
            await _clients.SaveChangesAsync(ct);

            _logger.LogInformation("Created client {ClientID}", client.ClientID);
            return CreatedAtAction(nameof(GetById), new { id = client.ClientID },
                new ApiResponse<ClientResponse>(true, "Client created.", MapToResponse(client)));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(Fail(ex.Message));
        }
    }

    // PUT api/clients/5
    /// <summary>Update an existing client</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ClientResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClientRequest req, CancellationToken ct)
    {
        var client = await _clients.GetByIdAsync(id, ct);
        if (client is null) return NotFound(Fail($"Client {id} not found."));

        try
        {
            client.Update(req.FirstName, req.LastName, req.Email, req.Phone, req.Address);
            _clients.Update(client);
            await _clients.SaveChangesAsync(ct);
            return Ok(new ApiResponse<ClientResponse>(true, "Client updated.", MapToResponse(client)));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(Fail(ex.Message));
        }
    }

    // DELETE api/clients/5
    /// <summary>Delete a client</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var client = await _clients.GetByIdAsync(id, ct);
        if (client is null) return NotFound(Fail($"Client {id} not found."));
        _clients.Delete(client);
        await _clients.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Mappers ───────────────────────────────────────────────────
    private static ClientResponse MapToResponse(Client c) => new(
        c.ClientID,
        c.FirstName,
        c.LastName,
        c.FullName,
        c.DateOfBirth.ToString("yyyy-MM-dd"),
        c.Email,
        c.Phone,
        c.Address,
        c.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
    );

    private static ClientSummaryResponse MapToSummary(Client c) => new(
        c.ClientID,
        c.FullName,
        c.Email,
        c.Phone,
        c.Policies.Count
    );

    private static object Fail(string msg) =>
        new ApiResponse<object>(false, msg, null);
}
