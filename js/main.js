(() => {
  'use strict';

  
  const marqueeTrack = document.querySelector('[data-marquee-track]');
  if (marqueeTrack) {
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
  }

  
  function wrapCharsIn(node, delayRef) {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      const tokens = node.textContent.split(/(\s+)/);
      tokens.forEach((token) => {
        if (token === '') return;
        if (/^\s+$/.test(token)) {
          frag.appendChild(document.createTextNode(token));
          return;
        }
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        [...token].forEach((ch) => {
          const span = document.createElement('span');
          span.className = 'char';
          span.textContent = ch;
          span.style.transitionDelay = `${delayRef.i * 14}ms`;
          delayRef.i += 1;
          wordSpan.appendChild(span);
        });
        frag.appendChild(wordSpan);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach((child) => wrapCharsIn(child, delayRef));
    }
  }
  document.querySelectorAll('h1.reveal, h2.reveal').forEach((heading) => {
    heading.classList.add('char-parent');
    const delayRef = { i: 0 };
    Array.from(heading.childNodes).forEach((child) => wrapCharsIn(child, delayRef));
  });

  
  document.querySelectorAll('.btn').forEach((btn) => {
    const label = btn.querySelector(':scope > span:not(.chevron)');
    if (!label) return;
    const text = label.textContent;
    label.classList.add('btn-label');
    label.innerHTML = '';
    [...text].forEach((ch, i) => {
      const rendered = ch === ' ' ? ' ' : ch;
      const charEl = document.createElement('span');
      charEl.className = 'btn-char';
      const inner = document.createElement('span');
      inner.className = 'btn-char-inner';
      inner.style.transitionDelay = `${i * 16}ms`;
      inner.innerHTML = `<span class="btn-char-line">${rendered}</span><span class="btn-char-line" aria-hidden="true">${rendered}</span>`;
      charEl.appendChild(inner);
      label.appendChild(charEl);
    });
  });

  
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => revealObserver.observe(el));

  
  const switcher = document.querySelector('[data-switcher]');
  if (switcher) {
    const btns = Array.from(switcher.querySelectorAll('[data-switch]'));
    const thumb = switcher.querySelector('[data-switcher-thumb]');
    const views = Array.from(document.querySelectorAll('[data-roadmap-view]'));
    const noteEl = document.querySelector('[data-roadmap-note]');

    function activate(idx) {
      btns.forEach((b, i) => b.classList.toggle('is-active', i === idx));
      views.forEach((v, i) => {
        v.hidden = i !== idx;
        v.classList.toggle('is-active', i === idx);
      });
      if (noteEl) noteEl.textContent = views[idx].dataset.note;
      const activeBtn = btns[idx];
      thumb.style.width = `${activeBtn.offsetWidth}px`;
      thumb.style.transform = `translateX(${activeBtn.offsetLeft - 4}px)`;
    }
    btns.forEach((b, i) => b.addEventListener('click', () => activate(i)));
    window.addEventListener('resize', () => {
      activate(btns.findIndex((b) => b.classList.contains('is-active')));
    });
    activate(0);
  }

  
  const serviceList = document.querySelector('[data-service-list]');
  if (serviceList) {
    const items = Array.from(serviceList.querySelectorAll('li'));
    const photo = document.querySelector('[data-service-photo]');
    const photos = [
      'assets/images/services/gangrene-foot.png',
      'assets/images/services/leg-artery.png',
      'assets/images/services/aorta-chest.png',
      'assets/images/services/carotid-neck.png',
      'assets/images/services/varicose-foot.png',
      'assets/images/services/dialysis-arm.png'
    ];
    photo.classList.add('is-loaded');
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const idx = Number(item.dataset.service);
        items.forEach((i) => i.classList.remove('is-active'));
        item.classList.add('is-active');
        photo.classList.remove('is-loaded');
        setTimeout(() => {
          photo.src = photos[idx];
          photo.classList.add('is-loaded');
        }, 150);
      });
    });
  }

  
  const faqList = document.querySelector('[data-faq-list]');
  if (faqList) {
    const items = Array.from(faqList.querySelectorAll('li'));
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const wasActive = item.classList.contains('is-active');
        items.forEach((i) => i.classList.remove('is-active'));
        if (!wasActive) item.classList.add('is-active');
      });
    });
  }

  
  const proofTrack = document.querySelector('[data-proof-track]');
  if (proofTrack) {
    const GALLERY_IMAGES = [
      'https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80'
    ];
    const cols = Array.from(proofTrack.querySelectorAll('[data-proof-col]'));
    const REPEAT_COUNT = 18; 
    cols.forEach((col, i) => {
      const subset = GALLERY_IMAGES.filter((_, idx) => idx % cols.length === i);
      let repeated = [];
      for (let r = 0; r < REPEAT_COUNT; r++) repeated = repeated.concat(subset);
      repeated.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'proof-card';
        const img = document.createElement('img');
        img.src = src;
        img.loading = 'lazy';
        img.alt = '';
        card.appendChild(img);
        col.appendChild(card);
      });
    });

    const frame = proofTrack.querySelector('[data-proof-frame]');
    const grid = proofTrack.querySelector('[data-proof-grid]');
    const payoff = proofTrack.querySelector('[data-proof-payoff]');
    
    const COLUMN_RANGES = [[0, -40], [-40, 10], [0, -40], [-30, 20]];

    
    const odometerEl = payoff.querySelector('[data-odometer]');
    const targetStr = odometerEl.dataset.target;
    const REPEATS = 3;
    const strips = [];
    targetStr.split('').forEach((digit, i) => {
      const col = document.createElement('div');
      col.className = 'odometer-digit';
      const strip = document.createElement('div');
      strip.className = 'odometer-strip';
      for (let r = 0; r < REPEATS; r++) {
        for (let d = 0; d <= 9; d++) {
          const span = document.createElement('span');
          span.textContent = String(d);
          strip.appendChild(span);
        }
      }
      col.appendChild(strip);
      odometerEl.appendChild(col);
      const landingIndex = (REPEATS - 1) * 10 + Number(digit);
      strips.push({ strip, landingIndex, delay: i * 90 });
    });
    const plus = document.createElement('span');
    plus.className = 'odometer-plus';
    plus.textContent = '+';
    odometerEl.appendChild(plus);

    let countStarted = false;
    function rollOdometer() {
      strips.forEach(({ strip, landingIndex, delay }) => {
        strip.style.transitionDelay = `${delay}ms`;
        strip.style.transform = `translateY(-${landingIndex}em)`;
      });
    }

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    function update() {
      const rect = proofTrack.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = clamp(total > 0 ? -rect.top / total : 0, 0, 1);

      
      const p1 = clamp(p / 0.15, 0, 1);
      frame.style.transform = `scale(${lerp(0.9, 1, p1)}, ${lerp(0.8, 1, p1)})`;
      frame.style.borderRadius = `${lerp(48, 0, p1)}px`;

      
      const p2 = clamp((p - 0.15) / 0.85, 0, 1);
      const rx = lerp(25, 4, p2);
      const ry = lerp(-45, -8, p2);
      const rz = lerp(15, 2, p2);
      const tz = lerp(-800, 0, p2);
      grid.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) translateZ(${tz}px)`;
      cols.forEach((col, i) => {
        const [from, to] = COLUMN_RANGES[i % COLUMN_RANGES.length];
        col.style.transform = `translateY(${lerp(from, to, p2)}%)`;
      });

      const p3 = clamp((p - 0.72) / 0.28, 0, 1);
      payoff.style.opacity = String(p3);
      payoff.style.transform = `translateY(${lerp(20, 0, p3)}px)`;

      if (p3 > 0.7 && !countStarted) {
        countStarted = true;
        rollOdometer();
      }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { update(); ticking = false; });
      }
    }, { passive: true });
    update();
  }

  
  function syncAboutPhotoHeight() {
    document.querySelectorAll('.about-grid').forEach((grid) => {
      const copy = grid.querySelector('.about-copy');
      const photos = grid.querySelector('.about-photos');
      if (!copy || !photos) return;
      if (window.matchMedia('(max-width: 960px)').matches) {
        photos.style.height = '';
        return;
      }
      photos.style.height = `${copy.offsetHeight}px`;
    });
  }
  syncAboutPhotoHeight();
  window.addEventListener('resize', syncAboutPhotoHeight);
  window.addEventListener('load', syncAboutPhotoHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncAboutPhotoHeight);
  }

  
  const aboutCarousel = document.querySelector('[data-about-carousel]');
  if (aboutCarousel) {
    const track = aboutCarousel.querySelector('[data-about-track]');
    const slides = Array.from(track.children);
    const prevBtn = aboutCarousel.querySelector('[data-about-prev]');
    const nextBtn = aboutCarousel.querySelector('[data-about-next]');
    const currentEl = aboutCarousel.querySelector('[data-about-current]');
    const totalEl = aboutCarousel.querySelector('[data-about-total]');
    let index = 0;
    let timer;

    totalEl.textContent = String(slides.length);

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      currentEl.textContent = String(index + 1);
    }
    function go(step) {
      index = (index + step + slides.length) % slides.length;
      render();
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => go(1), 4500);
    }
    prevBtn.addEventListener('click', () => { go(-1); restart(); });
    nextBtn.addEventListener('click', () => { go(1); restart(); });
    render();
    restart();
  }

  
  const quickcontacts = document.querySelectorAll('[data-quickcontact]');
  quickcontacts.forEach((qc) => {
    const toggleBtn = qc.querySelector('[data-quickcontact-toggle]');
    const menu = qc.querySelector('[data-quickcontact-menu]');
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'qc-close';
    closeBtn.setAttribute('aria-label', 'Закрыть');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      qc.classList.remove('is-open');
      toggleBtn.focus();
    });
    menu.prepend(closeBtn);

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = qc.classList.contains('is-open');
      quickcontacts.forEach((o) => o.classList.remove('is-open'));
      if (!wasOpen) qc.classList.add('is-open');
    });
  });
  document.addEventListener('click', () => {
    quickcontacts.forEach((o) => o.classList.remove('is-open'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') quickcontacts.forEach((o) => o.classList.remove('is-open'));
  });

  
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  
  const photoInput = document.getElementById('bf-photo');
  const fileAttachText = document.getElementById('fileAttachText');
  const fileAttachLabel = document.getElementById('fileAttachLabel');
  if (photoInput && fileAttachText && fileAttachLabel) {
    photoInput.addEventListener('change', () => {
      const n = photoInput.files.length;
      if (n === 0) {
        fileAttachText.textContent = 'Прикрепить фото';
        fileAttachLabel.classList.remove('has-file');
      } else if (n === 1) {
        fileAttachText.textContent = photoInput.files[0].name;
        fileAttachLabel.classList.add('has-file');
      } else {
        fileAttachText.textContent = `Выбрано файлов: ${n}`;
        fileAttachLabel.classList.add('has-file');
      }
    });
  }

  
  const bookingForm = document.getElementById('bookingForm');
  const formSuccess = document.getElementById('formSuccess');
  if (bookingForm && formSuccess) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      bookingForm.hidden = true;
      formSuccess.hidden = false;
    });
  }

  
  const roadmapCard = document.querySelector('.roadmap-card');
  if (roadmapCard) {
    const roadmapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          roadmapCard.classList.add('is-inview');
          roadmapObserver.unobserve(roadmapCard);
        }
      });
    }, { threshold: 0.25 });
    roadmapObserver.observe(roadmapCard);
  }
})();

