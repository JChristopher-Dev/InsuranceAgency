import { Component, OnInit }      from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '@services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container" style="max-width:740px">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Client' : 'New Client' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update client information' : 'Add a new policyholder' }}</p>
        </div>
        <a routerLink="/clients" class="btn btn-secondary">← Back</a>
      </div>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="submit()">

          <div class="form-section">
            <div class="form-section-title">Personal Information</div>
            <div class="form-row">
              <div class="form-group">
                <label>First Name <span style="color:var(--red)">*</span></label>
                <input formControlName="firstName" type="text" placeholder="e.g. John" />
                @if (f['firstName'].invalid && f['firstName'].touched) {
                  <div class="error-msg">First name is required</div>
                }
              </div>
              <div class="form-group">
                <label>Last Name <span style="color:var(--red)">*</span></label>
                <input formControlName="lastName" type="text" placeholder="e.g. Smith" />
                @if (f['lastName'].invalid && f['lastName'].touched) {
                  <div class="error-msg">Last name is required</div>
                }
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date of Birth <span style="color:var(--red)">*</span></label>
                <input formControlName="dateOfBirth" type="date" />
                @if (f['dateOfBirth'].invalid && f['dateOfBirth'].touched) {
                  <div class="error-msg">Date of birth is required</div>
                }
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Contact Details</div>
            <div class="form-row">
              <div class="form-group">
                <label>Email Address <span style="color:var(--red)">*</span></label>
                <input formControlName="email" type="email" placeholder="e.g. john@email.com" />
                @if (f['email'].errors?.['email'] && f['email'].touched) {
                  <div class="error-msg">Enter a valid email address</div>
                }
              </div>
              <div class="form-group">
                <label>Phone Number <span style="color:var(--red)">*</span></label>
                <input formControlName="phone" type="tel" placeholder="e.g. 082 123 4567" />
                @if (f['phone'].invalid && f['phone'].touched) {
                  <div class="error-msg">Phone number is required</div>
                }
              </div>
            </div>
            <div class="form-group">
              <label>Address <span style="color:var(--red)">*</span></label>
              <input formControlName="address" type="text" placeholder="e.g. 123 Main Road, Cape Town" />
              @if (f['address'].invalid && f['address'].touched) {
                <div class="error-msg">Address is required</div>
              }
            </div>
          </div>

          <div style="display:flex;gap:12px;padding-top:8px;border-top:1px solid var(--gray-100)">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="form.invalid || saving">
              {{ saving ? 'Saving...' : (isEdit ? 'Update Client' : 'Create Client') }}
            </button>
            <a routerLink="/clients" class="btn btn-secondary btn-lg">Cancel</a>
          </div>

        </form>
      </div>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  isEdit = false;
  saving = false;
  form!: FormGroup;
  private clientId?: number;

  get f() { return this.form.controls; }

  constructor(
    private fb:        FormBuilder,
    private router:    Router,
    private route:     ActivatedRoute,
    private clientSvc: ClientService
  ) {
    this.form = this.fb.group({
      firstName:   ['', Validators.required],
      lastName:    ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email:       ['', [Validators.required, Validators.email]],
      phone:       ['', Validators.required],
      address:     ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit   = !!this.clientId && !isNaN(this.clientId);
    if (this.isEdit) {
      this.clientSvc.getById(this.clientId!).subscribe(c => {
        if (c) this.form.patchValue(c as any);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val   = this.form.value as any;
    const action = this.isEdit
      ? this.clientSvc.update(this.clientId!, val)
      : this.clientSvc.create(val);
    action.subscribe({
      next: () => this.router.navigate(['/clients']),
      error: (e: Error) => { console.error(e); this.saving = false; }
    });
  }
}
