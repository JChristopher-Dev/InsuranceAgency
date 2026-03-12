import { Component, OnInit }      from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PolicyService } from '@services/policy.service';
import { PolicyType, CreatePolicyRequest, UpdatePolicyRequest, Policy } from '@models/policy.model';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container" style="max-width:740px">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Policy' : 'New Policy' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update policy details and coverage' : 'Create a Life, Funeral, or Legal policy' }}</p>
        </div>
        <a routerLink="/policies" class="btn btn-secondary">← Back</a>
      </div>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="submit()">

          <div class="form-section">
            <div class="form-section-title">Policy Information</div>
            <div class="form-row">
              @if (!isEdit) {
                <div class="form-group">
                  <label>Client ID <span style="color:var(--red)">*</span></label>
                  <input formControlName="clientID" type="number" placeholder="Enter client ID" />
                </div>
              }
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
              {{ saving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Policy') }}
            </button>
            <a routerLink="/policies" class="btn btn-secondary btn-lg">Cancel</a>
          </div>

        </form>
      </div>
    </div>
  `
})
export class PolicyFormComponent implements OnInit {
  isEdit = false;
  saving = false;
  selectedType: PolicyType | '' = '';
  form!: FormGroup;
  private policyId?: number;

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
    this.policyId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.policyId && !isNaN(this.policyId);

    const clientId = this.route.snapshot.queryParamMap.get('clientId');
    if (clientId) this.form.patchValue({ clientID: Number(clientId) });

    if (this.isEdit) {
      this.policySvc.getById(this.policyId!).subscribe(policy => {
        if (!policy) return;

        this.prefillForm(policy);
      });
    }

    this.onTypeChange();
  }

  onTypeChange(): void {
    this.selectedType = this.form.value.policyType as PolicyType | '';
    this.applyTypeValidators();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving = true;

    const payload = this.buildPayload();
    const action = this.isEdit
      ? this.policySvc.update(this.policyId!, payload as UpdatePolicyRequest)
      : this.policySvc.create(payload as CreatePolicyRequest);

    action.subscribe({
      next: () => this.router.navigate(['/policies']),
      error: (e: Error) => { console.error(e); this.saving = false; }
    });
  }

  private prefillForm(policy: Policy): void {
    this.selectedType = policy.policyType;

    this.form.patchValue({
      clientID: policy.clientID,
      policyNumber: policy.policyNumber,
      policyType: policy.policyType,
      startDate: this.toDateInput(policy.startDate),
      endDate: this.toDateInput(policy.endDate),
      premiumAmount: policy.premiumAmount,
      coverageAmount: policy.lifeDetail?.coverageAmount ?? policy.funeralDetail?.coverageAmount ?? null,
      beneficiary: policy.lifeDetail?.beneficiary ?? '',
      funeralType: policy.funeralDetail?.funeralType ?? '',
      maxCoverageAmount: policy.legalDetail?.maxCoverageAmount ?? null,
      legalType: policy.legalDetail?.legalType ?? '',
    });

    this.applyTypeValidators();
  }

  private applyTypeValidators(): void {
    const coverageAmount = this.form.get('coverageAmount');
    const beneficiary = this.form.get('beneficiary');
    const funeralType = this.form.get('funeralType');
    const maxCoverageAmount = this.form.get('maxCoverageAmount');
    const legalType = this.form.get('legalType');

    coverageAmount?.clearValidators();
    beneficiary?.clearValidators();
    funeralType?.clearValidators();
    maxCoverageAmount?.clearValidators();
    legalType?.clearValidators();

    if (this.selectedType === 'Life') {
      coverageAmount?.setValidators([Validators.required, Validators.min(1)]);
      beneficiary?.setValidators([Validators.required]);
    }

    if (this.selectedType === 'Funeral') {
      coverageAmount?.setValidators([Validators.required, Validators.min(1)]);
      funeralType?.setValidators([Validators.required]);
    }

    if (this.selectedType === 'Legal') {
      maxCoverageAmount?.setValidators([Validators.required, Validators.min(1)]);
      legalType?.setValidators([Validators.required]);
    }

    coverageAmount?.updateValueAndValidity();
    beneficiary?.updateValueAndValidity();
    funeralType?.updateValueAndValidity();
    maxCoverageAmount?.updateValueAndValidity();
    legalType?.updateValueAndValidity();
  }

  private buildPayload(): CreatePolicyRequest | UpdatePolicyRequest {
    const value = this.form.getRawValue();
    const base = {
      policyNumber: value.policyNumber,
      startDate: value.startDate,
      endDate: value.endDate,
      premiumAmount: Number(value.premiumAmount),
      policyType: value.policyType as PolicyType,
    };

    if (this.selectedType === 'Life') {
      return {
        ...base,
        ...(this.isEdit ? {} : { clientID: Number(value.clientID) }),
        coverageAmount: Number(value.coverageAmount),
        beneficiary: value.beneficiary,
      };
    }

    if (this.selectedType === 'Funeral') {
      return {
        ...base,
        ...(this.isEdit ? {} : { clientID: Number(value.clientID) }),
        coverageAmount: Number(value.coverageAmount),
        funeralType: value.funeralType,
      };
    }

    return {
      ...base,
      ...(this.isEdit ? {} : { clientID: Number(value.clientID) }),
      maxCoverageAmount: Number(value.maxCoverageAmount),
      legalType: value.legalType,
    };
  }

  private toDateInput(dateValue: string): string {
    return dateValue?.slice(0, 10) ?? '';
  }
}
