import { Component, OnInit }      from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PolicyService } from '@services/policy.service';
import { PolicyType }    from '@models/policy.model';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container" style="max-width:740px">
      <div class="page-header">
        <div>
          <h1 class="page-title">New Policy</h1>
          <p class="page-subtitle">Create a Life, Funeral, or Legal policy</p>
        </div>
        <a routerLink="/policies" class="btn btn-secondary">← Back</a>
      </div>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="submit()">

          <div class="form-section">
            <div class="form-section-title">Policy Information</div>
            <div class="form-row">
              <div class="form-group">
                <label>Client ID <span style="color:var(--red)">*</span></label>
                <input formControlName="clientID" type="number" placeholder="Enter client ID" />
              </div>
              <div class="form-group">
                <label>Policy Number <span style="color:var(--red)">*</span></label>
                <input formControlName="policyNumber" type="text" placeholder="e.g. POL-2024-001" />
              </div>
            </div>
            <div class="form-group">
              <label>Policy Type <span style="color:var(--red)">*</span></label>
              <select formControlName="policyType" (change)="onTypeChange()">
                <option value="">Select a policy type...</option>
                <option value="Life">🛡 Life Insurance</option>
                <option value="Funeral">⚰ Funeral Cover</option>
                <option value="Legal">⚖ Legal Cover</option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Coverage Period & Premium</div>
            <div class="form-row">
              <div class="form-group">
                <label>Start Date <span style="color:var(--red)">*</span></label>
                <input formControlName="startDate" type="date" />
              </div>
              <div class="form-group">
                <label>End Date <span style="color:var(--red)">*</span></label>
                <input formControlName="endDate" type="date" />
              </div>
            </div>
            <div class="form-group" style="max-width:320px">
              <label>Monthly Premium (R) <span style="color:var(--red)">*</span></label>
              <input formControlName="premiumAmount" type="number" step="0.01" placeholder="e.g. 350.00" />
            </div>
          </div>

          @if (selectedType === 'Life') {
            <div class="form-section" style="background:var(--purple-light);padding:20px;border-radius:var(--radius-lg)">
              <div class="form-section-title" style="color:var(--purple)">🛡 Life Cover Details</div>
              <div class="form-row">
                <div class="form-group">
                  <label>Coverage Amount (R) <span style="color:var(--red)">*</span></label>
                  <input formControlName="coverageAmount" type="number" step="0.01" placeholder="e.g. 500000.00" />
                </div>
                <div class="form-group">
                  <label>Beneficiary <span style="color:var(--red)">*</span></label>
                  <input formControlName="beneficiary" type="text" placeholder="e.g. Jane Smith" />
                </div>
              </div>
            </div>
          }

          @if (selectedType === 'Funeral') {
            <div class="form-section" style="background:#FFF1F2;padding:20px;border-radius:var(--radius-lg)">
              <div class="form-section-title" style="color:#BE123C">⚰ Funeral Cover Details</div>
              <div class="form-row">
                <div class="form-group">
                  <label>Coverage Amount (R) <span style="color:var(--red)">*</span></label>
                  <input formControlName="coverageAmount" type="number" step="0.01" placeholder="e.g. 50000.00" />
                </div>
                <div class="form-group">
                  <label>Funeral Type <span style="color:var(--red)">*</span></label>
                  <input formControlName="funeralType" type="text" placeholder="e.g. Traditional, Cremation" />
                </div>
              </div>
            </div>
          }

          @if (selectedType === 'Legal') {
            <div class="form-section" style="background:var(--blue-light);padding:20px;border-radius:var(--radius-lg)">
              <div class="form-section-title" style="color:var(--blue)">⚖ Legal Cover Details</div>
              <div class="form-row">
                <div class="form-group">
                  <label>Max Coverage Amount (R) <span style="color:var(--red)">*</span></label>
                  <input formControlName="maxCoverageAmount" type="number" step="0.01" placeholder="e.g. 100000.00" />
                </div>
                <div class="form-group">
                  <label>Legal Type <span style="color:var(--red)">*</span></label>
                  <input formControlName="legalType" type="text" placeholder="e.g. Civil, Criminal" />
                </div>
              </div>
            </div>
          }

          <div style="display:flex;gap:12px;padding-top:24px;border-top:1px solid var(--gray-100);margin-top:8px">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="saving">
              {{ saving ? 'Creating...' : 'Create Policy' }}
            </button>
            <a routerLink="/policies" class="btn btn-secondary btn-lg">Cancel</a>
          </div>

        </form>
      </div>
    </div>
  `
})
export class PolicyFormComponent implements OnInit {
  saving = false;
  selectedType: PolicyType | '' = '';
  // form declared here but initialized in constructor to avoid "used before initialization" error
  form!: FormGroup;

  constructor(
    private fb:        FormBuilder,
    private router:    Router,
    private route:     ActivatedRoute,
    private policySvc: PolicyService
  ) {
    this.form = this.fb.group({
      clientID:          [null, Validators.required],
      policyNumber:      ['',   Validators.required],
      policyType:        ['',   Validators.required],
      startDate:         ['',   Validators.required],
      endDate:           ['',   Validators.required],
      premiumAmount:     [null, Validators.required],
      coverageAmount:    [null],
      beneficiary:       [''],
      funeralType:       [''],
      maxCoverageAmount: [null],
      legalType:         [''],
    });
  }

  ngOnInit(): void {
    const clientId = this.route.snapshot.queryParamMap.get('clientId');
    if (clientId) this.form.patchValue({ clientID: Number(clientId) });
  }

  onTypeChange(): void {
    this.selectedType = this.form.value.policyType as PolicyType | '';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.policySvc.create(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/policies']),
      error: (e: Error) => { console.error(e); this.saving = false; }
    });
  }
}
