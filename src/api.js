const API_BASE = 'https://samudra.rizalzaky.cloud/api';

export async function fetchLatestEarthquake() {
  const res = await fetch(`${API_BASE}/earthquakes/latest`);
  if (!res.ok) throw new Error('Gagal memuat data gempa');
  return res.json();
}

export async function fetchArticles(category = '') {
  const url = category
    ? `${API_BASE}/articles?category=${category}`
    : `${API_BASE}/articles`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal memuat artikel');
  return res.json();
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
