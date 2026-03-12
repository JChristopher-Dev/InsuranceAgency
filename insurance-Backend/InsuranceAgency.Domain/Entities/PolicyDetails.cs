namespace InsuranceAgency.Domain.Entities;

// ─────────────────────────────────────────────
//  Life Policy
// ─────────────────────────────────────────────
public class LifePolicy
{
    public int LifePolicyID { get; private set; }
    public int PolicyID { get; private set; }
    public decimal CoverageAmount { get; private set; }
    public string Beneficiary { get; private set; } = string.Empty;

    public Policy Policy { get; private set; } = null!;

    protected LifePolicy() { }

    public LifePolicy(int policyId, decimal coverageAmount, string beneficiary)
    {
        if (coverageAmount <= 0)
            throw new ArgumentException("CoverageAmount must be positive.");
        if (string.IsNullOrWhiteSpace(beneficiary))
            throw new ArgumentException("Beneficiary is required.");

        PolicyID       = policyId;
        CoverageAmount = coverageAmount;
        Beneficiary    = beneficiary.Trim();
    }

    public void UpdateBeneficiary(string beneficiary)
    {
        if (string.IsNullOrWhiteSpace(beneficiary))
            throw new ArgumentException("Beneficiary is required.");
        Beneficiary = beneficiary.Trim();
    }

    public void UpdateCoverage(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Coverage must be positive.");
        CoverageAmount = amount;
    }
}

// ─────────────────────────────────────────────
//  Funeral Policy
// ─────────────────────────────────────────────
public class FuneralPolicy
{
    public int FuneralPolicyID { get; private set; }
    public int PolicyID { get; private set; }
    public decimal CoverageAmount { get; private set; }
    public string FuneralType { get; private set; } = string.Empty;

    public Policy Policy { get; private set; } = null!;

    protected FuneralPolicy() { }

    public FuneralPolicy(int policyId, decimal coverageAmount, string funeralType)
    {
        if (coverageAmount <= 0)
            throw new ArgumentException("CoverageAmount must be positive.");
        if (string.IsNullOrWhiteSpace(funeralType))
            throw new ArgumentException("FuneralType is required.");

        PolicyID       = policyId;
        CoverageAmount = coverageAmount;
        FuneralType    = funeralType.Trim();
    }

    public void Update(decimal coverageAmount, string funeralType)
    {
        if (coverageAmount <= 0) throw new ArgumentException("Coverage must be positive.");
        CoverageAmount = coverageAmount;
        FuneralType    = funeralType.Trim();
    }
}

// ─────────────────────────────────────────────
//  Legal Policy
// ─────────────────────────────────────────────
public class LegalPolicy
{
    public int LegalPolicyID { get; private set; }
    public int PolicyID { get; private set; }
    public decimal MaxCoverageAmount { get; private set; }
    public string LegalType { get; private set; } = string.Empty;

    public Policy Policy { get; private set; } = null!;

    protected LegalPolicy() { }

    public LegalPolicy(int policyId, decimal maxCoverageAmount, string legalType)
    {
        if (maxCoverageAmount <= 0)
            throw new ArgumentException("MaxCoverageAmount must be positive.");
        if (string.IsNullOrWhiteSpace(legalType))
            throw new ArgumentException("LegalType is required.");

        PolicyID          = policyId;
        MaxCoverageAmount = maxCoverageAmount;
        LegalType         = legalType.Trim();
    }

    public void Update(decimal maxCoverageAmount, string legalType)
    {
        if (maxCoverageAmount <= 0) throw new ArgumentException("Coverage must be positive.");
        MaxCoverageAmount = maxCoverageAmount;
        LegalType         = legalType.Trim();
    }
}
