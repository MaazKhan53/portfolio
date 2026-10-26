(function () {
  var S = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EXTS = ['.svg', '.png', '.webp', '.jpg'];

  /* ---------- 1. Guaranteed Visibility & AOS Init First ---------- */
  function initAnimations() {
    try {
      if (window.AOS) {
        window.AOS.init({ once: true, offset: 40, duration: 700, disable: reduce });
      } else {
        $$('[data-aos]').forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    } catch (e) {
      $$('[data-aos]').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }
  initAnimations();
  // Failsafe: ensure no section ever stays stuck at opacity 0
  setTimeout(function () {
    $$('[data-aos]').forEach(function (el) {
      if (window.getComputedStyle(el).opacity === '0' && !el.classList.contains('aos-animate')) {
        el.classList.add('aos-animate');
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }, 900);

  /* ---------- 2. Self-Healing CSS & PDF.js Loader ---------- */
  (function ensureDependencies() {
    if (!$('#certDynamicStyles')) {
      var st = document.createElement('style');
      st.id = 'certDynamicStyles';
      st.textContent =
        '.cert-viewport{overflow:hidden;position:relative;user-select:none;-webkit-user-select:none;touch-action:pan-y;cursor:grab;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}' +
        '.cert-viewport.is-dragging{cursor:grabbing}' +
        '.cert-track{display:flex;gap:20px;width:max-content;will-change:transform;padding:8px 0}' +
        '.cert-card{flex:none;width:310px;border-radius:16px;background:rgba(30,41,59,0.85);border:1px solid rgba(71,85,105,0.7);overflow:hidden;transition:border-color .25s ease,box-shadow .25s ease,transform .25s ease;cursor:pointer}' +
        '@media (max-width:640px){.cert-card{width:260px}}' +
        '.cert-card:hover{border-color:rgba(34,211,238,0.65);box-shadow:0 12px 28px -8px rgba(6,182,212,0.25);transform:translateY(-3px)}' +
        '.cert-preview-box{position:relative;width:100%;aspect-ratio:1.414/1;background:#0f172a;display:flex;align-items:center;justify-content:center;overflow:hidden}' +
        '.cert-preview-box canvas{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none}' +
        '#certLightbox{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(2,6,23,0.86);backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:opacity .32s cubic-bezier(0.16,1,0.3,1);touch-action:pinch-zoom}' +
        '#certLightbox.is-open{opacity:1;pointer-events:auto}' +
        '#certLightboxCard{position:relative;width:min(92vw,960px);max-height:88vh;border-radius:18px;background:#0f172a;border:1px solid rgba(56,189,248,0.35);box-shadow:0 25px 60px -15px rgba(0,0,0,0.85);overflow:hidden;transform-origin:center center;transition:transform .36s cubic-bezier(0.16,1,0.3,1),opacity .32s ease;display:flex;flex-direction:column}';
      document.head.appendChild(st);
    }

    if (!window.pdfjsLib && !$('#pdfjsScript')) {
      var sc = document.createElement('script');
      sc.id = 'pdfjsScript';
      sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      sc.onload = function () {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          window.dispatchEvent(new Event('pdfjsReady'));
        }
      };
      document.head.appendChild(sc);
    } else if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  })();

  /* ---------- 3. Analytics & Visitor Intelligence ---------- */
  function trackEvent(name, data) {
    try {
      if (typeof window.va === 'function') {
        window.va('event', { name: name, data: data || {} });
      }
    } catch (e) {}
  }

  if (S.analytics && S.analytics.clarityId) {
    try {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", S.analytics.clarityId);
    } catch (e) {}
  }

  try {
    var params = new URLSearchParams(window.location.search);
    var refTag = params.get('ref') || params.get('from') || params.get('utm_source');
    if (refTag) trackEvent('inbound_ref', { source: refTag });
  } catch (e) {}

  $$('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      trackEvent(el.getAttribute('data-track'), { href: el.getAttribute('href') || '' });
    });
  });

  var pepsicoDetails = $('#pepsicoToolsDetails') || $('#pepsico details');
  if (pepsicoDetails) {
    pepsicoDetails.addEventListener('toggle', function () {
      if (pepsicoDetails.open) trackEvent('pepsico_tools_expand');
    });
  }

  /* ---------- helpers ---------- */
  function initials(name) {
    return (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
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
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var hidden = menu.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(!hidden));
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.add('hidden'); menuBtn.setAttribute('aria-expanded', 'false'); });
    });
  }

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
  if (expGrid && Array.isArray(S.experience)) {
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
  }

  /* ---------- skill map ---------- */
  var all = {};
  if (S.skills && S.skills.advanced && S.skills.practitioner) {
    S.skills.advanced.forEach(function (s) { s.tier = 'Advanced Practitioner'; all[s.id] = s; });
    S.skills.practitioner.forEach(function (s) { s.tier = 'Practitioner'; all[s.id] = s; });
    var activeId = S.skills.advanced[0].id, rowsKey = '';

    function perRow() { return window.innerWidth < 640 ? [3, 3] : [4, 3]; }

    function drawCluster(container, items, n, cls) {
      if (!container) return;
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
          b.addEventListener('click', function () {
            select(s.id);
            trackEvent('skill_hex_click', { skill: s.name });
          });
          wrap.appendChild(b); row.appendChild(wrap);
        });
        container.appendChild(row);
      }
    }

    function select(id) {
      activeId = id;
      $$('.hexwrap').forEach(function (w) { w.classList.toggle('is-active', w.getAttribute('data-id') === id); });
      var s = all[id], panel = $('#skillPanel');
      if (!s || !panel) return;
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
    window.addEventListener('resize', function () { renderMap(false); });
  }

  /* ---------- Self-Healing Lightbox Modal Builder ---------- */
  function ensureLightboxDOM() {
    var lb = $('#certLightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'certLightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.innerHTML =
        '<div id="certLightboxCard">' +
          '<div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">' +
            '<div>' +
              '<span class="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold block">Anthropic Verified Credential</span>' +
              '<h3 id="certModalTitle" class="text-sm md:text-base font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-xl">Certificate</h3>' +
            '</div>' +
            '<div class="flex items-center gap-2">' +
              '<button id="certZoomBtn" type="button" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition">Zoom +</button>' +
              '<button id="certCloseBtn" type="button" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" aria-label="Close modal">' +
                '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div id="certModalViewport" class="relative overflow-auto flex-1 flex items-center justify-center bg-slate-950 p-3 md:p-6 select-none">' +
            '<canvas id="certModalCanvas" class="max-w-full max-h-[75vh] w-auto h-auto rounded shadow-lg transition-transform duration-200 origin-center"></canvas>' +
          '</div>' +
        '</div>';
      document.body.appendChild(lb);
    }
    return lb;
  }

  /* ---------- Exact Filename Resolver for GitHub Root & /certs ---------- */
  var EXACT_FILE_MAP = {
    'ai-fluency-frameworks-and-foundations.pdf': 'AI-Fluency-Frameworks-and-Foundation.pdf',
    'ai-capabilities-and-limitations.pdf': 'AI-Capabilities-and-Limitations.pdf',
    'ai-fluency-for-builders.pdf': 'AI-Fluency-for-Builders.pdf',
    'ai-fluency-for-small-businesses.pdf': 'AI-Fluency-for-Small-Businesses.pdf',
    'ai-fluency-for-students.pdf': 'AI-Fluency-for-students.pdf',
    'ai-fluency-for-educators.pdf': 'AI-Fluency-for-educators.pdf',
    'ai-fluency-for-nonprofits.pdf': 'AI-Fluency-for-nonprofits.pdf',
    'claude-code-in-action.pdf': 'Claude-Code-in-Action.pdf',
    'claude-code-101.pdf': 'Claude-Code-101.pdf',
    'introduction-to-agent-skills.pdf': 'Introduction-to-agent-skills.pdf',
    'introduction-to-subagents.pdf': 'Introduction-to-subagents.pdf',
    'introduction-to-claude-cowork.pdf': 'Introduction-to-Claude-Cowork.pdf',
    'claude-101.pdf': 'Claude-101.pdf',
    'teaching-ai-fluency.pdf': 'Teaching-AI-Fluency.pdf'
  };

  var pdfPageCache = {};
  var pendingCanvasRenders = [];

  function getPdfPage(certItem) {
    var key = certItem.file;
    if (pdfPageCache[key]) return pdfPageCache[key];

    var lower = certItem.file.toLowerCase();
    var mappedExact = EXACT_FILE_MAP[lower] || certItem.file;
    var altName = certItem.alt || lower;

    var candidates = [
      'certs/' + mappedExact,
      mappedExact,
      'certs/' + certItem.file,
      certItem.file,
      'certs/' + altName,
      altName
    ];

    pdfPageCache[key] = new Promise(function (resolve, reject) {
      if (!window.pdfjsLib) return reject(new Error('PDF.js waiting'));
      var idx = 0;
      function tryNext() {
        if (idx >= candidates.length) return reject(new Error('PDF not found'));
        var url = candidates[idx++];
        window.pdfjsLib.getDocument(url).promise.then(function (pdf) {
          return pdf.getPage(1);
        }).then(resolve).catch(tryNext);
      }
      tryNext();
    });
    return pdfPageCache[key];
  }

  function renderCertToCanvas(certItem, canvas, targetWidth) {
    if (!window.pdfjsLib) {
      pendingCanvasRenders.push({ item: certItem, canvas: canvas, width: targetWidth });
      return;
    }
    getPdfPage(certItem).then(function (page) {
      var baseVp = page.getViewport({ scale: 1 });
      var dpr = Math.min(window.devicePixelRatio || 1, 2.2);
      var scale = (targetWidth / baseVp.width) * dpr;
      var vp = page.getViewport({ scale: scale });
      canvas.width = vp.width;
      canvas.height = vp.height;
      var ctx = canvas.getContext('2d');
      page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
        var ph = canvas.parentNode && canvas.parentNode.querySelector('.cert-fallback');
        if (ph) ph.style.opacity = '0';
      });
    }).catch(function () {
      delete pdfPageCache[certItem.file];
    });
  }

  window.addEventListener('pdfjsReady', function () {
    var q = pendingCanvasRenders.slice();
    pendingCanvasRenders = [];
    q.forEach(function (job) { renderCertToCanvas(job.item, job.canvas, job.width); });
  });

  /* ---------- Certificates: 2 Balanced Rows of 7 + Physics Glide ---------- */
  var certWrap = $('#certRows');
  var rowControllers = [];

  if (certWrap && Array.isArray(S.certs)) {
    // Automatically balance into 2 rows of 7 even if data.js still has the old 10 + 4 grouping
    var allCertsFlat = [];
    S.certs.forEach(function (g) {
      (g.items || []).forEach(function (it) { allCertsFlat.push(it); });
    });

    var balancedGroups = S.certs.length === 2 && S.certs[0].items.length === 7
      ? S.certs
      : [
          { group: 'Row 01 · AI Fluency & Applied Foundations', direction: -1, items: allCertsFlat.slice(0, 7) },
          { group: 'Row 02 · Claude Code, Subagents & Workflows', direction: 1, items: allCertsFlat.slice(7, 14) }
        ];

    function createCertCard(c) {
      var card = document.createElement('div');
      card.className = 'cert-card group';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Enlarge certificate: ' + c.title);

      card.innerHTML =
        '<div class="cert-preview-box">' +
          '<div class="cert-fallback absolute inset-0 flex flex-col justify-between p-5 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 transition-opacity duration-300">' +
            '<div class="flex items-center justify-between">' +
              '<span class="text-[10px] tracking-widest uppercase text-cyan-300 font-bold">Anthropic</span>' +
              '<span class="px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 text-[10px] font-medium">Verified Credential</span>' +
            '</div>' +
            '<div class="my-auto py-2">' +
              '<p class="text-white font-bold text-base leading-snug">' + c.title + '</p>' +
              '<p class="text-xs text-slate-400 mt-1">Maaz Khan</p>' +
            '</div>' +
            '<div class="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">' +
              '<span>Certificate of Completion</span>' +
              '<span class="text-cyan-300">Click to zoom</span>' +
            '</div>' +
          '</div>' +
          '<canvas></canvas>' +
        '</div>' +
        '<div class="px-4 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2">' +
          '<span class="text-xs font-semibold text-slate-200 truncate">' + c.title + '</span>' +
          '<span class="text-[11px] text-cyan-400 shrink-0">Zoom +</span>' +
        '</div>';

      var canvas = card.querySelector('canvas');
      renderCertToCanvas(c, canvas, 340);
      card._certData = c;
      return card;
    }

    balancedGroups.forEach(function (g, gi) {
      var label = document.createElement('p');
      label.className = 'text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2 px-6 max-w-6xl mx-auto';
      label.textContent = g.group;

      var viewport = document.createElement('div');
      viewport.className = 'cert-viewport mb-8';
      var track = document.createElement('div');
      track.className = 'cert-track';

      for (var copy = 0; copy < 3; copy++) {
        g.items.forEach(function (c) {
          var card = createCertCard(c);
          if (copy > 0) {
            card.setAttribute('data-clone', String(copy));
            card.setAttribute('aria-hidden', 'true');
            card.tabIndex = -1;
          }
          track.appendChild(card);
        });
      }

      viewport.appendChild(track);
      certWrap.appendChild(label);
      certWrap.appendChild(viewport);

      var baseSpeed = (g.direction || (gi % 2 === 0 ? -1 : 1)) * 0.55;
      var ctrl = {
        viewport: viewport,
        track: track,
        baseSpeed: baseSpeed,
        pos: 0,
        momentum: 0,
        setW: 0,
        dragging: false,
        pointerId: null,
        lastX: 0,
        lastT: 0,
        movedDist: 0,
        downCard: null
      };

      function measureSetWidth() {
        var cards = $$('.cert-card', track);
        var n = g.items.length;
        if (cards.length >= n * 2) {
          ctrl.setW = cards[n].offsetLeft - cards[0].offsetLeft;
        } else {
          ctrl.setW = track.scrollWidth / 3;
        }
        if (ctrl.pos === 0 && ctrl.setW > 0) {
          ctrl.pos = -ctrl.setW;
        }
      }

      viewport.addEventListener('pointerdown', function (e) {
        if (e.button && e.button !== 0) return;
        ctrl.dragging = true;
        ctrl.pointerId = e.pointerId;
        ctrl.lastX = e.clientX;
        ctrl.lastT = performance.now();
        ctrl.movedDist = 0;
        ctrl.momentum = 0;
        ctrl.downCard = e.target.closest('.cert-card');
        viewport.classList.add('is-dragging');
        try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
      });

      viewport.addEventListener('pointermove', function (e) {
        if (!ctrl.dragging || e.pointerId !== ctrl.pointerId) return;
        var now = performance.now();
        var dx = e.clientX - ctrl.lastX;
        var dt = Math.max(now - ctrl.lastT, 8);
        ctrl.pos += dx;
        ctrl.movedDist += Math.abs(dx);
        var instVel = (dx / dt) * 16.67;
        ctrl.momentum = ctrl.momentum * 0.4 + instVel * 0.6;
        ctrl.lastX = e.clientX;
        ctrl.lastT = now;
      });

      function endDrag() {
        if (!ctrl.dragging) return;
        ctrl.dragging = false;
        viewport.classList.remove('is-dragging');
        try { viewport.releasePointerCapture(ctrl.pointerId); } catch (err) {}
        if (ctrl.movedDist < 7 && ctrl.downCard && ctrl.downCard._certData) {
          openCertModal(ctrl.downCard._certData, ctrl.downCard);
        }
        ctrl.downCard = null;
      }

      viewport.addEventListener('pointerup', endDrag);
      viewport.addEventListener('pointercancel', endDrag);

      ctrl.measure = measureSetWidth;
      rowControllers.push(ctrl);
    });

    function measureAllRows() {
      rowControllers.forEach(function (c) { c.measure(); });
    }
    window.addEventListener('load', measureAllRows);
    window.addEventListener('resize', measureAllRows);
    setTimeout(measureAllRows, 150);

    function tickCerts() {
      rowControllers.forEach(function (c) {
        if (!c.setW) c.measure();
        if (!c.setW) return;
        if (!c.dragging) {
          c.pos += (reduce ? 0 : c.baseSpeed) + c.momentum;
          c.momentum *= 0.94;
          if (Math.abs(c.momentum) < 0.02) c.momentum = 0;
        }
        if (c.pos <= -2 * c.setW) c.pos += c.setW;
        if (c.pos >= 0) c.pos -= c.setW;
        c.track.style.transform = 'translate3d(' + c.pos.toFixed(2) + 'px, 0, 0)';
      });
      requestAnimationFrame(tickCerts);
    }
    requestAnimationFrame(tickCerts);
  }

  /* ---------- Fluid FLIP Lightbox Modal Controller ---------- */
  var lightbox = ensureLightboxDOM();
  var lightboxCard = $('#certLightboxCard');
  var modalTitle = $('#certModalTitle');
  var modalCanvas = $('#certModalCanvas');
  var zoomBtn = $('#certZoomBtn');
  var closeBtn = $('#certCloseBtn');
  var activeOriginCard = null;
  var zoomLevel = 1;

  function computeFlipDelta(originEl) {
    if (!originEl) return { dx: 0, dy: 0, scale: 0.75 };
    var rect = originEl.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var dx = (rect.left + rect.width / 2) - vw / 2;
    var dy = (rect.top + rect.height / 2) - vh / 2;
    var scale = Math.max(0.25, Math.min(rect.width / Math.min(vw * 0.92, 960), 0.85));
    return { dx: dx, dy: dy, scale: scale };
  }

  function openCertModal(certItem, originCard) {
    activeOriginCard = originCard;
    zoomLevel = 1;
    if (modalCanvas) modalCanvas.style.transform = 'scale(1)';
    if (zoomBtn) zoomBtn.textContent = 'Zoom +';
    if (modalTitle) modalTitle.textContent = certItem.title;

    trackEvent('certificate_zoom_open', { certificate: certItem.title });
    if (modalCanvas) renderCertToCanvas(certItem, modalCanvas, 1100);

    var flip = computeFlipDelta(originCard);
    lightboxCard.style.transition = 'none';
    lightboxCard.style.transform = 'translate3d(' + flip.dx + 'px, ' + flip.dy + 'px, 0) scale(' + flip.scale + ')';
    lightbox.classList.add('is-open');

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        lightboxCard.style.transition = 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)';
        lightboxCard.style.transform = 'translate3d(0, 0, 0) scale(1)';
      });
    });
  }

  function closeCertModal() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    var flip = computeFlipDelta(activeOriginCard);
    lightboxCard.style.transition = 'transform 0.34s cubic-bezier(0.16, 1, 0.3, 1)';
    lightboxCard.style.transform = 'translate3d(' + flip.dx + 'px, ' + flip.dy + 'px, 0) scale(' + flip.scale + ')';
    lightbox.classList.remove('is-open');
    activeOriginCard = null;
  }

  if (zoomBtn) {
    zoomBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      zoomLevel = zoomLevel === 1 ? 1.65 : 1;
      if (modalCanvas) modalCanvas.style.transform = 'scale(' + zoomLevel + ')';
      zoomBtn.textContent = zoomLevel === 1 ? 'Zoom +' : 'Reset Zoom';
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeCertModal();
    });
  }
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (lightboxCard && !lightboxCard.contains(e.target)) closeCertModal();
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCertModal();
  });

  /* ---------- about ---------- */
  var factsEl = $('#aboutFacts');
  if (factsEl && S.about && Array.isArray(S.about.facts)) {
    S.about.facts.forEach(function (f) {
      var li = document.createElement('li');
      li.className = 'flex gap-3'; li.innerHTML = '<span class="text-cyan-300">&#9656;</span><span>' + f + '</span>';
      factsEl.appendChild(li);
    });
  }
  var beliefEl = $('#aboutBelief');
  if (beliefEl && S.about) beliefEl.textContent = S.about.belief || '';
  var storyEl = $('#aboutStory');
  if (storyEl && S.about && Array.isArray(S.about.story)) {
    S.about.story.forEach(function (p) {
      var el = document.createElement('p'); el.className = 'text-slate-400 leading-relaxed'; el.textContent = p; storyEl.appendChild(el);
    });
  }
  var fig = $('#aboutPhoto');
  if (fig) {
    var photo = loadImage('headshot', function (bad) { bad.remove(); });
    photo.className = 'w-full h-full object-cover';
    photo.onload = function () { fig.appendChild(photo); fig.classList.remove('hidden'); };
  }

  /* ---------- Contact form reset ---------- */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var btn = $('#submitBtn');
      if (btn) { btn.disabled = false; btn.innerText = 'Send Message'; }
    }
  });

  // Refresh AOS after dynamic sections are populated
  if (window.AOS) {
    setTimeout(function () { window.AOS.refresh(); }, 200);
  }
})();
