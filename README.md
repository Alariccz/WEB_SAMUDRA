# Web Samudra - CI/CD & Deployment Guide

Dokumentasi otomatisasi CI/CD untuk aplikasi Web Samudra ke server `ssh.rizalzaky.cloud` menggunakan **GitHub Actions**, **Cloudflare Tunnel**, **Docker**, dan **Nginx**.

---

## 🚀 Alur Kerja CI/CD

Pipeline CI/CD ini dipicu secara otomatis setiap kali ada `git push` ke branch `main` atau melalui tombol **Run workflow** di GitHub Actions:

1. **Job 1: Build & Verification**
   - Melakukan checkout kode repository.
   - Menginstal dependensi (`npm ci`).
   - Melakukan build project Vite (`npm run build`) untuk memastikan kode valid dan bebas error.
2. **Job 2: Deploy to Production Server**
   - Memasang `cloudflared` pada GitHub Actions runner agar dapat menembus Cloudflare Tunnel ke `ssh.rizalzaky.cloud`.
   - Mengakses server sebagai user `rizal` secara aman menggunakan `sshpass`.
   - Masuk ke direktori `/home/rizal/web-samudra`.
   - Mengambil pembaruan branch `main` (`git fetch origin main && git reset --hard origin/main`).
   - Menjalankan `./deploy.sh` untuk rebuild dan restart container Docker `web-samudra` di port `3006`.

---

## 🔑 Konfigurasi GitHub Repository Secret (PENTING)

Karena repository ini bersifat publik, password server **TIDAK BOLEH** disimpan langsung di file kode agar server Anda tetap aman. Simpan password di **GitHub Repository Secrets**:

1. Buka repository: [https://github.com/Alariccz/WEB_SAMUDRA](https://github.com/Alariccz/WEB_SAMUDRA)
2. Klik tab **Settings** ➔ di menu kiri klik **Secrets and variables** ➔ **Actions**.
3. Klik tombol **New repository secret**.
4. Isi data berikut:
   - **Name**: `SERVER_PASSWORD`
   - **Secret**: `rizal2302.`
5. Klik **Add secret**.

*(Semua konfigurasi lain seperti host `ssh.rizalzaky.cloud`, user `rizal`, dan path `/home/rizal/web-samudra` sudah terpasang secara default di dalam pipeline).*

---

## 🖥️ Server Details

- **Host**: `ssh.rizalzaky.cloud` (via Cloudflare Tunnel)
- **User**: `rizal`
- **Path**: `/home/rizal/web-samudra`
- **Aplikasi Port**: `3006` (Nginx container `web-samudra`)
- **Deploy Script**: `./deploy.sh`
