/**
 * SAMUDRA Admin Account Management Component
 * Hanya bisa diakses oleh Super Admin
 * Akun rizalzaky2302@gmail.com adalah satu-satunya yang bisa mempromosikan ke super_admin
 */

import {
  fetchAllUsers,
  updateUserRole,
  deleteUserAccount,
  getAdminUser,
  isSuperAdmin,
  isOwner
} from './adminApi.js';
import { showToast } from './adminToast.js';

// Email pemilik sistem - dipakai untuk tampilan label "Pemilik"
const OWNER_EMAIL = 'rizalzaky2302@gmail.com';

const ROLE_CONFIG = {
  super_admin: {
    label: 'Super Admin',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.25)',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  },
  admin: {
    label: 'Admin',
    color: '#00d2ff',
    glow: 'rgba(0,210,255,0.25)',
    bg: 'rgba(0,210,255,0.10)',
    border: 'rgba(0,210,255,0.30)',
    icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
  },
  user: {
    label: 'User',
    color: '#64748b',
    glow: 'rgba(100,116,139,0.2)',
    bg: 'rgba(100,116,139,0.10)',
    border: 'rgba(100,116,139,0.25)',
    icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
  }
};

let usersState = [];
let searchQuery = '';

export function renderAdminAccounts(container) {
  const me = getAdminUser();
  const isCurrentOwner = isOwner();
  const isSuperAdminUser = isSuperAdmin(); // sudah termasuk owner bypass

  if (!isSuperAdminUser) {
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:60vh;flex-direction:column;gap:16px;text-align:center;">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--adm-rose)" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <h2 style="color:var(--adm-text);margin:0;">Akses Ditolak</h2>
        <p style="color:var(--adm-text-dim);max-width:320px;margin:0;">Halaman Manajemen Akun hanya dapat diakses oleh Super Admin.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div>
      <!-- Title Bar -->
      <div class="adm-view-title-bar">
        <div class="adm-view-title-bar__left">
          <div class="adm-star-badge" style="margin-bottom:10px;">
            <span class="adm-star-badge__star">👑</span>
            <span>${isCurrentOwner ? 'Pemilik Sistem · Akses Penuh' : 'Super Admin · Manajemen Akun'}</span>
          </div>
          <h1>Manajemen Akun Admin</h1>
          <p>Kelola hak akses pengguna yang terdaftar di sistem SAMUDRA. Atur siapa yang bisa mengakses portal admin.</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <div class="adm-search-box" style="position:relative;">
            <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--adm-text-dim);pointer-events:none;" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              id="adm-accounts-search"
              placeholder="Cari nama atau email..."
              style="background:var(--adm-surface);border:1px solid var(--adm-border);color:var(--adm-text);border-radius:var(--adm-radius-sm);padding:10px 16px 10px 38px;font-size:13px;width:240px;outline:none;font-family:var(--adm-font);"
            >
          </div>
          <button class="adm-btn adm-btn--glass adm-btn--sm" id="adm-accounts-refresh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            <span>Muat Ulang</span>
          </button>
        </div>
      </div>

      <!-- Role Legend -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;">
        ${Object.entries(ROLE_CONFIG).map(([role, cfg]) => `
          <div style="display:flex;align-items:center;gap:7px;padding:6px 14px;border-radius:var(--adm-radius-full);background:${cfg.bg};border:1px solid ${cfg.border};font-size:12px;font-weight:500;color:${cfg.color};">
            ${cfg.icon} ${cfg.label}
          </div>
        `).join('')}
        ${isCurrentOwner ? `
          <div style="margin-left:auto;padding:6px 14px;border-radius:var(--adm-radius-full);background:rgba(245,158,11,0.08);border:1px dashed rgba(245,158,11,0.4);font-size:12px;color:var(--adm-amber);">
            ★ Anda adalah pemilik sistem — dapat mempromosikan Super Admin
          </div>
        ` : ''}
      </div>

      <!-- Stats Bar -->
      <div id="adm-accounts-stats" style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;"></div>

      <!-- Table Container -->
      <div class="adm-table-wrap" id="adm-accounts-table-wrap">
        <div style="text-align:center;padding:60px 0;color:var(--adm-text-dim);">
          <svg class="adm-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
          <div style="margin-top:14px;font-size:14px;">Memuat daftar akun...</div>
        </div>
      </div>

      <!-- Modal Root -->
      <div id="adm-accounts-modal-root"></div>
    </div>
  `;

  const tableWrap = container.querySelector('#adm-accounts-table-wrap');
  const statsEl = container.querySelector('#adm-accounts-stats');
  const searchInput = container.querySelector('#adm-accounts-search');
  const refreshBtn = container.querySelector('#adm-accounts-refresh');

  // Search handler
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.toLowerCase().trim();
      renderTable(tableWrap, isCurrentOwner, me);
    });
  }

  if (refreshBtn) {
    refreshBtn.onclick = () => loadUsers(tableWrap, statsEl, isCurrentOwner, me);
  }

  loadUsers(tableWrap, statsEl, isCurrentOwner, me);
}

async function loadUsers(tableWrap, statsEl, isOwner, me) {
  tableWrap.innerHTML = `
    <div style="text-align:center;padding:60px 0;color:var(--adm-text-dim);">
      <svg class="adm-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      <div style="margin-top:14px;font-size:14px;">Memuat daftar akun...</div>
    </div>
  `;
  try {
    const data = await fetchAllUsers();
    usersState = Array.isArray(data) ? data : (data.users || data.data || []);
    renderStats(statsEl);
    renderTable(tableWrap, isOwner, me);
  } catch (err) {
    tableWrap.innerHTML = `
      <div style="text-align:center;padding:60px 0;color:var(--adm-rose);">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div style="font-size:15px;font-weight:500;margin-bottom:6px;">Gagal memuat data pengguna</div>
        <div style="font-size:13px;color:var(--adm-text-dim);">${err.message || 'Terjadi kesalahan pada server'}</div>
      </div>
    `;
  }
}

function renderStats(statsEl) {
  if (!statsEl) return;
  const total = usersState.length;
  const superAdmins = usersState.filter(u => u.role === 'super_admin' || u.isSuperAdmin).length;
  const admins = usersState.filter(u => u.role === 'admin').length;
  const users = usersState.filter(u => !u.role || u.role === 'user').length;

  const stats = [
    { label: 'Total Akun', val: total, color: 'var(--adm-text-muted)', icon: '👥' },
    { label: 'Super Admin', val: superAdmins, color: 'var(--adm-amber)', icon: '👑' },
    { label: 'Admin', val: admins, color: 'var(--adm-cyan)', icon: '🛡️' },
    { label: 'User Biasa', val: users, color: 'var(--adm-text-dim)', icon: '👤' },
  ];

  statsEl.innerHTML = stats.map(s => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 18px;background:var(--adm-surface-card);border:1px solid var(--adm-border);border-radius:var(--adm-radius-sm);">
      <span style="font-size:18px;">${s.icon}</span>
      <div>
        <div style="font-size:18px;font-weight:700;color:${s.color};line-height:1;">${s.val}</div>
        <div style="font-size:11px;color:var(--adm-text-dim);margin-top:2px;">${s.label}</div>
      </div>
    </div>
  `).join('');
}

