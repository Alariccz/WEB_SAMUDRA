const API_BASE = (import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE || 'https://samudra.rizalzaky.cloud/api').replace(/\/+$/, '');

export async function fetchLatestEarthquake() {
  const res = await fetch(`${API_BASE}/earthquakes/latest`);
  if (!res.ok) throw new Error('Gagal memuat data gempa');
  return res.json();
}

let articlesCache = { data: null, ts: 0, cat: null };

export async function fetchArticles(category = '') {
  const now = Date.now();
  if (articlesCache.data && articlesCache.cat === category && now - articlesCache.ts < 30000) {
    return articlesCache.data;
  }
  const url = category
    ? `${API_BASE}/articles?category=${category}`
    : `${API_BASE}/articles`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal memuat artikel');
  const data = await res.json();
  articlesCache = { data, ts: Date.now(), cat: category };
  return data;
}

export async function fetchArticleById(id) {
  const res = await fetch(`${API_BASE}/articles/${id}`);
  if (!res.ok) throw new Error('Gagal memuat detail artikel');
  return res.json();
}

export async function fetchMitigasi() {
  const res = await fetch(`${API_BASE}/mitigasi`);
  if (!res.ok) throw new Error('Gagal memuat data mitigasi');
  return res.json();
}

export async function fetchPeralatan() {
  const res = await fetch(`${API_BASE}/peralatan`);
  if (!res.ok) throw new Error('Gagal memuat data peralatan');
  return res.json();
}

// Re-export Admin API functions
export * from './admin/adminApi.js';
