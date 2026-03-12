import { Component, OnInit }      from '@angular/core';
import { ReactiveFormsModule,
         FormBuilder, FormGroup,
         Validators }              from '@angular/forms';
import { Router, ActivatedRoute,
         RouterLink }              from '@angular/router';
import { ClaimService } from '../../../core/services/claim.service';
// 1. Import the ToastService you just created
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-claim-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container" style="max-width:600px">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Claim' : 'Submit Claim' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update claim information' : 'Claims can only be submitted against active policies' }}</p>
        </div>
        <a routerLink="/claims" class="btn btn-secondary">← Back</a>
      </div>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label>Policy ID *</label>
            <input formControlName="policyID" type="number" />
          </div>
          <div class="form-group">
            <label>Claim Amount (R) *</label>
            <input formControlName="amount" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label>Description *</label>
            <textarea formControlName="description" rows="4" placeholder="Describe the claim..."></textarea>
          </div>
          <div style="display:flex;gap:12px;margin-top:24px">
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving">
              {{ saving ? (isEdit ? 'Saving...' : 'Submitting...') : (isEdit ? 'Save Changes' : 'Submit Claim') }}
            </button>
            <a routerLink="/claims" class="btn btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ClaimFormComponent implements OnInit {
  isEdit = false;
  saving = false;
  form: FormGroup;
  private claimId?: number;

  constructor(
    private fb:       FormBuilder,
    private router:   Router,
    private route:    ActivatedRoute,
    private claimSvc: ClaimService,
    // 2. Inject the ToastService here
    private toast:    ToastService
  ) {
    this.form = this.fb.group({
      policyID:    [null, Validators.required],
      amount:      [null, [Validators.required, Validators.min(1)]],
      description: ['',  Validators.required],
    });
  }

  ngOnInit(): void {
    this.claimId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.claimId && !isNaN(this.claimId);

    const policyId = this.route.snapshot.queryParamMap.get('policyId');
    if (policyId) this.form.patchValue({ policyID: Number(policyId) });

    if (this.isEdit) {
      this.claimSvc.getById(this.claimId!).subscribe(claim => {
        if (!claim) return;

        this.form.patchValue({
          policyID: claim.policyID,
          amount: claim.amount,
          description: claim.description,
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      // 3. Inform the user they missed something
      this.toast.error('Please fill in all required fields.');
      return; 
    }

    this.saving = true;
    const action = this.isEdit
      ? this.claimSvc.update(this.claimId!, this.form.value)
      : this.claimSvc.create(this.form.value);

    action.subscribe({
      next: () => {
        // 4. Show success toast before navigating
        this.toast.success(this.isEdit ? 'Claim updated successfully!' : 'Claim submitted successfully!');
        this.router.navigate(['/claims']);
      },
      error: (err: Error) => { 
        // 5. Use the toast for errors instead of a local variable
        this.toast.error(err.message || 'Failed to submit claim');
        this.saving = false; 
      }
    });
  }
}