namespace InsuranceAgency.Domain.Enums;

public enum PolicyType
{
    Life    = 1,
    Funeral = 2,
    Legal   = 3
}

public enum PolicyStatus
{
    Active    = 1,
    Cancelled = 2,
    Expired   = 3,
    Suspended = 4
}

public enum ClaimStatus
{
    Pending  = 1,
    Approved = 2,
    Rejected = 3,
    Paid     = 4
}
