import { Component, OnInit } from '@angular/core';
import { RouterLink }         from '@angular/router';
import { FormsModule }        from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { ClientSummary } from '../../../core/models/client.model';

type SortKey = 'fullName' | 'email' | 'policyCount';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Clients</h1>
          <p class="page-subtitle">{{ clientSvc.clients().length }} registered policyholders</p>
        </div>
        <div class="page-actions">
          <a routerLink="/clients/new" class="btn btn-primary">+ New Client</a>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Search name or email..."
                 [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)" />
        </div>
        <div class="filter-sep"></div>
        <span style="font-size:12px;color:var(--gray-400)">
          Showing {{ clientSvc.clients().length }} clients
        </span>
      </div>

      @if (clientSvc.error()) {
        <div class="alert alert-error">⚠ {{ clientSvc.error() }}</div>
      }

      @if (clientSvc.loading()) {
        <div class="spinner-wrapper"><div class="spinner"></div></div>
      } @else {
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th class="sortable"
                      [class.sort-asc]="sortKey==='fullName'&&sortDir==='asc'"
                      [class.sort-desc]="sortKey==='fullName'&&sortDir==='desc'"
                      (click)="sort('fullName')">Client</th>
                  <th class="sortable"
                      [class.sort-asc]="sortKey==='email'&&sortDir==='asc'"
                      [class.sort-desc]="sortKey==='email'&&sortDir==='desc'"
                      (click)="sort('email')">Email</th>
                  <th>Phone</th>
                  <th class="sortable"
                      [class.sort-asc]="sortKey==='policyCount'&&sortDir==='asc'"
                      [class.sort-desc]="sortKey==='policyCount'&&sortDir==='desc'"
                      (click)="sort('policyCount')">Policies</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (c of sorted; track c.clientID) {
                  <tr>
                    <td>
                      <div class="avatar-cell">
                        <div class="avatar-initials">{{ initials(c.fullName) }}</div>
                        <a [routerLink]="['/clients', c.clientID]" class="td-link">{{ c.fullName }}</a>
                      </div>
                    </td>
                    <td style="color:var(--gray-500)">{{ c.email }}</td>
                    <td style="color:var(--gray-500)">{{ c.phone }}</td>
                    <td>
                      <span [class]="'badge ' + (c.policyCount > 0 ? 'badge-active' : 'badge-expired')">
                        <span class="badge-dot"></span>
                        {{ c.policyCount }} {{ c.policyCount === 1 ? 'policy' : 'policies' }}
                      </span>
                    </td>
                    <td>
                      <div class="td-actions">
                        <a [routerLink]="['/clients', c.clientID]"         class="btn btn-secondary btn-sm">View</a>
                        <a [routerLink]="['/clients', c.clientID, 'edit']"  class="btn btn-ghost btn-sm">Edit</a>
                        <button (click)="delete(c)" class="btn btn-ghost btn-sm" style="color:var(--red)">Delete</button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5">
                      <div class="empty-state">
                        <div class="empty-state-icon">👥</div>
                        <h3>No clients found</h3>
                        <p>Try a different search term or add a new client.</p>
                        <a routerLink="/clients/new" class="btn btn-primary">+ New Client</a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class ClientListComponent implements OnInit {
  searchTerm = '';
  sortKey: SortKey = 'fullName';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(public clientSvc: ClientService) {}

  ngOnInit(): void { this.clientSvc.loadAll(); }

  onSearch(term: string): void { this.clientSvc.search(term); }

  sort(key: SortKey): void {
    this.sortDir = this.sortKey === key && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortKey = key;
  }

  get sorted(): ClientSummary[] {
    return [...this.clientSvc.clients()].sort((a, b) => {
      const av = a[this.sortKey] ?? '';
      const bv = b[this.sortKey] ?? '';
      const cmp = typeof av === 'number'
        ? (av as number) - (bv as number)
        : String(av).localeCompare(String(bv));
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  delete(c: ClientSummary): void {
    if (!confirm(`Delete ${c.fullName}? This cannot be undone.`)) return;
    this.clientSvc.delete(c.clientID).subscribe();
  }
}
