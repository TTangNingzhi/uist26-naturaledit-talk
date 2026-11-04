// Slide deck runtime: scaling, keyboard paging, outline rail, reveal-on-arrival.
// Keys: ↓ → Space PgDn next · ↑ ← PgUp previous · Home/End · O outline · F fullscreen

(() => {
  const deck = document.querySelector('.deck');
  const slides = [...deck.querySelectorAll('.slide')];
  const nav = document.querySelector('.rail-nav');
  const total = slides.length;
  const pad2 = (n) => String(n).padStart(2, '0');
  let current = 0;

  // ---- scale the 1600 × 900 stage to the space next to the rail
  // phones (same query as slides.css): no rail; portrait fits width, landscape fills the screen
  const PHONE = matchMedia('(max-width: 820px), (max-height: 500px)');
  const PORTRAIT = matchMedia('(orientation: portrait)');
  function fit() {
    let s;
    if (PHONE.matches && PORTRAIT.matches) {
      s = (deck.clientWidth - 2 * 13) / 1600; // 12px slide padding + 1px frame border
    } else {
      const gutter = PHONE.matches || document.body.classList.contains('no-rail') ? 0 : 28;
      const w = deck.clientWidth - gutter * 2;
      const h = deck.clientHeight - gutter * 2;
      s = Math.min(w / 1600, h / 900);
    }
    document.documentElement.style.setProperty('--s', s.toFixed(4));
  }

  // ---- page numbers and the outline rail are derived from the slides
  const items = [];
  let lastGroup = null;
  slides.forEach((slide, i) => {
    slide.id = slide.id || `s${i + 1}`;
    const pg = slide.querySelector('.foot .pg');
    if (pg) pg.textContent = `${pad2(i + 1)} / ${pad2(total)}`;

    const group = slide.dataset.group;
    if (group && group !== lastGroup) {
      const g = document.createElement('div');
      g.className = 'rail-group';
      g.textContent = group;
      nav.append(g);
      lastGroup = group;
    }
    const btn = document.createElement('button');
    btn.className = 'rail-item';
    btn.innerHTML = `<span class="n">${pad2(i + 1)}</span><span>${slide.dataset.title || ''}</span>`;
    btn.addEventListener('click', () => go(i));
    nav.append(btn);
    items.push(btn);
  });

  function setActive(i) {
    current = i;
    slides.forEach((s, j) => s.classList.toggle('is-active', j === i));
    slides[i].classList.add('is-seen');
    items.forEach((b, j) => b.classList.toggle('is-active', j === i));
    items[i].scrollIntoView({ block: 'nearest' });
    history.replaceState(null, '', `#${i + 1}`);
    slides[i].dispatchEvent(new CustomEvent('slide:enter'));
  }

  function go(i, smooth = true) {
    i = Math.max(0, Math.min(total - 1, i));
    slides[i].scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    setActive(i);
  }

  // track the slide in view when the user scrolls with a trackpad or wheel
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(slides.indexOf(e.target));
      });
    },
    { root: deck, threshold: 0.6 },
  );
  slides.forEach((s) => io.observe(s));

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(k)) go(current + 1);
    else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(k)) go(current - 1);
    else if (k === 'Home') go(0);
    else if (k === 'End') go(total - 1);
    else if (k === 'o' || k === 'O') {
      document.body.classList.toggle('no-rail');
      fit();
      go(current, false);
    } else if (k === 'f' || k === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } else return;
    e.preventDefault();
  });

  // mobile browsers fire resize when the toolbar hides; only re-anchor on a real width change
  let lastW = innerWidth;
  window.addEventListener('resize', () => {
    fit();
    if (innerWidth === lastW && PHONE.matches) return;
    lastW = innerWidth;
    go(current, false);
  });

  // mapping demo (F2): hovering a summary segment highlights its code lines
  document.querySelectorAll('[data-map]').forEach((box) => {
    const segs = [...box.querySelectorAll('[data-seg]')];
    const lines = [...box.querySelectorAll('[data-lines]')];
    const show = (k) => {
      box.dataset.on = k;
      segs.forEach((s) => s.classList.toggle('on', s.dataset.seg === k));
      lines.forEach((l) => l.classList.toggle('on', l.dataset.lines.split(' ').includes(k)));
    };
    segs.forEach((s) => s.addEventListener('mouseenter', () => show(s.dataset.seg)));
    show(box.dataset.map);
  });

  // demo video: shown only once the file exists; plays on arrival, pauses on leave
  const videos = [...document.querySelectorAll('video.demo-video')];
  videos.forEach((v) => {
    const reveal = () => { v.hidden = false; v.closest('.demo-box')?.classList.add('has-video'); };
    if (v.readyState >= 1) reveal();
    else v.addEventListener('loadedmetadata', reveal);
  });
  slides.forEach((s) =>
    s.addEventListener('slide:enter', () => {
      videos.forEach((v) => {
        if (s.contains(v)) { if (!v.hidden) v.play().catch(() => {}); } else v.pause();
      });
    }),
  );

  fit();
  const start = parseInt(location.hash.slice(1), 10);
  go(Number.isFinite(start) ? start - 1 : 0, false);
})();
