// script.js
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DARK MODE ENFORCED (No toggle — permanent dark) ---
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.removeItem('theme'); // clear any old preference

    // --- 2. MOBILE MENU & NAVBAR SCROLL ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    if(mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const spans = mobileBtn.querySelectorAll('span');
            if(navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if(navLinks.classList.contains('active')) mobileBtn.click();
        });
    });

    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // --- 3. ROI CALCULATOR LOGIC ---
    const visitorSlider = document.getElementById('visitors');
    const convSlider = document.getElementById('convRate');
    const avgSlider = document.getElementById('avgValue');
    
    const visitOut = document.getElementById('visitorVal');
    const convOut = document.getElementById('convVal');
    const avgOut = document.getElementById('avgVal');
    const revenueOut = document.getElementById('potentialRevenue');

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    function calculateROI() {
        const visitors = parseInt(visitorSlider.value);
        const convRate = parseFloat(convSlider.value) / 100;
        const avgVal = parseInt(avgSlider.value);

        // Update badges
        visitOut.textContent = visitors.toLocaleString();
        convOut.textContent = convSlider.value + '%';
        avgOut.textContent = new Intl.NumberFormat('id-ID').format(avgVal);

        // Calculate Current Baseline
        const currentSales = visitors * convRate;
        const currentTotalRevenue = currentSales * avgVal;
        
        // Simulasikan Kekuatan Strategi Alpha Marketing (Misal traffic naik 2.5x, konversi naik +1.5%)
        const newVisitors = visitors * 2.5; 
        const newConvRate = convRate + 0.015;
        const newSales = newVisitors * newConvRate;
        const newTotalRevenue = newSales * avgVal;
        
        // Tampilkan di UI
        const currentRevOut = document.getElementById('currentRevenue');
        if(currentRevOut) {
            currentRevOut.textContent = formatRupiah(currentTotalRevenue);
        }
        revenueOut.textContent = formatRupiah(newTotalRevenue);
    }

    if(visitorSlider && convSlider && avgSlider) {
        visitorSlider.addEventListener('input', calculateROI);
        convSlider.addEventListener('input', calculateROI);
        avgSlider.addEventListener('input', calculateROI);
        calculateROI(); // init
    }

    // --- 4. FAQ ACCORDION ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            // Close all
            faqItems.forEach(fi => fi.classList.remove('active'));
            // Toggle current
            if(!isOpen) item.classList.add('active');
        });
    });

    // --- 5. FORM SUBMISSION (Simulation Modal) ---
    const form = document.getElementById('leadForm');
    const successModal = document.getElementById('successModal');
    const successName = document.getElementById('successName');
    const resetBtn = document.getElementById('resetFormBtn');

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const whatsapp = document.getElementById('whatsapp').value;
            const paket = document.getElementById('interest').value;
            
            const originalText = btn.innerText;
            btn.innerText = 'Memproses...';
            btn.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nama: name, email, whatsapp, paket })
                });

                const data = await response.json();

                if (response.ok) {
                    form.style.display = 'none';
                    successName.textContent = name;
                    successModal.classList.remove('hidden');
                    
                    const simNote = successModal.querySelector('.sim-note');
                    if (simNote) {
                        simNote.textContent = 'Pesanan Anda telah berhasil masuk ke database kami.';
                    }
                } else {
                    alert('Gagal mengirim pesanan: ' + (data.error || 'Terjadi kesalahan'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Gagal terhubung ke server. Apakah server backend sudah menyala?');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            successModal.classList.add('hidden');
            form.reset();
            form.style.display = 'block';
        });
    }

    // --- 6. KONTAK PESAN (Contacts Form Submission) ---
    const contactMsgForm = document.getElementById('contactMessageForm');
    const contactSuccessModal = document.getElementById('contactSuccessModal');
    const contactSuccessName = document.getElementById('contactSuccessName');
    const resetContactBtn = document.getElementById('resetContactBtn');
    
    if(contactMsgForm) {
        contactMsgForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactMsgForm.querySelector('button[type="submit"]');
            const nama = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const whatsapp = document.getElementById('contactWhatsapp').value;
            const pesan = document.getElementById('contactMessage').value;
            
            const originalText = btn.innerText;
            btn.innerText = 'Mengirim Pesan...';
            btn.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/api/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nama, email, whatsapp, pesan })
                });

                const data = await response.json();

                if (response.ok) {
                    contactMsgForm.style.display = 'none';
                    contactSuccessName.textContent = nama;
                    contactSuccessModal.classList.remove('hidden');
                } else {
                    alert('Gagal mengirim pesan: ' + (data.error || 'Terjadi kesalahan'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Gagal terhubung ke server backend.');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    if(resetContactBtn) {
        resetContactBtn.addEventListener('click', () => {
            contactSuccessModal.classList.add('hidden');
            if(contactMsgForm) {
                contactMsgForm.reset();
                contactMsgForm.style.display = 'block';
            }
        });
    }

    // --- 7. SCROLL REVEAL ANIMATIONS ---
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('show-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
    });

    // =============================================
    // SCROLL REVEAL ENGINE — .reveal elements
    // =============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('exit');
            } else {
                // Only exit-animate if scrolling back up
                if (entry.boundingClientRect.top > 0) {
                    entry.target.classList.remove('visible');
                    entry.target.classList.add('exit');
                }
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // =============================================
    // ANIMATED NUMBER COUNTER
    // =============================================
    function animateCounter(el, target, duration = 1800) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                el.textContent = target >= 1000 ? (target / 1000).toFixed(1) + 'rb+' : target + '+';
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(start) + (target >= 1000 ? '' : '');
            }
        }, 16);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                if (target) {
                    animateCounter(el, target);
                    counterObserver.unobserve(el);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
        counterObserver.observe(el);
    });

});

