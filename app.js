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
  setTimeout(function () {
    $$('[data-aos]').forEach(function (el) {
      if (window.getComputedStyle(el).opacity === '0' && !el.classList.contains('aos-animate')) {
        el.classList.add('aos-animate');
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }, 850);

  /* ---------- 2. Three.js 3D Architectural Data Constellation ---------- */
  (function initHeroThreeJS() {
    var canvas = $('#heroCanvas');
    if (!canvas || !window.THREE || reduce) return;

    try {
      var THREE = window.THREE;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 28;

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      var group = new THREE.Group();
      scene.add(group);

      // Architectural Data Nodes
      var nodeCount = window.innerWidth < 640 ? 55 : 95;
      var positions = new Float32Array(nodeCount * 3);
      var velocities = [];
      var spreadX = 46, spreadY = 28, spreadZ = 18;

      for (var i = 0; i < nodeCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spreadX;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ;
        velocities.push({
          vx: (Math.random() - 0.5) * 0.018,
          vy: (Math.random() - 0.5) * 0.018,
          vz: (Math.random() - 0.5) * 0.012
        });
      }

      var pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      var pointsMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.22,
        transparent: true,
        opacity: 0.85
      });
      var pointCloud = new THREE.Points(pointsGeo, pointsMat);
      group.add(pointCloud);

      // Dynamic Pipeline Connections
      var maxLines = nodeCount * 6;
      var linePositions = new Float32Array(maxLines * 6);
      var lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      var lineMat = new THREE.LineBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.18
      });
      var lineSegments = new THREE.LineSegments(lineGeo, lineMat);
      group.add(lineSegments);

      // Subtle Wireframe Glass Icosahedron Accent
      var icoGeo = new THREE.IcosahedronGeometry(9.5, 1);
      var icoMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.06
      });
      var icoMesh = new THREE.Mesh(icoGeo, icoMat);
      group.add(icoMesh);

      var mouseX = 0, mouseY = 0;
      window.addEventListener('pointermove', function (e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      function animateThree() {
        requestAnimationFrame(animateThree);
        // Only render when Hero is near viewport
        if (window.scrollY > window.innerHeight * 1.3) return;

        var posArr = pointsGeo.attributes.position.array;
        for (var i = 0; i < nodeCount; i++) {
          var ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          posArr[ix] += velocities[i].vx;
          posArr[iy] += velocities[i].vy;
          posArr[iz] += velocities[i].vz;

          if (Math.abs(posArr[ix]) > spreadX / 2) velocities[i].vx *= -1;
          if (Math.abs(posArr[iy]) > spreadY / 2) velocities[i].vy *= -1;
          if (Math.abs(posArr[iz]) > spreadZ / 2) velocities[i].vz *= -1;
        }
        pointsGeo.attributes.position.needsUpdate = true;

        // Connect nearby nodes into data pipelines
        var lineIdx = 0;
        var connectDistSq = 48;
        for (var a = 0; a < nodeCount; a++) {
          for (var b = a + 1; b < nodeCount; b++) {
            if (lineIdx >= maxLines) break;
            var dx = posArr[a * 3] - posArr[b * 3];
            var dy = posArr[a * 3 + 1] - posArr[b * 3 + 1];
            var dz = posArr[a * 3 + 2] - posArr[b * 3 + 2];
            var distSq = dx * dx + dy * dy + dz * dz;
            if (distSq < connectDistSq) {
              var lBase = lineIdx * 6;
              linePositions[lBase] = posArr[a * 3];
              linePositions[lBase + 1] = posArr[a * 3 + 1];
              linePositions[lBase + 2] = posArr[a * 3 + 2];
              linePositions[lBase + 3] = posArr[b * 3];
              linePositions[lBase + 4] = posArr[b * 3 + 1];
              linePositions[lBase + 5] = posArr[b * 3 + 2];
              lineIdx++;
            }
          }
        }
        lineGeo.setDrawRange(0, lineIdx * 2);
        lineGeo.attributes.position.needsUpdate = true;

        icoMesh.rotation.y += 0.0012;
        icoMesh.rotation.x += 0.0007;

        // Smooth camera & constellation parallax with mouse
        group.rotation.y += (mouseX * 0.22 - group.rotation.y) * 0.04;
        group.rotation.x += (-mouseY * 0.16 - group.rotation.x) * 0.04;

        renderer.render(scene, camera);
      }
      animateThree();
    } catch (e) {}
  })();

  /* ---------- 3. Analytics & Visitor Intelligence ---------- */
  function trackEvent(name, data) {
    try {
      if (typeof window.va === 'function') {
        window.va('event', { name: name, data: data || {} });
      }
      if (typeof window.clarity === 'function') {
        window.clarity('event', name);
        if (data) {
          Object.keys(data).forEach(function (k) {
            if (data[k]) window.clarity('set', name + '_' + k, String(data[k]));
          });
        }
      }
    } catch (e) {}
  }

  try {
    var params = new URLSearchParams(window.location.search);
    var refTag = params.get('ref') || params.get('from') || params.get('utm_source');
    if (refTag) {
      trackEvent('inbound_ref', { source: refTag });
      if (typeof window.clarity === 'function') {
        window.clarity('set', 'visitor_source', refTag);
      }
    }
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

  /* ---------- 4. Liquid Glass Cursor Specular Sheen ---------- */
  function bindLiquidGlassHover() {
    $$('.liquid-card').forEach(function (card) {
      if (card._glassBound) return;
      card._glassBound = true;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
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
      card.className = 'liquid-card rounded-3xl p-6 flex gap-5';
      card.setAttribute('data-aos', 'fade-up');

      var chip = document.createElement('div');
      chip.className = 'w-14 h-14 shrink-0 rounded-2xl bg-white flex items-center justify-center p-2 overflow-hidden shadow-md';
      var img = loadImage('logos/' + e.key, function (bad) {
        bad.remove();
        chip.className = 'w-14 h-14 shrink-0 rounded-2xl bg-slate-800/90 border border-white/10 text-cyan-300 font-display font-bold flex items-center justify-center';
        chip.textContent = initials(e.company);
      });
      img.className = 'max-w-full max-h-full object-contain';
      chip.appendChild(img);

      var body = document.createElement('div');
      body.className = 'min-w-0';
      body.innerHTML =
        '<div class="flex flex-wrap items-center gap-2">' +
          '<h3 class="text-lg font-bold text-white leading-snug">' + e.role + '</h3>' +
          (e.ongoing ? '<span class="mono-tag px-2.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-semibold uppercase tracking-wider">Ongoing</span>' : '') +
        '</div>' +
        '<p class="text-cyan-300 font-medium text-sm mt-0.5">' + e.company + '</p>' +
        '<p class="mono-tag text-[11px] text-slate-500 mt-0.5">' + e.dates + ' &middot; ' + e.place + '</p>' +
        '<p class="text-sm text-slate-300/85 mt-3 leading-relaxed">' + e.impact + '</p>';

      card.appendChild(chip); card.appendChild(body);
      expGrid.appendChild(card);
    });
  }

  bindLiquidGlassHover();

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
        '<span class="mono-tag inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest ' +
          (adv ? 'bg-cyan-400/10 border border-cyan-400/25 text-cyan-300' : 'bg-white/5 border border-white/10 text-slate-300') + '">' + s.tier + '</span>' +
        '<h3 class="text-2xl font-bold text-white mt-3">' + s.name + '</h3>' +
        '<p class="text-slate-300/90 mt-2 leading-relaxed">' + s.summary + '</p>' +
        '<p class="mt-4 text-sm text-slate-400 mono-tag">Verified in: ' +
          s.proof.map(function (p) { return '<a class="text-cyan-300 hover:text-white underline underline-offset-4" href="' + p.href + '">' + p.label + '</a>'; }).join(', ') + '</p>';
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

  /* ---------- PDF.js Setup & Frameless Certificate Renderer ---------- */
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

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
    getPdfPage(certItem).then(function (page) {
      var baseVp = page.getViewport({ scale: 1 });
      var dpr = Math.min(window.devicePixelRatio || 1, 2.4);
      var scale = (targetWidth / baseVp.width) * dpr;
      var vp = page.getViewport({ scale: scale });
      canvas.width = vp.width;
      canvas.height = vp.height;
      var ctx = canvas.getContext('2d');
      page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
        var ph = canvas.parentNode && canvas.parentNode.querySelector('.cert-fallback');
        if (ph) ph.remove();
      });
    }).catch(function () {
      delete pdfPageCache[certItem.file];
    });
  }

  /* ---------- Certificates: Pure Unbordered Gliding Rows ---------- */
  var certWrap = $('#certRows');
  var rowControllers = [];

  if (certWrap && Array.isArray(S.certs)) {
    var allCertsFlat = [];
    S.certs.forEach(function (g) {
      (g.items || []).forEach(function (it) { allCertsFlat.push(it); });
    });

    var balancedGroups = S.certs.length === 2 && S.certs[0].items.length === 7
      ? S.certs
      : [
          { direction: -1, items: allCertsFlat.slice(0, 7) },
          { direction: 1, items: allCertsFlat.slice(7, 14) }
        ];

    // Pure frameless certificate element: zero outer box, zero bottom bar, zero zoom button
    function createCertCard(c) {
      var card = document.createElement('div');
      card.className = 'cert-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', c.title);

      card.innerHTML =
        '<div class="cert-preview-box">' +
          '<div class="cert-fallback absolute inset-0 flex flex-col justify-between p-6 bg-[#f8fafc] text-slate-900 rounded-[6px]">' +
            '<div class="flex items-center justify-between border-b border-slate-200 pb-2">' +
              '<span class="mono-tag text-[9px] tracking-widest uppercase text-slate-500 font-bold">Anthropic</span>' +
              '<span class="mono-tag text-[9px] text-slate-400">Certificate</span>' +
            '</div>' +
            '<div class="my-auto py-2 text-left">' +
              '<p class="font-display font-bold text-slate-900 text-sm leading-snug">' + c.title + '</p>' +
              '<p class="text-[11px] text-slate-500 mt-1">Awarded to Maaz Khan</p>' +
            '</div>' +
            '<div class="text-[9px] mono-tag text-slate-400 text-right">Verified Credential</div>' +
          '</div>' +
          '<canvas></canvas>' +
        '</div>';

      var canvas = card.querySelector('canvas');
      renderCertToCanvas(c, canvas, 360);
      card._certData = c;
      return card;
    }

    balancedGroups.forEach(function (g, gi) {
      var viewport = document.createElement('div');
      viewport.className = 'cert-viewport';
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

      track.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var card = e.target.closest('.cert-card');
          if (card && card._certData) {
            e.preventDefault();
            openCertModal(card._certData, card);
          }
        }
      });

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

  /* ---------- Frameless Fluid FLIP Lightbox Controller ---------- */
  var lightbox = $('#certLightbox');
  var lightboxCard = $('#certLightboxCard');
  var modalCanvas = $('#certModalCanvas');
  var activeOriginCard = null;
  var zoomLevel = 1;

  function computeFlipDelta(originEl) {
    if (!originEl) return { dx: 0, dy: 0, scale: 0.4 };
    var rect = originEl.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var dx = (rect.left + rect.width / 2) - vw / 2;
    var dy = (rect.top + rect.height / 2) - vh / 2;
    var targetW = Math.min(vw * 0.92, 980);
    var scale = Math.max(0.22, Math.min(rect.width / targetW, 0.85));
    return { dx: dx, dy: dy, scale: scale };
  }

  function openCertModal(certItem, originCard) {
    if (!lightbox || !lightboxCard || !modalCanvas) return;
    activeOriginCard = originCard;
    zoomLevel = 1;
    modalCanvas.style.transform = 'scale(1)';

    trackEvent('certificate_zoom_open', { certificate: certItem.title });

    // Instant visual copy from clicked card's canvas before upgrading to ultra-high DPI
    var thumbCanvas = originCard ? originCard.querySelector('canvas') : null;
    if (thumbCanvas && thumbCanvas.width > 0) {
      modalCanvas.width = thumbCanvas.width;
      modalCanvas.height = thumbCanvas.height;
      modalCanvas.getContext('2d').drawImage(thumbCanvas, 0, 0);
    }
    renderCertToCanvas(certItem, modalCanvas, 1200);

    var flip = computeFlipDelta(originCard);
    lightboxCard.style.transition = 'none';
    lightboxCard.style.transform = 'translate3d(' + flip.dx + 'px, ' + flip.dy + 'px, 0) scale(' + flip.scale + ')';
    lightbox.classList.add('is-open');

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        lightboxCard.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        lightboxCard.style.transform = 'translate3d(0, 0, 0) scale(1)';
      });
    });
  }

  function closeCertModal() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    zoomLevel = 1;
    if (modalCanvas) modalCanvas.style.transform = 'scale(1)';
    var flip = computeFlipDelta(activeOriginCard);
    lightboxCard.style.transition = 'transform 0.36s cubic-bezier(0.16, 1, 0.3, 1)';
    lightboxCard.style.transform = 'translate3d(' + flip.dx + 'px, ' + flip.dy + 'px, 0) scale(' + flip.scale + ')';
    lightbox.classList.remove('is-open');
    activeOriginCard = null;
  }

  // Clicking anywhere outside the certificate closes it back into its gliding place
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target !== modalCanvas) {
        closeCertModal();
      }
    });
  }

  // Double-clicking the enlarged certificate toggles desktop zoom
  if (modalCanvas) {
    modalCanvas.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      zoomLevel = zoomLevel === 1 ? 1.65 : 1;
      modalCanvas.style.transform = 'scale(' + zoomLevel + ')';
      modalCanvas.style.cursor = zoomLevel === 1 ? 'zoom-in' : 'zoom-out';
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

  /* ---------- Contact form submit & reset ---------- */
  var contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function () {
      trackEvent('contact_form_submit');
      var btn = $('#submitBtn');
      if (btn) { btn.disabled = true; btn.innerText = 'Sending...'; }
    });
  }

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var btn = $('#submitBtn');
      if (btn) { btn.disabled = false; btn.innerText = 'Send Message'; }
    }
  });

  if (window.AOS) {
    setTimeout(function () { window.AOS.refresh(); }, 200);
  }
})();
