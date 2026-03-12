import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe }    from '@angular/common';
import { PolicyService }  from '@services/policy.service';
import { ClaimService }   from '@services/claim.service';
import { Policy }         from '@models/policy.model';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page-container">
      @if (!policy) {
        <div class="spinner-wrapper"><div class="spinner"></div></div>
      } @else {

        <div class="page-header">
          <div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">
              <span class="td-mono" style="font-size:18px">{{ policy.policyNumber }}</span>
              <span [class]="'badge badge-' + policy.policyType.toLowerCase()"><span class="badge-dot"></span>{{ policy.policyType }}</span>
              <span [class]="'badge badge-' + policy.status.toLowerCase()"><span class="badge-dot"></span>{{ policy.status }}</span>
            </div>
            <p class="page-subtitle">Policyholder: <strong>{{ policy.clientName }}</strong> · Policy #{{ policy.policyID }}</p>
          </div>
          <div class="page-actions">
            <a [routerLink]="['/clients', policy.clientID]" class="btn btn-ghost">View Client</a>
            <a routerLink="/policies" class="btn btn-secondary">← Back</a>
          </div>
        </div>

        @if (policy.status === 'Active' || policy.status === 'Suspended') {
          <div class="alert alert-info" style="margin-bottom:18px">
            <span style="font-weight:600">Status actions:</span>
            @if (policy.status === 'Active') {
              <button (click)="setStatus('Suspended')" class="btn btn-secondary btn-sm" style="margin-left:12px">Suspend Policy</button>
              <button (click)="setStatus('Cancelled')" class="btn btn-danger btn-sm" style="margin-left:8px">Cancel Policy</button>
            }
            @if (policy.status === 'Suspended') {
              <button (click)="setStatus('Active')" class="btn btn-success btn-sm" style="margin-left:12px">Reactivate Policy</button>
            }
          </div>
        }

        <div class="card" style="margin-bottom:18px">
          <div class="card-header"><div class="card-title">Policy Details</div></div>
          <div class="detail-grid">
            <div><div class="detail-label">Premium</div><div class="detail-value" style="font-size:20px;color:var(--blue)">R {{ policy.premiumAmount | number:'1.2-2' }}</div></div>
            <div><div class="detail-label">Start Date</div><div class="detail-value">{{ policy.startDate }}</div></div>
            <div><div class="detail-label">End Date</div><div class="detail-value">{{ policy.endDate }}</div></div>
            <div><div class="detail-label">Created</div><div class="detail-value">{{ policy.createdAt }}</div></div>
          </div>
        </div>

        @if (policy.lifeDetail) {
          <div class="card" style="margin-bottom:18px;border-left:4px solid var(--purple)">
            <div class="card-header"><div class="card-title">🛡 Life Cover Details</div></div>
            <div class="detail-grid">
              <div><div class="detail-label">Coverage Amount</div><div class="detail-value" style="font-size:18px">R {{ policy.lifeDetail.coverageAmount | number:'1.2-2' }}</div></div>
              <div><div class="detail-label">Beneficiary</div><div class="detail-value">{{ policy.lifeDetail.beneficiary }}</div></div>
            </div>
          </div>
        }
        @if (policy.funeralDetail) {
          <div class="card" style="margin-bottom:18px;border-left:4px solid #BE123C">
            <div class="card-header"><div class="card-title">⚰ Funeral Cover Details</div></div>
            <div class="detail-grid">
              <div><div class="detail-label">Coverage Amount</div><div class="detail-value" style="font-size:18px">R {{ policy.funeralDetail.coverageAmount | number:'1.2-2' }}</div></div>
              <div><div class="detail-label">Funeral Type</div><div class="detail-value">{{ policy.funeralDetail.funeralType }}</div></div>
            </div>
          </div>
        }
        @if (policy.legalDetail) {
          <div class="card" style="margin-bottom:18px;border-left:4px solid var(--blue)">
            <div class="card-header"><div class="card-title">⚖ Legal Cover Details</div></div>
            <div class="detail-grid">
              <div><div class="detail-label">Max Coverage</div><div class="detail-value" style="font-size:18px">R {{ policy.legalDetail.maxCoverageAmount | number:'1.2-2' }}</div></div>
              <div><div class="detail-label">Legal Type</div><div class="detail-value">{{ policy.legalDetail.legalType }}</div></div>
            </div>
          </div>
        }

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Claims</div>
              <div class="card-subtitle">{{ claimSvc.claims().length }} on this policy</div>
            </div>
            <a routerLink="/claims/new" [queryParams]="{policyId: policy.policyID}" class="btn btn-primary btn-sm">+ Submit Claim</a>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Amount</th><th>Status</th><th>Description</th></tr></thead>
              <tbody>
                @for (c of claimSvc.claims(); track c.claimID) {
                  <tr>
                    <td style="color:var(--gray-500)">{{ c.claimDate }}</td>
                    <td style="font-weight:600">R {{ c.amount | number:'1.2-2' }}</td>
                    <td><span [class]="'badge badge-' + c.status.toLowerCase()"><span class="badge-dot"></span>{{ c.status }}</span></td>
                    <td style="color:var(--gray-500);max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ c.description }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4">
                    <div class="empty-state" style="padding:28px">
                      <div class="empty-state-icon" style="font-size:30px">📁</div>
                      <h3>No claims on this policy</h3>
                    </div>
                  </td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class PolicyDetailComponent implements OnInit {
  policy: Policy | null = null;

  constructor(
    private route:     ActivatedRoute,
    private policySvc: PolicyService,
    public  claimSvc:  ClaimService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.policySvc.getById(id).subscribe(p => this.policy = p);
    this.claimSvc.loadByPolicy(id);
  }

  setStatus(status: any): void {
    if (!this.policy) return;
    this.policySvc.updateStatus(this.policy.policyID, status).subscribe(p => {
      this.policy = p;
    });
  }
}