function renderTable(tableWrap, isOwner, me) {
  const filtered = usersState.filter(u => {
    if (!searchQuery) return true;
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(searchQuery) || email.includes(searchQuery);
  });

  if (filtered.length === 0) {
    tableWrap.innerHTML = `
      <div style="text-align:center;padding:60px 0;color:var(--adm-text-dim);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <div style="font-size:14px;">${searchQuery ? `Tidak ada hasil untuk "<b style="color:var(--adm-text);">${searchQuery}</b>"` : 'Belum ada akun terdaftar.'}</div>
      </div>
    `;
    return;
  }

  // Sort: super_admin first, then admin, then user
  const roleOrder = { super_admin: 0, admin: 1, user: 2 };
  const sorted = [...filtered].sort((a, b) => {
    const ra = roleOrder[a.role] ?? 2;
    const rb = roleOrder[b.role] ?? 2;
    if (ra !== rb) return ra - rb;
    return (a.name || '').localeCompare(b.name || '');
  });

  tableWrap.innerHTML = `
    <div style="overflow-x:auto;border-radius:var(--adm-radius-md);border:1px solid var(--adm-border);">
      <table class="adm-accounts-table" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:rgba(14,28,46,0.9);border-bottom:1px solid var(--adm-border);">
            <th style="padding:14px 20px;text-align:left;font-size:11px;font-weight:600;color:var(--adm-text-dim);letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">Pengguna</th>
            <th style="padding:14px 20px;text-align:left;font-size:11px;font-weight:600;color:var(--adm-text-dim);letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">Email</th>
            <th style="padding:14px 20px;text-align:left;font-size:11px;font-weight:600;color:var(--adm-text-dim);letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">Role</th>
            <th style="padding:14px 20px;text-align:left;font-size:11px;font-weight:600;color:var(--adm-text-dim);letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">Bergabung</th>
            <th style="padding:14px 20px;text-align:right;font-size:11px;font-weight:600;color:var(--adm-text-dim);letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">Aksi</th>
          </tr>
        </thead>
        <tbody id="adm-accounts-tbody">
          ${sorted.map(user => renderUserRow(user, isOwner, me)).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:12px;font-size:12px;color:var(--adm-text-dim);text-align:right;">
      Menampilkan ${sorted.length} dari ${usersState.length} akun
    </div>
  `;

  // Bind action buttons
  tableWrap.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const userId = btn.getAttribute('data-user-id');
      const userEmail = btn.getAttribute('data-user-email');
      const user = usersState.find(u => u.id === userId || u._id === userId);
      if (!user) return;

      if (action === 'promote-admin') {
        openRoleModal(user, 'admin', tableWrap, isOwner, me);
      } else if (action === 'promote-superadmin') {
        openRoleModal(user, 'super_admin', tableWrap, isOwner, me);
      } else if (action === 'demote-user') {
        openRoleModal(user, 'user', tableWrap, isOwner, me);
      } else if (action === 'delete') {
        openDeleteModal(user, tableWrap, isOwner, me);
      }
    });
  });
}

