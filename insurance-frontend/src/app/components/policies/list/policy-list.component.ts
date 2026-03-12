import { Component, OnInit } from '@angular/core';
import { RouterLink }         from '@angular/router';
import { FormsModule }        from '@angular/forms';
import { DecimalPipe }        from '@angular/common';
import { PolicyService }      from '@services/policy.service';
import { PolicyType, PolicySummary } from '@models/policy.model';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Policies</h1>
          <p class="page-subtitle">{{ policySvc.policies().length }} policies loaded</p>
        </div>
        <div class="page-actions">
          <a routerLink="/policies/new" class="btn btn-primary">+ New Policy</a>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-tabs">
          <button class="filter-tab" [class.active]="typeFilter===''"        (click)="setType('')">All Types</button>
          <button class="filter-tab" [class.active]="typeFilter==='Life'"    (click)="setType('Life')">Life</button>
          <button class="filter-tab" [class.active]="typeFilter==='Funeral'" (click)="setType('Funeral')">Funeral</button>
          <button class="filter-tab" [class.active]="typeFilter==='Legal'"   (click)="setType('Legal')">Legal</button>
        </div>
        <div class="filter-sep"></div>
        <div class="filter-tabs">
          <button class="filter-tab" [class.active]="statusFilter===''"           (click)="statusFilter=''">All</button>
          <button class="filter-tab" [class.active]="statusFilter==='Active'"     (click)="statusFilter='Active'">Active</button>
          <button class="filter-tab" [class.active]="statusFilter==='Suspended'"  (click)="statusFilter='Suspended'">Suspended</button>
          <button class="filter-tab" [class.active]="statusFilter==='Expired'"    (click)="statusFilter='Expired'">Expired</button>
          <button class="filter-tab" [class.active]="statusFilter==='Cancelled'"  (click)="statusFilter='Cancelled'">Cancelled</button>
        </div>
        <div class="filter-sep"></div>
        <button (click)="loadExpiring()" class="btn btn-secondary btn-sm">⚠ Expiring Soon</button>
      </div>

      @if (policySvc.error()) {
        <div class="alert alert-error">⚠ {{ policySvc.error() }}</div>
      }

      @if (policySvc.loading()) {
        <div class="spinner-wrapper"><div class="spinner"></div></div>
      } @else {
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Policy Number</th><th>Type</th><th>Status</th>
                  <th>Monthly Premium</th><th>Expiry Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (p of filtered; track p.policyID) {
                  <tr [class.expiring-row]="isExpiringSoon(p)">
                    <td><span class="td-mono">{{ p.policyNumber }}</span></td>
                    <td><span [class]="'badge badge-' + p.policyType.toLowerCase()"><span class="badge-dot"></span>{{ p.policyType }}</span></td>
                    <td><span [class]="'badge badge-' + p.status.toLowerCase()"><span class="badge-dot"></span>{{ p.status }}</span></td>
                    <td style="font-weight:600">R {{ p.premiumAmount | number:'1.2-2' }}</td>
                    <td [style.color]="isExpiringSoon(p) ? 'var(--amber)' : 'var(--gray-500)'"
                        [style.font-weight]="isExpiringSoon(p) ? '600' : 'normal'">
                      {{ isExpiringSoon(p) ? '⚠ ' : '' }}{{ p.endDate }}
                    </td>
                    <td>
                      <div class="td-actions">
                        <a [routerLink]="['/policies', p.policyID]" class="btn btn-secondary btn-sm">View</a>
                        <a [routerLink]="['/policies', p.policyID, 'edit']" class="btn btn-ghost btn-sm">Edit</a>
                        @if (p.status === 'Active') {
                          <button (click)="cancel(p)" class="btn btn-ghost btn-sm" style="color:var(--red)">Cancel</button>
                        }
                        @if (p.status === 'Suspended') {
                          <button (click)="reactivate(p.policyID)" class="btn btn-ghost btn-sm" style="color:var(--green)">Reactivate</button>
                        }
                        <button (click)="deletePolicy(p)" class="btn btn-ghost btn-sm" style="color:var(--red)">Delete</button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="6">
                    <div class="empty-state">
                      <div class="empty-state-icon">📋</div>
                      <h3>No policies found</h3>
                      <p>Try changing the filters or add a new policy.</p>
                    </div>
                  </td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`.expiring-row td { background: #FFFBEB !important; }`]
})
export class PolicyListComponent implements OnInit {
  typeFilter   = '';
  statusFilter = '';

  constructor(public policySvc: PolicyService) {}

  ngOnInit(): void { this.policySvc.loadAll(); }

  setType(t: string): void {
    this.typeFilter = t;
    this.statusFilter = '';
    t ? this.policySvc.loadByType(t as PolicyType) : this.policySvc.loadAll();
  }

  loadExpiring(): void {
    this.typeFilter = ''; this.statusFilter = '';
    this.policySvc.loadExpiring(30);
  }

  get filtered(): PolicySummary[] {
    if (!this.statusFilter) return this.policySvc.policies();
    return this.policySvc.policies().filter(p => p.status === this.statusFilter);
  }

  isExpiringSoon(p: PolicySummary): boolean {
    const days = Math.ceil((new Date(p.endDate).getTime() - Date.now()) / 86400000);
    return p.status === 'Active' && days >= 0 && days <= 30;
  }

  cancel(p: PolicySummary): void {
    if (!confirm(`Cancel policy ${p.policyNumber}?`)) return;
    this.policySvc.updateStatus(p.policyID, 'Cancelled').subscribe();
  }

  reactivate(id: number): void {
    this.policySvc.updateStatus(id, 'Active').subscribe();
  }

  deletePolicy(p: PolicySummary): void {
    if (!confirm(`Delete policy ${p.policyNumber}? This cannot be undone.`)) return;
    this.policySvc.delete(p.policyID).subscribe();
  }
}