// =============================================
// CURSOR GLOW TRACKER
// =============================================
(function() {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
})();

// =============================================
// ROI EXPLOSION EFFECT (DRAMATIC)
// =============================================
(function() {
    const slider1 = document.getElementById('visitors');
    const slider2 = document.getElementById('avgValue');
    const slider3 = document.getElementById('convRate');
    const potentialEl = document.getElementById('potentialRevenue');
    const roiCard = document.querySelector('.roi-card');
    if (!slider1 || !potentialEl) return;

    let lastExplodedPct = -1;
    let lastExplodedTime = 0;
    const sparkColors = ['#10b981', '#34d399', '#6ee7b7', '#4f46e5', '#818cf8', '#fbbf24', '#f59e0b'];

    function triggerExplosion() {
        const pct = (slider1.value - slider1.min) / (slider1.max - slider1.min);
        // Map to 10 steps (0 to 10)
        const step = Math.floor(pct * 10);
        
        // Trigger if step changed and it went up (or dropped significantly and went up again), 
        // or if enough time passed since last explosion at a high value.
        if ((step > lastExplodedPct || Date.now() - lastExplodedTime > 1500) && step > 0) {
            lastExplodedPct = step;
            lastExplodedTime = Date.now();

            const severity = 0.5 + (pct * 2); // 0.5 to 2.5 severity multiplier
            const numSparks = Math.floor(10 + (30 * pct)); // 10 to 40 sparks
            
            // Pass dynamic CSS variables for scale and shake
            potentialEl.style.setProperty('--burst-scale', 1 + (0.5 * pct)); // 1.0 to 1.5
            potentialEl.style.setProperty('--burst-scale-2', 1 + (0.25 * pct));
            if (roiCard) roiCard.style.setProperty('--shake-x', (4 + 6 * pct) + 'px');

            // 1. Text pulse
            potentialEl.classList.remove('roi-explode');
            void potentialEl.offsetWidth;
            potentialEl.classList.add('roi-explode');

            // 2. Card shake
            if (roiCard) {
                roiCard.classList.remove('roi-card-shake');
                void roiCard.offsetWidth;
                roiCard.classList.add('roi-card-shake');
                setTimeout(() => roiCard.classList.remove('roi-card-shake'), 600);
            }

            // 3. Screen flash (opacity scales with severity)
            const flash = document.createElement('div');
            flash.className = 'roi-flash';
            flash.style.background = `radial-gradient(circle at center, rgba(16,185,129,${0.1 + 0.3*pct}), transparent 70%)`;
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 700);

            // 4. Expanding ring
            const parent = potentialEl.parentElement;
            parent.style.position = 'relative';
            const ring = document.createElement('div');
            ring.className = 'roi-ring';
            parent.appendChild(ring);
            setTimeout(() => ring.remove(), 900);

            // 5. Multi-colored spark particles
            for (let i = 0; i < numSparks; i++) {
                const spark = document.createElement('div');
                spark.className = 'roi-spark';
                const size = 3 + Math.random() * (4 + 4*pct);
                spark.style.width = size + 'px';
                spark.style.height = size + 'px';
                spark.style.background = sparkColors[Math.floor(Math.random() * sparkColors.length)];
                spark.style.left = '50%';
                spark.style.top = '50%';
                const angle = (Math.PI * 2 / numSparks) * i + (Math.random() * 0.5);
                const dist = (40 + Math.random() * 80) * severity;
                spark.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
                spark.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
                spark.style.boxShadow = '0 0 6px ' + spark.style.background;
                parent.appendChild(spark);
                setTimeout(() => spark.remove(), 1100);
            }
        } else if (step < lastExplodedPct - 1) {
            // Reset if user slides way back down so it can explode again when going up
            lastExplodedPct = step;
        }
    }
    slider1.addEventListener('input', triggerExplosion);
    if (slider2) slider2.addEventListener('input', triggerExplosion);
    if (slider3) slider3.addEventListener('input', triggerExplosion);
})();