function renderUserRow(user, isOwner, me) {
  const userId = user.id || user._id;
  const name = user.name || user.displayName || 'Tanpa Nama';
  const email = user.email || '-';
  const role = user.role || 'user';
  const isSelf = me && (me.id === userId || me._id === userId || me.email === email);
  const isUserOwner = email === OWNER_EMAIL;
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.user;

  const avatar = user.avatarUrl
    ? `<img src="${user.avatarUrl}" alt="${name}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid ${cfg.border};">`
    : `<div style="width:36px;height:36px;border-radius:50%;background:${cfg.bg};border:2px solid ${cfg.border};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:${cfg.color};">${name.charAt(0).toUpperCase()}</div>`;

  // Build action buttons
  const actions = [];

  if (!isSelf && !isUserOwner) {
    if (role === 'user') {
      actions.push(`
        <button class="adm-btn adm-btn--sm adm-btn--glass" data-action="promote-admin" data-user-id="${userId}" data-user-email="${email}" title="Jadikan Admin"
          style="border-color:rgba(0,210,255,0.4);color:var(--adm-cyan);font-size:12px;padding:6px 12px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Jadikan Admin
        </button>
      `);
    }
    if (role === 'admin') {
      actions.push(`
        <button class="adm-btn adm-btn--sm adm-btn--glass" data-action="demote-user" data-user-id="${userId}" data-user-email="${email}" title="Turunkan ke User"
          style="border-color:rgba(100,116,139,0.5);color:var(--adm-text-dim);font-size:12px;padding:6px 12px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Turunkan
        </button>
      `);
    }
    if (isOwner && role !== 'super_admin') {
      actions.push(`
        <button class="adm-btn adm-btn--sm adm-btn--glass" data-action="promote-superadmin" data-user-id="${userId}" data-user-email="${email}" title="Jadikan Super Admin"
          style="border-color:rgba(245,158,11,0.5);color:var(--adm-amber);font-size:12px;padding:6px 12px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Super Admin
        </button>
      `);
    }
    if (isOwner && role === 'super_admin') {
      actions.push(`
        <button class="adm-btn adm-btn--sm adm-btn--glass" data-action="demote-user" data-user-id="${userId}" data-user-email="${email}" title="Turunkan ke User"
          style="border-color:rgba(100,116,139,0.5);color:var(--adm-text-dim);font-size:12px;padding:6px 12px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Turunkan
        </button>
      `);
    }
    if (isOwner && role !== 'super_admin') {
      actions.push(`
        <button class="adm-btn adm-btn--sm adm-btn--danger" data-action="delete" data-user-id="${userId}" data-user-email="${email}" title="Hapus Akun"
          style="font-size:12px;padding:6px 10px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      `);
    }
  }

  const selfBadge = isSelf ? `<span style="font-size:10px;padding:2px 7px;border-radius:var(--adm-radius-full);background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);color:var(--adm-emerald);margin-left:8px;">Anda</span>` : '';
  const ownerBadge = isUserOwner ? `<span style="font-size:10px;padding:2px 7px;border-radius:var(--adm-radius-full);background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);color:var(--adm-amber);margin-left:6px;">Pemilik</span>` : '';

  return `
    <tr style="border-bottom:1px solid var(--adm-border);transition:background 0.15s;" 
        onmouseenter="this.style.background='var(--adm-surface-hover)'"
        onmouseleave="this.style.background='transparent'">
      <td style="padding:16px 20px;">
        <div style="display:flex;align-items:center;gap:12px;">
          ${avatar}
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--adm-text);display:flex;align-items:center;flex-wrap:wrap;gap:4px;">
              ${name}${selfBadge}${ownerBadge}
            </div>
            ${user.provider ? `<div style="font-size:11px;color:var(--adm-text-dim);margin-top:2px;">${user.provider === 'google' ? '🔵 Google' : user.provider}</div>` : ''}
          </div>
        </div>
      </td>
      <td style="padding:16px 20px;">
        <span style="font-size:13px;color:var(--adm-text-muted);font-family:var(--adm-mono);">${email}</span>
      </td>
      <td style="padding:16px 20px;">
        <span style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:var(--adm-radius-full);background:${cfg.bg};border:1px solid ${cfg.border};color:${cfg.color};font-size:12px;font-weight:600;">
          ${cfg.icon} ${cfg.label}
        </span>
      </td>
      <td style="padding:16px 20px;font-size:13px;color:var(--adm-text-dim);">${joinDate}</td>
      <td style="padding:16px 20px;">
        <div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;">
          ${actions.length > 0 ? actions.join('') : `<span style="font-size:12px;color:var(--adm-text-dim);padding:6px 12px;">${isSelf ? '— Akun Anda' : isUserOwner ? '— Pemilik Sistem' : '—'}</span>`}
        </div>
      </td>
    </tr>
  `;
}

