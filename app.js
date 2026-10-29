(function () {
  var S = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EXTS = ['.svg', '.png', '.webp', '.jpg'];

  /* ---------- 1. Guaranteed Visibility & AOS Init ---------- */
  function initAnimations() {
    try {
      if (window.AOS) {
        window.AOS.init({ once: true, offset: 40, duration: 750, easing: 'ease-out-cubic', disable: reduce });
      } else {
        $$('[data-aos]').forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
      }
    } catch (e) {
      $$('[data-aos]').forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
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
  }, 800);

  /* ---------- 2. Cursor-Revealed Atelier Grid & Card Sheen ---------- */
  window.addEventListener('pointermove', function (e) {
    document.documentElement.style.setProperty('--cx', e.clientX + 'px');
    document.documentElement.style.setProperty('--cy', e.clientY + 'px');
  }, { passive: true });

  function bindWarmGlassHover() {
    $$('.warm-glass').forEach(function (card) {
      if (card._glassBound) return;
      card._glassBound = true;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* ---------- 3. Cozy Studio Bokeh & Warm Floating Embers (No Robotic Lines) ---------- */
  (function initCozyStudioBokeh() {
    var canvas = $('#bgCanvas');
    if (!canvas || !window.THREE || reduce) return;

    try {
      var THREE = window.THREE;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 26;

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Create a soft radial glow texture for warm studio bokeh orbs
      var spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 64;
      spriteCanvas.height = 64;
      var sCtx = spriteCanvas.getContext('2d');
      var grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(250, 246, 240, 1)');
      grad.addColorStop(0.35, 'rgba(229, 169, 60, 0.65)');
      grad.addColorStop(0.7, 'rgba(200, 109, 68, 0.18)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 64, 64);
      var bokehTexture = new THREE.CanvasTexture(spriteCanvas);

      var group = new THREE.Group();
      scene.add(group);

      var count = window.innerWidth < 640 ? 36 : 65;
      var positions = new Float32Array(count * 3);
      var velocities = [];
      var spreadX = 50, spreadY = 34, spreadZ = 22;

      for (var i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spreadX;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ;
        velocities.push({
          vx: (Math.random() - 0.5) * 0.006,
          vy: (Math.random() * 0.006) + 0.002,
          vz: (Math.random() - 0.5) * 0.005
        });
      }

      var pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      var pointsMat = new THREE.PointsMaterial({
        size: 1.45,
        map: bokehTexture,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      var embers = new THREE.Points(pointsGeo, pointsMat);
      group.add(embers);

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

      function animateStudio() {
        requestAnimationFrame(animateStudio);
        var posArr = pointsGeo.attributes.position.array;
        for (var i = 0; i < count; i++) {
          var ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          posArr[ix] += velocities[i].vx;
          posArr[iy] += velocities[i].vy;
          posArr[iz] += velocities[i].vz;

          if (posArr[iy] > spreadY / 2) posArr[iy] = -spreadY / 2;
          if (Math.abs(posArr[ix]) > spreadX / 2) velocities[i].vx *= -1;
          if (Math.abs(posArr[iz]) > spreadZ / 2) velocities[i].vz *= -1;
        }
        pointsGeo.attributes.position.needsUpdate = true;

        var scrollProgress = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
        group.rotation.y += (mouseX * 0.08 + scrollProgress * 0.35 - group.rotation.y) * 0.03;
        group.rotation.x += (-mouseY * 0.06 + scrollProgress * 0.15 - group.rotation.x) * 0.03;

        renderer.render(scene, camera);
      }
      animateStudio();
    } catch (e) {}
  })();

  /* ---------- 4. Analytics & Visitor Intelligence ---------- */
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

  /* ---------- 5. Curated Exhibition Stage (Selected Work — Concise & Interactive) ---------- */
  var EXHIBITS = {
    pepsico: {
      tag: '01 · Flagship Architecture',
      context: 'PepsiCo Pakistan · Roshan Kal GTM & Tax',
      title: '59.4 net hours returned to two departments every month.',
      subtitle: 'Seven in-memory VBA engines packaged onto a custom Excel ribbon, installable on any corporate laptop in under 60 seconds.',
      kpis: [
        { val: '33 hrs', label: 'Saved monthly in GTM' },
        { val: '26.4 hrs', label: 'Saved monthly in Tax' },
        { val: '192 sec', label: 'vs. 26-hr reconciliation' },
        { val: '100%', label: 'Audit validation accuracy' }
      ],
      beats: [
        {
          id: 'problem',
          label: 'I. The Friction',
          heading: '61 gross hours lost every month to manual spreadsheets.',
          body: 'GTM spent 36 hours a month compiling master-data reports by hand, while Tax spent 25+ hours reconciling SAP ledgers against the FBR portal line by line.'
        },
        {
          id: 'craft',
          label: 'II. The Craft',
          heading: 'In-memory hash tables instead of heavy worksheet formulas.',
          body: 'Built seven engines on Scripting.Dictionary lookups and dynamic RAM arrays inside portable .xlam add-ins, complete with a 4-phase self-serve guide so executives install without IT tickets.'
        },
        {
          id: 'return',
          label: 'III. The Return',
          heading: 'Presented to the COO & CFO; permanently adopted in production.',
          body: 'GTM reporting dropped to under 15 minutes and Tax reconciliation dropped to 192 seconds. All 7 tools continue running across both departments post-internship.'
        }
      ],
      tools: [
        '01. CNIC & Cell Audit Engine',
        '02. YTD Reports Generator',
        '03. Pending Transfers Module',
        '04. Barcode Summary Engine',
        '05. Invalid Barcode % Detector',
        '06. FBR & SAP Reconciliation Engine',
        '07. CPR Standardization Protocol'
      ],
      stack: ['Excel VBA', 'Scripting.Dictionary', 'In-Memory Arrays', 'Custom Ribbon XML']
    },
    flyrank: {
      tag: '02 · Applied Machine Learning',
      context: 'FlyRank AI · 30,000 Production URLs · 32 Clients',
      title: '3.5× precision lift on unseen enterprise domains.',
      subtitle: 'A decision-support triage pipeline that ranks decaying search content under strict editorial bandwidth constraints.',
      kpis: [
        { val: '70.0%', label: 'Precision@10 (Unseen)' },
        { val: '3.5×', label: 'Lift over 20% heuristic' },
        { val: '0.5758', label: 'Honest grouped PR-AUC' },
        { val: '10,670', label: 'Ranked playbook URLs' }
      ],
      beats: [
        {
          id: 'problem',
          label: 'I. The Friction',
          heading: '80% of top-10 heuristic alerts were false alarms.',
          body: 'Enterprise teams manage 30,000+ URLs but can only audit 10 to 50 pages per sprint. Standard striking-distance rules waste human hours on stable pages.'
        },
        {
          id: 'craft',
          label: 'II. The Craft',
          heading: 'Client-grouped validation backed by a deliberate leakage harness.',
          body: 'Trained calibrated Logistic Regression and Random Forest models across 25 train clients and 7 unseen test clients, purging 13 formula-leaking columns.'
        },
        {
          id: 'return',
          label: 'III. The Return',
          heading: 'A 4-archetype Action Playbook with human safety guardrails.',
          body: 'Weighted decay probability by 90-day impression demand and enforced automated prune-safety and 60-day cooldown checks before any editorial action.'
        }
      ],
      links: [
        { label: 'Read Research Paper →', href: 'https://maazkhan53.github.io/ML-01-Run-the-Starter-Notebooks/', primary: true, track: 'flyrank_paper_click' },
        { label: 'Verified Credential →', href: 'https://internship.flyrank.ai/verify/FR-D10-856B9-368E2?first_name=Maaz', primary: false, track: 'flyrank_verify_click' }
      ],
      stack: ['Python', 'scikit-learn', 'GroupShuffleSplit', 'Leakage Harness', 'NIST AI RMF']
    },
    outfield: {
      tag: '03 · Product Engineering',
      context: 'Founder & Lead Developer · Karachi',
      title: 'Replacing fragmented WhatsApp chains with instant turf booking.',
      subtitle: 'Outfield is a two-sided sports ground discovery and reservation platform built for players and venue owners in Karachi.',
      kpis: [
        { val: '2-Sided', label: 'Players & Venue Owners' },
        { val: 'Live', label: 'Slot availability engine' },
        { val: '1-Tap', label: 'Reservation workflow' }
      ],
      beats: [
        {
          id: 'problem',
          label: 'I. The Friction',
          heading: 'Booking a pitch in Karachi takes a dozen phone calls.',
          body: 'Players have no central place to see open slots across venues, and facility owners manage overlapping reservations in manual notebooks and chat threads.'
        },
        {
          id: 'craft',
          label: 'II. The Craft',
          heading: 'Real-time relational state on React & Supabase.',
          body: 'Engineered a responsive web platform where players filter grounds by time and area while owners manage slot inventory from a single dashboard.'
        },
        {
          id: 'return',
          label: 'III. The Return',
          heading: 'Currently being rebuilt for public launch.',
          body: 'The core relational schema and frontend architecture are open-sourced on GitHub as the v2 production build nears completion.'
        }
      ],
      links: [
        { label: 'Inspect GitHub Repository →', href: 'https://github.com/MaazKhan53/outfield', primary: true, track: 'outfield_repo_click' }
      ],
      stack: ['React', 'Vite', 'Supabase', 'PostgreSQL', 'Vercel']
    },
    agents: {
      tag: '04 · Autonomous Workflows',
      context: 'Personal Engineering Systems · Docker & MCP',
      title: 'Handing daily market briefings and resume tailoring to agents.',
      subtitle: 'Two self-hosted automation pipelines built to eliminate repetitive personal research and document formatting.',
      kpis: [
        { val: 'Daily', label: 'Automated morning digest' },
        { val: '0-Touch', label: 'n8n + Groq + Docker' },
        { val: 'MCP', label: 'Local filesystem agent' }
      ],
      beats: [
        {
          id: 'problem',
          label: 'I. Financial Pipeline',
          heading: 'The morning market scan, automated end-to-end.',
          body: 'A self-hosted n8n workflow inside Docker scrapes daily financial news, synthesizes an executive briefing via the Groq LLM API, and delivers it via SMTP every morning.'
        },
        {
          id: 'craft',
          label: 'II. Resume Tailor Agent',
          heading: 'Local Claude agent wired to the MCP filesystem server.',
          body: 'Reads verified project metrics from my local master database and rewrites resume bullet points to align with target job descriptions in seconds.'
        },
        {
          id: 'return',
          label: 'III. The Return',
          heading: 'Hours of weekly reading and formatting reclaimed.',
          body: 'Both workflows run locally with zero manual copy-pasting, turning multi-step research routines into background utilities.'
        }
      ],
      stack: ['n8n', 'Docker', 'Groq LLM API', 'Model Context Protocol (MCP)', 'Claude Code']
    }
  };

  var currentExhibitKey = 'pepsico';
  var currentBeatIdx = 0;

  function renderExhibitStage(key, beatIdx) {
    var stage = $('#exhibitStage');
    if (!stage || !EXHIBITS[key]) return;
    currentExhibitKey = key;
    currentBeatIdx = beatIdx || 0;
    var ex = EXHIBITS[key];
    var activeBeat = ex.beats[currentBeatIdx] || ex.beats[0];

    $$('#exhibitTabs .exhibit-tab').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-exhibit') === key);
    });

    var kpisHtml = ex.kpis.map(function (k) {
      return '<div class="rounded-2xl bg-black/35 border border-white/10 p-4">' +
        '<div class="kpi-num font-editorial text-2xl sm:text-3xl font-semibold text-ivory">' + k.val + '</div>' +
        '<p class="text-xs text-sand mt-1">' + k.label + '</p>' +
      '</div>';
    }).join('');

    var beatsNavHtml = ex.beats.map(function (b, idx) {
      return '<button type="button" data-beat-idx="' + idx + '" class="beat-btn ' + (idx === currentBeatIdx ? 'is-active' : '') + '">' + b.label + '</button>';
    }).join('');

    var toolsHtml = '';
    if (ex.tools) {
      toolsHtml =
        '<details class="mt-5 pt-4 border-t border-white/10 group">' +
          '<summary class="cursor-pointer list-none inline-flex items-center gap-2 text-xs mono-tag uppercase tracking-wider text-amberGlow hover:text-ivory transition">' +
            '<span>View All 7 Production VBA Engines</span>' +
            '<span class="group-open:rotate-180 transition-transform">&#9662;</span>' +
          '</summary>' +
          '<div class="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-ivory/90">' +
            ex.tools.map(function (t) {
              return '<div class="px-3 py-2 rounded-xl bg-black/40 border border-white/10">' + t + '</div>';
            }).join('') +
          '</div>' +
        '</details>';
    }

    var linksHtml = '';
    if (ex.links) {
      linksHtml = '<div class="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-4 items-center">' +
        ex.links.map(function (l) {
          return '<a href="' + l.href + '" target="_blank" rel="noopener noreferrer" class="' +
            (l.primary ? 'text-sm font-semibold text-amberGlow hover:text-ivory transition' : 'text-xs mono-tag text-sand hover:text-ivory transition') + '">' + l.label + '</a>';
        }).join('') +
      '</div>';
    }

    var stackHtml = (ex.stack || []).map(function (s) {
      return '<span class="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] mono-tag text-sand">' + s + '</span>';
    }).join('');

    stage.innerHTML =
      '<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">' +
        '<!-- Left 6 Cols: Headline & Sculpted Numbers -->' +
        '<div class="lg:col-span-6 space-y-6">' +
          '<div>' +
            '<div class="flex flex-wrap items-center gap-2.5 mb-3">' +
              '<span class="mono-tag px-3 py-1 rounded-full bg-amberGlow/15 border border-amberGlow/30 text-amberGlow text-[11px] font-semibold uppercase tracking-wider">' + ex.tag + '</span>' +
              '<span class="mono-tag text-xs text-sand">' + ex.context + '</span>' +
            '</div>' +
            '<h3 class="font-editorial text-2xl sm:text-3xl md:text-4xl text-ivory leading-tight">' + ex.title + '</h3>' +
            '<p class="text-sand text-sm md:text-base mt-3 leading-relaxed">' + ex.subtitle + '</p>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-3">' + kpisHtml + '</div>' +
          '<div class="flex flex-wrap gap-2 pt-1">' + stackHtml + '</div>' +
        '</div>' +

        '<!-- Right 6 Cols: Interactive 3-Beat Story Switcher (1 Short Card at a Time) -->' +
        '<div class="lg:col-span-6">' +
          '<div class="rounded-3xl bg-black/40 border border-white/10 p-6 sm:p-8">' +
            '<div class="flex flex-wrap items-center gap-2 mb-6">' + beatsNavHtml + '</div>' +
            '<div id="beatCardContent" class="space-y-3 min-h-[130px]">' +
              '<span class="mono-tag text-[11px] uppercase tracking-widest text-amberGlow block">' + activeBeat.label + '</span>' +
              '<h4 class="font-editorial text-xl sm:text-2xl text-ivory leading-snug">' + activeBeat.heading + '</h4>' +
              '<p class="text-sand text-sm sm:text-base leading-relaxed">' + activeBeat.body + '</p>' +
            '</div>' +
            toolsHtml +
            linksHtml +
          '</div>' +
        '</div>' +
      '</div>';

    $$('#exhibitStage [data-beat-idx]').forEach(function (bBtn) {
      bBtn.addEventListener('click', function () {
        var nextIdx = parseInt(bBtn.getAttribute('data-beat-idx'), 10);
        renderExhibitStage(currentExhibitKey, nextIdx);
        trackEvent('exhibit_beat_switch', { project: currentExhibitKey, beat: nextIdx + 1 });
      });
    });
  }

  $$('#exhibitTabs .exhibit-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var k = tab.getAttribute('data-exhibit');
      renderExhibitStage(k, 0);
      trackEvent('exhibit_project_switch', { project: k });
    });
  });

  $$('[data-exhibit-jump]').forEach(function (link) {
    link.addEventListener('click', function () {
      var k = link.getAttribute('data-exhibit-jump');
      if (EXHIBITS[k]) renderExhibitStage(k, 0);
    });
  });

  renderExhibitStage('pepsico', 0);

  /* ---------- Helpers ---------- */
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

  /* ---------- Mobile Menu ---------- */
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

  /* ---------- KPI Count-Up ---------- */
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

  /* ---------- 6. Experience: All-At-Once Interactive Accordion Filmstrip ---------- */
  var expList = $('#experienceList') || $('#experienceGrid');
  if (expList && Array.isArray(S.experience)) {
    expList.innerHTML = '';
    S.experience.forEach(function (e, idx) {
      var row = document.createElement('article');
      row.className = 'exp-row py-4.5 px-2 sm:px-4' + (idx === 0 ? ' is-open' : '');

      var chip = document.createElement('div');
      chip.className = 'w-11 h-11 shrink-0 rounded-xl bg-white flex items-center justify-center p-1.5 overflow-hidden shadow-sm';
      var img = loadImage('logos/' + e.key, function (bad) {
        bad.remove();
        chip.className = 'w-11 h-11 shrink-0 rounded-xl bg-white/5 border border-white/10 text-amberGlow font-editorial font-semibold text-sm flex items-center justify-center';
        chip.textContent = initials(e.company);
      });
      img.className = 'max-w-full max-h-full object-contain';
      chip.appendChild(img);

      var header = document.createElement('div');
      header.className = 'flex items-center justify-between gap-4 py-4';

      var left = document.createElement('div');
      left.className = 'flex items-center gap-4 min-w-0';
      left.appendChild(chip);

      var titleWrap = document.createElement('div');
      titleWrap.className = 'min-w-0';
      titleWrap.innerHTML =
        '<div class="flex flex-wrap items-center gap-2">' +
          '<h3 class="font-editorial text-lg md:text-xl text-ivory truncate">' + e.company + '</h3>' +
          '<span class="text-sand/50 hidden sm:inline">&middot;</span>' +
          '<span class="text-sm font-medium text-sand truncate">' + e.role + '</span>' +
          (e.ongoing ? '<span class="mono-tag px-2 py-0.5 rounded-full bg-amberGlow/15 border border-amberGlow/30 text-amberGlow text-[10px] uppercase">Ongoing</span>' : '') +
        '</div>';
      left.appendChild(titleWrap);

      var right = document.createElement('div');
      right.className = 'flex items-center gap-3 shrink-0';
      right.innerHTML =
        '<span class="mono-tag text-xs text-sand/80 hidden md:inline">' + e.dates + '</span>' +
        '<span class="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-amberGlow text-xs">+</span>';

      header.appendChild(left);
      header.appendChild(right);

      var details = document.createElement('div');
      details.className = 'exp-details';
      details.innerHTML =
        '<div class="exp-details-inner pl-14 sm:pl-16 pb-4 pr-2">' +
          '<p class="mono-tag text-[11px] text-amberGlow/90 mb-1">' + e.dates + ' &middot; ' + e.place + '</p>' +
          '<p class="text-sm text-sand leading-relaxed max-w-3xl">' + e.impact + '</p>' +
        '</div>';

      row.appendChild(header);
      row.appendChild(details);

      row.addEventListener('click', function () {
        var wasOpen = row.classList.contains('is-open');
        $$('.exp-row', expList).forEach(function (r) { r.classList.remove('is-open'); });
        if (!wasOpen) row.classList.add('is-open');
        trackEvent('experience_row_toggle', { company: e.company });
      });

      expList.appendChild(row);
    });
  }

  /* ---------- 7. Tactile Editorial Capability Deck ---------- */
  var SKILL_ICONS = {
    'vba': '<svg class="w-4 h-4 draw-icon text-amberGlow shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
    'validation': '<svg class="w-4 h-4 draw-icon text-amberGlow shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
    'recon': '<svg class="w-4 h-4 draw-icon text-amberGlow shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>',
    'deploy': '<svg class="w-4 h-4 draw-icon text-amberGlow shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
    'anomaly': '<svg class="w-4 h-4 draw-icon text-amberGlow shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg>',
    'default': '<svg class="w-4 h-4 draw-icon text-amberGlow/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
  };

  var allSkills = {};
  if (S.skills && S.skills.advanced && S.skills.practitioner) {
    S.skills.advanced.forEach(function (s) { s.tier = 'Advanced Practitioner'; allSkills[s.id] = s; });
    S.skills.practitioner.forEach(function (s) { s.tier = 'Practitioner'; allSkills[s.id] = s; });

    function buildSkillPills(container, list) {
      if (!container) return;
      container.innerHTML = '';
      list.forEach(function (s) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'skill-pill';
        btn.setAttribute('data-id', s.id);
        var iconSvg = SKILL_ICONS[s.id] || SKILL_ICONS['default'];
        btn.innerHTML = iconSvg + '<span>' + s.name + '</span>';
        btn.addEventListener('click', function () {
          selectSkill(s.id);
          trackEvent('skill_select', { skill: s.name });
        });
        btn.addEventListener('pointerenter', function () {
          if (window.innerWidth >= 1024) selectSkill(s.id);
        });
        container.appendChild(btn);
      });
    }

    function selectSkill(id) {
      $$('.skill-pill').forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-id') === id);
      });
      var s = allSkills[id], panel = $('#skillPanel');
      if (!s || !panel) return;
      var adv = s.tier === 'Advanced Practitioner';
      panel.style.transform = 'scale(0.985)';
      setTimeout(function () { panel.style.transform = 'scale(1)'; }, 120);

      panel.innerHTML =
        '<div class="flex items-center justify-between gap-2 mb-4">' +
          '<span class="mono-tag px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ' +
            (adv ? 'bg-amberGlow/15 border border-amberGlow/35 text-amberGlow' : 'bg-white/5 border border-white/10 text-sand') + '">' + s.tier + '</span>' +
          '<span class="mono-tag text-[11px] text-sand/60">Capability Proof</span>' +
        '</div>' +
        '<h3 class="font-editorial text-2xl md:text-3xl text-ivory mb-3">' + s.name + '</h3>' +
        '<p class="text-sand text-sm md:text-base leading-relaxed mb-6">' + s.summary + '</p>' +
        '<div class="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">' +
          '<span class="mono-tag text-xs text-sand">Verified in:</span>' +
          '<div class="flex flex-wrap gap-3">' +
            s.proof.map(function (p) {
              var jumpMap = { '#pepsico': 'pepsico', '#flyrank': 'flyrank', '#outfield': 'outfield', '#also-built': 'agents' };
              var exKey = jumpMap[p.href] || '';
              return '<a class="text-sm font-semibold text-amberGlow hover:text-ivory transition" ' +
                (exKey ? 'data-skill-exhibit="' + exKey + '" href="#projects"' : 'href="' + p.href + '"') + '>' + p.label + ' &rarr;</a>';
            }).join('') +
          '</div>' +
        '</div>';

      $$('[data-skill-exhibit]', panel).forEach(function (a) {
        a.addEventListener('click', function () {
          renderExhibitStage(a.getAttribute('data-skill-exhibit'), 0);
        });
      });
    }

    buildSkillPills($('#clusterA'), S.skills.advanced);
    buildSkillPills($('#clusterP'), S.skills.practitioner);
    selectSkill(S.skills.advanced[0].id);
  }

  bindWarmGlassHover();

  /* ---------- 8. PDF.js Setup & Frameless Certificate Renderer ---------- */
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

  /* ---------- 9. Certificates: Pure Unbordered Gliding Rows ---------- */
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
          '<div class="cert-fallback absolute inset-0 flex flex-col justify-between p-6 bg-[#FAF6F0] text-obsidian rounded-[6px]">' +
            '<div class="flex items-center justify-between border-b border-black/10 pb-2">' +
              '<span class="mono-tag text-[9px] tracking-widest uppercase text-obsidian/60 font-bold">Anthropic</span>' +
              '<span class="mono-tag text-[9px] text-obsidian/50">Verified</span>' +
            '</div>' +
            '<div class="my-auto py-2 text-left">' +
              '<p class="font-editorial font-semibold text-obsidian text-sm leading-snug">' + c.title + '</p>' +
              '<p class="text-[11px] text-obsidian/60 mt-1">Maaz Khan</p>' +
            '</div>' +
            '<div class="text-[9px] mono-tag text-obsidian/50 text-right">Certificate of Completion</div>' +
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

  /* ---------- 10. Frameless Fluid FLIP Lightbox Controller ---------- */
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
        lightboxCard.style.transition = 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)';
        lightboxCard.style.transform = 'translate3d(0, 0, 0) scale(1)';
      });
    });
  }

  function closeCertModal() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    zoomLevel = 1;
    if (modalCanvas) modalCanvas.style.transform = 'scale(1)';
    var flip = computeFlipDelta(activeOriginCard);
    lightboxCard.style.transition = 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)';
    lightboxCard.style.transform = 'translate3d(' + flip.dx + 'px, ' + flip.dy + 'px, 0) scale(' + flip.scale + ')';
    lightbox.classList.remove('is-open');
    activeOriginCard = null;
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target !== modalCanvas) {
        closeCertModal();
      }
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

  /* ---------- 11. About & Contact ---------- */
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
      el.className = 'text-sand leading-relaxed';
      el.textContent = p;
      storyEl.appendChild(el);
    });
  }
  var fig = $('#aboutPhoto');
  if (fig) {
    var photo = loadImage('headshot', function (bad) { bad.remove(); });
    photo.className = 'w-full h-full object-cover';
    photo.onload = function () { fig.appendChild(photo); fig.classList.remove('hidden'); };
  }

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
