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

  /* ---------- 2. Cursor Follower & Magnetic CTA Physics ---------- */
  var cursorHalo = $('#cursorHalo');
  var cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
  var haloX = cursorX, haloY = cursorY;

  window.addEventListener('pointermove', function (e) {
    cursorX = e.clientX;
    cursorY = e.clientY;
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

  /* ---------- 3. TechText Interactive Hero Engine ("Maaz Khan.") ---------- */
  (function initTechText() {
    var wrap = $('#techTextWrap');
    var canvas = $('#techTextCanvas');
    if (!wrap || !canvas) return;

    var ctx = canvas.getContext('2d');
    var width = 0, height = 0, dpr = 1;
    var pointer = { x: -9999, y: -9999, down: false, dragX: 0, dragY: 0 };
    var springOffset = { x: 0, y: 0, vx: 0, vy: 0 };
    var kickEnergy = 0;
    var sweepX = -200;
    var specks = [];

    // Create 18 reactive technical specks & plus markers around the text
    for (var i = 0; i < 18; i++) {
      specks.push({
        rx: (i / 18) * 0.88 + 0.04,
        ry: 0.18 + (i % 3) * 0.32,
        ox: 0, oy: 0, vx: 0, vy: 0,
        isPlus: i % 3 === 0
      });
    }

    function resizeTechText() {
      var rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(300, rect.width);
      height = Math.max(80, rect.height);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeTechText();
    window.addEventListener('resize', resizeTechText);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(resizeTechText);
    }

    wrap.addEventListener('pointermove', function (e) {
      var r = wrap.getBoundingClientRect();
      var nx = e.clientX - r.left;
      var ny = e.clientY - r.top;
      if (pointer.down) {
        springOffset.vx += (nx - pointer.x) * 0.18;
        springOffset.vy += (ny - pointer.y) * 0.18;
      }
      pointer.x = nx;
      pointer.y = ny;
    });

    wrap.addEventListener('pointerleave', function () {
      pointer.x = -9999;
      pointer.y = -9999;
      pointer.down = false;
    });

    wrap.addEventListener('pointerdown', function (e) {
      pointer.down = true;
      // clickKick impulse
      kickEnergy = 18;
      sweepX = 0;
      specks.forEach(function (sp) {
        var sx = sp.rx * width;
        var sy = sp.ry * height;
        var ang = Math.atan2(sy - pointer.y, sx - pointer.x);
        sp.vx += Math.cos(ang) * 11;
        sp.vy += Math.sin(ang) * 11;
      });
    });

    window.addEventListener('pointerup', function () { pointer.down = false; });

    function renderTechText() {
      ctx.clearRect(0, 0, width, height);

      // Spring bounce physics (bounce = 0.4, softness = 0.7)
      springOffset.vx += (-springOffset.x) * 0.12;
      springOffset.vy += (-springOffset.y) * 0.12;
      springOffset.vx *= 0.82;
      springOffset.vy *= 0.82;
      springOffset.x += springOffset.vx;
      springOffset.y += springOffset.vy;

      kickEnergy *= 0.88;
      sweepX += 6;
      if (sweepX > width + 300) sweepX = -400;

      var fontSize = Math.min(height * 0.78, width * 0.155);
      ctx.font = '600 ' + fontSize.toFixed(0) + 'px Fraunces, Georgia, serif';
      ctx.textBaseline = 'middle';

      var text = 'Maaz Khan';
      var dot = '.';
      var baseX = 4 + springOffset.x;
      var baseY = height * 0.54 + springOffset.y;

      // Compute cursor reach repulsion (reach = 200)
      var dxCur = pointer.x - (width * 0.35);
      var dyCur = pointer.y - baseY;
      var distCur = Math.sqrt(dxCur * dxCur + dyCur * dyCur);
      var reachPullX = distCur < 200 ? (dxCur / 200) * 6 : 0;
      var reachPullY = distCur < 200 ? (dyCur / 200) * 4 : 0;

      // 1. Solid Sculpted Fill
      ctx.fillStyle = '#FAF6F0';
      ctx.fillText(text, baseX - reachPullX * 0.4, baseY - reachPullY * 0.4);
      var textW = ctx.measureText(text).width;
      ctx.fillStyle = '#D9463E';
      ctx.fillText(dot, baseX + textW - reachPullX * 0.4, baseY - reachPullY * 0.4);

      // 2. TechText Dashed Contour Layer (dashLength = 4, dashGap = 2, strokeWidth = 1.5)
      var contourShiftX = reachPullX + (Math.random() - 0.5) * kickEnergy;
      var contourShiftY = reachPullY + (Math.random() - 0.5) * kickEnergy;
      ctx.save();
      ctx.setLineDash([4, 2]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(232, 93, 84, 0.72)';
      ctx.strokeText(text + dot, baseX + contourShiftX, baseY + contourShiftY);
      ctx.restore();

      // 3. Sweep Shimmer Highlight
      if (sweepX > -200 && sweepX < width + 200) {
        ctx.save();
        var grad = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, 0);
        grad.addColorStop(0, 'rgba(217, 70, 62, 0)');
        grad.addColorStop(0.5, 'rgba(240, 117, 108, 0.95)');
        grad.addColorStop(1, 'rgba(217, 70, 62, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.strokeText(text + dot, baseX, baseY);
        ctx.restore();
      }

      // 4. Specks, Plus Markers & Telemetry Labels
      specks.forEach(function (sp, idx) {
        var homeX = sp.rx * Math.min(width * 0.9, textW + 40);
        var homeY = sp.ry * height;
        var curX = homeX + sp.ox;
        var curY = homeY + sp.oy;

        var dmx = curX - pointer.x;
        var dmy = curY - pointer.y;
        var dm = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dm < 200 && dm > 1) {
          var force = ((200 - dm) / 200) * 1.6;
          sp.vx += (dmx / dm) * force;
          sp.vy += (dmy / dm) * force;
        }

        sp.vx += (-sp.ox) * 0.08;
        sp.vy += (-sp.oy) * 0.08;
        sp.vx *= 0.84;
        sp.vy *= 0.84;
        sp.ox += sp.vx;
        sp.oy += sp.vy;

        var fx = homeX + sp.ox;
        var fy = homeY + sp.oy;

        ctx.strokeStyle = 'rgba(232, 93, 84, 0.55)';
        ctx.fillStyle = 'rgba(250, 246, 240, 0.75)';
        if (sp.isPlus) {
          ctx.beginPath();
          ctx.moveTo(fx - 3.5, fy); ctx.lineTo(fx + 3.5, fy);
          ctx.moveTo(fx, fy - 3.5); ctx.lineTo(fx, fy + 3.5);
          ctx.stroke();
        } else {
          ctx.fillRect(fx - 1.5, fy - 1.5, 3, 3);
        }

        // Telemetry label when cursor is within reach
        if (dm < 130 && idx % 4 === 0) {
          ctx.save();
          ctx.font = '500 10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#F0756C';
          ctx.fillText('[' + Math.round(fx) + ':' + Math.round(fy) + ']', fx + 6, fy - 6);
          ctx.restore();
        }
      });

      requestAnimationFrame(renderTechText);
    }
    requestAnimationFrame(renderTechText);
  })();

  /* ---------- 4. Scroll-Driven Background Line Streaks + AeroShards + Color Swapping ---------- */
  (function initScrollDrivenStreaksAndColorSwap() {
    var canvas = $('#bgCanvas');
    if (!canvas || !window.THREE) return;

    try {
      var THREE = window.THREE;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 34);

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      var streakGroup = new THREE.Group();
      scene.add(streakGroup);

      // 28 Architectural Streaks positioned in an outer aperture so center/left reading areas stay crystal clear
      var STREAK_COUNT = 28;
      var SEGMENTS = 44;
      var streaks = [];

      var colorCrimson = new THREE.Color('#D9463E');
      var colorRose = new THREE.Color('#F0756C');
      var colorIvory = new THREE.Color('#FAF6F0');

      for (var i = 0; i < STREAK_COUNT; i++) {
        var geo = new THREE.BufferGeometry();
        var positions = new Float32Array(SEGMENTS * 3);
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        var mat = new THREE.LineBasicMaterial({
          color: i % 2 === 0 ? colorCrimson.clone() : colorRose.clone(),
          transparent: true,
          opacity: 0.24 + (i % 5) * 0.04
        });

        var line = new THREE.Line(geo, mat);
        streakGroup.add(line);

        streaks.push({
          line: line,
          geo: geo,
          mat: mat,
          index: i,
          angleOffset: (i / STREAK_COUNT) * Math.PI * 2,
          radiusBase: 10.5 + (i % 6) * 1.9
        });
      }

      // AeroShards Plus Markers ('+') in 3D space
      var plusCanvas = document.createElement('canvas');
      plusCanvas.width = 32; plusCanvas.height = 32;
      var pCtx = plusCanvas.getContext('2d');
      pCtx.strokeStyle = '#F0756C';
      pCtx.lineWidth = 2.2;
      pCtx.beginPath();
      pCtx.moveTo(16, 6); pCtx.lineTo(16, 26);
      pCtx.moveTo(6, 16); pCtx.lineTo(26, 16);
      pCtx.stroke();
      var plusTex = new THREE.CanvasTexture(plusCanvas);

      var shardCount = 90;
      var shardPos = new Float32Array(shardCount * 3);
      var shardHome = new Float32Array(shardCount * 3);
      for (var s = 0; s < shardCount; s++) {
        var sa = (s / shardCount) * Math.PI * 2;
        var sr = 12 + Math.random() * 14;
        shardHome[s * 3] = Math.cos(sa) * sr + 4;
        shardHome[s * 3 + 1] = (Math.random() - 0.5) * 32;
        shardHome[s * 3 + 2] = (Math.random() - 0.5) * 14;
        shardPos[s * 3] = shardHome[s * 3];
        shardPos[s * 3 + 1] = shardHome[s * 3 + 1];
        shardPos[s * 3 + 2] = shardHome[s * 3 + 2];
      }
      var shardGeo = new THREE.BufferGeometry();
      shardGeo.setAttribute('position', new THREE.BufferAttribute(shardPos, 3));
      var shardMat = new THREE.PointsMaterial({
        size: 0.75,
        map: plusTex,
        transparent: true,
        opacity: 0.38,
        depthWrite: false
      });
      var shardPoints = new THREE.Points(shardGeo, shardMat);
      streakGroup.add(shardPoints);

      var targetScroll = 0;
      var currentScroll = 0;
      var targetColorSwap = 0; // 0 = Crimson Streaks / Ivory Headings; 1 = Ivory Streaks / Crimson Headings
      var currentColorSwap = 0;
      var gatherStrength = 0;
      var isHolding = false;
      var pulseWave = 0;
      var needsRender = true;

      function updateGeometryAtScroll(scrollVal, swapVal) {
        // Widen and rotate purely as a function of scroll progress
        var widenFactor = 1.0 + scrollVal * 1.65 + pulseWave * 0.35 - gatherStrength * 0.45;
        streakGroup.rotation.z = scrollVal * Math.PI * 1.45;
        streakGroup.rotation.y = scrollVal * Math.PI * 0.85;
        streakGroup.position.x = 4.2 - scrollVal * 2.4;

        // Interpolate streak color between Soft Deep Red (#D9463E) and Warm Ivory (#FAF6F0)
        var blendedPrimary = colorCrimson.clone().lerp(colorIvory, swapVal);
        var blendedSecondary = colorRose.clone().lerp(colorCrimson, swapVal);

        streaks.forEach(function (st) {
          st.mat.color.copy(st.index % 2 === 0 ? blendedPrimary : blendedSecondary);
          var pos = st.geo.attributes.position.array;
          var baseA = st.angleOffset;
          var r = st.radiusBase * widenFactor;

          for (var p = 0; p < SEGMENTS; p++) {
            var u = (p / (SEGMENTS - 1)) - 0.5; // -0.5 to 0.5
            var twist = u * (1.8 + scrollVal * 3.6);
            var a = baseA + twist;
            var localR = r * (1.0 + Math.abs(u) * scrollVal * 0.9);
            pos[p * 3] = Math.cos(a) * localR;
            pos[p * 3 + 1] = u * (34 + scrollVal * 18);
            pos[p * 3 + 2] = Math.sin(a) * localR * 0.55;
          }
          st.geo.attributes.position.needsUpdate = true;
        });

        renderer.render(scene, camera);
      }

      function tickScrollPhysics() {
        var maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
        targetScroll = Math.min(1, Math.max(0, window.scrollY / maxScroll));

        var diffScroll = targetScroll - currentScroll;
        var diffSwap = targetColorSwap - currentColorSwap;
        var targetGather = isHolding ? 1 : 0;
        var diffGather = targetGather - gatherStrength;

        // Only animate when scrolling, swapping colors, or holding/clicking (100% still when idle!)
        if (Math.abs(diffScroll) > 0.0002 || Math.abs(diffSwap) > 0.002 || Math.abs(diffGather) > 0.005 || pulseWave > 0.005 || needsRender) {
          currentScroll += diffScroll * 0.1;
          currentColorSwap += diffSwap * 0.08;
          gatherStrength += diffGather * 0.1;
          pulseWave *= 0.9;
          needsRender = false;
          updateGeometryAtScroll(currentScroll, currentColorSwap);
        }
        requestAnimationFrame(tickScrollPhysics);
      }

      // Check active section color mode on scroll & swap text + background streak colors
      var colorSections = $$('[data-color-mode]');
      function syncChapterColorSwap() {
        var vh = window.innerHeight;
        var activeMode = 'crimson-streaks';
        colorSections.forEach(function (sec) {
          var rect = sec.getBoundingClientRect();
          if (rect.top <= vh * 0.48 && rect.bottom >= vh * 0.25) {
            activeMode = sec.getAttribute('data-color-mode');
          }
        });

        if (activeMode === 'ivory-streaks') {
          targetColorSwap = 0.88;
          // Swap headings to Soft Deep Red and accents to Ivory
          document.documentElement.style.setProperty('--dyn-heading', '#F0756C');
          document.documentElement.style.setProperty('--dyn-accent', '#FAF6F0');
        } else {
          targetColorSwap = 0.0;
          // Headings in Crisp Ivory and accents in Soft Deep Red
          document.documentElement.style.setProperty('--dyn-heading', '#FAF6F0');
          document.documentElement.style.setProperty('--dyn-accent', '#E85D54');
        }
      }

      window.addEventListener('scroll', syncChapterColorSwap, { passive: true });
      window.addEventListener('mousedown', function () { isHolding = true; pulseWave = 1.0; });
      window.addEventListener('mouseup', function () { isHolding = false; });
      window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        needsRender = true;
      });

      syncChapterColorSwap();
      tickScrollPhysics();
    } catch (e) {}
  })();

  /* ---------- 5. GSAP ScrollTrigger Choreography & Mask-Split Typography ---------- */
  function initGSAPChoreography() {
    if (!window.gsap) return;
    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    if (reduce) return;

    gsap.fromTo(
      '#top .split-line',
      { yPercent: 115, rotateZ: 2, opacity: 0 },
      { yPercent: 0, rotateZ: 0, opacity: 1, duration: 1.15, stagger: 0.12, ease: 'power4.out', delay: 0.1 }
    );

    $$('.gsap-section-header').forEach(function (header) {
      var lines = $$('.split-line', header);
      if (lines.length) {
        gsap.fromTo(
          lines,
          { yPercent: 115, rotateZ: 1.5, opacity: 0 },
          {
            yPercent: 0, rotateZ: 0, opacity: 1, duration: 1.05, stagger: 0.1, ease: 'power4.out',
            scrollTrigger: { trigger: header, start: 'top 84%' }
          }
        );
      }
    });

    $$('.gsap-spread').forEach(function (spread) {
      var lines = $$('.split-line', spread);
      if (lines.length) {
        gsap.fromTo(
          lines,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.1, ease: 'power4.out',
            scrollTrigger: { trigger: spread, start: 'top 82%' }
          }
        );
      }

      gsap.fromTo(
        spread,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.0, ease: 'power3.out',
          scrollTrigger: {
            trigger: spread, start: 'top 82%',
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

    $$('.liquid-divider').forEach(function (svg) {
      var wave = $('.morph-wave', svg);
      var line = $('.morph-line', svg);
      if (wave && line && window.ScrollTrigger) {
        gsap.to([wave, line], {
          attr: { d: 'M0,80 C480,0 960,120 1440,30 L1440,120 L0,120 Z' },
          ease: 'none',
          scrollTrigger: { trigger: svg, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }
    });
  }

  /* ---------- 6. Chapter Compass & Experience Dial ---------- */
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
          (i === 0 ? 'bg-crimson text-ivory font-bold' : 'bg-white/10 text-sand hover:bg-white/20');
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
            (i === idx ? 'bg-crimson text-ivory font-bold shadow-lg' : 'bg-white/10 text-sand hover:bg-white/20');
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

  /* ---------- 7. Craft Curtains ---------- */
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
            '<span class="mono-meta text-sm swap-accent font-bold shrink-0">' + c.num + '</span>' +
            '<h3 class="curtain-title font-editorial text-2xl sm:text-4xl md:text-5xl text-ivory tracking-tight truncate">' + c.title + '</h3>' +
          '</div>' +
          '<span class="mono-meta text-xs uppercase tracking-widest swap-accent shrink-0 hidden sm:inline">Expand +</span>' +
        '</div>' +
        '<div class="curtain-drawer">' +
          '<div class="curtain-drawer-inner pl-8 sm:pl-14 pt-6 pr-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">' +
            '<div class="lg:col-span-8 space-y-2">' +
              '<h4 class="font-editorial text-xl sm:text-2xl text-ivory">' + c.headline + '</h4>' +
              '<p class="text-base sm:text-lg text-ivory/85 leading-relaxed max-w-2xl">' + c.body + '</p>' +
              '<p class="mono-meta text-xs swap-accent pt-2">' + c.tools + '</p>' +
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

  /* ---------- 8. Certificates: 3D CircularCarousel (preset="cylinder") ---------- */
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

  var cylStage = $('#certCylinderStage');
  var cylRotor = $('#certCylinderRotor');

  if (cylStage && cylRotor && Array.isArray(S.certs)) {
    var allCerts = [];
    S.certs.forEach(function (g) {
      (g.items || []).forEach(function (it) { allCerts.push(it); });
    });

    var count = allCerts.length;
    var stepDeg = 360 / count;
    var cylCards = [];

    allCerts.forEach(function (c, idx) {
      var card = document.createElement('div');
      card.className = 'cyl-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', c.title);

      card.innerHTML =
        '<div class="cyl-card-inner">' +
          '<div class="cert-fallback absolute inset-0 flex flex-col justify-between p-5 bg-[#FAF6F0] text-obsidian">' +
            '<div class="flex items-center justify-between border-b border-black/10 pb-1.5">' +
              '<span class="mono-meta text-[9px] tracking-widest uppercase text-obsidian/60 font-bold">Anthropic</span>' +
              '<span class="mono-meta text-[9px] text-obsidian/50">Verified</span>' +
            '</div>' +
            '<div class="my-auto py-1 text-left">' +
              '<p class="font-editorial font-semibold text-obsidian text-xs sm:text-sm leading-snug">' + c.title + '</p>' +
              '<p class="text-[10px] text-obsidian/60 mt-1">Maaz Khan</p>' +
            '</div>' +
            '<div class="text-[8px] mono-meta text-obsidian/50 text-right">Certificate</div>' +
          '</div>' +
          '<canvas></canvas>' +
          '<div class="cyl-shade"></div>' +
        '</div>';

      var canvas = card.querySelector('canvas');
      renderCertToCanvas(c, canvas, 340);

      card._certData = c;
      card._baseAngle = idx * stepDeg;
      card._shadeEl = card.querySelector('.cyl-shade');
      cylRotor.appendChild(card);
      cylCards.push(card);
    });

    var rotY = 0;
    var velY = 0;
    var targetSnapY = null;
    var isHovered = false;
    var isDragging = false;
    var startX = 0, lastX = 0, lastT = 0, movedDist = 0, clickedCard = null;
    var driftSpeed = -0.14; // direction="left", speed={14}

    function getRadius() {
      var cardW = window.innerWidth < 640 ? 220 : 280;
      var gap = 25;
      return Math.round(((cardW + gap) * count) / (2 * Math.PI));
    }

    cylStage.addEventListener('pointerenter', function () { isHovered = true; });
    cylStage.addEventListener('pointerleave', function () { isHovered = false; });

    cylStage.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      isDragging = true;
      targetSnapY = null;
      startX = e.clientX;
      lastX = e.clientX;
      lastT = performance.now();
      movedDist = 0;
      velY = 0;
      clickedCard = e.target.closest('.cyl-card');
      cylStage.classList.add('is-dragging');
      try { cylStage.setPointerCapture(e.pointerId); } catch (err) {}
    });

    cylStage.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      var now = performance.now();
      var dx = e.clientX - lastX;
      var dt = Math.max(now - lastT, 8);
      var degDelta = dx * 0.16;
      rotY += degDelta;
      movedDist += Math.abs(dx);
      velY = velY * 0.4 + ((degDelta / dt) * 16.67) * 0.6;
      lastX = e.clientX;
      lastT = now;
    });

    function endCylDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      cylStage.classList.remove('is-dragging');
      try { cylStage.releasePointerCapture(e.pointerId); } catch (err) {}

      // focusOnClick behavior: if clicked without dragging
      if (movedDist < 7 && clickedCard) {
        var worldDeg = ((clickedCard._baseAngle + rotY) % 360 + 360) % 360;
        if (worldDeg > 180) worldDeg -= 360;
        // If card is on the side, rotate cylinder to focus it front-and-center; if already centered, zoom open!
        if (Math.abs(worldDeg) > 14) {
          velY = 0;
          targetSnapY = rotY - worldDeg;
        } else {
          openCertModal(clickedCard._certData, clickedCard);
        }
      }
      clickedCard = null;
    }

    cylStage.addEventListener('pointerup', endCylDrag);
    cylStage.addEventListener('pointercancel', endCylDrag);

    function tickCylinder() {
      var radius = getRadius();

      if (!isDragging) {
        if (targetSnapY !== null) {
          var diff = targetSnapY - rotY;
          rotY += diff * 0.12;
          if (Math.abs(diff) < 0.15) {
            rotY = targetSnapY;
            targetSnapY = null;
          }
        } else {
          // Apply drag momentum (momentum = 0.6) + autoplay drift (pauses on hover)
          if (Math.abs(velY) > 0.02) {
            rotY += velY;
            velY *= 0.94;
            // Snap to nearest card once momentum slows down
            if (Math.abs(velY) < 0.08 && isHovered) {
              targetSnapY = Math.round(rotY / stepDeg) * stepDeg;
              velY = 0;
            }
          } else if (!isHovered && !reduce) {
            rotY += driftSpeed;
          }
        }
      }

      // Update each card's 3D cylindrical position, depthFade={0.55}, and innerShade={0.6}
      cylCards.forEach(function (card) {
        var angle = card._baseAngle + rotY;
        var rad = (angle * Math.PI) / 180;
        var cosA = Math.cos(rad); // +1 at front, -1 at back
        var depthNorm = (cosA + 1) * 0.5; // 1 at front, 0 at back

        // stretch={0.5} subtle scale enhancement at front
        var scale = 0.86 + depthNorm * 0.18;
        card.style.transform = 'rotateY(' + angle.toFixed(2) + 'deg) translateZ(' + radius + 'px) scale(' + scale.toFixed(3) + ')';

        // depthFade={0.55}
        card.style.opacity = (0.22 + depthNorm * 0.78).toFixed(3);
        card.style.zIndex = String(Math.round(depthNorm * 100));

        // innerShade={0.6}
        if (card._shadeEl) {
          card._shadeEl.style.opacity = ((1 - depthNorm) * 0.65).toFixed(3);
        }
      });

      requestAnimationFrame(tickCylinder);
    }
    requestAnimationFrame(tickCylinder);
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
      li.innerHTML = '<span class="w-2 h-2 rounded-full bg-crimson shrink-0"></span><span>' + f + '</span>';
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

  bindMagneticElements();
  initGSAPChoreography();
})();
