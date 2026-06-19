-- ============================================
-- SQL SETUP: Web Tracking — Alpha Marketing
-- Jalankan sekali di Neon SQL Console
-- ============================================

-- Buat tabel page_visits
CREATE TABLE IF NOT EXISTS page_visits (
  id               SERIAL PRIMARY KEY,
  page             VARCHAR(200)  NOT NULL,
  referrer         TEXT,
  user_agent       TEXT,
  device_type      VARCHAR(50),
  country          VARCHAR(100),
  city             VARCHAR(100),
  duration_seconds INTEGER       DEFAULT 0,
  ip_hash          VARCHAR(64),
  created_at       TIMESTAMPTZ   DEFAULT NOW()
);

-- Index untuk query analytics agar lebih cepat
CREATE INDEX IF NOT EXISTS idx_visits_created ON page_visits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_page    ON page_visits (page);
CREATE INDEX IF NOT EXISTS idx_visits_ip_hash ON page_visits (ip_hash);

-- Cek hasil
SELECT 'Tabel page_visits berhasil dibuat!' AS status;
