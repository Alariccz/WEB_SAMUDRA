/**
 * SAMUDRA Admin API Client
 * Terintegrasi penuh dengan backend https://samudra.rizalzaky.cloud/api
 * Mendukung Auth JWT, Cloudflare R2 Storage Upload, Artikel, Mitigasi, dan Peralatan Siaga
 */

const API_BASE = 'https://samudra.rizalzaky.cloud/api';
const TOKEN_KEY = 'samudra_admin_token';
const REFRESH_TOKEN_KEY = 'samudra_admin_refresh_token';
const USER_KEY = 'samudra_admin_user';

// --- AUTH TOKEN HELPERS ---
export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAdminToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAdminRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || '';
}

export function setAdminRefreshToken(refreshToken) {
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getAdminUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setAdminUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}

/**
 * Memperbarui accessToken menggunakan refreshToken yang tersimpan
 */
export async function refreshAdminToken() {
  const refreshToken = getAdminRefreshToken();
  if (!refreshToken) {
    logoutAdmin();
    throw new Error('Tidak ada refresh token.');
  }

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) {
    logoutAdmin();
    throw new Error('Sesi login telah berakhir.');
  }

  const data = await res.json();
  const newToken = data.accessToken || data.access_token || data.token;
  if (newToken) {
    setAdminToken(newToken);
  }
  const newRefreshToken = data.refreshToken || data.refresh_token;
  if (newRefreshToken) {
    setAdminRefreshToken(newRefreshToken);
  }
  return newToken;
}

// Request helper with automatic Bearer token and automatic token refresh retry
async function authFetch(endpoint, options = {}, isRetry = false) {
  let token = getAdminToken();
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is plain object and not FormData, stringify to JSON
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    body
  });

  if (res.status === 401) {
    // Attempt token refresh if not already retried
    if (!isRetry && getAdminRefreshToken()) {
      try {
        const refreshedToken = await refreshAdminToken();
        if (refreshedToken) {
          headers['Authorization'] = `Bearer ${refreshedToken}`;
          return await authFetch(endpoint, { ...options, headers, body }, true);
        }
      } catch (refreshErr) {
        console.warn('Auto refresh token gagal:', refreshErr);
      }
    }

    logoutAdmin();
    const error = new Error('Sesi telah berakhir atau kredensial salah. Silakan login kembali.');
    error.status = 401;
    throw error;
  }

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    let errMsg = 'Terjadi kesalahan pada server';
    if (data && typeof data === 'object') {
      if (Array.isArray(data.message)) {
        errMsg = data.message.join(', ');
      } else if (data.message) {
        errMsg = data.message;
      } else if (data.error) {
        errMsg = data.error;
      }
    }
    const err = new Error(errMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// --- AUTH ENDPOINTS ---

/**
 * Login admin dengan email dan password
 * @param {string} email
 * @param {string} password
 */
export async function loginAdmin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password })
  });

  const data = await res.json();
  if (!res.ok) {
    let msg = 'Email atau password salah';
    if (Array.isArray(data.message)) msg = data.message.join(', ');
    else if (data.message) msg = data.message;
    throw new Error(msg);
  }

  // Token might be accessToken, access_token, or token
  const token = data.accessToken || data.access_token || data.token;
  if (token) {
    setAdminToken(token);
  }

  const refreshToken = data.refreshToken || data.refresh_token;
  if (refreshToken) {
    setAdminRefreshToken(refreshToken);
  }

  const user = data.user || null;
  if (user) {
    setAdminUser(user);
  } else {
    // Fetch profile if not included in login response
    try {
      const profile = await getMe();
      setAdminUser(profile);
    } catch (e) {
      console.warn('Gagal memuat profil admin:', e);
    }
  }

  return data;
}

export const GOOGLE_CLIENT_ID = '772157858952-jtuupdldo13hsjghk1rc5al957qr1ako.apps.googleusercontent.com';

/**
 * Login admin dengan Google idToken via POST /api/auth/google/token
 * @param {string} idToken
 */
