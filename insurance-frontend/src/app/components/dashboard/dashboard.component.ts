import { Component, OnInit } from '@angular/core';
import { RouterLink }         from '@angular/router';
import { DecimalPipe }        from '@angular/common';
import { ClientService }      from '@services/client.service';
import { PolicyService }      from '@services/policy.service';
import { ClaimService }       from '@services/claim.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page-container">

      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Live overview of your insurance portfolio</p>
        </div>
        <div class="page-actions">
          <a routerLink="/clients/new"  class="btn btn-secondary">+ New Client</a>
          <a routerLink="/policies/new" class="btn btn-primary">+ New Policy</a>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon si-blue">👥</div>
          </div>
          <div class="stat-value">{{ clientSvc.clients().length }}</div>
          <div class="stat-label">Total Clients</div>
          <div class="stat-sub">Registered policyholders</div>
        </div>

        <div class="stat-card green">
          <div class="stat-header">
            <div class="stat-icon si-green">✅</div>
          </div>
          <div class="stat-value">{{ activePolicies }}</div>
          <div class="stat-label">Active Policies</div>
          <div class="stat-sub">of {{ totalPolicies }} total</div>
        </div>

        <div class="stat-card amber">
          <div class="stat-header">
            <div class="stat-icon si-amber">⏳</div>
          </div>
          <div class="stat-value">{{ pendingClaims }}</div>
          <div class="stat-label">Pending Claims</div>
          <div class="stat-sub">Awaiting review</div>
        </div>

        <div class="stat-card purple">
          <div class="stat-header">
            <div class="stat-icon si-purple">💰</div>
          </div>
          <div class="stat-value">R {{ totalClaimsValue | number:'1.0-0' }}</div>
          <div class="stat-label">Total Claim Value</div>
          <div class="stat-sub">Across all claims</div>
        </div>
      </div>

      <!-- Bottom row -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">

        <!-- Policy breakdown -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Policy Breakdown</div>
              <div class="card-subtitle">By type and status</div>
            </div>
            <a routerLink="/policies" class="btn btn-ghost btn-sm">View all →</a>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px">
            @for (row of policyRows; track row.label) {
              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                  <span style="font-size:13px;color:var(--gray-600);font-weight:500">
                    {{ row.icon }} {{ row.label }}
                  </span>
                  <span style="font-size:13px;font-weight:700;color:var(--gray-800)">{{ row.count }}</span>
                </div>
                <div style="height:6px;background:var(--gray-100);border-radius:10px;overflow:hidden">
                  <div [style.width]="row.pct + '%'"
                       [style.background]="row.color"
                       style="height:100%;border-radius:10px;transition:width .6s ease">
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Pending claims list -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Pending Claims</div>
              <div class="card-subtitle">Require action</div>
            </div>
            <a routerLink="/claims" class="btn btn-ghost btn-sm">View all →</a>
          </div>

          @if (pendingClaimsList.length === 0) {
            <div class="empty-state" style="padding:24px">
              <div style="font-size:32px;opacity:.3;margin-bottom:8px">✅</div>
              <div style="color:var(--gray-400);font-size:13px">No pending claims</div>
            </div>
          } @else {
            <div style="display:flex;flex-direction:column">
              @for (c of pendingClaimsList.slice(0, 5); track c.claimID) {
                <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--gray-50)">
                  <div>
                    <div style="font-size:13px;font-weight:500;color:var(--gray-800)">{{ c.clientName }}</div>
                    <div style="font-size:11px;color:var(--gray-400);margin-top:2px">{{ c.policyNumber }}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:13px;font-weight:600">R {{ c.amount | number:'1.0-0' }}</div>
                    <span class="badge badge-pending" style="margin-top:3px">
                      <span class="badge-dot"></span>Pending
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

      </div>

      <!-- Quick actions -->
      <div class="card" style="margin-top:18px">
        <div class="card-title" style="margin-bottom:16px">Quick Actions</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a routerLink="/clients/new"  class="btn btn-primary">+ New Client</a>
          <a routerLink="/policies/new" class="btn btn-primary">+ New Policy</a>
          <a routerLink="/claims/new"   class="btn btn-primary">+ New Claim</a>
          <a routerLink="/claims"       class="btn btn-secondary">View All Claims</a>
          <a routerLink="/policies"     class="btn btn-secondary">View All Policies</a>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {

  constructor(
    public clientSvc: ClientService,
    public policySvc: PolicyService,
    public claimSvc:  ClaimService
  ) {}

  ngOnInit(): void {
    this.clientSvc.loadAll();
    this.policySvc.loadAll();
    this.claimSvc.loadAll();
  }

  get totalPolicies()     { return this.policySvc.policies().length; }
  get activePolicies()    { return this.policySvc.policies().filter(p => p.status === 'Active').length; }
  get pendingClaims()     { return this.claimSvc.claims().filter(c => c.status === 'Pending').length; }
  get pendingClaimsList() { return this.claimSvc.claims().filter(c => c.status === 'Pending'); }
  get totalClaimsValue()  { return this.claimSvc.claims().reduce((s, c) => s + c.amount, 0); }

  get policyRows() {
    const total = this.totalPolicies || 1;
    return [
      { icon: '✅', label: 'Active',    count: this.policySvc.policies().filter(p => p.status === 'Active').length,    color: '#16A34A', pct: (this.policySvc.policies().filter(p => p.status === 'Active').length    / total * 100).toFixed(0) },
      { icon: '⏳', label: 'Suspended', count: this.policySvc.policies().filter(p => p.status === 'Suspended').length, color: '#D97706', pct: (this.policySvc.policies().filter(p => p.status === 'Suspended').length / total * 100).toFixed(0) },
      { icon: '❌', label: 'Cancelled', count: this.policySvc.policies().filter(p => p.status === 'Cancelled').length, color: '#DC2626', pct: (this.policySvc.policies().filter(p => p.status === 'Cancelled').length / total * 100).toFixed(0) },
      { icon: '⚫', label: 'Expired',   count: this.policySvc.policies().filter(p => p.status === 'Expired').length,   color: '#94A3B8', pct: (this.policySvc.policies().filter(p => p.status === 'Expired').length   / total * 100).toFixed(0) },
    ];
  }
}
