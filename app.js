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

  /* ---------- 2. Interactive Cursor Follower & Magnetic CTA Physics ---------- */
  var cursorHalo = $('#cursorHalo');
  var mouseNormX = 0, mouseNormY = 0;
  var cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
  var haloX = cursorX, haloY = cursorY;

  window.addEventListener('pointermove', function (e) {
    cursorX = e.clientX;
    cursorY = e.clientY;
    mouseNormX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseNormY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  if (cursorHalo && !reduce) {
    (function tickCursor() {
      haloX += (cursorX - haloX) * 0.18;
      haloY += (cursorY - haloY) * 0.18;
      cursorHalo.style.transform = 'translate3d(' + haloX.toFixed(1) + 'px, ' + haloY.toFixed(1) + 'px, 0)';
      requestAnimationFrame(tickCursor);
    })();
  }

  function bindMagneticElements() {
    $$('[data-magnetic], .cta-primary, .cta-beam, .dial-node').forEach(function (el) {
      if (el._magBound) return;
      el._magBound = true;
      el.addEventListener('pointerenter', function () {
        if (cursorHalo) cursorHalo.classList.add('is-hovering');
      });
      el.addEventListener('pointerleave', function () {
        if (cursorHalo) cursorHalo.classList.remove('is-hovering');
        if (!el.classList.contains('dial-node')) {
          el.style.transform = 'translate3d(0px, 0px, 0px)';
        }
      });
      if (!el.classList.contains('dial-node')) {
        el.addEventListener('pointermove', function (e) {
          if (reduce) return;
          var r = el.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
          var dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
          el.style.transform = 'translate3d(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px, 0)';
        });
      }
    });
  }
  bindMagneticElements();

  /* ---------- 3. Lusion-Style Lit 3D Architectural Sculpture (Positioned in Negative Space) ---------- */
  (function initLit3DSculpture() {
    var canvas = $('#bgCanvas');
    if (!canvas || !window.THREE) return;

    try {
      var THREE = window.THREE;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 26);

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Warm studio lighting (Gold key light + Copper rim light + Deep espresso ambient)
      var ambientLight = new THREE.AmbientLight(0x1a1410, 1.4);
      scene.add(ambientLight);

      var keyLight = new THREE.DirectionalLight(0xe5a93c, 2.2);
      keyLight.position.set(12, 16, 14);
      scene.add(keyLight);

      var rimLight = new THREE.PointLight(0xc86d44, 2.6, 50);
      rimLight.position.set(-14, -10, 8);
      scene.add(rimLight);

      var artifactGroup = new THREE.Group();
      // Start positioned on the right side of the screen so left-aligned hero text is 100% clear
      artifactGroup.position.set(6.5, 0.5, 0);
      scene.add(artifactGroup);

      // Core Sculptural Mobius / TorusKnot Ribbon (Smooth Dark Bronze Physical Material)
      var knotGeo = new THREE.TorusKnotGeometry(4.2, 1.05, 180, 32, 2, 3);
      var knotMat = new THREE.MeshStandardMaterial({
        color: 0x18130e,
        roughness: 0.24,
        metalness: 0.88,
        transparent: true,
        opacity: 0.92
      });
      var knotMesh = new THREE.Mesh(knotGeo, knotMat);
      artifactGroup.add(knotMesh);

      // Delicate Golden Wireframe Halo Cage around the sculpture
      var cageGeo = new THREE.TorusKnotGeometry(4.26, 1.08, 90, 16, 2, 3);
      var cageMat = new THREE.MeshBasicMaterial({
        color: 0xe5a93c,
        wireframe: true,
        transparent: true,
        opacity: 0.08
      });
      var cageMesh = new THREE.Mesh(cageGeo, cageMat);
      artifactGroup.add(cageMesh);

      // Outer Gyroscopic Architectural Rings
      var ringGeo1 = new THREE.TorusGeometry(6.8, 0.035, 16, 120);
      var ringMat1 = new THREE.MeshBasicMaterial({ color: 0xe5a93c, transparent: true, opacity: 0.28 });
      var ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 3;
      artifactGroup.add(ring1);

      var ringGeo2 = new THREE.TorusGeometry(8.2, 0.025, 16, 120);
      var ringMat2 = new THREE.MeshBasicMaterial({ color: 0xfaf6f0, transparent: true, opacity: 0.14 });
      var ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.y = Math.PI / 4;
      artifactGroup.add(ring2);

      window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      var smoothScroll = 0;
      var clock = 0;

      function animate3D() {
        requestAnimationFrame(animate3D);
        clock += 0.006;

        var maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
        var rawScroll = Math.min(1, Math.max(0, window.scrollY / maxScroll));
        smoothScroll += (rawScroll - smoothScroll) * 0.05;

        // 3D Timeline Choreography: Move sculpture gracefully across negative space as user scrolls
        var isMobile = window.innerWidth < 768;
        var targetX = isMobile ? 0 : Math.cos(smoothScroll * Math.PI * 2.5) * 6.8;
        var targetY = Math.sin(smoothScroll * Math.PI * 2) * 2.2;
        var targetZ = -Math.sin(smoothScroll * Math.PI) * 5.5;

        artifactGroup.position.x += (targetX + mouseNormX * 1.1 - artifactGroup.position.x) * 0.04;
        artifactGroup.position.y += (targetY - mouseNormY * 0.9 - artifactGroup.position.y) * 0.04;
        artifactGroup.position.z += (targetZ - artifactGroup.position.z) * 0.04;

        // Scroll-driven sculptural rotation + subtle idle spin
        knotMesh.rotation.x = smoothScroll * Math.PI * 3.5 + clock * 0.7;
        knotMesh.rotation.y = smoothScroll * Math.PI * 2.2 + clock * 0.5;
        cageMesh.rotation.copy(knotMesh.rotation);

        ring1.rotation.z = clock * 0.8 + smoothScroll * 4;
        ring2.rotation.x = -clock * 0.6 + smoothScroll * 3;

        renderer.render(scene, camera);
      }
      animate3D();
    } catch (e) {}
  })();

  /* ---------- 4. GSAP ScrollTrigger Choreography & Mask-Split Typography ---------- */
  function initGSAPChoreography() {
    if (!window.gsap) return;
    var gsap = window.gsap;
    if (window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
    }

    if (reduce) return;

    // 1. Hero Opening Mask-Split Stagger
    gsap.fromTo(
      '#top .split-line',
      { yPercent: 115, rotateZ: 2, opacity: 0 },
      { yPercent: 0, rotateZ: 0, opacity: 1, duration: 1.15, stagger: 0.12, ease: 'power4.out', delay: 0.1 }
    );

    // 2. Section Header Mask-Split Reveals on Scroll
    $$('.gsap-section-header').forEach(function (header) {
      var lines = $$('.split-line', header);
      if (lines.length) {
        gsap.fromTo(
          lines,
          { yPercent: 115, rotateZ: 1.5, opacity: 0 },
          {
            yPercent: 0,
            rotateZ: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.1,
            ease: 'power4.out',
            scrollTrigger: { trigger: header, start: 'top 84%' }
          }
        );
      }
    });

    // 3. Project Spreads 3D Perspective Entry + Compression Bar Trigger
    $$('.gsap-spread').forEach(function (spread) {
      var lines = $$('.split-line', spread);
      if (lines.length) {
        gsap.fromTo(
          lines,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.0,
            stagger: 0.1,
            ease: 'power4.out',
            scrollTrigger: { trigger: spread, start: 'top 82%' }
          }
        );
      }

      gsap.fromTo(
        spread,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: spread,
            start: 'top 82%',
            onEnter: function () {
              $$('.compression-bar', spread).forEach(function (bar) {
                var w = bar.getAttribute('data-target-width');
                if (w) gsap.to(bar, { width: w, duration: 1.35, ease: 'power3.out' });
              });
            }
          }
        }
      );
    });

    // 4. Liquid SVG Morphing Wave Dividers on Scroll
    $$('.liquid-divider').forEach(function (svg) {
      var wave = $('.morph-wave', svg);
      var line = $('.morph-line', svg);
      if (wave && line && window.ScrollTrigger) {
        gsap.to([wave, line], {
          attr: { d: 'M0,80 C480,0 960,120 1440,30 L1440,120 L0,120 Z' },
          ease: 'none',
          scrollTrigger: {
            trigger: svg,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    });
  }

  /* ---------- 5. Chapter Compass & Scroll Listener ---------- */
  var compassLabel = $('#compassLabel');
  var chapters = $$('[data-chapter]');

  function onScrollUpdate() {
    var vh = window.innerHeight;
    if (compassLabel && chapters.length) {
      var currentName = chapters[0].getAttribute('data-chapter');
      chapters.forEach(function (sec) {
        if (sec.getBoundingClientRect().top <= vh * 0.45) {
          currentName = sec.getAttribute('data-chapter');
        }
      });
      compassLabel.textContent = currentName;
    }
    updateExperienceDialFromScroll();
  }
  window.addEventListener('scroll', onScrollUpdate, { passive: true });

  /* ---------- 6. Experience (Rotating Architectural Dial with Oversized 82px–98px Logos) ---------- */
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
      var node = document.createElement('button');
      node.type = 'button';
      node.className = 'dial-node';
      node.setAttribute('aria-label', e.company + ' - ' + e.role);
      node.dataset.index = String(i);

      var upright = document.createElement('div');
      upright.className = 'dial-node-upright';

      var img = loadImage('logos/' + e.key, function (bad) {
        bad.remove();
        upright.innerHTML = '<span class="font-editorial text-xl sm:text-2xl font-bold text-obsidian">' + initials(e.company) + '</span>';
      });
      img.className = 'w-full h-full object-contain';
      upright.appendChild(img);
      node.appendChild(upright);

      node.addEventListener('click', function () {
        manualLockUntil = performance.now() + 2200;
        setActiveExperience(i);
        trackEvent('experience_dial_click', { company: e.company });
      });

      dialRing.appendChild(node);

      if (expStepDots) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'px-3 py-1.5 rounded-full mono-meta text-xs transition-all duration-300 ' +
          (i === 0 ? 'bg-amberGlow text-obsidian font-bold' : 'bg-white/10 text-sand hover:bg-white/20');
        dot.textContent = e.company;
        dot.addEventListener('click', function () {
          manualLockUntil = performance.now() + 2200;
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
        if (window.gsap && !reduce) {
          window.gsap.fromTo(
            [expCompany, expRole, expImpact],
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: 'power3.out' }
          );
        }
        expDates.textContent = item.dates;
        expPlace.textContent = item.place + (item.ongoing ? ' · Ongoing' : '');
        expCompany.textContent = item.company;
        expRole.textContent = item.role;
        expImpact.textContent = item.impact;
      }

      if (expStepDots) {
        $$('button', expStepDots).forEach(function (d, i) {
          d.className = 'px-3 py-1.5 rounded-full mono-meta text-xs transition-all duration-300 ' +
            (i === idx ? 'bg-amberGlow text-obsidian font-bold shadow-lg' : 'bg-white/10 text-sand hover:bg-white/20');
        });
      }
    }

    setActiveExperience(0);
    window._setActiveExp = setActiveExperience;
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
      if (idx !== activeExpIdx && typeof window._setActiveExp === 'function') {
        window._setActiveExp(idx);
      }
    }
  }

  /* ---------- 7. Craft: The Typographic Split-Curtain ---------- */
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
      headline: 'Models that generalize to unseen companies instead of flattering themselves.',
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
      band.className = 'curtain-band py-7 sm:py-9 px-4 rounded-2xl' + (i === 0 ? ' is-open' : '');
      band.innerHTML =
        '<div class="flex items-baseline justify-between gap-6">' +
          '<div class="flex items-baseline gap-5 sm:gap-8 min-w-0">' +
            '<span class="mono-meta text-sm text-amberGlow font-bold shrink-0">' + c.num + '</span>' +
            '<h3 class="curtain-title font-editorial text-2xl sm:text-4xl md:text-5xl text-ivory tracking-tight truncate">' + c.title + '</h3>' +
          '</div>' +
          '<span class="mono-meta text-xs uppercase tracking-widest text-amberGlow shrink-0 hidden sm:inline">Expand +</span>' +
        '</div>' +
        '<div class="curtain-drawer">' +
          '<div class="curtain-drawer-inner pl-8 sm:pl-14 pt-6 pr-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">' +
            '<div class="lg:col-span-8 space-y-2">' +
              '<h4 class="font-editorial text-xl sm:text-2xl text-ivory">' + c.headline + '</h4>' +
              '<p class="text-base sm:text-lg text-ivory/85 leading-relaxed max-w-2xl">' + c.body + '</p>' +
              '<p class="mono-meta text-xs text-amberGlow pt-2">' + c.tools + '</p>' +
            '</div>' +
            '<div class="lg:col-span-4 lg:text-right">' +
              '<a href="' + c.proofHref + '" class="cta-beam text-xs py-3 px-5">' + c.proofLabel + '</a>' +
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

  /* ---------- 8. PDF.js & 3D Perspective Gallery Arc for Certificates ---------- */
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

  /* ---------- 9. Frameless Fluid FLIP Lightbox Controller ---------- */
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

  /* ---------- 10. About & Contact ---------- */
  var factsEl = $('#aboutFacts');
  if (factsEl && S.about && Array.isArray(S.about.facts)) {
    S.about.facts.forEach(function (f) {
      var li = document.createElement('li');
      li.className = 'flex items-center gap-3';
      li.innerHTML = '<span class="w-2 h-2 rounded-full bg-amberGlow shrink-0"></span><span>' + f + '</span>';
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
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Dispatch Direct Note</span><span class="cta-arrow-circle">&rarr;</span>';
      }
    }
  });

  // Initialize GSAP ScrollTrigger choreography after DOM population
  bindMagneticElements();
  initGSAPChoreography();
})();
