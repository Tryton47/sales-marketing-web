const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve file HTML/CSS/JS kamu

// Koneksi ke MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Gagal koneksi ke database:', err);
    return;
  }
  console.log('Berhasil konek ke MySQL!');
});

// Endpoint untuk menyimpan order
app.post('/api/orders', (req, res) => {
  const { nama, email, paket } = req.body;
  
  // Validasi input
  if (!nama || !email || !paket) {
    return res.status(400).json({ error: 'Semua field (nama, email, paket) harus diisi' });
  }

  const query = 'INSERT INTO orders (nama, email, paket) VALUES (?, ?, ?)';
  db.query(query, [nama, email, paket], (err, results) => {
    if (err) {
      console.error('Gagal menyimpan pesanan:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
    
    res.status(201).json({ 
      message: 'Pesanan berhasil dikirim!', 
      orderId: results.insertId 
    });
  });
});

// Endpoint untuk menyimpan pesan kontak
app.post('/api/contacts', (req, res) => {
  const { nama, email, pesan } = req.body;
  
  // Validasi input
  if (!nama || !email || !pesan) {
    return res.status(400).json({ error: 'Semua field (nama, email, pesan) harus diisi' });
  }

  const query = 'INSERT INTO contacts (nama, email, pesan) VALUES (?, ?, ?)';
  db.query(query, [nama, email, pesan], (err, results) => {
    if (err) {
      console.error('Gagal menyimpan pesan kontak:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
    
    res.status(201).json({ 
      message: 'Pesan kontak berhasil dikirim!', 
      contactId: results.insertId 
    });
  });
});

// Jalankan server
app.listen(process.env.PORT, () => {
  console.log(`Server berjalan di http://localhost:${process.env.PORT}`);
});