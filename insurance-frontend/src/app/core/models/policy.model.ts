// src/app/core/models/policy.model.ts

export type PolicyType   = 'Life' | 'Funeral' | 'Legal';
export type PolicyStatus = 'Active' | 'Cancelled' | 'Expired' | 'Suspended';

export interface LifeDetail {
  lifePolicyID:   number;
  coverageAmount: number;
  beneficiary:    string;
}

export interface FuneralDetail {
  funeralPolicyID: number;
  coverageAmount:  number;
  funeralType:     string;
}

export interface LegalDetail {
  legalPolicyID:    number;
  maxCoverageAmount: number;
  legalType:        string;
}

// Full policy — returned by GET /api/policies/{id}
export interface Policy {
  policyID:      number;
  clientID:      number;
  clientName:    string;
  policyNumber:  string;
  startDate:     string;
  endDate:       string;
  premiumAmount: number;
  policyType:    PolicyType;
  status:        PolicyStatus;
  createdAt:     string;
  lifeDetail:    LifeDetail   | null;
  funeralDetail: FuneralDetail | null;
  legalDetail:   LegalDetail   | null;
}

// Summary — returned by list endpoints
export interface PolicySummary {
  policyID:      number;
  policyNumber:  string;
  policyType:    PolicyType;
  status:        PolicyStatus;
  premiumAmount: number;
  endDate:       string;
}

export interface CreatePolicyRequest {
  clientID:          number;
  policyNumber:      string;
  startDate:         string;
  endDate:           string;
  premiumAmount:     number;
  policyType:        PolicyType;
  // Type-specific — only fill the relevant set
  coverageAmount?:    number;
  beneficiary?:       string;
  funeralType?:       string;
  maxCoverageAmount?: number;
  legalType?:         string;
}

export interface UpdatePolicyRequest {
  policyNumber:      string;
  startDate:         string;
  endDate:           string;
  premiumAmount:     number;
  policyType:        PolicyType;
  coverageAmount?:    number;
  beneficiary?:       string;
  funeralType?:       string;
  maxCoverageAmount?: number;
  legalType?:         string;
}

export interface UpdatePolicyStatusRequest { status: PolicyStatus; }
export interface UpdatePremiumRequest      { premiumAmount: number; }
