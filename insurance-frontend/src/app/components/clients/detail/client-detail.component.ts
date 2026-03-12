// src/app/components/clients/detail/client-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe }      from '@angular/common';
import { ClientService } from '../../../core/services/client.service';

import { PolicyService } from '../../../core/services/policy.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page-container">
      @if (!client) {
        <div class="spinner-wrapper"><div class="spinner"></div></div>
      } @else {
        <div class="page-header">
          <div style="display:flex;align-items:center;gap:16px">
            <div class="avatar-initials" style="width:48px;height:48px;font-size:16px;border-radius:12px">
              {{ initials(client.fullName) }}
            </div>
            <div>
              <h1 class="page-title">{{ client.fullName }}</h1>
              <p class="page-subtitle">Client #{{ client.clientID }} · Joined {{ client.createdAt }}</p>
            </div>
          </div>
          <div class="page-actions">
            <a [routerLink]="['/clients', client.clientID, 'edit']" class="btn btn-secondary">Edit Client</a>
            <a routerLink="/clients" class="btn btn-ghost">← Back</a>
          </div>
        </div>

        <!-- Details card -->
        <div class="card" style="margin-bottom:18px">
          <div class="card-header">
            <div class="card-title">Personal Details</div>
          </div>
          <div class="detail-grid">
            <div>
              <div class="detail-label">Email</div>
              <div class="detail-value">{{ client.email }}</div>
            </div>
            <div>
              <div class="detail-label">Phone</div>
              <div class="detail-value">{{ client.phone }}</div>
            </div>
            <div>
              <div class="detail-label">Date of Birth</div>
              <div class="detail-value">{{ client.dateOfBirth }}</div>
            </div>
            <div>
              <div class="detail-label">Address</div>
              <div class="detail-value">{{ client.address }}</div>
            </div>
          </div>
        </div>

        <!-- Policies -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Policies</div>
              <div class="card-subtitle">{{ policySvc.policies().length }} total</div>
            </div>
            <a [routerLink]="'/policies/new'" [queryParams]="{clientId: client.clientID}"
               class="btn btn-primary btn-sm">+ Add Policy</a>
          </div>

          @if (policySvc.loading()) {
            <div class="spinner-wrapper" style="padding:32px"><div class="spinner"></div></div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr><th>Policy #</th><th>Type</th><th>Status</th><th>Premium</th><th>Expires</th><th></th></tr>
                </thead>
                <tbody>
                  @for (p of policySvc.policies(); track p.policyID) {
                    <tr>
                      <td><span class="td-mono">{{ p.policyNumber }}</span></td>
                      <td><span [class]="'badge badge-' + p.policyType.toLowerCase()"><span class="badge-dot"></span>{{ p.policyType }}</span></td>
                      <td><span [class]="'badge badge-' + p.status.toLowerCase()"><span class="badge-dot"></span>{{ p.status }}</span></td>
                      <td style="font-weight:600">R {{ p.premiumAmount | number:'1.2-2' }}</td>
                      <td style="color:var(--gray-500)">{{ p.endDate }}</td>
                      <td><a [routerLink]="['/policies', p.policyID]" class="btn btn-secondary btn-sm">View</a></td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6">
                      <div class="empty-state" style="padding:32px">
                        <div class="empty-state-icon">📋</div>
                        <h3>No policies yet</h3>
                      </div>
                    </td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;

  constructor(
    private route:     ActivatedRoute,
    private clientSvc: ClientService,
    public  policySvc: PolicyService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clientSvc.getById(id).subscribe(c => this.client = c);
    this.policySvc.loadByClient(id);
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
}
