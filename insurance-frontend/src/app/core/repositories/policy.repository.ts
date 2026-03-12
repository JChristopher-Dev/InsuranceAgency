// src/app/core/repositories/policy.repository.ts

import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { ApiResponse, PagedResponse } from '@models/api-response.model';
import {
  Policy, PolicySummary, PolicyType, PolicyStatus,
  CreatePolicyRequest, UpdatePolicyStatusRequest, UpdatePremiumRequest
} from '@models/policy.model';

@Injectable({ providedIn: 'root' })
export class PolicyRepository {

  private readonly base = 'policies';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PagedResponse<PolicySummary>> {
    return this.http.get<PagedResponse<PolicySummary>>(this.base);
  }

  getById(id: number): Observable<ApiResponse<Policy>> {
    return this.http.get<ApiResponse<Policy>>(`${this.base}/${id}`);
  }

  getByClient(clientId: number): Observable<PagedResponse<PolicySummary>> {
    return this.http.get<PagedResponse<PolicySummary>>(`${this.base}/client/${clientId}`);
  }

  getByType(type: PolicyType): Observable<PagedResponse<PolicySummary>> {
    return this.http.get<PagedResponse<PolicySummary>>(`${this.base}/by-type/${type}`);
  }

  getByStatus(status: PolicyStatus): Observable<PagedResponse<PolicySummary>> {
    return this.http.get<PagedResponse<PolicySummary>>(`${this.base}/by-status/${status}`);
  }

  getExpiring(daysAhead = 30): Observable<PagedResponse<PolicySummary>> {
    return this.http.get<PagedResponse<PolicySummary>>(`${this.base}/expiring`, {
      params: { daysAhead }
    });
  }

  create(body: CreatePolicyRequest): Observable<ApiResponse<Policy>> {
    return this.http.post<ApiResponse<Policy>>(this.base, body);
  }

  updateStatus(id: number, body: UpdatePolicyStatusRequest): Observable<ApiResponse<Policy>> {
    return this.http.patch<ApiResponse<Policy>>(`${this.base}/${id}/status`, body);
  }

  updatePremium(id: number, body: UpdatePremiumRequest): Observable<ApiResponse<Policy>> {
    return this.http.patch<ApiResponse<Policy>>(`${this.base}/${id}/premium`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
