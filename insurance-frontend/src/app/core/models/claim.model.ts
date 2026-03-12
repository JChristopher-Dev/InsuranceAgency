// src/app/core/models/claim.model.ts

export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid';

export interface Claim {
  claimID:      number;
  policyID:     number;
  policyNumber: string;
  clientName:   string;
  claimDate:    string;
  amount:       number;
  status:       ClaimStatus;
  description:  string;
}

export interface CreateClaimRequest {
  policyID:    number;
  amount:      number;
  description: string;
}

export interface UpdateClaimStatusRequest {
  status:           ClaimStatus;
  rejectionReason?: string;
}