export async function loginWithGoogleToken(idToken) {
  const res = await fetch(`${API_BASE}/auth/google/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });

  const data = await res.json();
  if (!res.ok) {
    let msg = 'Gagal login dengan akun Google';
    if (Array.isArray(data.message)) msg = data.message.join(', ');
    else if (data.message) msg = data.message;
    throw new Error(msg);
  }

  const token = data.accessToken || data.access_token || data.token;
  if (token) {
    setAdminToken(token);
  }

  const refreshToken = data.refreshToken || data.refresh_token;
  if (refreshToken) {
    setAdminRefreshToken(refreshToken);
  }

  const user = data.user || null;
  if (user) {
    setAdminUser(user);
  } else {
    try {
      const profile = await getMe();
      setAdminUser(profile);
    } catch (e) {
      console.warn('Gagal memuat profil admin:', e);
    }
  }

  return data;
}

/**
 * Membuka Google OAuth backend
 */
export function redirectToGoogleOAuth() {
  window.location.href = `${API_BASE}/auth/google`;
}

/**
 * Ambil data user yang sedang login
 */
export async function getMe() {
  const user = await authFetch('/auth/me');
  setAdminUser(user);
  return user;
}

// --- FILE STORAGE UPLOAD (Cloudflare R2) ---

/**
 * Upload file gambar/dokumen ke Cloudflare R2
 * @param {File} file
 * @param {'articles'|'mitigasi'|'peralatan'|'general'} folder
 */
export async function uploadStorageFile(file, folder = 'general') {
  const formData = new FormData();
  formData.append('file', file);

  const res = await authFetch(`/storage/upload?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    body: formData
  });

  // Extract public URL from response
  const url = res.url || res.fileUrl || res.secure_url || (res.data && res.data.url) || res;
  if (typeof url === 'string') return url;
  if (url && typeof url.url === 'string') return url.url;
  return String(url);
}

// --- ARTICLES MANAGEMENT (CRUD) ---

/**
 * Ambil semua artikel untuk admin (termasuk status draft & published)
 */
export async function fetchAdminArticles() {
  try {
    return await authFetch('/articles/admin/all');
  } catch (err) {
    // Fallback to public endpoint if admin all is restricted
    console.warn('Fallback ke /articles:', err);
    return await authFetch('/articles');
  }
}

/**
 * Tambah artikel baru
 * @param {{ title: string, content: string, category?: string, coverImageUrl?: string, status?: 'draft'|'published' }} articleData
 */
export async function createArticle(articleData) {
  return await authFetch('/articles', {
    method: 'POST',
    body: articleData
  });
}

/**
 * Update artikel yang sudah ada
 * @param {string} id
 * @param {{ title?: string, content?: string, category?: string, coverImageUrl?: string, status?: 'draft'|'published' }} articleData
 */
