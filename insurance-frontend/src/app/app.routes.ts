// src/app/app.routes.ts
//
// Routes map URL paths to components.
// loadComponent() = lazy loading — the component is only downloaded when the user navigates to it.
// This keeps the initial bundle small.

import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    title: 'Dashboard'
  },

  // Clients
  {
    path: 'clients',
    loadComponent: () =>
      import('./components/clients/list/client-list.component')
        .then(m => m.ClientListComponent),
    title: 'Clients'
  },
  {
    path: 'clients/new',
    loadComponent: () =>
      import('./components/clients/form/client-form.component')
        .then(m => m.ClientFormComponent),
    title: 'New Client'
  },
  {
    path: 'clients/:id',
    loadComponent: () =>
      import('./components/clients/detail/client-detail.component')
        .then(m => m.ClientDetailComponent),
    title: 'Client Detail'
  },
  {
    path: 'clients/:id/edit',
    loadComponent: () =>
      import('./components/clients/form/client-form.component')
        .then(m => m.ClientFormComponent),
    title: 'Edit Client'
  },

  // Policies
  {
    path: 'policies',
    loadComponent: () =>
      import('./components/policies/list/policy-list.component')
        .then(m => m.PolicyListComponent),
    title: 'Policies'
  },
  {
    path: 'policies/new',
    loadComponent: () =>
      import('./components/policies/form/policy-form.component')
        .then(m => m.PolicyFormComponent),
    title: 'New Policy'
  },
  {
    path: 'policies/:id',
    loadComponent: () =>
      import('./components/policies/detail/policy-detail.component')
        .then(m => m.PolicyDetailComponent),
    title: 'Policy Detail'
  },

  // Claims
  {
    path: 'claims',
    loadComponent: () =>
      import('./components/claims/list/claim-list.component')
        .then(m => m.ClaimListComponent),
    title: 'Claims'
  },
  {
    path: 'claims/new',
    loadComponent: () =>
      import('./components/claims/form/claim-form.component')
        .then(m => m.ClaimFormComponent),
    title: 'New Claim'
  },

  // Fallback
  { path: '**', redirectTo: 'dashboard' }
];
