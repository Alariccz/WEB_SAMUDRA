/**
 * SAMUDRA Master Admin Portal Application
 * Orchestrates views (Login, Dashboard, Articles, Mitigasi, Peralatan, Accounts)
 * Role access:
 *   - admin: Dashboard, Artikel, Mitigasi, Peralatan (CRUD penuh)
 *   - super_admin: semua di atas + Manajemen Akun
 *   - Hanya rizalzaky2302@gmail.com (owner) yang bisa promote ke super_admin
 */

import './adminStyle.css';
import {
  isAdminLoggedIn,
  getAdminUser,
  logoutAdmin,
  getMe,
  isSuperAdmin,
  isAdminOrAbove
} from './adminApi.js';
import { renderAdminLogin } from './AdminLogin.js';
import { renderAdminDashboard } from './AdminDashboard.js';
import { renderAdminArticles, openCreateArticleModalDirectly } from './AdminArticles.js';
import { renderAdminMitigasi, openCreateMitigasiModalDirectly } from './AdminMitigasi.js';
import { renderAdminPeralatan } from './AdminPeralatan.js';
import { renderAdminAccounts } from './AdminAccounts.js';
import { showToast } from './adminToast.js';

// Reset tab ke 'dashboard' setiap app di-mount ulang agar tidak nyangkut di tab yang tidak diizinkan
let activeTab = 'dashboard';

