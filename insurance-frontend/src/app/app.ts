import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">IA</div>
          <div>
            <div class="brand-name">Insurance Agency</div>
            <div class="brand-sub">Management Portal</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section-label">Main</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⬛</span> Dashboard
          </a>
          <div class="nav-section-label">Records</div>
          <a routerLink="/clients" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👤</span> Clients
          </a>
          <a routerLink="/policies" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📋</span> Policies
          </a>
          <a routerLink="/claims" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📁</span> Claims
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-footer-text">Insurance Agency v1.0</div>
        </div>
      </aside>
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-layout     { display: flex; height: 100vh; overflow: hidden; }
    .sidebar        { width: 240px; min-width: 240px; background: #1F3864; display: flex; flex-direction: column; }
    .sidebar-brand  { display: flex; align-items: center; gap: 12px; padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,.1); }
    .brand-icon     { width: 36px; height: 36px; background: #2E75B6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 13px; }
    .brand-name     { font-size: 14px; font-weight: 700; color: white; }
    .brand-sub      { font-size: 10px; color: rgba(255,255,255,.5); }
    .sidebar-nav    { flex: 1; padding: 16px 8px; overflow-y: auto; }
    .nav-section-label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,.35); text-transform: uppercase; letter-spacing: .8px; padding: 12px 8px 4px; }
    .nav-item       { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 6px; color: rgba(255,255,255,.7); text-decoration: none; font-size: 13px; font-weight: 500; transition: all .15s; margin-bottom: 2px; }
    .nav-item:hover { background: rgba(255,255,255,.08); color: white; }
    .nav-item.active { background: #2E75B6; color: white; }
    .nav-icon       { font-size: 14px; width: 18px; text-align: center; }
    .sidebar-footer { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,.1); }
    .sidebar-footer-text { font-size: 11px; color: rgba(255,255,255,.3); }
    .main-content   { flex: 1; overflow-y: auto; background: #F9FAFB; }
  `]
})
export class AppComponent {}