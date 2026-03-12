// src/app/core/repositories/client.repository.ts
//
// Repositories own the raw HTTP calls — nothing else.
// They map URL + verb to a typed Observable.
// They do NOT contain business logic or state.
//
// The separation: Repository = "how to talk to the API"
//                 Service    = "what to do with the data"

import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import {
  ApiResponse, PagedResponse
} from '@models/api-response.model';
import {
  Client, ClientSummary,
  CreateClientRequest, UpdateClientRequest
} from '@models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientRepository {

  // 'clients' is the path after the base URL set in the interceptor
  private readonly base = 'clients';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PagedResponse<ClientSummary>> {
    return this.http.get<PagedResponse<ClientSummary>>(this.base);
  }

  getById(id: number): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.base}/${id}`);
  }

  getWithPolicies(id: number): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.base}/${id}/policies`);
  }

  search(q: string): Observable<PagedResponse<ClientSummary>> {
    return this.http.get<PagedResponse<ClientSummary>>(`${this.base}/search`, {
      params: { q }
    });
  }

  create(body: CreateClientRequest): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(this.base, body);
  }

  update(id: number, body: UpdateClientRequest): Observable<ApiResponse<Client>> {
    return this.http.put<ApiResponse<Client>>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
