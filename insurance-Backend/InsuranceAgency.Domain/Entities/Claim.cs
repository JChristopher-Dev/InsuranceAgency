using InsuranceAgency.Domain.Enums;

namespace InsuranceAgency.Domain.Entities;

public class Claim
{
    public int ClaimID { get; private set; }
    public int PolicyID { get; private set; }
    public DateTime ClaimDate { get; private set; }
    public decimal Amount { get; private set; }
    public ClaimStatus Status { get; private set; }
    public string Description { get; private set; } = string.Empty;

    public Policy Policy { get; private set; } = null!;

    protected Claim() { }

    public Claim(int policyId, decimal amount, string description)
    {
        if (amount <= 0)
            throw new ArgumentException("Claim amount must be greater than zero.");
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required.");

        PolicyID    = policyId;
        Amount      = amount;
        Description = description.Trim();
        ClaimDate   = DateTime.UtcNow;
        Status      = ClaimStatus.Pending;
    }

    public void Approve()
    {
        if (Status != ClaimStatus.Pending)
            throw new InvalidOperationException("Only pending claims can be approved.");
        Status = ClaimStatus.Approved;
    }

    public void Reject(string reason)
    {
        if (Status != ClaimStatus.Pending)
            throw new InvalidOperationException("Only pending claims can be rejected.");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rejection reason is required.");
        Status      = ClaimStatus.Rejected;
        Description += $" | Rejection reason: {reason}";
    }

    public void MarkPaid()
    {
        if (Status != ClaimStatus.Approved)
            throw new InvalidOperationException("Only approved claims can be marked as paid.");
        Status = ClaimStatus.Paid;
    }

    public void UpdateAmount(decimal amount)
    {
        if (Status != ClaimStatus.Pending)
            throw new InvalidOperationException("Cannot update amount on a processed claim.");
        if (amount <= 0) throw new ArgumentException("Amount must be positive.");
        Amount = amount;
    }
}
