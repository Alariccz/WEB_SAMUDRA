# Web Samudra - CI/CD & Deployment Guide

Dokumentasi otomatisasi CI/CD untuk aplikasi Web Samudra menggunakan **GitHub Actions**, **Docker**, dan **Nginx**.

---

## 🚀 Alur Kerja CI/CD

Pipeline CI/CD ini dipicu secara otomatis setiap kali ada `git push` ke branch `main` atau dijalankan secara manual via `workflow_dispatch`:

1. **Job 1: Build & Verification**
   - Melakukan checkout kode repository.
   - Menginstal dependensi (`npm ci`).
   - Melakukan build project Vite (`npm run build`) untuk memvalidasi tidak ada error sintaks atau build failure sebelum deploy.
2. **Job 2: Deploy to Production Server**
   - Menghubungkan ke server Anda secara aman melalui SSH.
   - Berpindah ke direktori project di server (`SERVER_PATH`).
   - Menarik pembaruan terbaru (`git fetch origin main && git reset --hard origin/main`).
   - Menjalankan `./deploy.sh` untuk me-rebuild Docker image dan merestart container secara zero/minimal downtime.

---

## 🔑 Konfigurasi GitHub Repository Secrets

Agar GitHub Actions dapat mengakses server Anda secara otomatis, tambahkan secrets berikut di repository GitHub Anda:

**Langkah:** Buka repository GitHub -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

| Secret Name | Deskripsi | Contoh Nilai | Wajib / Opsional |
|-------------|-----------|--------------|------------------|
| `SERVER_HOST` | IP Address publik atau Domain server Anda | `103.123.45.67` atau `vps.domainanda.com` | **Wajib** |
| `SERVER_USER` | Username user SSH di server | `root` atau `ubuntu` | **Wajib** |
| `SERVER_PATH` | Path absolut folder project di server | `/var/www/WEB_SAMUDRA` | **Wajib** |
| `SERVER_SSH_KEY` | Private SSH Key server (`id_rsa` / `id_ed25519`) | `-----BEGIN OPENSSH PRIVATE KEY----- ...` | **Wajib** (jika pakai key) |
| `SERVER_PASSWORD` | Password SSH user server | `passwordAnda` | Opsional (jika pakai password) |
| `SERVER_PORT` | Port SSH server (default: `22`) | `22` | Opsional |
| `SERVER_SSH_PASSPHRASE` | Passphrase SSH Key (jika key diproteksi passphrase) | `passphraseRahasia` | Opsional |

---

## 🖥️ Persiapan Awal di Sisi Server (Sekali Saja)

Pastikan server Anda sudah disiapkan dengan langkah-langkah berikut:

1. **Install Docker & Docker Compose**:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose-plugin
   sudo systemctl enable --now docker
   ```

2. **Clone Repository ke Server**:
   ```bash
   mkdir -p /var/www
   cd /var/www
   git clone https://github.com/Alariccz/WEB_SAMUDRA.git
   cd WEB_SAMUDRA
   chmod +x deploy.sh
   ```

3. **Pastikan Port 3006 Terbuka di Firewall**:
   Aplikasi berjalan pada port `3006` (sesuai `docker-compose.yml`).
   ```bash
   sudo ufw allow 3006/tcp
   ```

4. **Test Jalankan Manual Pertama Kali (Opsional)**:
   ```bash
   ./deploy.sh
   ```

Setelah konfigurasi Secrets di GitHub selesai, setiap commit baru yang di-push ke branch `main` akan langsung ter-deploy otomatis ke server Anda!
