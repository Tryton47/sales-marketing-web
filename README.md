# Alpha Marketing - Digital Agency Web Platform

![Alpha Marketing Header](https://img.shields.io/badge/Status-Completed-success)
![Lingkungan](https://img.shields.io/badge/Lingkungan-Vanilla_Web_Stack-blue)
![Tujuan](https://img.shields.io/badge/Tujuan-Tugas_Akademik-purple)

## 📌 Deskripsi Proyek
**Alpha Marketing** adalah platform ekosistem pemasaran berbasis *Digital Agency*. Aplikasi web ini pada mulanya dibangun sebagai struktur mandiri (*Frontend Web Application*), namun telah berevolusi menjadi proyek layar penuh (**Full-Stack**) lengkap dengan kerangka pemrosesan sistem server (*Node.js + Express Backend*) serta basis data aktif (*MySQL Database terintegrasi via Docker & Navicat*).

Fokus utama dari proyek ini adalah implementasi **Modern UI/UX Design** (seperti *Glassmorphism*, *Dark Mode*, *Scroll Animation*, dan Sinkronisasi Cerdas) serta fungsionalitas pengumpulan pelanggan (Lead Generation) dan Pertanyaan Klien yang langsung menancap ke penyimpanan relasional (*Relational DB*).

## 🛠️ Teknologi yang Digunakan
Sistem ini menggunakan ekosistem *Node/Custom API* yang dinamis namun tetap berbobot ringan di sisi server:
1. **Frontend Web Murni (HTML/CSS/JS)**: Tidak melibatkan pustaka bundel berat (seperti React) demi efisiensi optimal dan kecepatan muat maksimum. Termasuk sistem Pemindah Tema Otomatis dan Form Asinkron (Fetch API).
2. **REST API Server (Node.js & Express)**: Kerangka perantara pelayan lalu lintas. Menerima pos HTTP klien, memvalidasi keamanan, lalu menyimpan struktur JSON ke database.
3. **Penyimpanan Terpusat (MySQL 8 / Navicat Premium)**: Logika dan relasi tabel diletakkan ke *`mysql2`* Node driver untuk mengelola `orders` (pemesanan) dan `contacts` (Tanya Jawab), diamankan dalam lingkungan *Docker Container*.

## 🌟 Fitur Utama (Key Features)

### 1. Smart Theme Provider (Mode Gelap/Terang)
Dilengkapi pemindah (*switcher*) tema otomatis. Menggunakan `localStorage` pada browser sehingga preferensi tema pengguna (Light/Dark Mode) akan melekat kuat. Semua transisi warnanya berpindah secara mulus tanpa pemuatan ulang (*reload*).

### 2. Kalkulator Profil ROI Interaktif (Real-Time JS)
Simulasi perhitungan finansial yang merambat langsung ke layar. Pengguna dapat menggeser penanda (*Slider Range*), dan JavaScript akan melakukan komputasi parameter untuk menyajikan persentase potensi keuntungan seketika itu juga. Hal ini membuktikan kompetensi pembuatan model interaktif.

### 3. Sistem Gerbang Autentikasi Modern (Login Page)
Halaman terpisah di `login.html` yang mendemonstrasikan sistem *dummy-login*. Dilengkapi validasi keamanan simulasi menggunakan kredensial (ID: `andhika123`, PW: `andhika123`). Bila sandi ditolak, sistem memberikan respons visual *Haptic Shake* (bergetar) berbasis animasi CSS berpadu *timeout* JS. Kesuksesan login memicu efek visual gradien hijau yang menandakan pintu gerbang terbuka ke halaman dasbor (`index.html`).

### 4. Animasi Intersection Observer (Lazy Reveal)
Daripada memberikan fungsional animasi kepada CSS standar yang menyerap memori, web ini melacak posisi piksel pengunjung menggunakan *IntersectionObserver API*. Elemen UI seperti Kartu, Teks, dan Gambar baru akan ditampilkan (dengan efek transisi mengambang dari bawah) di rentang detik pengunjung tiba di posisi layar tersebut.

### 5. Formulir Pemasaran & Tanya Jawab Terpusat (Database Connected)
Website memiliki form khusus pemesanan "Lead Generation" dan "General Questions/Contact". Semua form menghindari sistem *refresh* (*Anti-Reload*) menggunakan `Fetch API` JavaScript dan langsung mengirimnya ke *REST API Backend* untuk direkam di *MySQL*.

### 6. Seamless Component & Interactions
Beberapa pelengkap arsitektur UI/UX lainnya termasuk:
- Akselerasi Pergerakan Logo Paralel (*Infinite CSS Loop Marquee*).
- Form Tanya Jawab (*FAQ Accordion*) yang beroperasi merubah tinggi piksel otomatis untuk optimalisasi ruang ruang baca.

## 📂 Struktur File (File Directory)
Semua fungsi berpusat pada komponen-file independen:
```text
/sales-marketing-web
├── public/           // Aset Publik Pameran Frontend
│   ├── index.html    // File Master/Beranda Utama beserta Form Orders & Contacts
│   ├── about.html    // Halaman Sejarah berbasis Timeline
│   ├── login.html    // Akses Gerbang (Dilengkapi validasi JS internal)
│   ├── style.css     // Pusat Pengendalian Desain Global
│   └── script.js     // Logika Otak Utama API & DOM (Kalkulator, Fetch API)
├── server.js         // Gerbang API Backend Express.js & Terowongan MySQL
├── .env              // File Skema Kredensial Database
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
- Integrasi *Backend* ✅ (Status: Terpenuhi! Tabel Pemesanan & Kontak berjalan murni dalam SQL Server)
- Fitur *Dashboard Admin* Sistem untuk Manajemen Kontak (*Login Required*) ⏳ 
- Pengiriman Tanda Terima (*Receipt*) melalui NodeMailer ke surel. ⏳

---
✍️ **Dikembangkan oleh:** Tim Alpha Marketing - 2026
