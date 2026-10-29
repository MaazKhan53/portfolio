(function () {
  var S = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EXTS = ['.svg', '.png', '.webp', '.jpg'];

  /* ---------- 1. Analytics & Visitor Intelligence ---------- */
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

  var pepsicoDetails = $('#pepsicoToolsDetails');
  if (pepsicoDetails) {
    pepsicoDetails.addEventListener('toggle', function () {
      if (pepsicoDetails.open) trackEvent('pepsico_tools_expand');
    });
  }

  /* ---------- 2. Cursor Lamp Tracking ---------- */
  var mouseNormX = 0, mouseNormY = 0;
  window.addEventListener('pointermove', function (e) {
    document.documentElement.style.setProperty('--cx', e.clientX + 'px');
    document.documentElement.style.setProperty('--cy', e.clientY + 'px');
    mouseNormX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseNormY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ---------- 3. Morphing 4-State 3D WebGL Sculpture ---------- */
  (function initMorphingSculpture() {
    var canvas = $('#bgCanvas');
    if (!canvas || !window.THREE) return;

    try {
      var THREE = window.THREE;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 32;

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Soft warm glowing dot texture
      var sc = document.createElement('canvas');
      sc.width = 64; sc.height = 64;
      var ctx = sc.getContext('2d');
      var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(250, 246, 240, 1)');
      g.addColorStop(0.35, 'rgba(229, 169, 60, 0.78)');
      g.addColorStop(0.75, 'rgba(200, 109, 68, 0.2)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      var dotTexture = new THREE.CanvasTexture(sc);

      var N = window.innerWidth < 640 ? 550 : 1050;
      var currentPos = new Float32Array(N * 3);

      // 4 Distinct 3D Sculptural Formations
      var s0_eclipse = new Float32Array(N * 3);   // Chapter 00: Golden Eclipse Ring
      var s1_streams = new Float32Array(N * 3);   // Chapter 01: Chaos -> Parallel Order Streams
      var s2_helix = new Float32Array(N * 3);     // Chapter 02: Orbital Architectural Dial Helix
      var s3_horizon = new Float32Array(N * 3);   // Chapter 03-05: Calm Warm Horizon Floor

      for (var i = 0; i < N; i++) {
        var idx = i * 3;
        var t = i / N;
        var angle = t * Math.PI * 2 * 12;

        // State 0: Off-center Golden Eclipse Torus
        var r0 = 11.5 + (Math.random() - 0.5) * 2.4;
        var a0 = t * Math.PI * 2;
        s0_eclipse[idx] = Math.cos(a0) * r0 + 4.5;
        s0_eclipse[idx + 1] = Math.sin(a0) * r0 * 0.82 + 1.0;
        s0_eclipse[idx + 2] = (Math.random() - 0.5) * 4.5;

        // State 1: Left Chaotic Cloud snapping into 5 Parallel Right Streams
        var x1 = (t - 0.5) * 48;
        var streamLane = (i % 5 - 2) * 3.2;
        var chaosFactor = Math.max(0, (1 - t * 1.35));
        s1_streams[idx] = x1;
        s1_streams[idx + 1] = streamLane + Math.sin(t * 14 + i) * 9.5 * chaosFactor;
        s1_streams[idx + 2] = Math.cos(t * 10 + i) * 7.0 * chaosFactor;

        // State 2: Architectural Double Helix / Wheel
        var r2 = 12.5;
        var a2 = t * Math.PI * 6;
        s2_helix[idx] = Math.cos(a2) * r2 - 7.5;
        s2_helix[idx + 1] = (t - 0.5) * 34;
        s2_helix[idx + 2] = Math.sin(a2) * r2 * 0.65;

        // State 3: Wide Undulating Horizon Floor
        var gx = ((i % 35) / 35 - 0.5) * 54;
        var gz = (Math.floor(i / 35) / (N / 35) - 0.5) * 28;
        s3_horizon[idx] = gx;
        s3_horizon[idx + 1] = -8.5 + Math.sin(gx * 0.25) * 1.6 + Math.cos(gz * 0.3) * 1.4;
        s3_horizon[idx + 2] = gz;

        currentPos[idx] = s0_eclipse[idx];
        currentPos[idx + 1] = s0_eclipse[idx + 1];
        currentPos[idx + 2] = s0_eclipse[idx + 2];
      }

      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));

      var mat = new THREE.PointsMaterial({
        size: 0.72,
        map: dotTexture,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      var sculpture = new THREE.Points(geo, mat);
      scene.add(sculpture);

      window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      var smoothScroll = 0;
      var clock = 0;

      function lerp(a, b, f) { return a + (b - a) * f; }

      function animateSculpture() {
        requestAnimationFrame(animateSculpture);
        clock += 0.008;

        var maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
        var rawProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
        smoothScroll += (rawProgress - smoothScroll) * 0.06;

        // Map smoothScroll [0..1] across the 4 sculptural states (0->1, 1->2, 2->3)
        var scaled = smoothScroll * 3;
        var stageIdx = Math.min(2, Math.floor(scaled));
        var stageFrac = scaled - stageIdx;
        // Smoothstep easing between sculptures
        var easeF = stageFrac * stageFrac * (3 - 2 * stageFrac);

        var states = [s0_eclipse, s1_streams, s2_helix, s3_horizon];
        var fromArr = states[stageIdx];
        var toArr = states[stageIdx + 1];

        var pos = geo.attributes.position.array;
        for (var i = 0; i < N; i++) {
          var ix = i * 3, iy = ix + 1, iz = ix + 2;
          var tx = lerp(fromArr[ix], toArr[ix], easeF);
          var ty = lerp(fromArr[iy], toArr[iy], easeF);
          var tz = lerp(fromArr[iz], toArr[iz], easeF);

          // Subtle organic breathing motion
          pos[ix] = tx + Math.sin(clock + i * 0.15) * 0.18;
          pos[iy] = ty + Math.cos(clock + i * 0.12) * 0.18;
          pos[iz] = tz;
        }
        geo.attributes.position.needsUpdate = true;

        sculpture.rotation.y += (mouseNormX * 0.18 + clock * 0.08 - sculpture.rotation.y) * 0.04;
        sculpture.rotation.x += (-mouseNormY * 0.12 - sculpture.rotation.x) * 0.04;

        renderer.render(scene, camera);
      }
      animateSculpture();
    } catch (e) {}
  })();

  /* ---------- 4. Scroll Choreography: Hero Curtain Split, Reveal & Compression Bars ---------- */
  var heroTopLeft = $('#heroTopLeft');
  var heroBottomRight = $('#heroBottomRight');
  var compassLabel = $('#compassLabel');
  var chapters = $$('[data-chapter]');

  function onScrollChoreography() {
    var sy = window.scrollY;
    var vh = window.innerHeight;

    // 1. Hero Curtain-Split Physics
    if (heroTopLeft && heroBottomRight && sy < vh * 1.2 && !reduce) {
      var p = Math.min(1, sy / (vh * 0.85));
      heroTopLeft.style.transform = 'translate3d(' + (-p * 110).toFixed(1) + 'px, ' + (-p * 35).toFixed(1) + 'px, 0)';
      heroTopLeft.style.opacity = String(Math.max(0, 1 - p * 1.25));
      heroBottomRight.style.transform = 'translate3d(' + (p * 110).toFixed(1) + 'px, ' + (p * 35).toFixed(1) + 'px, 0)';
      heroBottomRight.style.opacity = String(Math.max(0, 1 - p * 1.25));
    }

    // 2. Update Bottom-Right Chapter Compass
    if (compassLabel && chapters.length) {
      var currentName = chapters[0].getAttribute('data-chapter');
      chapters.forEach(function (sec) {
        if (sec.getBoundingClientRect().top <= vh * 0.45) {
          currentName = sec.getAttribute('data-chapter');
        }
      });
      compassLabel.textContent = currentName;
    }

    // 3. Rotate the Architectural Experience Dial on Scroll
    updateExperienceDialFromScroll();
  }

  window.addEventListener('scroll', onScrollChoreography, { passive: true });

  // IntersectionObserver for .choreo-reveal & .compression-bar
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          $$('.compression-bar', en.target).forEach(function (bar) {
            var targetW = bar.getAttribute('data-target-width');
            if (targetW) bar.style.width = targetW;
          });
        }
      });
    }, { threshold: 0.18 });

    $$('.choreo-reveal').forEach(function (el) { revealObserver.observe(el); });
  } else {
    $$('.choreo-reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 5. Experience (Direction A: The Rotating Architectural Dial) ---------- */
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

  var expSection = $('#experience');
  var dialRing = $('#dialRing');
  var dialCounter = $('#dialCounter');
  var expCompany = $('#expActiveCompany');
  var expRole = $('#expActiveRole');
  var expDates = $('#expActiveDates');
  var expPlace = $('#expActivePlace');
  var expImpact = $('#expActiveImpact');
  var expStepDots = $('#expStepDots');
  var activeExpIdx = -1;
  var manualLockUntil = 0;

  if (dialRing && Array.isArray(S.experience) && S.experience.length) {
    var totalExp = S.experience.length;

    S.experience.forEach(function (e, i) {
      var angleDeg = (i / totalExp) * 360;
      var angleRad = (angleDeg * Math.PI) / 180;

      var node = document.createElement('button');
      node.type = 'button';
      node.className = 'dial-node';
      node.setAttribute('aria-label', e.company + ' - ' + e.role);
      node.dataset.index = String(i);

      var upright = document.createElement('div');
      upright.className = 'dial-node-upright';

      var img = loadImage('logos/' + e.key, function (bad) {
        bad.remove();
        upright.innerHTML = '<span class="mono-meta text-xs font-semibold">' + initials(e.company) + '</span>';
      });
      img.className = 'max-w-full max-h-full object-contain';
      upright.appendChild(img);
      node.appendChild(upright);

      node.addEventListener('click', function () {
        manualLockUntil = performance.now() + 1800;
        setActiveExperience(i);
        trackEvent('experience_dial_click', { company: e.company });
      });

      dialRing.appendChild(node);

      // Step dot indicator
      if (expStepDots) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'h-1.5 rounded-full transition-all duration-300 ' + (i === 0 ? 'w-8 bg-amberGlow' : 'w-2 bg-white/20');
        dot.setAttribute('aria-label', 'Go to ' + e.company);
        dot.addEventListener('click', function () {
          manualLockUntil = performance.now() + 1800;
          setActiveExperience(i);
        });
        expStepDots.appendChild(dot);
      }
    });

    function positionDialNodes() {
      var radius = dialRing.offsetWidth / 2;
      $$('.dial-node', dialRing).forEach(function (node, i) {
        var angleRad = ((i / totalExp) * 360 * Math.PI) / 180;
        var x = Math.cos(angleRad) * radius;
        var y = Math.sin(angleRad) * radius;
        node.style.transform = 'translate3d(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px, 0)';
      });
    }
    positionDialNodes();
    window.addEventListener('resize', positionDialNodes);

    function setActiveExperience(idx) {
      if (idx === activeExpIdx || !S.experience[idx]) return;
      activeExpIdx = idx;
      var item = S.experience[idx];
      var targetRot = -((idx / totalExp) * 360);

      dialRing.style.transform = 'rotate(' + targetRot + 'deg)';
      $$('.dial-node', dialRing).forEach(function (node, i) {
        node.classList.toggle('is-active', i === idx);
        var up = $('.dial-node-upright', node);
        if (up) up.style.transform = 'rotate(' + (-targetRot) + 'deg)';
      });

      if (dialCounter) dialCounter.textContent = '0' + (idx + 1) + ' / 0' + totalExp;

      if (expCompany) {
        expCompany.style.opacity = '0.25';
        expCompany.style.transform = 'translateY(8px)';
        setTimeout(function () {
          expDates.textContent = item.dates;
          expPlace.textContent = item.place + (item.ongoing ? ' · Ongoing' : '');
          expCompany.textContent = item.company;
          expRole.textContent = item.role;
          expImpact.textContent = item.impact;
          expCompany.style.opacity = '1';
          expCompany.style.transform = 'translateY(0)';
        }, 120);
      }

      if (expStepDots) {
        $$('button', expStepDots).forEach(function (d, i) {
          d.className = 'h-1.5 rounded-full transition-all duration-300 ' + (i === idx ? 'w-8 bg-amberGlow' : 'w-2 bg-white/20');
        });
      }
    }

    setActiveExperience(0);
  }

  function updateExperienceDialFromScroll() {
    if (!expSection || !S.experience || !S.experience.length) return;
    if (performance.now() < manualLockUntil) return;
    var rect = expSection.getBoundingClientRect();
    var scrollable = expSection.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    if (rect.top <= 0 && rect.bottom >= window.innerHeight * 0.5) {
      var p = Math.min(0.999, Math.max(0, -rect.top / scrollable));
      var idx = Math.floor(p * S.experience.length);
      if (idx !== activeExpIdx) {
        var clickables = $$('.dial-node', dialRing);
        if (clickables[idx]) {
          // Trigger dial update smoothly
          activeExpIdx = -1;
          var item = S.experience[idx];
          var totalExp = S.experience.length;
          activeExpIdx = idx;
          var targetRot = -((idx / totalExp) * 360);
          dialRing.style.transform = 'rotate(' + targetRot + 'deg)';
          clickables.forEach(function (node, i) {
            node.classList.toggle('is-active', i === idx);
            var up = $('.dial-node-upright', node);
            if (up) up.style.transform = 'rotate(' + (-targetRot) + 'deg)';
          });
          if (dialCounter) dialCounter.textContent = '0' + (idx + 1) + ' / 0' + totalExp;
          if (expDates) expDates.textContent = item.dates;
          if (expPlace) expPlace.textContent = item.place + (item.ongoing ? ' · Ongoing' : '');
          if (expCompany) expCompany.textContent = item.company;
          if (expRole) expRole.textContent = item.role;
          if (expImpact) expImpact.textContent = item.impact;
          if (expStepDots) {
            $$('button', expStepDots).forEach(function (d, i) {
              d.className = 'h-1.5 rounded-full transition-all duration-300 ' + (i === idx ? 'w-8 bg-amberGlow' : 'w-2 bg-white/20');
            });
          }
        }
      }
    }
  }

  /* ---------- 6. Craft: The Typographic Split-Curtain ---------- */
  var CURTAINS = [
    {
      num: '01',
      title: 'Enterprise Excel & VBA Systems',
      headline: 'Turning 36-hour manual spreadsheet routines into 15-minute in-memory engines.',
      body: 'Built seven production tools using Scripting.Dictionary hash lookups, dynamic memory arrays, and custom XML ribbons (.xlam) so non-technical teams can run complex audits in one click.',
      tools: 'VBA · Memory Arrays · Custom XML Ribbons · CNIC & Barcode Validation · Power BI & DAX',
      proofLabel: 'Inspect PepsiCo Suite ↑',
      proofHref: '#pepsico'
    },
    {
      num: '02',
      title: 'Predictive Machine Learning',
      headline: ' Models that generalize to unseen companies instead of flattering themselves.',
      body: 'Engineered L2 Logistic Regression and Random Forest triage pipelines evaluated under strict client-grouped holdout splits (GroupShuffleSplit) and a quarantined leakage harness across 30,000 URLs.',
      tools: 'Python · pandas · scikit-learn · Client-Grouped Validation · NIST AI RMF Governance',
      proofLabel: 'Inspect FlyRank Research ↑',
      proofHref: '#flyrank'
    },
    {
      num: '03',
      title: 'Tax, SAP & ERP Reconciliation',
      headline: 'Compressing 25-hour line-by-line SAP and FBR tax audits into 192 seconds.',
      body: 'Designed tolerance-based matching engines for PepsiCo Tax, monitored dealer billing across 3,500 dealers in SAP at FFC, and executed SAP Ariba international sourcing at OGDCL.',
      tools: 'SAP ERP · SAP Ariba · FBR Tax Portal Reconciliation · CPR Standardization',
      proofLabel: 'Inspect Tax Engine ↑',
      proofHref: '#pepsico'
    },
    {
      num: '04',
      title: 'Full-Stack & Agentic Workflows',
      headline: 'Two-sided web platforms and autonomous background agents.',
      body: 'Founded Outfield (React, Vite, Supabase) for live sports venue booking in Karachi, and deployed self-hosted n8n + Docker + Groq LLM pipelines and local MCP filesystem agents.',
      tools: 'React · Supabase · n8n · Docker · Groq API · Claude Code & Subagents (MCP)',
      proofLabel: 'Inspect Outfield & Agents ↑',
      proofHref: '#outfield'
    },
    {
      num: '05',
      title: 'Risk, Credit & Equity Analysis',
      headline: 'Institutional risk frameworks and independent technical trading.',
      body: 'Worked across operational, credit, liquidity, and environmental risk (Basel II) at Askari Bank Head Office, alongside active technical and fundamental equity trading on the PSX since 2025.',
      tools: 'Basel II & RCSA · SME Credit Analysis · RSI, MACD & Bollinger Bands · Financial Statements',
      proofLabel: 'Inspect Track Record ↑',
      proofHref: '#experience'
    }
  ];

  var curtainList = $('#curtainList');
  if (curtainList) {
    CURTAINS.forEach(function (c, i) {
      var band = document.createElement('article');
      band.className = 'curtain-band py-7 sm:py-9' + (i === 0 ? ' is-open' : '');
      band.innerHTML =
        '<div class="flex items-baseline justify-between gap-6">' +
          '<div class="flex items-baseline gap-5 sm:gap-8 min-w-0">' +
            '<span class="mono-meta text-xs text-amberGlow shrink-0">' + c.num + '</span>' +
            '<h3 class="curtain-title font-editorial text-2xl sm:text-4xl md:text-5xl text-ivory tracking-tight truncate">' + c.title + '</h3>' +
          '</div>' +
          '<span class="mono-meta text-xs uppercase tracking-widest text-sand/60 shrink-0 hidden sm:inline">Inspect +</span>' +
        '</div>' +
        '<div class="curtain-drawer">' +
          '<div class="curtain-drawer-inner pl-8 sm:pl-14 pt-6 pr-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">' +
            '<div class="lg:col-span-8 space-y-2">' +
              '<h4 class="font-editorial text-xl sm:text-2xl text-ivory">' + c.headline + '</h4>' +
              '<p class="text-sm sm:text-base text-sand leading-relaxed max-w-2xl">' + c.body + '</p>' +
              '<p class="mono-meta text-xs text-amberGlow/90 pt-2">' + c.tools + '</p>' +
            '</div>' +
            '<div class="lg:col-span-4 lg:text-right">' +
              '<a href="' + c.proofHref + '" class="editorial-link text-sm font-medium text-ivory">' + c.proofLabel + '</a>' +
            '</div>' +
          '</div>' +
        '</div>';

      band.addEventListener('click', function () {
        var open = band.classList.contains('is-open');
        $$('.curtain-band', curtainList).forEach(function (b) { b.classList.remove('is-open'); });
        if (!open) band.classList.add('is-open');
        trackEvent('craft_curtain_open', { capability: c.title });
      });

      curtainList.appendChild(band);
    });
  }

  /* ---------- 7. PDF.js & 3D Perspective Gallery Arc for Certificates ---------- */
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

    function createCertCard(c) {
      var card = document.createElement('div');
      card.className = 'cert-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', c.title);

      card.innerHTML =
        '<div class="cert-preview-box">' +
          '<div class="cert-fallback absolute inset-0 flex flex-col justify-between p-6 bg-[#FAF6F0] text-obsidian rounded-[4px]">' +
            '<div class="flex items-center justify-between border-b border-black/10 pb-2">' +
              '<span class="mono-meta text-[9px] tracking-widest uppercase text-obsidian/60 font-bold">Anthropic</span>' +
              '<span class="mono-meta text-[9px] text-obsidian/50">Verified</span>' +
            '</div>' +
            '<div class="my-auto py-2 text-left">' +
              '<p class="font-editorial font-semibold text-obsidian text-sm leading-snug">' + c.title + '</p>' +
              '<p class="text-[11px] text-obsidian/60 mt-1">Maaz Khan</p>' +
            '</div>' +
            '<div class="text-[9px] mono-meta text-obsidian/50 text-right">Certificate of Completion</div>' +
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

      var baseSpeed = (g.direction || (gi % 2 === 0 ? -1 : 1)) * 0.58;
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

  /* ---------- 8. Frameless Fluid FLIP Lightbox Controller ---------- */
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
        lightboxCard.style.transition = 'transform 0.44s cubic-bezier(0.16, 1, 0.3, 1)';
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

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target !== modalCanvas) closeCertModal();
    });
  }

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

  /* ---------- 9. About & Contact ---------- */
  var factsEl = $('#aboutFacts');
  if (factsEl && S.about && Array.isArray(S.about.facts)) {
    S.about.facts.forEach(function (f) {
      var li = document.createElement('li');
      li.className = 'flex items-center gap-3';
      li.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amberGlow shrink-0"></span><span>' + f + '</span>';
      factsEl.appendChild(li);
    });
  }
  var beliefEl = $('#aboutBelief');
  if (beliefEl && S.about) beliefEl.textContent = S.about.belief || '';
  var storyEl = $('#aboutStory');
  if (storyEl && S.about && Array.isArray(S.about.story)) {
    S.about.story.forEach(function (p) {
      var el = document.createElement('p');
      el.textContent = p;
      storyEl.appendChild(el);
    });
  }

  var contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function () {
      trackEvent('contact_form_submit');
      var btn = $('#submitBtn');
      if (btn) { btn.disabled = true; btn.innerText = 'Dispatching...'; }
    });
  }

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var btn = $('#submitBtn');
      if (btn) { btn.disabled = false; btn.innerHTML = '<span>Dispatch Note</span><span>&rarr;</span>'; }
    }
  });
})();
