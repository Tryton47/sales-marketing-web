// script.js
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. THEME SWITCHER (Dark / Light Mode) ---
    const themeBtn = document.getElementById('themeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    const htmlEl = document.documentElement;
    
    // Check local storage for preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    if(currentTheme === 'dark') {
        htmlEl.setAttribute('data-theme', 'dark');
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    }

    themeBtn.addEventListener('click', () => {
        const isDark = htmlEl.getAttribute('data-theme') === 'dark';
        if(isDark) {
            htmlEl.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        } else {
            htmlEl.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        }
    });

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

});
