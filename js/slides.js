// Slide deck runtime: scaling, keyboard paging, outline rail, reveal-on-arrival, step-through slides.
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

  // step-through slides ([data-steps]): next/previous keys walk the steps before paging;
  // [data-show="0 2"] elements appear on the listed steps, [data-go="n"] buttons jump to a step
  const steppers = new Map();
  slides.forEach((s) => {
    const box = s.querySelector('[data-steps]');
    if (!box) return;
    const set = (k) => {
      box.dataset.step = k;
      box.querySelectorAll('[data-show]').forEach((el) => {
        el.hidden = !el.dataset.show.split(' ').includes(String(k));
      });
      box.querySelectorAll('[data-go]').forEach((b) => b.classList.toggle('on', +b.dataset.go === k));
    };
    box.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => set(+b.dataset.go)));
    set(0);
    steppers.set(s, { n: +box.dataset.steps, step: () => +box.dataset.step, set });
  });

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
    const st = steppers.get(slides[current]);
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(k)) {
      if (st && st.step() < st.n - 1) st.set(st.step() + 1);
      else go(current + 1);
    } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(k)) {
      if (st && st.step() > 0) st.set(st.step() - 1);
      else go(current - 1);
    }
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

  // live demo slide: the recorded clip (works offline) or the public YouTube video
  document.querySelectorAll('[data-demo]').forEach((box) => {
    const slide = box.closest('.slide');
    const video = box.querySelector('video');
    const yt = box.querySelector('iframe');
    const buttons = slide.querySelectorAll('[data-mode]');
    const id = yt.dataset.youtube.trim();
    const set = (mode) => {
      box.dataset.mode = mode;
      buttons.forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
      if (mode === 'youtube') {
        video.pause();
        if (id && !yt.src) {
          yt.src = `https://www.youtube-nocookie.com/embed/${id}?start=${yt.dataset.start}&end=${yt.dataset.end}&rel=0`;
        }
      }
    };
    box.dataset.yt = id ? 'set' : 'missing';
    buttons.forEach((b) => b.addEventListener('click', () => set(b.dataset.mode)));
    // default to the clip; fall back to YouTube when the file is not there (e.g., a hosted copy)
    set('clip');
    if (video.error) set('youtube');
    video.addEventListener('error', () => set('youtube'));
    // never autoplay (the live demo comes first); pause when leaving the slide
    slides.forEach((s) => s !== slide && s.addEventListener('slide:enter', () => video.pause()));
  });

  fit();
  const start = parseInt(location.hash.slice(1), 10);
  go(Number.isFinite(start) ? start - 1 : 0, false);
})();
