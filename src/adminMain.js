/**
 * SAMUDRA Administrator Portal Main Entry Point
 * Didedikasikan untuk subdomain admin: https://admin.samudra.buzz/
 * Terpisah dari website publik tanpa dependensi 3D / publik scene
 */

import './admin/adminStyle.css';
import {
  renderAdminApp,
  setAdminToken,
  setAdminRefreshToken,
  getMe,
  getAdminUser
} from './admin/index.js';

// Catch unhandled errors gracefully in console
window.onerror = function (msg, url, line) {
  console.warn('SAMUDRA Admin Console Warning:', msg, 'at line', line);
};

const adminRoot = document.getElementById('admin-app');

/**
 * Helper untuk mengarahkan pengguna kembali ke website publik utama
 */
function navigateToPublicWebsite() {
  const hostname = window.location.hostname;
  if (hostname === 'admin.samudra.buzz' || hostname.endsWith('.samudra.buzz')) {
    window.location.href = 'https://samudra.buzz/';
    return;
  }
  // Local development fallback
  if (window.location.port) {
    window.location.href = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/`;
  } else {
    window.location.href = '/';
  }
}

// Inisialisasi token dari Google OAuth redirect callback jika ada
const urlParams = new URLSearchParams(window.location.search);
const oauthToken = urlParams.get('token') || urlParams.get('accessToken') || urlParams.get('access_token');
const oauthRefreshToken = urlParams.get('refreshToken') || urlParams.get('refresh_token');
const authError = urlParams.get('error') || urlParams.get('message');

if (oauthToken) {
  setAdminToken(oauthToken);
  if (oauthRefreshToken) {
    setAdminRefreshToken(oauthRefreshToken);
  }
  getAdminUser();

  // Bersihkan query string token dari address bar demi keamanan
  const cleanUrl = window.location.pathname.replace(/\/auth\/callback/g, '') || '/';
  window.history.replaceState({}, '', cleanUrl);

  getMe().catch((e) => {
    console.warn('Gagal memuat profil OAuth:', e);
  }).finally(() => {
    renderAdminApp(adminRoot, navigateToPublicWebsite);
  });
} else {
  if (authError) {
    console.warn('OAuth Error:', authError);
    window.history.replaceState({}, '', window.location.pathname);
  }
  renderAdminApp(adminRoot, navigateToPublicWebsite);
}

