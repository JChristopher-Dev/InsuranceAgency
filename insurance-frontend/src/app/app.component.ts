import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="sb-brand">
          <div class="sb-logo">IA</div>
          <div>
            <div class="sb-name">InsureAgency</div>
            <div class="sb-tagline">Management Portal</div>
          </div>
        </div>
        <nav class="sb-nav">
          <div class="sb-section">OVERVIEW</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="sb-item">
            <span class="sb-icon">📊</span> Dashboard
          </a>
          <div class="sb-section">RECORDS</div>
          <a routerLink="/clients"  routerLinkActive="active" class="sb-item">
            <span class="sb-icon">👥</span> Clients
          </a>
          <a routerLink="/policies" routerLinkActive="active" class="sb-item">
            <span class="sb-icon">📋</span> Policies
          </a>
          <a routerLink="/claims"   routerLinkActive="active" class="sb-item">
            <span class="sb-icon">📁</span> Claims
          </a>
        </nav>
        <div class="sb-footer">
          <div class="sb-divider"></div>
          <div class="sb-user">
            <div class="sb-avatar">A</div>
            <div>
              <div class="sb-user-name">Administrator</div>
              <div class="sb-user-role">Full Access</div>
            </div>
          </div>
        </div>
      </aside>
      <div class="main-col">
        <header class="topbar">
          <div></div>
          <div class="tb-status"><span class="tb-dot"></span> API Connected</div>
        </header>
        <main class="content"><router-outlet /></main>
      </div>
    </div>
  `,
  styles: [`
    .shell{display:flex;height:100vh;overflow:hidden}
    .sidebar{width:244px;min-width:244px;background:#111827;display:flex;flex-direction:column}
    .sb-brand{display:flex;align-items:center;gap:11px;padding:20px 16px 16px;border-bottom:1px solid rgba(255,255,255,.07)}
    .sb-logo{width:36px;height:36px;background:#2563EB;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:13px;flex-shrink:0}
    .sb-name{font-size:14px;font-weight:700;color:#fff}
    .sb-tagline{font-size:10px;color:rgba(255,255,255,.3);margin-top:1px}
    .sb-nav{flex:1;padding:12px 8px;overflow-y:auto}
    .sb-section{display:block;font-size:10px;font-weight:700;color:rgba(255,255,255,.25);letter-spacing:1.2px;padding:14px 10px 5px}
    .sb-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:7px;color:rgba(255,255,255,.55);text-decoration:none;font-size:13px;font-weight:500;transition:all .15s;margin-bottom:2px}
    .sb-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.85)}
    .sb-item.active{background:#2563EB;color:#fff}
    .sb-icon{font-size:15px;width:18px;text-align:center;flex-shrink:0}
    .sb-footer{padding:0 8px 14px}
    .sb-divider{height:1px;background:rgba(255,255,255,.07);margin-bottom:12px}
    .sb-user{display:flex;align-items:center;gap:10px;padding:9px 8px;border-radius:7px}
    .sb-avatar{width:30px;height:30px;background:#374151;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:12px;font-weight:700;flex-shrink:0}
    .sb-user-name{font-size:12px;font-weight:600;color:rgba(255,255,255,.7)}
    .sb-user-role{font-size:10px;color:rgba(255,255,255,.3)}
    .main-col{flex:1;display:flex;flex-direction:column;overflow:hidden}
    .topbar{height:50px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:flex-end;padding:0 28px;flex-shrink:0}
    .tb-status{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;color:#374151}
    .tb-dot{width:7px;height:7px;background:#16A34A;border-radius:50%;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 2px #DCFCE7}50%{box-shadow:0 0 0 4px #BBF7D0}}
    .content{flex:1;overflow-y:auto}
  `]
})
export class AppComponent {}
