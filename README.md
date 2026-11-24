<div align="center">

# 🌊 SAMUDRA — Sistem Antisipasi & Mitigasi Tsunami

**Platform web interaktif untuk pemantauan gempa & tsunami, visualisasi 3D pesisir, simulasi seismik, pelacakan darurat real-time, serta portal kendali administrator.**

![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.186-000000?style=flat-square&logo=threedotjs&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&logo=leaflet&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Nginx_Alpine-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

---

## 📖 Tentang Proyek

**WEB_SAMUDRA** adalah aplikasi frontend multi-entry yang dirancang sebagai antarmuka publik, halaman pelacakan darurat keluarga, dan pusat kendali admin dalam ekosistem **SAMUDRA**. Aplikasi ini terintegrasi dengan backend NestJS, telemetri gempa BMKG, data seismik SeismicID, serta distribusi aplikasi Android (APK) melalui Cloudflare R2.

Aplikasi ini terdiri dari **3 portal utama** yang dibangun dalam satu proyek Vite dan disajikan melalui Nginx:

| Portal | Entry Point | Rute / Domain Produksi | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Website Publik** | `index.html` (`src/main.js`) | `https://samudra.buzz` | Landing page 3D interaktif, gempa terkini, cuaca maritim, simulasi tsunami, mitigasi, edukasi, dan unduh APK |
| **Live Tracking Darurat** | `live.html` (`src/live.js`) | `https://samudra.buzz/live/:id` | Pemantauan lokasi keluarga secara real-time saat bencana dengan peta Leaflet |
| **Portal Administrator** | `admin.html` (`src/adminMain.js`) | `https://admin.samudra.buzz` | Dashboard manajemen konten (Artikel, Mitigasi, Peralatan) & kontrol akses admin berbasis Google OAuth |

---

## ✨ Fitur Utama

### 1. Website Publik (`samudra.buzz`)
- **Visualisasi 3D Pesisir Interaktif (Three.js)**
  - 3 *scroll-driven scenes* (Pemantauan Buoy, Gelombang Tsunami, dan POV Rute Evakuasi menuju Shelter) dengan *smooth scrolling* (Lenis).
  - Kontrol interaktif: slider **Magnitudo (7.0 – 9.2)** dengan perubahan status (*Waspada / Siaga / Awas*), slider **Waktu (Siang/Malam)**, toggle **Zona Risiko**, *drag-to-yaw*, serta efek optik bawah air (*caustics, wet lens, displacement*).
- **Banner Gempa Real-Time**
  - Menampilkan data gempa terbaru (magnitudo, lokasi, kedalaman, waktu) dari API backend yang tersinkronisasi dengan BMKG.
- **Stasiun Cuaca Maritim & Atmosfer (DIY)**
  - Widget cuaca *dot-matrix* interaktif real-time (Open-Meteo & BMKG) untuk 4 titik strategis: *Yogyakarta Kota*, *Pesisir Parangtritis*, *Pesisir Glagah (YIA)*, dan *Pantai Baron*.
- **Simulasi Seismik & Skenario Tsunami (Leaflet + SeismicID)**
  - Peta probabilitas risiko seismik Indonesia beserta preset skenario tsunami (*Megathrust Selatan Jawa*, *Subduksi Aceh–Simeulue*, *Sesar Palu-Koro*, dll.) lengkap dengan estimasi waktu tiba (ETA) dan tinggi gelombang.
- **Langkah Mitigasi, Peralatan & Edukasi**
  - Konten dinamis dari API (`/api/mitigasi`, `/api/peralatan`, `/api/articles`) dengan komponen *Warp Carousel*, checklist kesiapsiagaan, dan halaman baca artikel penuh.
- **Distribusi APK Android & QR Code Dinamis**
  - Mockup ponsel 3D interaktif, tombol unduh APK langsung (Cloudflare R2 / lokal), serta QR Code SVG otomatis yang mendeteksi alamat IP LAN saat dijalankan di *development server*.

### 2. Live Tracking Darurat (`/live/:trackingId`)
- Peta **Leaflet (OpenStreetMap)** dengan pembaruan posisi otomatis tiap 4 detik dan animasi pergerakan marker yang halus.
- Indikator status radar (aktif/berhenti), *polyline* jejak rute evakuasi, dan status baterai perangkat pengguna yang dilacak.
- Perhitungan jarak (*Haversine*) dan ETA menuju **Titik Evakuasi Aman / Shelter** terdekat.
- Tombol aksi cepat ke **Telepon**, **WhatsApp**, dan **Google Maps**, dilengkapi metadata OpenGraph untuk pratinjau tautan darurat di WhatsApp.

### 3. Portal Administrator (`admin.samudra.buzz`)
- Terisolasi dari aset 3D publik agar ringan dan cepat.
- Autentikasi menggunakan **Google OAuth** (`/login`, `/auth/callback`, `/dashboard`).
- **Role-Based Access Control (RBAC)**:
  - `admin`: Akses Dashboard serta CRUD penuh untuk **Artikel**, **Mitigasi**, dan **Peralatan**.
  - `super_admin`: Seluruh akses admin ditambah **Manajemen Akun**.

---

## 🛠️ Tech Stack

- **Core & Build:** Vite 8 (Multi-Page Entry), Vanilla JavaScript (ES Modules), React 19, TypeScript
- **3D & Animasi:** Three.js, Framer Motion, Lenis
- **Peta & Geospasial:** Leaflet (OpenStreetMap)
- **Ikon & Utilitas:** Lucide React, `qrcode`, `clsx`
- **Deployment & Web Server:** Docker (Multi-stage `node:22-alpine` → `nginx:alpine`), Docker Compose, Nginx, GitHub Actions

---

## 📁 Struktur Direktori

```text
WEB_SAMUDRA/
├── .github/workflows/
│   └── deploy.yml              # Pipeline CI/CD (Build check & Auto-deploy SSH Cloudflare Tunnel)
├── components/                 # Komponen UI reusable (React/TSX: Bento, Carousel, Blog, Weather, dll.)
├── lib/                        # Utilitas bersama
├── public/                     # Aset statis (gambar, ikon, favicon, downloads)
├── src/
│   ├── main.js                 # Entry point Website Publik
│   ├── adminMain.js            # Entry point Portal Administrator
│   ├── live.js                 # Entry point halaman Live Tracking
│   ├── api.js                  # Klien HTTP untuk API Backend SAMUDRA
│   ├── style.css               # Stylesheet utama Website Publik
│   ├── admin/                  # Modul Portal Admin (Login, Dashboard, Articles, Mitigasi, Peralatan, Accounts)
│   ├── components/             # Komponen halaman publik (Navbar, EarthquakeBanner, WeatherWidget, Simulation, dll.)
│   ├── live/                   # Modul peta & logika Live Tracking Darurat
│   └── scene/
│       └── threeScene.js       # Setup scene 3D pesisir, gelombang, buoy, dan rute evakuasi
├── index.html                  # HTML entry Website Publik
├── admin.html                  # HTML entry Portal Admin
├── live.html                   # HTML entry Live Tracking
├── vite.config.js              # Konfigurasi Vite (multi-entry, proxy SeismicID, SPA & LAN middleware)
├── nginx.conf                  # Virtual host Nginx (samudra.buzz & admin.samudra.buzz)
├── Dockerfile                  # Multi-stage Docker build (Node 22 -> Nginx Alpine)
├── docker-compose.yml          # Orkestrasi container produksi
├── deploy.sh                   # Script rebuild & restart container di server
└── .env.example                # Template variabel lingkungan
```

---

## 🚀 Instalasi & Menjalankan Secara Lokal

### Prasyarat
- **Node.js** versi `22.x` atau lebih baru
- **npm**

### Langkah-langkah

1. **Clone repositori**
   ```bash
   git clone https://github.com/Alariccz/WEB_SAMUDRA.git
   cd WEB_SAMUDRA
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya jika perlu:
   ```bash
   cp .env.example .env
   ```

   | Variabel | Deskripsi | Default |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | Base URL Backend API SAMUDRA (NestJS) | `https://samudra.rizalzaky.cloud/api` |
   | `VITE_API_BASE` | Fallback Base URL API | `https://samudra.rizalzaky.cloud/api` |
   | `VITE_APK_URL` | URL publik unduhan APK Android (Cloudflare R2) | `https://cdn.samudra.buzz/download/app-arm64-v8a-release.apk` |

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3001`:
   - Website Publik: `http://localhost:3001/`
   - Live Tracking: `http://localhost:3001/live/<tracking-id>`
   - Portal Admin: `http://localhost:3001/login` atau `http://localhost:3001/dashboard`

5. **Build & Preview Produksi**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🐳 Deployment dengan Docker

Proyek ini sudah dilengkapi `Dockerfile`, `docker-compose.yml`, dan `nginx.conf` untuk kebutuhan produksi:

```bash
# Build dan jalankan container di background (default port 3006 -> 80)
docker compose up -d --build
```

Untuk mengganti port host, atur variabel lingkungan `WEB_PORT`:
```bash
WEB_PORT=8080 docker compose up -d --build
```

Atau jalankan script deployment otomatis yang digunakan di server produksi:
```bash
chmod +x deploy.sh
./deploy.sh
```

### CI/CD (GitHub Actions)
Setiap `push` ke branch `main` akan secara otomatis memicu workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
1. **Build & Verification:** Menjalankan `npm ci` dan `npm run build` di runner Ubuntu (Node 22).
2. **Deploy to Production Server:** Terhubung ke server produksi melalui Cloudflare Tunnel SSH, menarik commit terbaru dari `origin/main`, dan menjalankan `./deploy.sh`.

---

## 🤝 Kontributor

Dikembangkan oleh tim pengembang **SAMUDRA**.