export function renderAdminApp(container, onBackToWebsite) {
  container.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'adm-app';
  container.appendChild(root);

  // --- Cek autentikasi ---
  if (!isAdminLoggedIn()) {
    activeTab = 'dashboard';
    renderAdminLogin(root, () => {
      renderAdminApp(container, onBackToWebsite);
    }, onBackToWebsite);
    return;
  }

  // --- Cek apakah user punya minimal role admin ---
  const user = getAdminUser();
  if (user && !isAdminOrAbove()) {
    // User terdaftar tapi belum diberi role admin
    root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:20px;text-align:center;padding:40px;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--adm-amber)" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <h2 style="color:var(--adm-text);margin:0;font-size:22px;">Akses Belum Diizinkan</h2>
        <p style="color:var(--adm-text-dim);max-width:400px;margin:0;line-height:1.6;">
          Akun <b style="color:var(--adm-text);">${user.email || ''}</b> belum memiliki hak akses admin.<br>
          Hubungi Super Admin untuk mendapatkan izin akses.
        </p>
        <button class="adm-btn adm-btn--glass" onclick="window.__navigateToAdmin && window.__navigateToAdmin()" style="margin-top:8px;" onclick="location.reload()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Coba Lagi
        </button>
        <button class="adm-btn adm-btn--danger adm-btn--sm" id="adm-unauth-logout">Keluar</button>
      </div>
    `;
    const logoutBtn = root.querySelector('#adm-unauth-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        logoutAdmin();
        renderAdminApp(container, onBackToWebsite);
      };
    }
    return;
  }

  const superAdmin = isSuperAdmin();

  // --- Refresh profil di background ---
  getMe().then(freshUser => {
    updateUserBadge(root);
    // Kalau role berubah (misal dicabut), re-render
    if (!isAdminOrAbove()) {
      renderAdminApp(container, onBackToWebsite);
    }
  }).catch(err => {
    if (err.status === 401) {
      activeTab = 'dashboard';
      renderAdminLogin(root, () => {
        renderAdminApp(container, onBackToWebsite);
      }, onBackToWebsite);
    }
  });

  // --- Render Shell Header + Main View ---
  root.innerHTML = `
    <!-- Top Command Navigation Header -->
    <header class="adm-header">
      <div class="adm-header__brand" id="adm-brand-link">
        <div class="adm-header__logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        </div>
        <div>
          <span class="adm-header__logo-title">SAMUDRA</span>
          <span class="adm-header__badge">${superAdmin ? 'SUPER ADMIN' : 'PORTAL ADMIN'}</span>
        </div>
      </div>

      <!-- Navigation Tab Pills -->
      <nav class="adm-nav-tabs">
        <button class="adm-nav-btn ${activeTab === 'dashboard' ? 'adm-nav-btn--active' : ''}" data-tab="dashboard">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span>Ringkasan</span>
        </button>

        <button class="adm-nav-btn ${activeTab === 'articles' ? 'adm-nav-btn--active' : ''}" data-tab="articles">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span>Artikel</span>
        </button>

        <button class="adm-nav-btn ${activeTab === 'mitigasi' ? 'adm-nav-btn--active' : ''}" data-tab="mitigasi">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Mitigasi</span>
        </button>

        <button class="adm-nav-btn ${activeTab === 'peralatan' ? 'adm-nav-btn--active' : ''}" data-tab="peralatan">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          <span>Peralatan</span>
        </button>

        ${superAdmin ? `
        <button class="adm-nav-btn ${activeTab === 'accounts' ? 'adm-nav-btn--active' : ''}" data-tab="accounts" style="${activeTab === 'accounts' ? '' : 'border-color:rgba(245,158,11,0.25);'}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Akun</span>
          <span style="display:inline-flex;align-items:center;margin-left:4px;padding:1px 6px;border-radius:9999px;background:rgba(245,158,11,0.18);color:var(--adm-amber);font-size:9px;font-weight:700;letter-spacing:0.05em;">SA</span>
        </button>
        ` : ''}
      </nav>

      <!-- User Profile & Action Controls -->
      <div class="adm-header__actions">
        <div class="adm-user-badge" id="adm-user-badge-wrap">
          <div class="adm-user-avatar" id="adm-user-avatar">A</div>
          <div class="adm-user-info">
            <span class="adm-user-name" id="adm-user-name">Admin</span>
            <span class="adm-user-role" id="adm-user-role">${superAdmin ? 'Super Admin' : 'Administrator'}</span>
          </div>
        </div>

        <button class="adm-btn adm-btn--glass adm-btn--sm" id="adm-btn-website" title="Lihat Tampilan Web Publik">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          <span>Ke Website</span>
        </button>

        <button class="adm-btn adm-btn--danger adm-btn--sm adm-btn--icon-only" id="adm-btn-logout" title="Keluar / Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </header>

    <!-- Main View Workspace -->
    <main class="adm-main" id="adm-main-view"></main>
  `;

  updateUserBadge(root);

  const mainView = root.querySelector('#adm-main-view');
  const navBtns = root.querySelectorAll('.adm-nav-btn');
  const websiteBtn = root.querySelector('#adm-btn-website');
  const logoutBtn = root.querySelector('#adm-btn-logout');
  const brandLink = root.querySelector('#adm-brand-link');

  // Tab switching handler
  const switchTab = (tab) => {
    // Cegah akses ke tab 'accounts' kalau bukan super_admin
    if (tab === 'accounts' && !isSuperAdmin()) return;

    activeTab = tab;
    navBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('adm-nav-btn--active');
      } else {
        btn.classList.remove('adm-nav-btn--active');
      }
    });

    renderCurrentView(mainView, switchTab);
  };

  navBtns.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    };
  });

  if (brandLink) {
    brandLink.onclick = () => switchTab('dashboard');
  }

  // Website button
  if (websiteBtn && onBackToWebsite) {
    websiteBtn.onclick = onBackToWebsite;
  }

  // Logout button
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      if (confirm('Keluar dari sesi administrator SAMUDRA?')) {
        logoutAdmin();
        activeTab = 'dashboard';
        showToast('Anda telah keluar dari sesi admin.', 'success');
        renderAdminApp(container, onBackToWebsite);
      }
    };
  }

  // Render initial view
  renderCurrentView(mainView, switchTab);
}

function renderCurrentView(mainView, switchTab) {
  switch (activeTab) {
    case 'dashboard':
      renderAdminDashboard(
        mainView,
        switchTab,
        () => {
          switchTab('articles');
          setTimeout(() => openCreateArticleModalDirectly(mainView), 50);
        },
        () => {
          switchTab('mitigasi');
          setTimeout(() => openCreateMitigasiModalDirectly(mainView), 50);
        }
      );
      break;
    case 'articles':
      renderAdminArticles(mainView);
      break;
    case 'mitigasi':
      renderAdminMitigasi(mainView);
      break;
    case 'peralatan':
      renderAdminPeralatan(mainView);
      break;
    case 'accounts':
      renderAdminAccounts(mainView);
      break;
    default:
      renderAdminDashboard(mainView, switchTab);
  }
}

function updateUserBadge(root) {
  const user = getAdminUser();
  const nameEl = root.querySelector('#adm-user-name');
  const roleEl = root.querySelector('#adm-user-role');
  const avatarEl = root.querySelector('#adm-user-avatar');

  if (!user) return;

  if (nameEl && user.name) {
    nameEl.textContent = user.name.split(' ')[0] || user.name;
  }
  if (roleEl) {
    const roleLabel = user.role === 'super_admin' ? 'Super Admin'
      : user.role === 'admin' ? 'Administrator'
      : (user.role || 'Admin');
    roleEl.textContent = roleLabel;
  }
  if (avatarEl) {
    if (user.avatarUrl) {
      avatarEl.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else if (user.name) {
      avatarEl.textContent = user.name.charAt(0).toUpperCase();
    }
  }
}
