using InsuranceAgency.Domain.Enums;

namespace InsuranceAgency.Domain.Entities;

public class Policy
{
    public int PolicyID { get; private set; }
    public int ClientID { get; private set; }
    public string PolicyNumber { get; private set; } = string.Empty;
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public decimal PremiumAmount { get; private set; }
    public PolicyType PolicyType { get; private set; }
    public PolicyStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Navigation
    public Client Client { get; private set; } = null!;
    public LifePolicy? LifePolicy { get; private set; }
    public FuneralPolicy? FuneralPolicy { get; private set; }
    public LegalPolicy? LegalPolicy { get; private set; }

    public IReadOnlyCollection<Claim> Claims => _claims.AsReadOnly();
    private readonly List<Claim> _claims = new();

    protected Policy() { }

    public Policy(int clientId, string policyNumber, DateTime startDate,
                  DateTime endDate, decimal premiumAmount, PolicyType policyType)
    {
        if (endDate <= startDate)
            throw new ArgumentException("EndDate must be after StartDate.");
        if (premiumAmount <= 0)
            throw new ArgumentException("PremiumAmount must be greater than zero.");

        ClientID      = clientId;
        PolicyNumber  = policyNumber.Trim();
        StartDate     = startDate;
        EndDate       = endDate;
        PremiumAmount = premiumAmount;
        PolicyType    = policyType;
        Status        = PolicyStatus.Active;
        CreatedAt     = DateTime.UtcNow;
    }

    public void Activate()  => Status = PolicyStatus.Active;
    public void Cancel()    => Status = PolicyStatus.Cancelled;
    public void Expire()    => Status = PolicyStatus.Expired;
    public void Suspend()   => Status = PolicyStatus.Suspended;

    public void UpdatePremium(decimal newAmount)
    {
        if (newAmount <= 0) throw new ArgumentException("Premium must be positive.");
        PremiumAmount = newAmount;
    }

    public bool IsActive => Status == PolicyStatus.Active;
}
