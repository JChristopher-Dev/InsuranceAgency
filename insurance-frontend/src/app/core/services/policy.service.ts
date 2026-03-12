// src/app/core/services/policy.service.ts

import { Injectable, signal } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { PolicyRepository } from '@repos/policy.repository';
import {
  Policy, PolicySummary, PolicyType, PolicyStatus,
  CreatePolicyRequest, UpdatePolicyRequest
} from '@models/policy.model';

@Injectable({ providedIn: 'root' })
export class PolicyService {

  readonly policies = signal<PolicySummary[]>([]);
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);

  constructor(private repo: PolicyRepository) {}

  loadAll(): void {
    this.loading.set(true);
    this.repo.getAll().subscribe({
      next: res => { this.policies.set(res.data ?? []); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadByClient(clientId: number): void {
    this.loading.set(true);
    this.repo.getByClient(clientId).subscribe({
      next: res => { this.policies.set(res.data ?? []); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadByType(type: PolicyType): void {
    this.loading.set(true);
    this.repo.getByType(type).subscribe({
      next: res => { this.policies.set(res.data ?? []); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadExpiring(days = 30): void {
    this.loading.set(true);
    this.repo.getExpiring(days).subscribe({
      next: res => { this.policies.set(res.data ?? []); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getById(id: number): Observable<Policy | null> {
    return this.repo.getById(id).pipe(map(r => r.data));
  }

  create(req: CreatePolicyRequest): Observable<Policy | null> {
    return this.repo.create(req).pipe(
      tap(() => this.loadAll()),
      map(r => r.data)
    );
  }

  update(id: number, req: UpdatePolicyRequest): Observable<Policy | null> {
    return this.repo.update(id, req).pipe(
      tap(() => this.loadAll()),
      map(r => r.data)
    );
  }

  updateStatus(id: number, status: PolicyStatus): Observable<Policy | null> {
    return this.repo.updateStatus(id, { status }).pipe(
      tap(() => this.loadAll()),
      map(r => r.data)
    );
  }

  updatePremium(id: number, premiumAmount: number): Observable<Policy | null> {
    return this.repo.updatePremium(id, { premiumAmount }).pipe(
      tap(() => this.loadAll()),
      map(r => r.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.repo.delete(id).pipe(tap(() => this.loadAll()));
  }
}
