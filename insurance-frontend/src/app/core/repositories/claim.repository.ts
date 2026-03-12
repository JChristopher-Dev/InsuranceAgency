// src/app/core/repositories/claim.repository.ts

import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { ApiResponse, PagedResponse } from '../../core/models/api-response.model';
import {
  Claim, ClaimStatus,
  CreateClaimRequest, UpdateClaimStatusRequest
} from '../../core/models/claim.model';

@Injectable({ providedIn: 'root' })
export class ClaimRepository {

  private readonly base = 'claims';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PagedResponse<Claim>> {
    return this.http.get<PagedResponse<Claim>>(this.base);
  }

  getById(id: number): Observable<ApiResponse<Claim>> {
    return this.http.get<ApiResponse<Claim>>(`${this.base}/${id}`);
  }

  getByPolicy(policyId: number): Observable<PagedResponse<Claim>> {
    return this.http.get<PagedResponse<Claim>>(`${this.base}/policy/${policyId}`);
  }

  getByClient(clientId: number): Observable<PagedResponse<Claim>> {
    return this.http.get<PagedResponse<Claim>>(`${this.base}/client/${clientId}`);
  }

  getByStatus(status: ClaimStatus): Observable<PagedResponse<Claim>> {
    return this.http.get<PagedResponse<Claim>>(`${this.base}/by-status/${status}`);
  }

  getTotalByPolicy(policyId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.base}/policy/${policyId}/total`);
  }

  create(body: CreateClaimRequest): Observable<ApiResponse<Claim>> {
    return this.http.post<ApiResponse<Claim>>(this.base, body);
  }

  updateStatus(id: number, body: UpdateClaimStatusRequest): Observable<ApiResponse<Claim>> {
    return this.http.patch<ApiResponse<Claim>>(`${this.base}/${id}/status`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
