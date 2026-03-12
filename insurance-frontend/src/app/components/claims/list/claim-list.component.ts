import { Component, OnInit } from '@angular/core';
import { RouterLink }         from '@angular/router';
import { DecimalPipe }        from '@angular/common';
import { ClaimService }  from '../../../core/services/claim.service';
import { ClaimStatus }   from '../../../core/models/claim.model';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Claims</h1>
          <p class="page-subtitle">{{ claimSvc.claims().length }} claims loaded</p>
        </div>
        <a routerLink="/claims/new" class="btn btn-primary">+ New Claim</a>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <div class="filter-tabs">
          <button class="filter-tab" [class.active]="!activeStatus" (click)="resetFilter()">
            All <span class="tab-count">{{ claimSvc.claims().length }}</span>
          </button>
          @for (s of statuses; track s) {
            <button class="filter-tab" [class.active]="activeStatus===s" (click)="filterByStatus(s)">
              {{ statusIcon[s] }} {{ s }}
            </button>
          }
        </div>
      </div>

      @if (claimSvc.error()) {
        <div class="alert alert-error">⚠ {{ claimSvc.error() }}</div>
      }

      @if (claimSvc.loading()) {
        <div class="spinner-wrapper"><div class="spinner"></div></div>
      } @else {
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Policy</th>
                  <th>Policyholder</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (c of claimSvc.claims(); track c.claimID) {
                  <tr>
                    <td style="color:var(--gray-500);white-space:nowrap">{{ c.claimDate }}</td>
                    <td><span class="td-mono">{{ c.policyNumber }}</span></td>
                    <td>
                      <div class="avatar-cell">
                        <div class="avatar-initials" style="width:28px;height:28px;font-size:10px">
                          {{ initials(c.clientName) }}
                        </div>
                        {{ c.clientName }}
                      </div>
                    </td>
                    <td style="font-weight:700;color:var(--gray-900)">R {{ c.amount | number:'1.2-2' }}</td>
                    <td>
                      <span [class]="'badge badge-' + c.status.toLowerCase()">
                        <span class="badge-dot"></span>{{ c.status }}
                      </span>
                    </td>
                    <td>
                      <div class="td-actions">
                        <a [routerLink]="['/claims', c.claimID]" class="btn btn-secondary btn-sm">View</a>
                        <a [routerLink]="['/claims', c.claimID, 'edit']" class="btn btn-ghost btn-sm">Edit</a>
                        @if (c.status === 'Pending') {
                          <button (click)="approve(c.claimID)" class="btn btn-success btn-sm">✓ Approve</button>
                          <button (click)="reject(c.claimID)"  class="btn btn-ghost btn-sm" style="color:var(--red)">✕ Reject</button>
                        }
                        @if (c.status === 'Approved') {
                          <button (click)="markPaid(c.claimID)" class="btn btn-primary btn-sm">$ Mark Paid</button>
                        }
                        <button (click)="deleteClaim(c.claimID)" class="btn btn-ghost btn-sm" style="color:var(--red)">Delete</button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="6">
                    <div class="empty-state">
                      <div class="empty-state-icon">📁</div>
                      <h3>No claims found</h3>
                      <p>{{ activeStatus ? 'No ' + activeStatus + ' claims.' : 'No claims have been submitted yet.' }}</p>
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
  styles: [`
    .tab-count { background: rgba(0,0,0,.08); border-radius: 10px; padding: 1px 6px; font-size: 10px; margin-left: 4px; }
  `]
})
export class ClaimListComponent implements OnInit {
  readonly statuses: ClaimStatus[] = ['Pending', 'Approved', 'Rejected', 'Paid'];
  readonly statusIcon: Record<string, string> = {
    Pending: '⏳', Approved: '✅', Rejected: '❌', Paid: '💰'
  };
  activeStatus: ClaimStatus | null = null;

  constructor(public claimSvc: ClaimService) {}

  ngOnInit(): void { this.claimSvc.loadAll(); }

  filterByStatus(s: ClaimStatus): void {
    this.activeStatus = s;
    this.claimSvc.loadByStatus(s);
  }

  resetFilter(): void {
    this.activeStatus = null;
    this.claimSvc.loadAll();
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  approve(id: number): void {
    this.claimSvc.approve(id).subscribe();
  }

  reject(id: number): void {
    const reason = prompt('Enter rejection reason:');
    if (!reason?.trim()) return;
    this.claimSvc.reject(id, reason).subscribe();
  }

  markPaid(id: number): void {
    this.claimSvc.markPaid(id).subscribe();
  }

  deleteClaim(id: number): void {
    if (!confirm('Delete this claim? This cannot be undone.')) return;
    this.claimSvc.delete(id).subscribe();
  }
}