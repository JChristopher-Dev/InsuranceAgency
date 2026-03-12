// src/app/core/services/claim.service.ts

import { Injectable, signal } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { ClaimRepository } from '@repos/claim.repository';
import {
  Claim, ClaimStatus, CreateClaimRequest
} from '@models/claim.model';

@Injectable({ providedIn: 'root' })
export class ClaimService {

  readonly claims  = signal<Claim[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  constructor(private repo: ClaimRepository) {}

  loadAll(): void {
    this.loading.set(true);
    this.repo.getAll().subscribe({
      next: res => { this.claims.set(res.data ?? []); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadByStatus(status: ClaimStatus): void {
    this.loading.set(true);
    this.repo.getByStatus(status).subscribe({
      next: res => { this.claims.set(res.data ?? []); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadByPolicy(policyId: number): void {
    this.loading.set(true);
    this.repo.getByPolicy(policyId).subscribe({
      next: res => { this.claims.set(res.data ?? []); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getById(id: number): Observable<Claim | null> {
    return this.repo.getById(id).pipe(map(r => r.data));
  }

  create(req: CreateClaimRequest): Observable<Claim | null> {
    return this.repo.create(req).pipe(
      tap(() => this.loadAll()),
      map(r => r.data)
    );
  }

  approve(id: number): Observable<Claim | null> {
    return this.repo.updateStatus(id, { status: 'Approved' }).pipe(
      tap(() => this.loadAll()),
      map(r => r.data)
    );
  }

  reject(id: number, reason: string): Observable<Claim | null> {
    return this.repo.updateStatus(id, { status: 'Rejected', rejectionReason: reason }).pipe(
      tap(() => this.loadAll()),
      map(r => r.data)
    );
  }

  markPaid(id: number): Observable<Claim | null> {
    return this.repo.updateStatus(id, { status: 'Paid' }).pipe(
      tap(() => this.loadAll()),
      map(r => r.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.repo.delete(id).pipe(tap(() => this.loadAll()));
  }
}
