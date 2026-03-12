import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClaimService } from '@services/claim.service';
import { Claim } from '@models/claim.model';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page-container">
      @if (!claim) {
        <div class="spinner-wrapper"><div class="spinner"></div></div>
      } @else {
        <div class="page-header">
          <div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">
              <span class="td-mono" style="font-size:18px">Claim #{{ claim.claimID }}</span>
              <span [class]="'badge badge-' + claim.status.toLowerCase()"><span class="badge-dot"></span>{{ claim.status }}</span>
            </div>
            <p class="page-subtitle">Policy: <strong>{{ claim.policyNumber }}</strong> · {{ claim.clientName }}</p>
          </div>
          <div class="page-actions">
            <a [routerLink]="['/claims', claim.claimID, 'edit']" class="btn btn-secondary">Edit Claim</a>
            <button (click)="deleteClaim()" class="btn btn-danger">Delete</button>
            <a routerLink="/claims" class="btn btn-ghost">← Back</a>
          </div>
        </div>

        <div class="card" style="margin-bottom:18px">
          <div class="card-header"><div class="card-title">Claim Details</div></div>
          <div class="detail-grid">
            <div>
              <div class="detail-label">Claim Date</div>
              <div class="detail-value">{{ claim.claimDate }}</div>
            </div>
            <div>
              <div class="detail-label">Amount</div>
              <div class="detail-value" style="font-size:20px;color:var(--blue)">R {{ claim.amount | number:'1.2-2' }}</div>
            </div>
            <div>
              <div class="detail-label">Policy ID</div>
              <div class="detail-value">{{ claim.policyID }}</div>
            </div>
            <div>
              <div class="detail-label">Policyholder</div>
              <div class="detail-value">{{ claim.clientName }}</div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:18px">
          <div class="card-header"><div class="card-title">Description</div></div>
          <p style="font-size:14px;color:var(--gray-700);line-height:1.6">{{ claim.description }}</p>
        </div>

        @if (claim.status === 'Pending' || claim.status === 'Approved') {
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Actions</div>
                <div class="card-subtitle">Update claim lifecycle</div>
              </div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              @if (claim.status === 'Pending') {
                <button (click)="approve()" class="btn btn-success">Approve</button>
                <button (click)="reject()" class="btn btn-danger">Reject</button>
              }
              @if (claim.status === 'Approved') {
                <button (click)="markPaid()" class="btn btn-primary">Mark Paid</button>
              }
            </div>
          </div>
        }
      }
    </div>
  `
})
export class ClaimDetailComponent implements OnInit {
  claim: Claim | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private claimSvc: ClaimService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.claimSvc.getById(id).subscribe(claim => this.claim = claim);
  }

  approve(): void {
    if (!this.claim) return;
    this.claimSvc.approve(this.claim.claimID).subscribe(claim => this.claim = claim);
  }

  reject(): void {
    if (!this.claim) return;
    const reason = prompt('Enter rejection reason:');
    if (!reason?.trim()) return;

    this.claimSvc.reject(this.claim.claimID, reason).subscribe(claim => this.claim = claim);
  }

  markPaid(): void {
    if (!this.claim) return;
    this.claimSvc.markPaid(this.claim.claimID).subscribe(claim => this.claim = claim);
  }

  deleteClaim(): void {
    if (!this.claim) return;
    if (!confirm('Delete this claim? This cannot be undone.')) return;

    this.claimSvc.delete(this.claim.claimID).subscribe(() => {
      this.router.navigate(['/claims']);
    });
  }
}
