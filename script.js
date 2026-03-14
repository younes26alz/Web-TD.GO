/* ==============================================
   TD.Go — JavaScript
   Handles: Navbar scroll, mobile menu,
   gallery drag/scroll, back-to-top, AOS, form
============================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. NAVBAR — scroll effect + active link
  ========================================== */
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNav();
    toggleBackTop();
  });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  // Close nav on link click (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // Active nav link on scroll
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) a.classList.add('active');
    });
  }

  /* ==========================================
     2. BACK TO TOP BUTTON
  ========================================== */
  const backTop = document.getElementById('backTop');

  function toggleBackTop() {
    if (window.scrollY > 400) {
      backTop.classList.add('visible');
    } else {
      backTop.classList.remove('visible');
    }
  }

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ==========================================
     3. SIMPLE AOS (Animate on Scroll)
  ========================================== */
  const animatedEls = document.querySelectorAll('[data-aos]');

  // Add CSS for AOS
  const aosStyle = document.createElement('style');
  aosStyle.textContent = `
    [data-aos] {
      opacity: 0;
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    [data-aos="fade-right"] { transform: translateX(-50px); }
    [data-aos="fade-left"]  { transform: translateX(50px);  }
    [data-aos]:not([data-aos="fade-right"]):not([data-aos="fade-left"]) {
      transform: translateY(40px);
    }
    [data-aos].visible {
      opacity: 1 !important;
      transform: translate(0) !important;
    }
  `;
  document.head.appendChild(aosStyle);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  animatedEls.forEach(el => observer.observe(el));

  // Also animate cards with data-delay
  const delayedCards = document.querySelectorAll('[data-delay]');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay * 130);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  delayedCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cardObserver.observe(card);
  });

  /* ==========================================
     4. GALLERY — Drag to Scroll + Arrows + Dots
  ========================================== */
  const track      = document.getElementById('galleryTrack');
  const arrowLeft  = document.getElementById('arrowLeft');
  const arrowRight = document.getElementById('arrowRight');
  const dotsContainer = document.getElementById('galleryDots');

  if (track) {
    // Generate dots
    const cards = track.querySelectorAll('.gallery-card');
    const totalCards = cards.length;
    let visibleCount = Math.floor(track.clientWidth / 200) || 3;

    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('button');
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => scrollToCard(i));
      dotsContainer.appendChild(dot);
    }

    function updateDots() {
      const scrollLeft = track.scrollLeft;
      const cardWidth  = cards[0].offsetWidth + 20; // gap
      const activeIndex = Math.round(scrollLeft / cardWidth);
      dotsContainer.querySelectorAll('.gallery-dot').forEach((d, i) => {
        d.classList.toggle('active', i === activeIndex);
      });
    }

    function scrollToCard(index) {
      const cardWidth = cards[0].offsetWidth + 20;
      track.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    }

    track.addEventListener('scroll', updateDots);

    // Arrow buttons
    arrowLeft.addEventListener('click', () => {
      track.scrollBy({ left: -(cards[0].offsetWidth + 20) * 2, behavior: 'smooth' });
    });
    arrowRight.addEventListener('click', () => {
      track.scrollBy({ left:  (cards[0].offsetWidth + 20) * 2, behavior: 'smooth' });
    });

    // Drag to scroll
    let isDown = false, startX, scrollStart;

    track.addEventListener('mousedown', (e) => {
      isDown = true; startX = e.pageX - track.offsetLeft;
      scrollStart = track.scrollLeft;
      track.classList.add('dragging');
    });
    track.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('dragging'); });
    track.addEventListener('mouseup',    () => { isDown = false; track.classList.remove('dragging'); });
    track.addEventListener('mousemove',  (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollStart - (x - startX) * 1.5;
    });

    // Touch support
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        track.scrollBy({ left: diff > 0 ? 200 : -200, behavior: 'smooth' });
      }
    });
  }

  /* ==========================================
     5. CONTACT FORM
  ========================================== */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = '✅ تم الإرسال!';
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg> إرسال الرسالة`;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  }

  /* ==========================================
     6. SMOOTH SCROLL for all anchor links
  ========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = target.offsetTop - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });

  /* ==========================================
     7. Parallax effect on hero blobs
  ========================================== */
  const blobs = document.querySelectorAll('.blob');
  window.addEventListener('mousemove', (e) => {
    const xRatio = (e.clientX / window.innerWidth  - 0.5) * 20;
    const yRatio = (e.clientY / window.innerHeight - 0.5) * 20;
    blobs.forEach((blob, i) => {
      const factor = (i + 1) * 0.5;
      blob.style.transform = `translate(${xRatio * factor}px, ${yRatio * factor}px)`;
    });
  });

  /* ==========================================
     8. Stagger animation for feature/step items
  ========================================== */
  const staggerItems = document.querySelectorAll('.feature-item, .step, .about-card');
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find index among siblings
        const parent = entry.target.parentElement;
        const siblings = [...parent.children];
        const index = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  staggerItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.55s ease, transform 0.55s ease, border-color 0.35s ease, box-shadow 0.35s ease';
    staggerObserver.observe(item);
  });

  /* ==========================================
     9. Phone mockup subtle floating animation
  ========================================== */
  const phones = document.querySelectorAll('.phone');
  phones.forEach((phone, i) => {
    phone.style.animation = `floatPhone${i} ${4.5 + i * 0.8}s ease-in-out infinite`;
  });

  // Inject keyframes dynamically
  const phoneKF = document.createElement('style');
  phoneKF.textContent = `
    @keyframes floatPhone0 { 0%,100%{transform:translateX(-50%) translateY(0)}   50%{transform:translateX(-50%) translateY(-12px)} }
    @keyframes floatPhone1 { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
    @keyframes floatPhone2 { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-8px)} }
  `;
  document.head.appendChild(phoneKF);

});