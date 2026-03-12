namespace InsuranceAgency.API.DTOs;

// ═══════════════════════════════════════════════════════
//  CLIENT DTOs
// ═══════════════════════════════════════════════════════

public record ClientResponse(
    int     ClientID,
    string  FirstName,
    string  LastName,
    string  FullName,
    string  DateOfBirth,
    string  Email,
    string  Phone,
    string  Address,
    string  CreatedAt
);

public record ClientSummaryResponse(
    int    ClientID,
    string FullName,
    string Email,
    string Phone,
    int    PolicyCount
);

public record CreateClientRequest(
    string FirstName,
    string LastName,
    DateTime DateOfBirth,
    string Email,
    string Phone,
    string Address
);

public record UpdateClientRequest(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Address
);

// ═══════════════════════════════════════════════════════
//  POLICY DTOs
// ═══════════════════════════════════════════════════════

public record PolicyResponse(
    int      PolicyID,
    int      ClientID,
    string   ClientName,
    string   PolicyNumber,
    string   StartDate,
    string   EndDate,
    decimal  PremiumAmount,
    string   PolicyType,
    string   Status,
    string   CreatedAt,
    LifePolicyDetail?    LifeDetail,
    FuneralPolicyDetail? FuneralDetail,
    LegalPolicyDetail?   LegalDetail
);

public record PolicySummaryResponse(
    int     PolicyID,
    string  PolicyNumber,
    string  PolicyType,
    string  Status,
    decimal PremiumAmount,
    string  EndDate
);

public record LifePolicyDetail(
    int     LifePolicyID,
    decimal CoverageAmount,
    string  Beneficiary
);

public record FuneralPolicyDetail(
    int     FuneralPolicyID,
    decimal CoverageAmount,
    string  FuneralType
);

public record LegalPolicyDetail(
    int     LegalPolicyID,
    decimal MaxCoverageAmount,
    string  LegalType
);

public record CreatePolicyRequest(
    int      ClientID,
    string   PolicyNumber,
    DateTime StartDate,
    DateTime EndDate,
    decimal  PremiumAmount,
    string   PolicyType,          // "Life" | "Funeral" | "Legal"
    // Type-specific fields (only the relevant set required)
    decimal? CoverageAmount,
    string?  Beneficiary,         // Life only
    string?  FuneralType,         // Funeral only
    decimal? MaxCoverageAmount,   // Legal only
    string?  LegalType            // Legal only
);

public record UpdatePolicyStatusRequest(string Status);

public record UpdatePremiumRequest(decimal PremiumAmount);

// ═══════════════════════════════════════════════════════
//  CLAIM DTOs
// ═══════════════════════════════════════════════════════

public record ClaimResponse(
    int     ClaimID,
    int     PolicyID,
    string  PolicyNumber,
    string  ClientName,
    string  ClaimDate,
    decimal Amount,
    string  Status,
    string  Description
);

public record CreateClaimRequest(
    int     PolicyID,
    decimal Amount,
    string  Description
);

public record UpdateClaimStatusRequest(
    string  Status,   // "Approved" | "Rejected" | "Paid"
    string? RejectionReason
);

// ═══════════════════════════════════════════════════════
//  SHARED
// ═══════════════════════════════════════════════════════

public record ApiResponse<T>(bool Success, string Message, T? Data);
public record PagedResponse<T>(bool Success, string Message, IEnumerable<T> Data, int Total);
