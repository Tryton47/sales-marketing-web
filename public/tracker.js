/**
 * Alpha Marketing — Web Visitor Tracker
 * Merekam kunjungan halaman secara ringan & ramah privasi.
 * Tidak menggunakan cookie. IP tidak disimpan (hanya hash-nya).
 * Script ini TIDAK dipasang di halaman admin.html / login.html.
 */
(function () {
  'use strict';

  // Deteksi device dari User Agent
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'Mobile';
    return 'Desktop';
  }

  // Ambil nama halaman bersih (misal: "Beranda", "Layanan")
  function getPageName() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    const map = {
      'index.html': 'Beranda',
      '': 'Beranda',
      'layanan.html': 'Layanan',
      'harga.html': 'Harga & Paket',
      'about.html': 'Sejarah',
      'kontak.html': 'Kontak',
    };
    return map[file] || file;
  }

  // Format referrer menjadi nama yang mudah dibaca
  function getReadableReferrer() {
    const ref = document.referrer;
    if (!ref) return 'Direct / Bookmark';
    try {
      const host = new URL(ref).hostname.replace('www.', '');
      if (host.includes('google')) return 'Google';
      if (host.includes('facebook') || host.includes('fb.com')) return 'Facebook';
      if (host.includes('instagram')) return 'Instagram';
      if (host.includes('tiktok')) return 'TikTok';
      if (host.includes('twitter') || host.includes('x.com')) return 'Twitter / X';
      if (host.includes('youtube')) return 'YouTube';
      if (host.includes('whatsapp')) return 'WhatsApp';
      return host;
    } catch (e) {
      return 'Unknown';
    }
  }

  const startTime = Date.now();
  const pageName = getPageName();
  const deviceType = getDeviceType();
  const referrer = getReadableReferrer();

  // Kirim data kunjungan ke API
  function sendTrack(duration) {
    const payload = {
      page: pageName,
      referrer: referrer,
      user_agent: navigator.userAgent,
      device_type: deviceType,
      duration_seconds: duration || 0,
    };

    // Gunakan sendBeacon agar berhasil bahkan saat halaman ditutup
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', blob);
    } else {
      // Fallback untuk browser lama
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }

  // Kirim saat halaman pertama kali dimuat (durasi 0)
  sendTrack(0);

  // Update durasi saat user meninggalkan halaman
  window.addEventListener('beforeunload', function () {
    const duration = Math.round((Date.now() - startTime) / 1000);
    sendTrack(duration);
  });

  // Juga update durasi saat halaman kehilangan fokus (mobile / tab switch)
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      const duration = Math.round((Date.now() - startTime) / 1000);
      sendTrack(duration);
    }
  });
})();
