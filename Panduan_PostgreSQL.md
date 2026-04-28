# Panduan Setup Lokal Alpha Marketing (Database, Backend, & Frontend)

Panduan ini berisi kumpulan langkah lengkap (Step-by-Step) untuk menjalankan ekosistem **Alpha Marketing** dari nol di komputer lokal, lengkap dengan tutorial Docker, pengaturan Navicat Premium 17, serta eksekusi terminal. Simpan dokumen ini sebagai referensi jika Anda lupa cara men-setup lingkungan.

---

## TAHAP 1: Menjalankan Database MySQL via Docker
Karena kita menggunakan MySQL, menjalakannya lewat wadah virtual (Docker) adalah cara paling praktis dan aman agar tidak memenuhi sistem komputer Anda.

1. **Install Docker Desktop**: Jika Anda belum memilikinya, unduh dari situs resmi [Docker Desktop](https://www.docker.com/products/docker-desktop/) dan selesaikan instalasinya (Pastikan WSL2 aktif jika menggunakan Windows).
2. **Buka Terminal/Command Prompt (CMD)**:
3. **Tarik Image MySQL & Jalankan Container-nya**:
   Jalankan perintah ini di bawah di Terminal Anda (ini akan mengunduh inti MySQL dan menyalakannya seketika):
   ```bash
   docker run --name alpha-mysql -e MYSQL_ROOT_PASSWORD=password123 -e MYSQL_DATABASE=salesmarketing -p 3306:3306 -d mysql:latest
   ```
   *Ket*: 
   - `--name alpha-mysql`: Nama penanda kontainer Anda.
   - `MYSQL_ROOT_PASSWORD=password123`: Kata sandi root (sesuai `.env` Anda).
   - `MYSQL_DATABASE=salesmarketing`: Langsung membuat database saat start.
   - `-p 3306:3306`: Membuka jalan port database standar.

## TAHAP 2: Mengatur Navicat Premium 17
Kita akan menggunakan Navicat untuk menyusun struktur kerangka Tabel yang menerima pesan di atas *Database* yang baru berjalan tadi.

1. Buka aplikasi **Navicat Premium 17**.
2. Klik tombol merah/hijau **Connection** di pojok kiri atas -> Pilih **MySQL**.
3. Di jendela konfigurasi:
   - **Connection Name**: `Alpha Local DB` (Bebas)
   - **Host**: `127.0.0.1` 
   - **Port**: `3306`
   - **User Name**: `root`
   - **Password**: `password123` (sesuai tahap Docker)
4. Tekan **Test Connection** di kiri bawah. Jika `Connection Successful!`, klik **OK**.
5. Klik dua kali koneksi `Alpha Local DB` di pojok kiri untuk membukanya.
6. Klik dua kali database **`salesmarketing`** jaringannya agar menyala menjadi warna hijau.
7. Tekan fitur ikon **Query** di tab atas -> **New Query**.
8. Ketik / tempel perintah sakti (*Query*) berikut ini persis seperti yang Anda buat sebelumnya:

   ```sql
   CREATE TABLE orders (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nama VARCHAR(100) NOT NULL,
     email VARCHAR(100) NOT NULL,
     paket VARCHAR(50) NOT NULL,
     status VARCHAR(20) DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE contacts (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nama VARCHAR(100) NOT NULL,
     email VARCHAR(100) NOT NULL,
     pesan TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
9. Tekan tombol **Run** (Ikon Play). Navicat akan mencetak dua Tabel ajaib tersebut. Buka menu Tables (di kiri), klik kanan -> Refresh (segarkan), dan keduanya akan muncul.

## TAHAP 3: Konfigurasi File Koneksi (.env)
Pastikan di dalam Folder Root web (bersama `server.js`) terdapat file bernama `.env`. Periksa apakah isinya sudah akurat:

```text
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=password123
DB_NAME=salesmarketing
PORT=3000
```
(Titik perantara bagi Node.js untuk berbicara dengan database Docker Anda).

## TAHAP 4: Menjalankan Server Node.js
Sekarang saatnya menghidupkan *Back-end* (mesin roda gigi perantara *frontend* HTML dengan Database MySQL).

1. Buka fitur **Terminal** langsung lewat Visual Studio Code, atau buka **PowerShell/CMD** baru.
2. Navigasikan ke dalam folder website Anda, (Cth: `cd D:/sales-marketing-web`).
3. (Opsional) Jika baru pertama kali mengunduh file mentahnya, jangan lupa ketik:
   ```bash
   npm install
   ```
4. Hadirkan nyawa ke *server* Anda:
   ```bash
   node server.js
   ```
5. Terminal seharusnya menjawab ramah:
   > Server berjalan di http://localhost:3000
   > BERHASIL KONEK CIHUYYYYY!!!

## TAHAP 5: Uji Coba Kinerja Penyatuan (Frontend -> Backend)
1. Buka aplikasi peramban (*browser*) misal Chrome, isikan pada kolom pencarian URL: 
   `http://localhost:3000` (JANGAN cuma langsung 'Klik Kanan file index.html', tapi gunakan URL ini agar Backend yang melayani perjalanannya).
2. Turun ke form "Hitung ROI" / "Konsultasi" atau "Pertanyaan Umum", isi isiannya, dan Submit.
3. Segera beralih buka kembali layar Navicat premium Anda.
4. Klik dua kali tabel `orders` / `contacts` -> Data baru otomatis tercatat rapi di baris paling bawah. Selesai!

## Catatan Penting
- **Cara Mematikan Server**: Tekan `CTRL + C` di layar tempat Terminal Node tadi.
- **Cara Matikan Database**: Buka Docker Desktop, arahkan ke daftar Container Anda, dan tekan ikon Kotak Hitam *(Stop)* pada *alpha-mysql*. Hidupkan ulang dengan tombol *Play* (Start) tanpa perlu ngetik kode di tahap 1 lagi.
