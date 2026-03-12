// src/app/core/models/client.model.ts

// ── Response shapes (what the API sends back) ────────────────
export interface Client {
  clientID:    number;
  firstName:   string;
  lastName:    string;
  fullName:    string;
  dateOfBirth: string;   // API returns dates as strings e.g. "1990-05-14"
  email:       string;
  phone:       string;
  address:     string;
  createdAt:   string;
}

export interface ClientSummary {
  clientID:    number;
  fullName:    string;
  email:       string;
  phone:       string;
  policyCount: number;
}

// ── Request shapes (what we send TO the API) ────────────────
export interface CreateClientRequest {
  firstName:   string;
  lastName:    string;
  dateOfBirth: string;
  email:       string;
  phone:       string;
  address:     string;
}

export interface UpdateClientRequest {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  address:   string;
}
