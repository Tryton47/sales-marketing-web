# Alpha Marketing - Digital Agency Web Platform

![Alpha Marketing Header](https://img.shields.io/badge/Status-Completed-success)
![Lingkungan](https://img.shields.io/badge/Lingkungan-Vanilla_Web_Stack-blue)
![Tujuan](https://img.shields.io/badge/Tujuan-Tugas_Akademik-purple)

## 📌 Deskripsi Proyek
**Alpha Marketing** adalah platform ekosistem pemasaran berskala **Full-Service Digital Agency**. Aplikasi web ini telah diekspansi secara masif untuk melayani manajemen Ads, Produksi Video Sinematik, Pengelolaan Sosial Media (SMM), dan Desain Grafis (A La Carte maupun Bundling). Proyek ini dibangun sebagai kerangka layar penuh (**Full-Stack**) lengkap dengan pemrosesan sistem server (*Node.js + Express Backend*) serta basis data aktif (*MySQL Database terintegrasi via Docker & Navicat*).

Fokus utama dari proyek ini adalah implementasi **Modern UI/UX Design** (seperti *Glassmorphism*, *Dark Mode* multi-halaman, *Scroll Animation*) serta fungsionalitas pengumpulan pelanggan riil (*Lead Generation* dan Fitur Pesanan Pintar dengan Tautan WhatsApp Otomatis) yang dikelola lewat Dasbor Admin Eksekutif.

## 🛠️ Teknologi yang Digunakan
Sistem ini menggunakan ekosistem *Node/Custom API* yang dinamis namun tetap berbobot ringan di sisi server:
1. **Frontend Web Murni (HTML/CSS/JS)**: Arsitektur *Multi-page* (`layanan`, `harga`, `kontak`) yang sangat efisien untuk memfasilitasi bisnis kelas industri, tanpa konfigurasi framework berat. Menggunakan VanillaTilt.js dan Sinkronisasi Tema antar halaman.
2. **REST API Server (Node.js & Express)**: Kerangka perantara pelayan lalu lintas form pemesanan multi-kategori dan pertanyaan umum, lengkap dengan asimilasi nomor WhatsApp klien.
3. **Penyimpanan Terpusat (MySQL 8 / Navicat Premium)**: Logika dan relasi tabel fleksibel via *`mysql2`* Node driver untuk mengelola `orders` dan `contacts` di lingkungan lokal/kontainerisasi.

## 🌟 Fitur Utama (Key Features)

### 1. Smart Theme Provider (Mode Gelap/Terang)
Dilengkapi pemindah (*switcher*) tema otomatis. Menggunakan `localStorage` pada browser sehingga preferensi tema pengguna (Light/Dark Mode) akan melekat kuat. Semua transisi warnanya berpindah secara mulus tanpa pemuatan ulang (*reload*).

### 2. Kalkulator Profil ROI Interaktif (Real-Time JS)
Simulasi perhitungan finansial yang merambat langsung ke layar. Pengguna dapat menggeser penanda (*Slider Range*), dan JavaScript akan melakukan komputasi parameter untuk menyajikan persentase potensi keuntungan seketika itu juga. Hal ini membuktikan kompetensi pembuatan model interaktif.

### 3. Arsitektur Agensi Palugada (Multi-Page Routing)
Website telah dibongkar menjadi navigasi cerdas yang memisahkan Beranda, Layanan/Pilar Kreatif (`layanan.html`), Paket Harga (`harga.html`), Sejarah (`about.html`), dan Formulir Pintar (`kontak.html`). Pemisahan ini menciptakan *funneling* psikologi marketing yang mendasar dan kokoh layaknya perusahaan besar. 

### 4. Animasi Intersection Observer & Interaktif 3D
Selain melacak posisi menggunakan *IntersectionObserver API* (*Fade-in/up* lewat `AOS.js`), fitur *VanillaTilt.js* dipasang pada elemen pameran jasa (Kartu Harga, Modal) untuk memberikan kesan dinamis 3D yang mencerminkan agensi *ultra-premium*.

### 5. Formulir Pintar Terhubung WhatsApp (Smart Routing)
Pemesanan jasa spesifik di halaman harga (*A La Carte/Kustom*) dilengkapi URL Parameter `?layanan=...` yang secara otomatis meng-seleksi opsi *dropdown* (Auto-fill) untuk klien di formulir pemesanan. Formulir ini lalu mengirim JSON berisi nama, email, pilihan jasa, dan **Nomor WhatsApp**, langsung ke MySQL Backend.

### 6. Executive Admin Dashboard (`admin.html`)
Dasbor rahasia (diproteksi kata sandi `admin`) untuk meninjau secara langsung setiap pesanan yang masuk dan riwayat form Hubungi Kami. Super Admin dapat:
- Melihat metrik Total Order, Pending, dan Selesai.
- Mengubah status pengerjaan sistem (*Pending/Diproses/Selesai*).
- Menekan nomor WhatsApp klien dan diarahkan ke *WhatsApp Web/App* langsung tanpa perlu menyimpan nomor manual ke buku kontak.

## 📂 Struktur File (File Directory)
Semua fungsi berpusat pada komponen-file independen:
```text
/sales-marketing-web
├── public/           // Aset Publik Pameran Frontend
│   ├── index.html    // Beranda Utama (Hero & Simulator ROI)
│   ├── layanan.html  // Skema 4 Pilar (Sosmed, Video, Ads, Beranda)
│   ├── harga.html    // Tabel Harga Paket dan Jasa Eceran (A La Carte)
│   ├── kontak.html   // Formulir Smart Endpoint untuk DB (Auto-parameter)
│   ├── about.html    // Halaman Sejarah berbasis Timeline
│   ├── admin.html    // Panel Manajemen Pesanan & WhatsApp Router Khusus Admin
│   ├── login.html    // Gerbang Autentikasi Admin
│   ├── style.css     // Pusat Regulasi Palet Warna & Glassmorphism
│   └── script.js     // Logika Otak Utama API, Kalkulator, & Fetch
├── server.js         // Gerbang API Backend Express.js & Terowongan MySQL
├── .env              // File Skema Kredensial Database Rahasia
├── Panduan_*.md      // Tata Cara Skema Instansi Eksternal Docker/Navicat SQL
└── README.md         // Dokumentasi Repositori ini
```

## 🚀 Cara Instalasi & Menjalankan Website
Ikuti **`Panduan_PostgreSQL.md`** di repositori ini yang berisi seluruh rahasia detail tata-cara untuk menyalakan MySQL Database dengan perantara kontainerisasi **Docker**, mengelola kerangka SQL di GUI **Navicat**, serta memantik daya nyala server komputasi terminalnya.

Jika Anda hanya ingin menjalankannya secara singkat (Asumsi DB sudah siap):
1. Mulai instalasi dependensi di Terminal: `npm install`
2. Hidupkan otak Server JS: `node server.js`
3. Beranda interaktif akan terlayani pada mesin lokomotor API di [http://localhost:3000](http://localhost:3000)

## 🔜 Pengembangan Lanjutan (Roadmap)
- Integrasi Penuh Backend & Dasbor Admin ✅ (Status: Terpenuhi! Manajemen Database SQL 100% fungsional beserta filter status dan tautan auto-wa.me)
- Routing URL Otomatis ✅ (Status: Terpenuhi! Memastikan form kontak langsung mengunci layanan yang dipencet pengguna)
- Pengiriman Tanda Terima (*Receipt*) melalui API WhatsApp Pihak Ketiga (seperti Baileys) ke klien. ⏳

---
✍️ **Dikembangkan oleh:** Tim Alpha Marketing - 2026
