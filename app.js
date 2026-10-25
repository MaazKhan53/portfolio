(function () {
  var S = window.SITE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EXTS = ['.svg', '.png', '.webp', '.jpg'];

  /* ---------- helpers ---------- */
  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }
  function loadImage(base, onFail) {
    var img = new Image(), i = 0;
    img.alt = ''; img.decoding = 'async';
    img.onerror = function () { i++; if (i < EXTS.length) { img.src = base + EXTS[i]; } else { onFail(img); } };
    img.src = base + EXTS[0];
    return img;
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = $('#menuBtn'), menu = $('#mobileMenu');
  menuBtn.addEventListener('click', function () {
    var hidden = menu.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!hidden));
  });
  $$('a', menu).forEach(function (a) {
    a.addEventListener('click', function () { menu.classList.add('hidden'); menuBtn.setAttribute('aria-expanded', 'false'); });
  });

  /* ---------- KPI count-up ---------- */
  var counters = $$('[data-count]');
  function fmt(el, v) { return (el.dataset.prefix || '') + v.toFixed(+el.dataset.decimals || 0) + (el.dataset.suffix || ''); }
  if (reduce || !('IntersectionObserver' in window)) {
    counters.forEach(function (el) { el.textContent = fmt(el, parseFloat(el.dataset.count)); });
  } else {
    counters.forEach(function (el) { el.textContent = fmt(el, 0); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, target = parseFloat(el.dataset.count), t0 = performance.now(), dur = 1300;
        (function step(now) {
          var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(el, target * e);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- experience ---------- */
  var expGrid = $('#experienceGrid');
  S.experience.forEach(function (e) {
    var card = document.createElement('article');
    card.className = 'rounded-2xl border border-slate-700 bg-slate-800/60 p-6 flex gap-5 hover:border-blue-500/40 transition duration-300';
    card.setAttribute('data-aos', 'fade-up');

    var chip = document.createElement('div');
    chip.className = 'w-14 h-14 shrink-0 rounded-xl bg-white flex items-center justify-center p-2 overflow-hidden';
    var img = loadImage('logos/' + e.key, function (bad) {
      bad.remove();
      chip.className = 'w-14 h-14 shrink-0 rounded-xl bg-slate-700 text-white font-bold flex items-center justify-center';
      chip.textContent = initials(e.company);
    });
    img.className = 'max-w-full max-h-full object-contain';
    chip.appendChild(img);

    var body = document.createElement('div');
    body.className = 'min-w-0';
    body.innerHTML =
      '<div class="flex flex-wrap items-center gap-2">' +
        '<h3 class="text-lg font-bold text-white leading-snug">' + e.role + '</h3>' +
        (e.ongoing ? '<span class="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 text-[11px] font-semibold uppercase tracking-wider">Ongoing</span>' : '') +
      '</div>' +
      '<p class="text-cyan-300 font-medium">' + e.company + '</p>' +
      '<p class="text-xs text-slate-500 mt-0.5">' + e.dates + ' &middot; ' + e.place + '</p>' +
      '<p class="text-sm text-slate-400 mt-3 leading-relaxed">' + e.impact + '</p>';

    card.appendChild(chip); card.appendChild(body);
    expGrid.appendChild(card);
  });

  /* ---------- skill map ---------- */
  var all = {};
  S.skills.advanced.forEach(function (s) { s.tier = 'Advanced Practitioner'; all[s.id] = s; });
  S.skills.practitioner.forEach(function (s) { s.tier = 'Practitioner'; all[s.id] = s; });
  var activeId = S.skills.advanced[0].id, rowsKey = '';

  function perRow() { return window.innerWidth < 640 ? [3, 3] : [4, 3]; }

  function drawCluster(container, items, n, cls) {
    container.innerHTML = '';
    for (var i = 0; i < items.length; i += n) {
      var r = i / n, row = document.createElement('div');
      row.className = 'flex';
      row.style.gap = '4px';
      row.style.marginLeft = r % 2 ? 'calc((var(--hw) + 4px) / 2)' : '0';
      row.style.marginTop = r ? 'calc(var(--hh) * -0.25 + 3px)' : '0';
      items.slice(i, i + n).forEach(function (s) {
        var wrap = document.createElement('div');
        wrap.className = 'hexwrap'; wrap.setAttribute('data-id', s.id);
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'hex ' + cls;
        b.setAttribute('aria-label', s.name + ', ' + s.tier);
        b.innerHTML = '<span>' + s.name + '</span>' + (s.star ? '<i class="hex-star" aria-hidden="true">&#9733;</i>' : '');
        b.addEventListener('click', function () { select(s.id); });
        wrap.appendChild(b); row.appendChild(wrap);
      });
      container.appendChild(row);
    }
  }

  function select(id) {
    activeId = id;
    $$('.hexwrap').forEach(function (w) { w.classList.toggle('is-active', w.getAttribute('data-id') === id); });
    var s = all[id], panel = $('#skillPanel');
    var adv = s.tier === 'Advanced Practitioner';
    panel.innerHTML =
      '<span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest ' +
        (adv ? 'bg-cyan-400/10 text-cyan-300' : 'bg-slate-600/40 text-slate-300') + '">' + s.tier + '</span>' +
      '<h3 class="text-2xl font-bold text-white mt-3">' + s.name + '</h3>' +
      '<p class="text-slate-400 mt-2 leading-relaxed">' + s.summary + '</p>' +
      '<p class="mt-4 text-sm text-slate-500">Proof: ' +
        s.proof.map(function (p) { return '<a class="text-blue-400 hover:text-blue-300 underline underline-offset-4" href="' + p.href + '">' + p.label + '</a>'; }).join(', ') + '</p>';
  }

  function renderMap(force) {
    var pr = perRow(), key = pr.join(',');
    if (!force && key === rowsKey) return;
    rowsKey = key;
    drawCluster($('#clusterP'), S.skills.practitioner, pr[0], 't1');
    drawCluster($('#clusterA'), S.skills.advanced, pr[1], 't2');
    select(activeId);
  }
  renderMap(true);

  /* ---------- certificates (scroll-linked rows) ---------- */
  var certWrap = $('#certRows'), tracks = [];
  S.certs.forEach(function (g, gi) {
    var label = document.createElement('p');
    label.className = 'text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3 px-6 max-w-6xl mx-auto';
    label.textContent = g.group;
    var viewport = document.createElement('div');
    viewport.className = 'cert-viewport mb-10';
    var track = document.createElement('div');
    track.className = 'cert-track';
    track.setAttribute('data-cert-track', gi);
    g.items.forEach(function (c) {
      var a = document.createElement('a');
      a.className = 'cert rounded-2xl border border-slate-700 bg-slate-800/70 p-5 flex flex-col justify-between hover:border-cyan-400/50 transition duration-300';
      a.href = 'certs/' + c.file; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.innerHTML =
        '<span><span class="block text-[10px] tracking-widest uppercase text-cyan-300/80 font-semibold">Anthropic</span>' +
        '<span class="block text-white font-semibold mt-2 leading-snug">' + c.title + '</span></span>' +
        '<span class="block mt-4 text-sm text-slate-400">View certificate &rarr;</span>';
      track.appendChild(a);
    });
    viewport.appendChild(track);
    certWrap.appendChild(label); certWrap.appendChild(viewport);
    tracks.push({ track: track, viewport: viewport, setW: 0 });
  });

  function buildTracks() {
    tracks.forEach(function (t) {
      $$('[data-clone]', t.track).forEach(function (n) { n.remove(); });
      if (reduce) { t.viewport.style.overflowX = 'auto'; return; }
      var originals = $$('.cert', t.track);
      t.setW = t.track.scrollWidth + 16;
      var sets = Math.ceil(window.innerWidth / t.setW) + 2;
      for (var s = 1; s < sets; s++) {
        originals.forEach(function (o) {
          var c = o.cloneNode(true);
          c.setAttribute('data-clone', '1'); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1;
          t.track.appendChild(c);
        });
      }
    });
    update();
  }

  var ticking = false;
  function update() {
    ticking = false;
    if (reduce) return;
    var top = certWrap.getBoundingClientRect().top + window.scrollY;
    var progress = (window.scrollY + window.innerHeight - top) * 0.4;
    tracks.forEach(function (t, i) {
      if (!t.setW) return;
      var off = ((progress % t.setW) + t.setW) % t.setW;
      t.track.style.transform = 'translate3d(' + (i % 2 === 0 ? -off : off - t.setW) + 'px,0,0)';
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { renderMap(false); buildTracks(); }, 150);
  });
  window.addEventListener('load', buildTracks);
  buildTracks();

  /* ---------- about ---------- */
  var factsEl = $('#aboutFacts');
  S.about.facts.forEach(function (f) {
    var li = document.createElement('li');
    li.className = 'flex gap-3'; li.innerHTML = '<span class="text-cyan-300">&#9656;</span><span>' + f + '</span>';
    factsEl.appendChild(li);
  });
  $('#aboutBelief').textContent = S.about.belief;
  var storyEl = $('#aboutStory');
  (S.about.story || []).forEach(function (p) {
    var el = document.createElement('p'); el.className = 'text-slate-400 leading-relaxed'; el.textContent = p; storyEl.appendChild(el);
  });
  var fig = $('#aboutPhoto');
  var photo = loadImage('headshot', function (bad) { bad.remove(); });
  photo.className = 'w-full h-full object-cover';
  photo.onload = function () { fig.appendChild(photo); fig.classList.remove('hidden'); };

  /* ---------- form: reset the button if the user hits Back ---------- */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var btn = $('#submitBtn'); btn.disabled = false; btn.innerText = 'Send Message';
    }
  });

  /* ---------- scroll animations ---------- */
  if (window.AOS) { AOS.init({ once: true, offset: 50, disable: reduce }); }
})();
