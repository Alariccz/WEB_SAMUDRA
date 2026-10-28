/**
 * SAMUDRA Admin Login Component
 * Visual Luxury Inspired by WoodNest Atmospheric Dark Design
 */

import { loginAdmin, loginWithGoogleToken, redirectToGoogleOAuth, GOOGLE_CLIENT_ID } from './adminApi.js';
import { showToast } from './adminToast.js';

function getGoogleBtnInner() {
  return `
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
    <span>Lanjutkan dengan Google</span>
  `;
}

export function renderAdminLogin(container, onLoginSuccess, onBackToHome) {
  container.innerHTML = `
    <div class="adm-login-wrap">
      <div class="adm-login-card">
        
        <!-- Hero Visual Showcase (Left Column) -->
        <div class="adm-login-hero">
          <div class="adm-login-hero__overlay"></div>
          <div class="adm-login-hero__glow"></div>
          
          <div class="adm-login-hero__content">
            <div class="adm-star-badge">
              <span class="adm-star-badge__star">★</span>
              <span>4.9 Sistem Komando Tsunami</span>
            </div>
            
            <h1 class="adm-login-hero__title">Pusat Kendali<br>SAMUDRA</h1>
            <p class="adm-login-hero__lede">
              Manajemen edukasi publik, instruksi mitigasi langkah-demi-langkah, dan koordinasi peringatan dini bencana pesisir Indonesia.
            </p>
            
            <!-- Feature Badges with Diamond Pins (WoodNest style) -->
            <div class="adm-login-feature-card">
              <div class="adm-diamond-pin">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div class="adm-feature-text">
                <b>Artikel & Edukasi Warga</b>
                <small>Publikasi cepat artikel dan panduan evakuasi</small>
              </div>
            </div>

            <div class="adm-login-feature-card">
              <div class="adm-diamond-pin">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="adm-feature-text">
                <b>Panduan Mitigasi Bertahap</b>
                <small>Kustomisasi SOP dan langkah keselamatan lapangan</small>
              </div>
            </div>

            <div class="adm-login-feature-card">
              <div class="adm-diamond-pin">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div class="adm-feature-text">
                <b>Cloudflare R2 Media Storage</b>
                <small>Unggah foto & visual panduan tanpa limit</small>
              </div>
            </div>
          </div>

          <div style="position: relative; z-index: 2; margin-top: 32px; font-size: 12px; color: var(--adm-text-dim);">
            Tersinkronisasi dengan API Server: <code>samudra.rizalzaky.cloud</code>
          </div>
        </div>

        <!-- Login Form (Right Column) -->
        <div class="adm-login-form-wrap">
          <div class="adm-login-header">
            <h2>Masuk Admin</h2>
            <p>Masukkan akun administrator untuk mengelola konten web SAMUDRA.</p>
          </div>

          <!-- Alert Container -->
          <div class="adm-login-alert" id="login-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span id="login-alert-msg">Email atau password tidak sesuai.</span>
          </div>

          <form id="adm-login-form" novalidate>
            <div class="adm-form-group">
              <label class="adm-form-label" for="adm-email">Alamat Email</label>
              <div class="adm-input-wrap">
                <svg class="adm-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input class="adm-input" type="email" id="adm-email" placeholder="nama@samudra.id" required autocomplete="email">
              </div>
            </div>

            <div class="adm-form-group">
              <label class="adm-form-label" for="adm-password">Kata Sandi</label>
              <div class="adm-input-wrap">
                <svg class="adm-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input class="adm-input" type="password" id="adm-password" placeholder="••••••••" required autocomplete="current-password">
                <button type="button" class="adm-input-toggle" id="adm-toggle-pwd" title="Tampilkan/sembunyikan sandi">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>

            <button type="submit" class="adm-btn adm-btn--white" id="adm-submit-btn" style="width: 100%; margin-top: 12px;">
              <span>Masuk ke Dashboard</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </form>

          <!-- Divider -->
          <div class="adm-divider">
            <span>atau</span>
          </div>

          <!-- Google Sign In Button -->
          <button type="button" class="adm-btn--google" id="adm-google-btn" title="Masuk menggunakan akun Google">
            ${getGoogleBtnInner()}
          </button>

          <div class="adm-login-footer">
            <button class="adm-back-link" id="adm-btn-back" type="button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span>Kembali ke Beranda</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  // --- INTERACTION LOGIC ---
  const form = container.querySelector('#adm-login-form');
  const emailInput = container.querySelector('#adm-email');
  const passwordInput = container.querySelector('#adm-password');
  const togglePwdBtn = container.querySelector('#adm-toggle-pwd');
  const submitBtn = container.querySelector('#adm-submit-btn');
  const alertEl = container.querySelector('#login-alert');
  const alertMsg = container.querySelector('#login-alert-msg');
  const backBtn = container.querySelector('#adm-btn-back');
  const googleBtn = container.querySelector('#adm-google-btn');

  // Google Login handling
  if (googleBtn) {
    googleBtn.onclick = () => {
      alertEl.classList.remove('adm-login-alert--show');
      googleBtn.disabled = true;
      googleBtn.innerHTML = `
        <svg class="adm-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        <span>Menghubungkan ke Google...</span>
      `;
      redirectToGoogleOAuth();
    };

    // Passively try Google One Tap if client library is loaded
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (response && response.credential) {
              googleBtn.disabled = true;
              googleBtn.innerHTML = `<span>Memverifikasi akun Google...</span>`;
              try {
                await loginWithGoogleToken(response.credential);
                showToast('Login Google berhasil! Selamat datang di Pusat Kendali SAMUDRA.', 'success');
                if (onLoginSuccess) onLoginSuccess();
              } catch (err) {
                alertMsg.textContent = err.message || 'Login Google gagal.';
                alertEl.classList.add('adm-login-alert--show');
                googleBtn.disabled = false;
                googleBtn.innerHTML = getGoogleBtnInner();
              }
            }
          }
        });
        window.google.accounts.id.prompt();
      } catch (e) {
        // Silent catch for GSI passive prompt
      }
    }
  }

  // Back button
  if (backBtn && onBackToHome) {
    backBtn.onclick = onBackToHome;
  }

  // Toggle password visibility
  if (togglePwdBtn) {
    togglePwdBtn.onclick = () => {
      const isPwd = passwordInput.type === 'password';
      passwordInput.type = isPwd ? 'text' : 'password';
      togglePwdBtn.innerHTML = isPwd
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    };
  }

  // Handle Form Submit
  form.onsubmit = async (e) => {
    e.preventDefault();
    alertEl.classList.remove('adm-login-alert--show');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alertMsg.textContent = 'Harap isi email dan password.';
      alertEl.classList.add('adm-login-alert--show');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="adm-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      <span>Memverifikasi...</span>
    `;

    try {
      await loginAdmin(email, password);
      showToast('Login berhasil! Selamat datang di Pusat Kendali SAMUDRA.', 'success');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      alertMsg.textContent = err.message || 'Login gagal. Periksa kembali akun Anda.';
      alertEl.classList.add('adm-login-alert--show');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Masuk ke Dashboard</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      `;
    }
  };
}
