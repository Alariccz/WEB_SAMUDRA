/**
 * SAMUDRA Administrator Portal Main Entry Point
 * Didedikasikan untuk subdomain admin: https://admin.samudra.buzz/
 * Terpisah dari website publik tanpa dependensi 3D / publik scene
 */

import './admin/adminStyle.css';
import {
  renderAdminApp,
  renderAdminLogin,
  handleAuthCallback,
  isAdminLoggedIn,
  isAdminOrAbove
} from './admin/index.js';

// Tangani console error secara graceful
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

/**
 * Router utama untuk portal administrator
 */
function route() {
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const isCallback = pathname.includes('/auth/callback') || searchParams.has('accessToken') || searchParams.has('access_token');

  // 1. Route: /auth/callback (Google OAuth redirect)
  if (isCallback) {
    handleAuthCallback(adminRoot, {
      onAuthSuccess: () => {
        renderAdminApp(adminRoot, navigateToPublicWebsite);
      },
      onAuthError: (errMsg) => {
        renderAdminLogin(
          adminRoot,
          () => {
            window.history.replaceState({}, '', '/dashboard');
            renderAdminApp(adminRoot, navigateToPublicWebsite);
          },
          navigateToPublicWebsite,
          errMsg
        );
      }
    });
    return;
  }

  // 2. Route: /login
  if (pathname.includes('/login')) {
    if (isAdminLoggedIn() && isAdminOrAbove()) {
      window.history.replaceState({}, '', '/dashboard');
      renderAdminApp(adminRoot, navigateToPublicWebsite);
      return;
    }
    renderAdminLogin(
      adminRoot,
      () => {
        window.history.replaceState({}, '', '/dashboard');
        renderAdminApp(adminRoot, navigateToPublicWebsite);
      },
      navigateToPublicWebsite
    );
    return;
  }

  // 3. Route: /dashboard atau route lainnya
  if (!isAdminLoggedIn()) {
    window.history.replaceState({}, '', '/login');
    renderAdminLogin(
      adminRoot,
      () => {
        window.history.replaceState({}, '', '/dashboard');
        renderAdminApp(adminRoot, navigateToPublicWebsite);
      },
      navigateToPublicWebsite
    );
    return;
  }

  renderAdminApp(adminRoot, navigateToPublicWebsite);
}

// Inisialisasi router
route();

// Dengarkan perubahan histori browser (Back/Forward)
window.addEventListener('popstate', () => {
  route();
});