export async function updateArticle(id, articleData) {
  return await authFetch(`/articles/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: articleData
  });
}

/**
 * Hapus artikel
 * @param {string} id
 */
export async function deleteArticle(id) {
  return await authFetch(`/articles/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

// --- MITIGASI MANAGEMENT (CRUD) ---

/**
 * Ambil semua langkah mitigasi
 */
export async function fetchAdminMitigasi() {
  return await authFetch('/mitigasi');
}

/**
 * Tambah langkah mitigasi baru
 * @param {{ stepNumber: number, title: string, description: string, iconName?: string, imageUrl?: string }} mitigasiData
 */
export async function createMitigasi(mitigasiData) {
  return await authFetch('/mitigasi', {
    method: 'POST',
    body: mitigasiData
  });
}

/**
 * Update langkah mitigasi
 * @param {string} id
 * @param {{ stepNumber?: number, title?: string, description?: string, iconName?: string, imageUrl?: string }} mitigasiData
 */
export async function updateMitigasi(id, mitigasiData) {
  return await authFetch(`/mitigasi/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: mitigasiData
  });
}

/**
 * Hapus langkah mitigasi
 * @param {string} id
 */
export async function deleteMitigasi(id) {
  return await authFetch(`/mitigasi/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

// --- PERALATAN SIAGA MANAGEMENT (CRUD) ---

/**
 * Ambil daftar peralatan siaga bencana
 */
export async function fetchAdminPeralatan() {
  return await authFetch('/peralatan');
}

/**
 * Tambah peralatan siaga baru
 * @param {{ name: string, category?: string, description: string, priority?: number, iconName?: string, imageUrl?: string }} data
 */
export async function createPeralatan(data) {
  return await authFetch('/peralatan', {
    method: 'POST',
    body: data
  });
}

/**
 * Update peralatan siaga
 * @param {string} id
 * @param {{ name?: string, category?: string, description?: string, priority?: number, iconName?: string, imageUrl?: string }} data
 */
export async function updatePeralatan(id, data) {
  return await authFetch(`/peralatan/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: data
  });
}

/**
 * Hapus peralatan siaga
 * @param {string} id
 */
export async function deletePeralatan(id) {
  return await authFetch(`/peralatan/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

// --- USER / ACCOUNT MANAGEMENT (Super Admin only) ---

/**
 * Ambil semua pengguna terdaftar
 */
export async function fetchAllUsers() {
  try {
    return await authFetch('/users');
  } catch (err) {
    // fallback path kalau backend pakai /auth/users
    try {
      return await authFetch('/auth/users');
    } catch {
      throw err;
    }
  }
}

/**
 * Ubah role pengguna
 * @param {string} userId
 * @param {'user'|'admin'|'super_admin'} role
 */
export async function updateUserRole(userId, role) {
  // Coba PATCH /users/:id/role, fallback ke PATCH /users/:id
  try {
    return await authFetch(`/users/${encodeURIComponent(userId)}/role`, {
      method: 'PATCH',
      body: { role }
    });
  } catch (err) {
    if (err.status === 404) {
      return await authFetch(`/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        body: { role }
      });
    }
    throw err;
  }
}

/**
 * Hapus akun pengguna
 * @param {string} userId
 */
export async function deleteUserAccount(userId) {
  return await authFetch(`/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE'
  });
}

// Email pemilik sistem — selalu mendapat akses super_admin
const OWNER_EMAIL = 'rizalzaky2302@gmail.com';

/**
 * Cek apakah user yang sedang login adalah pemilik sistem (owner)
 */
export function isOwner() {
  const user = getAdminUser();
  if (!user) return false;
  return (user.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase();
}

/**
 * Cek apakah user yang sedang login adalah admin atau super_admin.
 * Pemilik sistem (OWNER_EMAIL) selalu lolos cek ini.
 */
export function isAdminOrAbove() {
  const user = getAdminUser();
  if (!user) return false;
  // Owner selalu punya akses penuh
  if ((user.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase()) return true;
  return user.role === 'admin' || user.role === 'super_admin' || user.isSuperAdmin === true;
}

/**
 * Cek apakah user yang sedang login adalah super_admin.
 * Pemilik sistem (OWNER_EMAIL) selalu dianggap super_admin.
 */
export function isSuperAdmin() {
  const user = getAdminUser();
  if (!user) return false;
  // Owner selalu super_admin
  if ((user.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase()) return true;
  return user.role === 'super_admin' || user.isSuperAdmin === true;
}

/**
 * Setelah login, coba promosikan role owner ke super_admin di backend.
 * Gagal secara senyap kalau endpoint tidak tersedia.
 */
export async function tryPromoteOwnerRole() {
  const user = getAdminUser();
  if (!user) return;
  if ((user.email || '').toLowerCase() !== OWNER_EMAIL.toLowerCase()) return;
  if (user.role === 'super_admin') return; // sudah benar

  try {
    // Coba endpoint khusus promosi owner
    const updated = await authFetch(`/users/${encodeURIComponent(user.id || user._id)}/role`, {
      method: 'PATCH',
      body: { role: 'super_admin' }
    });
    // Update lokal
    setAdminUser({ ...user, role: 'super_admin' });
    console.info('[SAMUDRA] Owner dipromosikan ke super_admin.');
  } catch (e) {
    // Tidak apa-apa, bypass frontend tetap berlaku
    console.warn('[SAMUDRA] Auto-promote owner gagal (endpoint mungkin tidak tersedia):', e.message);
  }
}

