// src/app/core/services/client.service.ts
//
// Services sit between components and repositories.
// They own: state (BehaviorSubject), business logic, and error handling.
// Components call services — never repositories directly.

import { Injectable, signal } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { ClientRepository }    from '@repos/client.repository';
import {
  Client, ClientSummary,
  CreateClientRequest, UpdateClientRequest
} from '@models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {

  // Signals are Angular 17's reactive state primitive.
  // Components read these and re-render automatically when they change.
  readonly clients  = signal<ClientSummary[]>([]);
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);

  constructor(private repo: ClientRepository) {}

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    this.repo.getAll().subscribe({
      next: res => {
        this.clients.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  getById(id: number): Observable<Client | null> {
    return this.repo.getById(id).pipe(
      map(res => res.data)
    );
  }

  getWithPolicies(id: number): Observable<Client | null> {
    return this.repo.getWithPolicies(id).pipe(
      map(res => res.data)
    );
  }

  search(q: string): void {
    if (!q.trim()) { this.loadAll(); return; }

    this.loading.set(true);
    this.repo.search(q).subscribe({
      next: res => {
        this.clients.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  create(req: CreateClientRequest): Observable<Client | null> {
    return this.repo.create(req).pipe(
      tap(() => this.loadAll()),  // refresh the list after creating
      map(res => res.data)
    );
  }

  update(id: number, req: UpdateClientRequest): Observable<Client | null> {
    return this.repo.update(id, req).pipe(
      tap(() => this.loadAll()),
      map(res => res.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.repo.delete(id).pipe(
      tap(() => this.loadAll())
    );
  }
}