function openRoleModal(user, newRole, tableWrap, isOwner, me) {
  const modalRoot = document.getElementById('adm-accounts-modal-root');
  if (!modalRoot) return;

  const userId = user.id || user._id;
  const name = user.name || user.email;
  const cfg = ROLE_CONFIG[newRole] || ROLE_CONFIG.user;
  const oldCfg = ROLE_CONFIG[user.role || 'user'] || ROLE_CONFIG.user;

  const isPromotion = (ROLE_CONFIG[newRole] ? Object.keys(ROLE_CONFIG).indexOf(newRole) : 2) < (Object.keys(ROLE_CONFIG).indexOf(user.role || 'user'));
  const actionWord = newRole === 'super_admin' ? 'Promosikan ke Super Admin' :
    newRole === 'admin' ? 'Jadikan Admin' : 'Turunkan ke User';

  const warningMsg = newRole === 'super_admin'
    ? `<div style="padding:12px 16px;border-radius:var(--adm-radius-sm);background:rgba(245,158,11,0.10);border:1px solid rgba(245,158,11,0.3);color:var(--adm-amber);font-size:13px;margin-top:16px;">
        ⚠️ <b>Perhatian:</b> Super Admin memiliki akses penuh ke seluruh sistem termasuk manajemen akun. Gunakan dengan sangat hati-hati.
      </div>` : '';

  modalRoot.innerHTML = `
    <div class="adm-modal-overlay" id="adm-role-modal-overlay" style="position:fixed;inset:0;background:rgba(3,9,18,0.82);backdrop-filter:blur(10px);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;">
      <div class="adm-modal-card" style="background:var(--adm-surface-card);border:1px solid var(--adm-border);border-radius:var(--adm-radius-lg);padding:32px;max-width:480px;width:100%;box-shadow:var(--adm-shadow),0 0 60px -20px ${cfg.glow};">
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
          <div style="width:48px;height:48px;border-radius:var(--adm-radius-md);background:${cfg.bg};border:1px solid ${cfg.border};display:flex;align-items:center;justify-content:center;color:${cfg.color};flex-shrink:0;">
            ${cfg.icon.replace('width="12"','width="22"').replace('height="12"','height="22"')}
          </div>
          <div>
            <h3 style="margin:0;font-size:17px;color:var(--adm-text);">${actionWord}</h3>
            <p style="margin:4px 0 0;font-size:13px;color:var(--adm-text-dim);">Konfirmasi perubahan hak akses</p>
          </div>
        </div>

        <!-- User Info -->
        <div style="padding:14px 16px;border-radius:var(--adm-radius-sm);background:var(--adm-surface);border:1px solid var(--adm-border);margin-bottom:16px;">
          <div style="font-size:13px;color:var(--adm-text-dim);margin-bottom:6px;">Akun yang diubah:</div>
          <div style="font-size:15px;font-weight:600;color:var(--adm-text);">${name}</div>
          <div style="font-size:12px;color:var(--adm-text-dim);margin-top:2px;font-family:var(--adm-mono);">${user.email}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
            <span style="padding:3px 10px;border-radius:var(--adm-radius-full);background:${oldCfg.bg};border:1px solid ${oldCfg.border};color:${oldCfg.color};font-size:11px;font-weight:600;">${oldCfg.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--adm-text-dim)" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            <span style="padding:3px 10px;border-radius:var(--adm-radius-full);background:${cfg.bg};border:1px solid ${cfg.border};color:${cfg.color};font-size:11px;font-weight:600;">${cfg.label}</span>
          </div>
        </div>

        ${warningMsg}

        <!-- Actions -->
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;">
          <button class="adm-btn adm-btn--glass adm-btn--sm" id="adm-role-modal-cancel" style="padding:10px 22px;">Batal</button>
          <button class="adm-btn adm-btn--sm" id="adm-role-modal-confirm" style="padding:10px 22px;background:${cfg.bg};border:1px solid ${cfg.border};color:${cfg.color};">
            <span id="adm-role-confirm-label">${actionWord}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const overlay = modalRoot.querySelector('#adm-role-modal-overlay');
  const cancelBtn = modalRoot.querySelector('#adm-role-modal-cancel');
  const confirmBtn = modalRoot.querySelector('#adm-role-modal-confirm');

  const closeModal = () => { modalRoot.innerHTML = ''; };
  cancelBtn.onclick = closeModal;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

  confirmBtn.onclick = async () => {
    confirmBtn.disabled = true;
    const label = confirmBtn.querySelector('#adm-role-confirm-label');
    if (label) label.textContent = 'Menyimpan...';
    try {
      await updateUserRole(userId, newRole);
      const userInState = usersState.find(u => (u.id || u._id) === userId);
      if (userInState) userInState.role = newRole;
      closeModal();
      showToast(`Hak akses ${name} berhasil diubah ke ${cfg.label}.`, 'success');
      renderTable(tableWrap, isOwner, me);
    } catch (err) {
      showToast(err.message || 'Gagal mengubah hak akses.', 'error');
      confirmBtn.disabled = false;
      if (label) label.textContent = actionWord;
    }
  };
}

function openDeleteModal(user, tableWrap, isOwner, me) {
  const modalRoot = document.getElementById('adm-accounts-modal-root');
  if (!modalRoot) return;

  const userId = user.id || user._id;
  const name = user.name || user.email;

  modalRoot.innerHTML = `
    <div class="adm-modal-overlay" id="adm-delete-modal-overlay" style="position:fixed;inset:0;background:rgba(3,9,18,0.82);backdrop-filter:blur(10px);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;">
      <div class="adm-modal-card" style="background:var(--adm-surface-card);border:1px solid rgba(244,63,94,0.3);border-radius:var(--adm-radius-lg);padding:32px;max-width:440px;width:100%;box-shadow:var(--adm-shadow),0 0 60px -20px rgba(244,63,94,0.2);">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
          <div style="width:48px;height:48px;border-radius:var(--adm-radius-md);background:rgba(244,63,94,0.12);border:1px solid rgba(244,63,94,0.35);display:flex;align-items:center;justify-content:center;color:var(--adm-rose);flex-shrink:0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <div>
            <h3 style="margin:0;font-size:17px;color:var(--adm-text);">Hapus Akun</h3>
            <p style="margin:4px 0 0;font-size:13px;color:var(--adm-text-dim);">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        <div style="padding:14px 16px;border-radius:var(--adm-radius-sm);background:var(--adm-surface);border:1px solid var(--adm-border);margin-bottom:20px;">
          <div style="font-size:13px;color:var(--adm-text-dim);margin-bottom:4px;">Akun yang akan dihapus:</div>
          <div style="font-size:15px;font-weight:600;color:var(--adm-text);">${name}</div>
          <div style="font-size:12px;color:var(--adm-text-dim);font-family:var(--adm-mono);">${user.email}</div>
        </div>

        <div style="padding:12px 16px;border-radius:var(--adm-radius-sm);background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.25);color:var(--adm-rose);font-size:13px;margin-bottom:24px;">
          ⚠️ Seluruh data terkait akun ini akan dihapus secara permanen dari sistem.
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button class="adm-btn adm-btn--glass adm-btn--sm" id="adm-delete-modal-cancel" style="padding:10px 22px;">Batal</button>
          <button class="adm-btn adm-btn--danger adm-btn--sm" id="adm-delete-modal-confirm" style="padding:10px 22px;">
            <span id="adm-delete-confirm-label">Hapus Permanen</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const overlay = modalRoot.querySelector('#adm-delete-modal-overlay');
  const cancelBtn = modalRoot.querySelector('#adm-delete-modal-cancel');
  const confirmBtn = modalRoot.querySelector('#adm-delete-modal-confirm');

  const closeModal = () => { modalRoot.innerHTML = ''; };
  cancelBtn.onclick = closeModal;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

  confirmBtn.onclick = async () => {
    confirmBtn.disabled = true;
    const label = confirmBtn.querySelector('#adm-delete-confirm-label');
    if (label) label.textContent = 'Menghapus...';
    try {
      await deleteUserAccount(userId);
      usersState = usersState.filter(u => (u.id || u._id) !== userId);
      closeModal();
      showToast(`Akun ${name} berhasil dihapus.`, 'success');
      renderTable(tableWrap, isOwner, me);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus akun.', 'error');
      confirmBtn.disabled = false;
      if (label) label.textContent = 'Hapus Permanen';
    }
  };
}
