// src/app/components/dashboard/dashboard.component.ts
// Uses Chart.js (loaded via CDN in index.html) for two charts:
//   - Doughnut: policy breakdown by type
//   - Bar:      claims breakdown by status
// declare const Chart lets TypeScript know Chart exists globally without a type package.

import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterLink }    from '@angular/router';
import { DecimalPipe }   from '@angular/common';
import { ClientService } from '@services/client.service';
import { PolicyService } from '@services/policy.service';
import { ClaimService }  from '@services/claim.service';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page-container">

      <!-- Header -->
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

      <!-- Charts row -->
      <div class="charts-grid">

        <!-- Policy breakdown doughnut -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Policy Breakdown</div>
            <div class="chart-sub">Distribution by policy type</div>
          </div>
          <div style="display:flex;align-items:center;gap:32px">
            <div class="chart-wrap" style="flex:1">
              <canvas #policyChart></canvas>
            </div>
            <div class="legend-list">
              <div class="legend-item">
                <div class="legend-dot" style="background:#7C3AED"></div>
                <span class="legend-label">Life</span>
                <span class="legend-val">{{ lifePolicies }}</span>
              </div>
              <div class="legend-item">
                <div class="legend-dot" style="background:#BE123C"></div>
                <span class="legend-label">Funeral</span>
                <span class="legend-val">{{ funeralPolicies }}</span>
              </div>
              <div class="legend-item">
                <div class="legend-dot" style="background:#2563EB"></div>
                <span class="legend-label">Legal</span>
                <span class="legend-val">{{ legalPolicies }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Claims by status bar chart -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Claims by Status</div>
            <div class="chart-sub">Current claim pipeline</div>
          </div>
          <div class="chart-wrap">
            <canvas #claimChart></canvas>
          </div>
        </div>

      </div>

      <!-- Bottom row: policy status breakdown + recent claims -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">

        <!-- Policy status summary -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Policy Status</div>
              <div class="card-subtitle">All {{ totalPolicies }} policies</div>
            </div>
            <a routerLink="/policies" class="btn btn-ghost btn-sm">View all →</a>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            @for (row of policyStatusRows; track row.label) {
              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                  <span style="font-size:13px;color:var(--gray-600);font-weight:500">{{ row.label }}</span>
                  <span style="font-size:13px;font-weight:700;color:var(--gray-800)">{{ row.count }}</span>
                </div>
                <div style="height:6px;background:var(--gray-100);border-radius:10px;overflow:hidden">
                  <div [style.width]="row.pct + '%'" [style.background]="row.color"
                       style="height:100%;border-radius:10px;transition:width .6s ease"></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Recent pending claims -->
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
              <div style="font-size:28px;opacity:.3;margin-bottom:8px">✅</div>
              <div style="color:var(--gray-400);font-size:13px">No pending claims</div>
            </div>
          } @else {
            <div style="display:flex;flex-direction:column;gap:2px">
              @for (c of pendingClaimsList.slice(0,5); track c.claimID) {
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--gray-50)">
                  <div>
                    <div style="font-size:13px;font-weight:500;color:var(--gray-800)">{{ c.clientName }}</div>
                    <div style="font-size:11px;color:var(--gray-400);margin-top:2px">{{ c.policyNumber }}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:13px;font-weight:600;color:var(--gray-900)">R {{ c.amount | number:'1.0-0' }}</div>
                    <span class="badge badge-pending" style="margin-top:3px">Pending</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('policyChart') policyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('claimChart')  claimChartRef!:  ElementRef<HTMLCanvasElement>;

  private policyChartInstance: any;
  private claimChartInstance:  any;

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

  // AfterViewInit = canvas elements are ready in the DOM
  ngAfterViewInit(): void {
    // Poll until data has loaded (signals update async)
    const interval = setInterval(() => {
      if (!this.policySvc.loading() && !this.claimSvc.loading()) {
        clearInterval(interval);
        this.buildCharts();
      }
    }, 100);
  }

  private buildCharts(): void {
    // ── Doughnut: policy types ──────────────────────────────
    const pCtx = this.policyChartRef.nativeElement.getContext('2d');
    this.policyChartInstance = new Chart(pCtx, {
      type: 'doughnut',
      data: {
        labels: ['Life', 'Funeral', 'Legal'],
        datasets: [{
          data: [this.lifePolicies, this.funeralPolicies, this.legalPolicies],
          backgroundColor: ['#7C3AED', '#BE123C', '#2563EB'],
          hoverBackgroundColor: ['#6D28D9', '#9F1239', '#1D4ED8'],
          borderWidth: 3,
          borderColor: '#fff',
        }]
      },
      options: {
        cutout: '68%',
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} policies`
        }}},
        animation: { animateScale: true }
      }
    });

    // ── Bar: claims by status ───────────────────────────────
    const cCtx = this.claimChartRef.nativeElement.getContext('2d');
    this.claimChartInstance = new Chart(cCtx, {
      type: 'bar',
      data: {
        labels: ['Pending', 'Approved', 'Rejected', 'Paid'],
        datasets: [{
          label: 'Claims',
          data: [
            this.countClaims('Pending'),
            this.countClaims('Approved'),
            this.countClaims('Rejected'),
            this.countClaims('Paid'),
          ],
          backgroundColor: ['#FEF3C7', '#DCFCE7', '#FEE2E2', '#EFF6FF'],
          borderColor:     ['#D97706',  '#16A34A',  '#DC2626',  '#2563EB'],
          borderWidth: 2,
          borderRadius: 6,
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0, color: '#94A3B8' }, grid: { color: '#F1F5F9' } },
          x: { ticks: { color: '#64748B' }, grid: { display: false } }
        },
        animation: { duration: 700, easing: 'easeOutQuart' }
      }
    });
  }

  // ── Computed values ──────────────────────────────────────
  get totalPolicies()    { return this.policySvc.policies().length; }
  get activePolicies()   { return this.policySvc.policies().filter(p => p.status === 'Active').length; }
  get pendingClaims()    { return this.claimSvc.claims().filter(c => c.status === 'Pending').length; }
  get pendingClaimsList(){ return this.claimSvc.claims().filter(c => c.status === 'Pending'); }
  get totalClaimsValue() { return this.claimSvc.claims().reduce((s, c) => s + c.amount, 0); }

  get lifePolicies()   { return this.policySvc.policies().filter(p => p.policyType === 'Life').length; }
  get funeralPolicies(){ return this.policySvc.policies().filter(p => p.policyType === 'Funeral').length; }
  get legalPolicies()  { return this.policySvc.policies().filter(p => p.policyType === 'Legal').length; }

  countClaims(status: string) { return this.claimSvc.claims().filter(c => c.status === status).length; }

  get policyStatusRows() {
    const total = this.totalPolicies || 1;
    return [
      { label: 'Active',    count: this.activePolicies,
        pct: (this.activePolicies / total * 100).toFixed(1), color: '#16A34A' },
      { label: 'Expired',   count: this.policySvc.policies().filter(p => p.status === 'Expired').length,
        pct: (this.policySvc.policies().filter(p => p.status === 'Expired').length / total * 100).toFixed(1), color: '#94A3B8' },
      { label: 'Cancelled', count: this.policySvc.policies().filter(p => p.status === 'Cancelled').length,
        pct: (this.policySvc.policies().filter(p => p.status === 'Cancelled').length / total * 100).toFixed(1), color: '#DC2626' },
      { label: 'Suspended', count: this.policySvc.policies().filter(p => p.status === 'Suspended').length,
        pct: (this.policySvc.policies().filter(p => p.status === 'Suspended').length / total * 100).toFixed(1), color: '#D97706' },
    ];
  }
}
