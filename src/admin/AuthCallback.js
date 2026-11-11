/**
 * SAMUDRA Administrator Google OAuth Callback Handler (/auth/callback)
 * Menangani redirect dari backend NestJS:
 * https://admin.samudra.buzz/auth/callback?accessToken=...&refreshToken=...
 */

import {
  API_BASE,
  setAdminToken,
  setAdminRefreshToken,
  setAdminUser,
  logoutAdmin,
  tryPromoteOwnerRole
} from './adminApi.js';
import { showToast } from './adminToast.js';

/**
 * Handle proses callback autentikasi Google OAuth
 * @param {HTMLElement} container
 * @param {Object} options
 * @param {Function} options.onAuthSuccess
 * @param {Function} options.onAuthError
 */
export async function handleAuthCallback(container, { onAuthSuccess, onAuthError } = {}) {
  // Render loading state
  container.innerHTML = `
    <div style="display:flex;min-height:100vh;align-items:center;justify-content:center;background-color:#020914;color:#f1f5f9;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:18px;text-align:center;max-width:440px;">
        <div style="width:44px;height:44px;border:3px solid rgba(56,189,248,0.15);border-top-color:#38bdf8;border-radius:50%;animation:adm-spin 0.8s linear infinite;"></div>
        <div>
          <h3 style="margin:0 0 6px 0;font-size:18px;font-weight:600;color:#f8fafc;">Autentikasi Google</h3>
          <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.5;" id="auth-callback-status">
            Memproses autentikasi, mohon tunggu...
          </p>
        </div>
      </div>
    </div>
  `;

  const statusText = container.querySelector('#auth-callback-status');
  const updateStatus = (msg) => {
    if (statusText) statusText.textContent = msg;
  };

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const accessToken = searchParams.get('accessToken') || searchParams.get('access_token') || searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken') || searchParams.get('refresh_token');
    const errorParam = searchParams.get('error') || searchParams.get('message');

    // Jika backend mengirimkan pesan error pada URL query
    if (errorParam) {
      throw new Error(decodeURIComponent(errorParam));
    }

    // 1. Validasi token dari searchParams
    if (!accessToken) {
      console.error('Token tidak ditemukan di callback URL');
      throw new Error('Token tidak ditemukan di callback URL');
    }

    // 2. Simpan token ke localStorage & auth store
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    setAdminToken(accessToken);
    if (refreshToken) {
      setAdminRefreshToken(refreshToken);
    }

    // 3. Panggil endpoint verifikasi / profil: GET https://samudra.rizalzaky.cloud/api/auth/me
    updateStatus('Memverifikasi hak akses administrator...');
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      let errMsg = `Gagal memverifikasi profil (HTTP ${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) {
          errMsg = Array.isArray(errJson.message) ? errJson.message.join(', ') : errJson.message;
        }
      } catch (_) {}
      throw new Error(errMsg);
    }

    const userData = await res.json();
    const user = userData.user || userData;

    // 4. Pastikan role user adalah admin atau super_admin
    const email = (user.email || '').toLowerCase();
    const isOwner = email === 'rizalzaky2302@gmail.com';
    const role = (user.role || '').toLowerCase();
    const isSuperAdmin = user.isSuperAdmin === true || role === 'super_admin';
    const isAdmin = isOwner || isSuperAdmin || role === 'admin';

    if (!isAdmin) {
      // Bukan admin: bersihkan token dan tolak akses
      logoutAdmin();
      throw new Error('Akses ditolak: Akun Anda tidak memiliki hak akses administrator.');
    }

    // Simpan profil admin yang valid
    setAdminUser(user);

    // Coba otomatis promosikan role owner jika akun pemilik sistem
    tryPromoteOwnerRole().catch(() => {});

    // Arahkan ke /dashboard dan bersihkan URL callback
    window.history.replaceState({}, '', '/dashboard');
    showToast(`Login Google berhasil! Selamat datang, ${user.name || user.email || 'Admin'}.`, 'success');

    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    logoutAdmin();
    const errorMsg = err.message || 'oauth_failed';

    // Arahkan kembali ke /login dengan parameter error
    window.history.replaceState({}, '', `/login?error=${encodeURIComponent(errorMsg)}`);
    showToast(errorMsg, 'error');

    if (onAuthError) {
      onAuthError(errorMsg);
    }
  }
}

