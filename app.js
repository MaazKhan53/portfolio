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

  /* ---------- 2. High-Refresh-Rate Cursor Follower & Magnetic CTAs ---------- */
  var cursorHalo = $('#cursorHalo');
  var cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
  var haloX = cursorX, haloY = cursorY;
  var mouseNormX = 0, mouseNormY = 0;

  window.addEventListener('pointermove', function (e) {
    cursorX = e.clientX;
    cursorY = e.clientY;
    mouseNormX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseNormY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  if (cursorHalo && !reduce) {
    (function tickCursor() {
      haloX += (cursorX - haloX) * 0.22;
      haloY += (cursorY - haloY) * 0.22;
      cursorHalo.style.transform = 'translate3d(' + haloX.toFixed(1) + 'px, ' + haloY.toFixed(1) + 'px, 0)';
      requestAnimationFrame(tickCursor);
    })();
  }

  function bindMagneticElements() {
    $$('[data-magnetic], .cta-primary, .cta-beam').forEach(function (el) {
      if (el._magBound) return;
      el._magBound = true;
      el.addEventListener('pointerenter', function () {
        if (cursorHalo) cursorHalo.classList.add('is-hovering');
      });
      el.addEventListener('pointerleave', function () {
        if (cursorHalo) cursorHalo.classList.remove('is-hovering');
        el.style.transform = 'translate3d(0px, 0px, 0px)';
      });
      el.addEventListener('pointermove', function (e) {
        if (reduce) return;
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.26;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.26;
        el.style.transform = 'translate3d(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px, 0)';
      });
    });
  }
  bindMagneticElements();

  /* ---------- 3. TechText Interactive Hero Engine (Viewport-Gated for 120fps) ---------- */
  (function initTechText() {
    var wrap = $('#techTextWrap');
    var canvas = $('#techTextCanvas');
    if (!wrap || !canvas) return;

    var ctx = canvas.getContext('2d');
    var width = 0, height = 0, dpr = 1;
    var pointer = { x: -9999, y: -9999, down: false };
    var springOffset = { x: 0, y: 0, vx: 0, vy: 0 };
    var kickEnergy = 0;
    var sweepX = -200;
    var isVisible = true;
    var specks = [];

    for (var i = 0; i < 16; i++) {
      specks.push({
        rx: (i / 16) * 0.88 + 0.04,
        ry: 0.2 + (i % 3) * 0.3,
        ox: 0, oy: 0, vx: 0, vy: 0,
        isPlus: i % 3 === 0
      });
    }

    function resizeTechText() {
      var rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(280, rect.width);
      height = Math.max(75, rect.height);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeTechText();
    window.addEventListener('resize', resizeTechText);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(resizeTechText);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
      }).observe(wrap);
    }

    wrap.addEventListener('pointermove', function (e) {
      var r = wrap.getBoundingClientRect();
      var nx = e.clientX - r.left;
      var ny = e.clientY - r.top;
      if (pointer.down) {
        springOffset.vx += (nx - pointer.x) * 0.16;
        springOffset.vy += (ny - pointer.y) * 0.16;
      }
      pointer.x = nx;
      pointer.y = ny;
    });
    wrap.addEventListener('pointerleave', function () {
      pointer.x = -9999; pointer.y = -9999; pointer.down = false;
    });
    wrap.addEventListener('pointerdown', function () {
      pointer.down = true;
      kickEnergy = 16;
      sweepX = 0;
      specks.forEach(function (sp) {
        var sx = sp.rx * width, sy = sp.ry * height;
        var ang = Math.atan2(sy - pointer.y, sx - pointer.x);
        sp.vx += Math.cos(ang) * 10;
        sp.vy += Math.sin(ang) * 10;
      });
    });
    window.addEventListener('pointerup', function () { pointer.down = false; });

    function renderTechText() {
      requestAnimationFrame(renderTechText);
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      springOffset.vx += (-springOffset.x) * 0.12;
      springOffset.vy += (-springOffset.y) * 0.12;
      springOffset.vx *= 0.82;
      springOffset.vy *= 0.82;
      springOffset.x += springOffset.vx;
      springOffset.y += springOffset.vy;

      kickEnergy *= 0.88;
      sweepX += 5.5;
      if (sweepX > width + 300) sweepX = -400;

      var fontSize = Math.min(height * 0.76, width * 0.145);
      ctx.font = '600 ' + fontSize.toFixed(0) + 'px Fraunces, Georgia, serif';
      ctx.textBaseline = 'middle';

      var text = 'Maaz Khan';
      var dot = '.';
      var baseX = 4 + springOffset.x;
      var baseY = height * 0.54 + springOffset.y;

      var dxCur = pointer.x - (width * 0.35);
      var dyCur = pointer.y - baseY;
      var distCur = Math.sqrt(dxCur * dxCur + dyCur * dyCur);
      var reachPullX = distCur < 200 ? (dxCur / 200) * 5.5 : 0;
      var reachPullY = distCur < 200 ? (dyCur / 200) * 3.5 : 0;

      ctx.fillStyle = '#FAF6F0';
      ctx.fillText(text, baseX - reachPullX * 0.35, baseY - reachPullY * 0.35);
      var textW = ctx.measureText(text).width;
      ctx.fillStyle = '#D9463E';
      ctx.fillText(dot, baseX + textW - reachPullX * 0.35, baseY - reachPullY * 0.35);

      var contourShiftX = reachPullX + (Math.random() - 0.5) * kickEnergy;
      var contourShiftY = reachPullY + (Math.random() - 0.5) * kickEnergy;
      ctx.save();
      ctx.setLineDash([4, 2]);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(232, 93, 84, 0.7)';
      ctx.strokeText(text + dot, baseX + contourShiftX, baseY + contourShiftY);
      ctx.restore();

      if (sweepX > -150 && sweepX < width + 150) {
        ctx.save();
        var grad = ctx.createLinearGradient(sweepX - 70, 0, sweepX + 70, 0);
        grad.addColorStop(0, 'rgba(217, 70, 62, 0)');
        grad.addColorStop(0.5, 'rgba(240, 117, 108, 0.92)');
        grad.addColorStop(1, 'rgba(217, 70, 62, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.strokeText(text + dot, baseX, baseY);
        ctx.restore();
      }

      specks.forEach(function (sp, idx) {
        var homeX = sp.rx * Math.min(width * 0.9, textW + 36);
        var homeY = sp.ry * height;
        var curX = homeX + sp.ox, curY = homeY + sp.oy;
        var dmx = curX - pointer.x, dmy = curY - pointer.y;
        var dm = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dm < 190 && dm > 1) {
          var force = ((190 - dm) / 190) * 1.4;
          sp.vx += (dmx / dm) * force;
          sp.vy += (dmy / dm) * force;
        }
        sp.vx += (-sp.ox) * 0.08;
        sp.vy += (-sp.oy) * 0.08;
        sp.vx *= 0.84;
        sp.vy *= 0.84;
        sp.ox += sp.vx;
        sp.oy += sp.vy;

        var fx = homeX + sp.ox, fy = homeY + sp.oy;
        ctx.strokeStyle = 'rgba(232, 93, 84, 0.55)';
        ctx.fillStyle = 'rgba(250, 246, 240, 0.75)';
        if (sp.isPlus) {
          ctx.beginPath();
          ctx.moveTo(fx - 3, fy); ctx.lineTo(fx + 3, fy);
          ctx.moveTo(fx, fy - 3); ctx.lineTo(fx, fy + 3);
          ctx.stroke();
        } else {
          ctx.fillRect(fx - 1.5, fy - 1.5, 3, 3);
        }
        if (dm < 120 && idx % 4 === 0) {
          ctx.font = '500 9.5px "JetBrains Mono", monospace';
          ctx.fillStyle = '#F0756C';
          ctx.fillText('[' + Math.round(fx) + ':' + Math.round(fy) + ']', fx + 5, fy - 5);
        }
      });
    }
    requestAnimationFrame(renderTechText);
  })();

  /* ---------- 4. Combined 3D AeroShards + Scroll-Driven Line Streaks (#bgCanvas) ---------- */
  (function initAeroShardsAndLineStreaks() {
    var canvas = $('#bgCanvas');
    if (!canvas || !window.THREE) return;

    try {
      var THREE = window.THREE;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 34);

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

      // Lighting for Glass/Crystal AeroShards
      var ambLight = new THREE.AmbientLight(0x240c0f, 1.6);
      scene.add(ambLight);
      var dirLight1 = new THREE.DirectionalLight(0xd9463e, 2.8);
      dirLight1.position.set(15, 20, 18);
      scene.add(dirLight1);
      var dirLight2 = new THREE.DirectionalLight(0xfaf6f0, 1.6);
      dirLight2.position.set(-18, -12, 14);
      scene.add(dirLight2);

      var masterGroup = new THREE.Group();
      scene.add(masterGroup);

      var colorCrimson = new THREE.Color('#D9463E');
      var colorRose = new THREE.Color('#F0756C');
      var colorIvory = new THREE.Color('#FAF6F0');

      // A. 28 Dynamic Scroll-Driven Line Streaks
      var STREAK_COUNT = 28;
      var SEGMENTS = 40;
      var streaks = [];

      for (var i = 0; i < STREAK_COUNT; i++) {
        var geo = new THREE.BufferGeometry();
        var positions = new Float32Array(SEGMENTS * 3);
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        var mat = new THREE.LineBasicMaterial({
          color: i % 2 === 0 ? colorCrimson.clone() : colorRose.clone(),
          transparent: true,
          opacity: 0.25 + (i % 5) * 0.04
        });
        var line = new THREE.Line(geo, mat);
        masterGroup.add(line);
        streaks.push({
          geo: geo,
          mat: mat,
          index: i,
          angleOffset: (i / STREAK_COUNT) * Math.PI * 2,
          radiusBase: 10.0 + (i % 6) * 1.85
        });
      }

      // B. 420 Faceted 3D AeroShards (InstancedMesh for Locked 120fps)
      var SHARD_COUNT = window.innerWidth < 640 ? 220 : 420;
      var shardGeo = new THREE.OctahedronGeometry(0.42, 0);
      // Stretch into sharp aerodynamic crystal shards
      shardGeo.scale(0.55, 2.1, 0.35);

      var shardMat = new THREE.MeshPhysicalMaterial({
        color: 0xd9463e,
        emissive: 0x3a090d,
        roughness: 0.18,
        metalness: 0.35,
        transmission: 0.45,
        transparent: true,
        opacity: 0.82,
        flatShading: true
      });

      var shardMesh = new THREE.InstancedMesh(shardGeo, shardMat, SHARD_COUNT);
      masterGroup.add(shardMesh);

      var shardData = [];
      var dummy = new THREE.Object3D();
      for (var s = 0; s < SHARD_COUNT; s++) {
        var u = (s / SHARD_COUNT) - 0.5;
        var angle = (s * 0.38) % (Math.PI * 2);
        var rad = 9.0 + (s % 9) * 1.8;
        shardData.push({
          u: u,
          angle: angle,
          rad: rad,
          rotX: Math.random() * Math.PI,
          rotY: Math.random() * Math.PI,
          rotZ: Math.random() * Math.PI,
          scale: 0.55 + (s % 5) * 0.22
        });
      }

      // C. 120 '+' Precision Markers (markers="plus")
      var plusCanvas = document.createElement('canvas');
      plusCanvas.width = 32; plusCanvas.height = 32;
      var pCtx = plusCanvas.getContext('2d');
      pCtx.strokeStyle = '#F0756C';
      pCtx.lineWidth = 2.4;
      pCtx.beginPath();
      pCtx.moveTo(16, 6); pCtx.lineTo(16, 26);
      pCtx.moveTo(6, 16); pCtx.lineTo(26, 16);
      pCtx.stroke();
      var plusTex = new THREE.CanvasTexture(plusCanvas);

      var plusCount = 120;
      var plusPos = new Float32Array(plusCount * 3);
      for (var k = 0; k < plusCount; k++) {
        var pa = (k / plusCount) * Math.PI * 2;
        var pr = 11 + (k % 7) * 2.2;
        plusPos[k * 3] = Math.cos(pa) * pr;
        plusPos[k * 3 + 1] = ((k / plusCount) - 0.5) * 38;
        plusPos[k * 3 + 2] = Math.sin(pa) * pr * 0.55;
      }
      var plusGeo = new THREE.BufferGeometry();
      plusGeo.setAttribute('position', new THREE.BufferAttribute(plusPos, 3));
      var plusMat = new THREE.PointsMaterial({
        size: 0.72,
        map: plusTex,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      });
      masterGroup.add(new THREE.Points(plusGeo, plusMat));

      // State variables for intro, scroll, mouse, click pulse, and holdToGather
      var introProgress = 0.05; // intro animation 0 -> 1
      var targetScroll = 0, currentScroll = 0;
      var targetColorSwap = 0, currentColorSwap = 0;
      var curMouseX = 0, curMouseY = 0;
      var gatherStrength = 0, isHolding = false, pulseWave = 0;
      var forceRender = true;

      function updateSceneGeometry(scrollVal, swapVal, introVal) {
        var widen = (0.3 + introVal * 0.7) * (1.0 + scrollVal * 1.55 + pulseWave * 0.4 - gatherStrength * 0.48);

        masterGroup.rotation.z = scrollVal * Math.PI * 1.4 + curMouseX * 0.08;
        masterGroup.rotation.y = scrollVal * Math.PI * 0.85 + curMouseX * 0.14;
        masterGroup.rotation.x = -curMouseY * 0.1;
        masterGroup.position.x = 4.0 - scrollVal * 2.2;

        // Swap colors between Soft Deep Red and Warm Ivory across sections
        var primaryCol = colorCrimson.clone().lerp(colorIvory, swapVal);
        var secondaryCol = colorRose.clone().lerp(colorCrimson, swapVal);
        shardMat.color.copy(primaryCol);

        // Update 28 Line Streaks in-place
        for (var i = 0; i < STREAK_COUNT; i++) {
          var st = streaks[i];
          st.mat.color.copy(i % 2 === 0 ? primaryCol : secondaryCol);
          var pos = st.geo.attributes.position.array;
          var baseA = st.angleOffset;
          var r = st.radiusBase * widen;

          for (var p = 0; p < SEGMENTS; p++) {
            var u = (p / (SEGMENTS - 1)) - 0.5;
            var twist = u * (1.8 + scrollVal * 3.6);
            var a = baseA + twist;
            var localR = r * (1.0 + Math.abs(u) * scrollVal * 0.85);
            pos[p * 3] = Math.cos(a) * localR;
            pos[p * 3 + 1] = u * (34 + scrollVal * 18) * introVal;
            pos[p * 3 + 2] = Math.sin(a) * localR * 0.55;
          }
          st.geo.attributes.position.needsUpdate = true;
        }

        // Update 420 3D AeroShards along the twisting streams
        for (var s = 0; s < SHARD_COUNT; s++) {
          var d = shardData[s];
          var twistS = d.u * (2.0 + scrollVal * 4.0);
          var aS = d.angle + twistS + scrollVal * 2.2;
          var rS = d.rad * widen * (1.0 + Math.abs(d.u) * scrollVal * 0.65);

          var sx = Math.cos(aS) * rS;
          var sy = d.u * (36 + scrollVal * 16) * introVal;
          var sz = Math.sin(aS) * rS * 0.6;

          // Mouse parallax & holdToGather pull
          if (gatherStrength > 0.01) {
            sx = sx * (1 - gatherStrength * 0.55) + curMouseX * 8 * gatherStrength;
            sy = sy * (1 - gatherStrength * 0.55) - curMouseY * 6 * gatherStrength;
          }

          dummy.position.set(sx, sy, sz);
          dummy.rotation.set(
            d.rotX + scrollVal * 3.2 + curMouseY * 0.3,
            d.rotY + scrollVal * 2.6 + curMouseX * 0.3,
            d.rotZ + aS
          );
          var sc = d.scale * introVal * (1 + pulseWave * 0.35);
          dummy.scale.set(sc, sc, sc);
          dummy.updateMatrix();
          shardMesh.setMatrixAt(s, dummy.matrix);
        }
        shardMesh.instanceMatrix.needsUpdate = true;

        renderer.render(scene, camera);
      }

      function tickBackground() {
        requestAnimationFrame(tickBackground);

        var maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
        targetScroll = Math.min(1, Math.max(0, window.scrollY / maxScroll));

        if (introProgress < 0.999) {
          introProgress += (1 - introProgress) * 0.06;
        } else {
          introProgress = 1;
        }

        var dScroll = targetScroll - currentScroll;
        var dSwap = targetColorSwap - currentColorSwap;
        var dMouseX = mouseNormX - curMouseX;
        var dMouseY = mouseNormY - curMouseY;
        var dGather = (isHolding ? 1 : 0) - gatherStrength;

        // Render only when scrolling, intro-animating, moving cursor, pulsing, or holding
        if (
          introProgress < 1 ||
          Math.abs(dScroll) > 0.00015 ||
          Math.abs(dSwap) > 0.002 ||
          Math.abs(dMouseX) > 0.002 ||
          Math.abs(dMouseY) > 0.002 ||
          Math.abs(dGather) > 0.004 ||
          pulseWave > 0.004 ||
          forceRender
        ) {
          currentScroll += dScroll * 0.11;
          currentColorSwap += dSwap * 0.08;
          curMouseX += dMouseX * 0.08;
          curMouseY += dMouseY * 0.08;
          gatherStrength += dGather * 0.1;
          pulseWave *= 0.88;
          forceRender = false;
          updateSceneGeometry(currentScroll, currentColorSwap, introProgress);
        }
      }

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
          targetColorSwap = 0.85;
          document.documentElement.style.setProperty('--dyn-heading', '#F0756C');
          document.documentElement.style.setProperty('--dyn-accent', '#FAF6F0');
        } else {
          targetColorSwap = 0.0;
          document.documentElement.style.setProperty('--dyn-heading', '#FAF6F0');
          document.documentElement.style.setProperty('--dyn-accent', '#E85D54');
        }
      }

      window.addEventListener('scroll', syncChapterColorSwap, { passive: true });
      window.addEventListener('pointerdown', function () { isHolding = true; pulseWave = 1.0; });
      window.addEventListener('pointerup', function () { isHolding = false; });
      window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        forceRender = true;
      });

      syncChapterColorSwap();
      tickBackground();
    } catch (e) {}
  })();

  /* ---------- 5. RubberSegment Component (stretch={100}, squash={3}, glide={75}, draggable) ---------- */
  (function initRubberSegment() {
    var seg = $('#pepsicoRubberSegment');
    var thumb = $('#pepsicoRubberThumb');
    if (!seg || !thumb) return;

    var slots = $$('.rubber-slot', seg);
    var valEl = $('#pepsicoDynamicVal');
    var unitEl = $('#pepsicoDynamicUnit');
    var subEl = $('#pepsicoDynamicSub');
    var beforeEl = $('#pepsicoBeforeLabel');
    var afterEl = $('#pepsicoAfterLabel');

    var PERIOD_DATA = {
      Day:   { val: '2.7',   unit: 'hrs / day', sub: '1.5 hrs saved in GTM + 1.2 hrs saved in Tax every workday', before: '1.2 Hours / day', after: '8 Seconds' },
      Week:  { val: '14.8',  unit: 'hrs / wk',  sub: '8.25 hrs saved in GTM + 6.6 hrs saved in Tax every week',   before: '6.5 Hours / wk',  after: '48 Seconds' },
      Month: { val: '59.4',  unit: 'hrs / mo',  sub: '33 hrs saved in Go-To-Market + 26.4 hrs saved in Tax every month', before: '26 Hours / mo', after: '192 Seconds' },
      Year:  { val: '712.8', unit: 'hrs / yr',  sub: 'Over 17 full work-weeks returned to PepsiCo every year',    before: '312 Hours / yr',  after: '38 Minutes / yr' }
    };

    var activeIdx = 2; // Default "Month"
    var thumbX = 200; // in percent (0%, 100%, 200%, 300%)
    var targetX = 200;
    var velX = 0;
    var dragging = false;

    function selectSlot(idx) {
      activeIdx = Math.max(0, Math.min(3, idx));
      targetX = activeIdx * 100;
      slots.forEach(function (s, i) {
        s.classList.toggle('is-active', i === activeIdx);
      });
      var period = slots[activeIdx].getAttribute('data-period');
      var d = PERIOD_DATA[period];
      if (d && valEl) {
        valEl.textContent = d.val;
        unitEl.textContent = d.unit;
        subEl.textContent = d.sub;
        beforeEl.textContent = d.before;
        afterEl.textContent = d.after;
      }
      trackEvent('rubber_segment_change', { period: period });
    }

    slots.forEach(function (s, idx) {
      s.addEventListener('click', function () { selectSlot(idx); });
    });

    seg.addEventListener('pointerdown', function (e) {
      dragging = true;
      try { seg.setPointerCapture(e.pointerId); } catch (err) {}
    });
    seg.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var r = seg.getBoundingClientRect();
      var rel = Math.max(0, Math.min(0.999, (e.clientX - r.left) / r.width));
      targetX = rel * 300;
    });
    function endRubberDrag(e) {
      if (!dragging) return;
      dragging = false;
      try { seg.releasePointerCapture(e.pointerId); } catch (err) {}
      var r = seg.getBoundingClientRect();
      var rel = Math.max(0, Math.min(0.999, (e.clientX - r.left) / r.width));
      selectSlot(Math.floor(rel * 4));
    }
    seg.addEventListener('pointerup', endRubberDrag);
    seg.addEventListener('pointercancel', endRubberDrag);

    function tickRubber() {
      var diff = targetX - thumbX;
      if (Math.abs(diff) > 0.05 || Math.abs(velX) > 0.05) {
        velX = velX * 0.72 + diff * 0.18;
        thumbX += velX;
        // Elastic stretch={100} and squash={3} proportional to velocity
        var speed = Math.min(1, Math.abs(velX) / 28);
        var scaleX = 1 + speed * 0.34;
        var scaleY = 1 - speed * 0.14;
        thumb.style.transform = 'translate3d(' + thumbX.toFixed(2) + '%, 0, 0) scale(' + scaleX.toFixed(3) + ', ' + scaleY.toFixed(3) + ')';
      } else {
        thumb.style.transform = 'translate3d(' + targetX + '%, 0, 0) scale(1, 1)';
      }
      requestAnimationFrame(tickRubber);
    }
    requestAnimationFrame(tickRubber);
  })();

  /* ---------- 6. Experience: FlexCarousel (preset="liquid", intro="rise", captureWheel) ---------- */
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

  (function initFlexCarousel() {
    var stage = $('#flexCarouselStage');
    var track = $('#flexCarouselTrack');
    if (!stage || !track || !Array.isArray(S.experience) || !S.experience.length) return;

    var items = S.experience;
    var count = items.length;
    var cards = [];
    var currentIndex = 0;
    var smoothIndex = 0;
    var introDone = false;

    var capIndex = $('#flexCapIndex');
    var capDates = $('#flexCapDates');
    var capPlace = $('#flexCapPlace');
    var capTitle = $('#flexCapTitle');
    var capImpact = $('#flexCapImpact');

    items.forEach(function (e, i) {
      var card = document.createElement('article');
      card.className = 'flex-liquid-card' + (i === 0 ? ' is-focused' : '');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      var logoBox = document.createElement('div');
      logoBox.className = 'flex-logo-box';
      var img = loadImage('logos/' + e.key, function (bad) {
        bad.remove();
        logoBox.innerHTML = '<span class="font-editorial text-xl font-bold text-obsidian">' + initials(e.company) + '</span>';
      });
      img.className = 'w-full h-full object-contain';
      logoBox.appendChild(img);

      var topRow = document.createElement('div');
      topRow.className = 'flex items-start justify-between gap-3';
      topRow.appendChild(logoBox);

      var numBadge = document.createElement('span');
      numBadge.className = 'mono-meta text-xs text-roseSoft font-semibold';
      numBadge.textContent = '0' + (i + 1);
      topRow.appendChild(numBadge);

      var bottomInfo = document.createElement('div');
      bottomInfo.innerHTML =
        '<p class="mono-meta text-[10px] uppercase tracking-widest text-sand/75 mb-1">' + e.dates + '</p>' +
        '<h3 class="font-editorial text-2xl text-ivory leading-tight">' + e.company + '</h3>' +
        '<p class="text-xs sm:text-sm text-roseSoft font-medium mt-1 line-clamp-2">' + e.role + '</p>';

      card.appendChild(topRow);
      card.appendChild(bottomInfo);

      card.addEventListener('click', function () {
        setFlexFocus(i);
        trackEvent('flex_carousel_select', { company: e.company });
      });

      track.appendChild(card);
      cards.push(card);
    });

    function setFlexFocus(idx) {
      currentIndex = Math.max(0, Math.min(count - 1, idx));
      cards.forEach(function (c, i) {
        c.classList.toggle('is-focused', i === currentIndex);
      });
      var item = items[currentIndex];
      if (item && capTitle) {
        capIndex.textContent = '0' + (currentIndex + 1) + ' / 0' + count;
        capDates.textContent = item.dates;
        capPlace.textContent = item.place + (item.ongoing ? ' · Ongoing' : '');
        capTitle.textContent = item.company + ' — ' + item.role;
        capImpact.textContent = item.impact;
      }
    }

    // Trigger intro="rise" staggered entrance when #experience scrolls into view
    if ('IntersectionObserver' in window) {
      var expObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !introDone) {
          introDone = true;
          cards.forEach(function (c, i) {
            setTimeout(function () {
              c.style.opacity = '1';
              c._risen = true;
            }, i * 65);
          });
        }
      }, { threshold: 0.18 });
      expObserver.observe(stage);
    } else {
      introDone = true;
      cards.forEach(function (c) { c.style.opacity = '1'; c._risen = true; });
    }

    // captureWheel: step smoothly through cards on wheel, releasing at boundaries
    var lastWheelTime = 0;
    stage.addEventListener('wheel', function (e) {
      var dy = e.deltaY || e.deltaX;
      if (Math.abs(dy) < 8) return;
      var goingNext = dy > 0;
      if ((goingNext && currentIndex < count - 1) || (!goingNext && currentIndex > 0)) {
        e.preventDefault();
        var now = performance.now();
        if (now - lastWheelTime > 220) {
          lastWheelTime = now;
          setFlexFocus(currentIndex + (goingNext ? 1 : -1));
        }
      }
    }, { passive: false });

    // Drag support
    var isDragging = false, startX = 0;
    stage.addEventListener('pointerdown', function (e) {
      isDragging = true; startX = e.clientX;
      stage.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 55) {
        setFlexFocus(currentIndex + (dx < 0 ? 1 : -1));
        startX = e.clientX;
      }
    });
    window.addEventListener('pointerup', function () {
      isDragging = false;
      stage.classList.remove('is-dragging');
    });

    function tickFlexCarousel() {
      requestAnimationFrame(tickFlexCarousel);
      if (!introDone) return;

      smoothIndex += (currentIndex - smoothIndex) * 0.12;
      var baseSpacing = window.innerWidth < 640 ? 165 : 225;

      cards.forEach(function (card, i) {
        if (!card._risen) return;
        var offset = i - smoothIndex;
        var absOff = Math.abs(offset);

        // Liquid lens math: lensWidth={0.74}, lensHeight={1.18}, squeeze={0.2}, tilt={62}, bend={0.34}, curl="twist"
        var lensFactor = Math.max(0, 1 - absOff * 0.85);
        var squeezeX = 1 - Math.min(0.24, absOff * 0.12) + lensFactor * 0.14;
        var scaleY = 1 - Math.min(0.22, absOff * 0.09) + lensFactor * 0.16;

        // Compress spacing slightly for outer squeezed cards
        var sign = offset < 0 ? -1 : 1;
        var tx = offset * baseSpacing - sign * Math.max(0, absOff - 1) * 28;
        var tz = lensFactor * 95 - absOff * 55; // bend={0.34}
        var rotY = Math.max(-62, Math.min(62, -offset * 24)); // tilt={62}
        var rotZ = offset * 2.8; // curl="twist"

        card.style.transform =
          'translate3d(' + tx.toFixed(1) + 'px, 0px, ' + tz.toFixed(1) + 'px) ' +
          'rotateY(' + rotY.toFixed(1) + 'deg) ' +
          'rotateZ(' + rotZ.toFixed(1) + 'deg) ' +
          'scale(' + squeezeX.toFixed(3) + ', ' + scaleY.toFixed(3) + ')';

        card.style.zIndex = String(Math.round(100 - absOff * 15));
        card.style.opacity = String(Math.max(0.22, 1 - absOff * 0.22));
      });
    }
    requestAnimationFrame(tickFlexCarousel);
  })();

  /* ---------- 7. Craft Curtains + JellyRadio (swell={0.2}, barge={6}, shrink={0.05}, stiffness={580}) ---------- */
  var CURTAINS = [
    {
      num: '01',
      category: 'Automation',
      title: 'Enterprise Excel & VBA Systems',
      headline: 'Turning 36-hour manual spreadsheet routines into 15-minute in-memory engines.',
      body: 'Built seven production tools using Scripting.Dictionary hash lookups, dynamic memory arrays, and custom XML ribbons (.xlam) so non-technical teams can run complex audits in one click.',
      tools: 'VBA · Memory Arrays · Custom XML Ribbons · CNIC & Barcode Validation · Power BI & DAX',
      proofLabel: 'Inspect PepsiCo Suite ↑',
      proofHref: '#pepsico'
    },
    {
      num: '02',
      category: 'ML & AI',
      title: 'Predictive Machine Learning',
      headline: 'Models that generalize to unseen companies instead of flattering themselves.',
      body: 'Engineered L2 Logistic Regression and Random Forest triage pipelines evaluated under strict client-grouped holdout splits (GroupShuffleSplit) and a quarantined leakage harness across 30,000 URLs.',
      tools: 'Python · pandas · scikit-learn · Client-Grouped Validation · NIST AI RMF Governance',
      proofLabel: 'Inspect FlyRank Research ↑',
      proofHref: '#flyrank'
    },
    {
      num: '03',
      category: 'Finance & ERP',
      title: 'Tax, SAP & ERP Reconciliation',
      headline: 'Compressing 25-hour line-by-line SAP and FBR tax audits into 192 seconds.',
      body: 'Designed tolerance-based matching engines for PepsiCo Tax, monitored dealer billing across 3,500 dealers in SAP at FFC, and executed SAP Ariba international sourcing at OGDCL.',
      tools: 'SAP ERP · SAP Ariba · FBR Tax Portal Reconciliation · CPR Standardization',
      proofLabel: 'Inspect Tax Engine ↑',
      proofHref: '#pepsico'
    },
    {
      num: '04',
      category: 'ML & AI',
      title: 'Full-Stack & Agentic Workflows',
      headline: 'Two-sided web platforms and autonomous background agents.',
      body: 'Founded Outfield (React, Vite, Supabase) for live sports venue booking in Karachi, and deployed self-hosted n8n + Docker + Groq LLM pipelines and local MCP filesystem agents.',
      tools: 'React · Supabase · n8n · Docker · Groq API · Claude Code & Subagents (MCP)',
      proofLabel: 'Inspect Outfield & Agents ↑',
      proofHref: '#outfield'
    },
    {
      num: '05',
      category: 'Finance & ERP',
      title: 'Risk, Credit & Equity Analysis',
      headline: 'Institutional risk frameworks and independent technical trading.',
      body: 'Worked across operational, credit, liquidity, and environmental risk (Basel II) at Askari Bank Head Office, alongside active technical and fundamental equity trading on the PSX since 2025.',
      tools: 'Basel II & RCSA · SME Credit Analysis · RSI, MACD & Bollinger Bands · Financial Statements',
      proofLabel: 'Inspect Track Record ↑',
      proofHref: '#experience'
    }
  ];

  var curtainList = $('#curtainList');
  var activeCategoryFilter = 'All';

  function renderCurtains() {
    if (!curtainList) return;
    curtainList.innerHTML = '';
    var filtered = CURTAINS.filter(function (c) {
      return activeCategoryFilter === 'All' || c.category === activeCategoryFilter;
    });

    filtered.forEach(function (c, i) {
      var band = document.createElement('article');
      band.className = 'curtain-band py-6 sm:py-7 px-4 rounded-2xl' + (i === 0 ? ' is-open' : '');
      band.innerHTML =
        '<div class="flex items-baseline justify-between gap-6">' +
          '<div class="flex items-baseline gap-4 sm:gap-7 min-w-0">' +
            '<span class="mono-meta text-xs swap-accent font-bold shrink-0">' + c.num + '</span>' +
            '<h3 class="curtain-title font-editorial text-xl sm:text-3xl md:text-4xl text-ivory tracking-tight truncate">' + c.title + '</h3>' +
          '</div>' +
          '<span class="mono-meta text-[11px] uppercase tracking-widest swap-accent shrink-0 hidden sm:inline">' + c.category + ' +</span>' +
        '</div>' +
        '<div class="curtain-drawer">' +
          '<div class="curtain-drawer-inner pl-8 sm:pl-12 pt-5 pr-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">' +
            '<div class="lg:col-span-8 space-y-2">' +
              '<h4 class="font-editorial text-lg sm:text-xl text-ivory">' + c.headline + '</h4>' +
              '<p class="text-sm sm:text-base text-ivory/85 leading-relaxed max-w-2xl">' + c.body + '</p>' +
              '<p class="mono-meta text-[11px] swap-accent pt-1.5">' + c.tools + '</p>' +
            '</div>' +
            '<div class="lg:col-span-4 lg:text-right pt-2 lg:pt-0">' +
              '<a href="' + c.proofHref + '" class="cta-beam text-xs py-2.5 px-5">' + c.proofLabel + '</a>' +
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
  renderCurtains();

  // JellyRadio Physics Engine (swell={0.2}, barge={6}, shrink={0.05}, stagger={22})
  function bindJellyGroup(groupEl, onSelect) {
    if (!groupEl) return;
    var chips = $$('.jelly-chip', groupEl);

    function triggerJellyPhysics(selectedIdx) {
      chips.forEach(function (chip, idx) {
        if (chip.disabled) return;
        var dist = idx - selectedIdx;
        chip.classList.toggle('is-active', idx === selectedIdx);

        if (window.gsap && !reduce) {
          if (dist === 0) {
            // Selected chip swells (swell={0.2}) and bounces with high stiffness
            window.gsap.fromTo(chip,
              { scaleX: 1.2, scaleY: 0.86 },
              { scaleX: 1, scaleY: 1, x: 0, duration: 0.55, ease: 'elastic.out(1.2, 0.35)' }
            );
          } else {
            // Neighbor chips barge outward (barge={6}) and shrink slightly (shrink={0.05})
            var dir = dist < 0 ? -1 : 1;
            var bargePx = (dir * 6) / Math.abs(dist);
            window.gsap.fromTo(chip,
              { x: bargePx, scale: 0.95 },
              { x: 0, scale: 1, duration: 0.5, delay: Math.abs(dist) * 0.022, ease: 'elastic.out(1, 0.4)' }
            );
          }
        }
      });
    }

    chips.forEach(function (chip, idx) {
      chip.addEventListener('click', function () {
        if (chip.disabled) return;
        triggerJellyPhysics(idx);
        onSelect(chip, idx);
      });
    });
  }

  bindJellyGroup($('#jellyLevelGroup'), function (chip) {
    activeCategoryFilter = chip.getAttribute('data-jelly-val') || 'All';
    renderCurtains();
    trackEvent('jelly_filter_change', { filter: activeCategoryFilter });
  });

  bindJellyGroup($('#jellyViewGroup'), function (chip) {
    var mode = chip.getAttribute('data-jelly-view');
    if (curtainList) {
      curtainList.classList.toggle('is-grid-mode', mode === 'grid');
    }
    trackEvent('jelly_view_change', { view: mode });
  });

  /* ---------- 8. Certificates: 3D CircularCarousel (intro="rise" + Constant Drift) ---------- */
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
      var dpr = Math.min(window.devicePixelRatio || 1, 2.2);
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
    var cylInView = false;

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
      renderCertToCanvas(c, canvas, 320);

      card._certData = c;
      card._baseAngle = idx * stepDeg;
      card._shadeEl = card.querySelector('.cyl-shade');
      // intro="rise" vertical offset per card (starts at 160px below and springs to 0)
      card._riseY = 160;
      card._riseProgress = 0;
      cylRotor.appendChild(card);
      cylCards.push(card);
    });

    // Observe Certificates section to trigger intro="rise" and gate rendering when offscreen
    var certIntroTriggered = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        cylInView = entries[0].isIntersecting;
        if (cylInView && !certIntroTriggered) {
          certIntroTriggered = true;
          cylCards.forEach(function (card, i) {
            setTimeout(function () { card._startRise = true; }, i * 45);
          });
        }
      }, { threshold: 0.12 }).observe(cylStage);
    } else {
      cylInView = true;
      cylCards.forEach(function (card) { card._startRise = true; card._riseY = 0; });
    }

    var rotY = 0;
    var velY = 0;
    var targetSnapY = null;
    var isDragging = false;
    var lastX = 0, lastT = 0, movedDist = 0, clickedCard = null;
    var driftSpeed = -0.15; // Constant non-stop drift regardless of cursor hover!

    var cachedRadius = 560;
    function updateCylRadius() {
      var cardW = window.innerWidth < 640 ? 210 : 260;
      var gap = 25;
      cachedRadius = Math.round(((cardW + gap) * count) / (2 * Math.PI));
    }
    updateCylRadius();
    window.addEventListener('resize', updateCylRadius);

    cylStage.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      isDragging = true;
      targetSnapY = null;
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

      if (movedDist < 7 && clickedCard) {
        var worldDeg = ((clickedCard._baseAngle + rotY) % 360 + 360) % 360;
        if (worldDeg > 180) worldDeg -= 360;
        if (Math.abs(worldDeg) > 16) {
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
      requestAnimationFrame(tickCylinder);
      if (!cylInView) return;

      if (!isDragging) {
        if (targetSnapY !== null) {
          var diff = targetSnapY - rotY;
          rotY += diff * 0.12;
          if (Math.abs(diff) < 0.2) {
            targetSnapY = null;
          }
        } else {
          // Constant drift + user drag momentum (never stops when cursor hovers!)
          rotY += (reduce ? 0 : driftSpeed) + velY;
          velY *= 0.94;
          if (Math.abs(velY) < 0.01) velY = 0;
        }
      }

      for (var i = 0; i < count; i++) {
        var card = cylCards[i];
        if (card._startRise && card._riseY > 0.2) {
          card._riseY *= 0.86;
          if (card._riseY < 0.2) card._riseY = 0;
        }

        var angle = card._baseAngle + rotY;
        var rad = (angle * Math.PI) / 180;
        var cosA = Math.cos(rad);
        var depthNorm = (cosA + 1) * 0.5;
        var scale = 0.86 + depthNorm * 0.18;

        card.style.transform =
          'rotateY(' + angle.toFixed(2) + 'deg) ' +
          'translate3d(0px, ' + card._riseY.toFixed(1) + 'px, ' + cachedRadius + 'px) ' +
          'scale(' + scale.toFixed(3) + ')';

        var riseAlpha = 1 - (card._riseY / 160);
        card.style.opacity = ((0.22 + depthNorm * 0.78) * riseAlpha).toFixed(3);
        card.style.zIndex = String(Math.round(depthNorm * 100));

        if (card._shadeEl) {
          card._shadeEl.style.opacity = ((1 - depthNorm) * 0.62).toFixed(3);
        }
      }
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
    var targetW = Math.min(vw * 0.92, 960);
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
        lightboxCard.style.transition = 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)';
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

  /* ---------- 10. GSAP ScrollTrigger Choreography & Chapter Compass ---------- */
  function initGSAPChoreography() {
    if (!window.gsap) return;
    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    if (reduce) return;

    gsap.fromTo(
      '#top .split-line',
      { yPercent: 115, rotateZ: 2, opacity: 0 },
      { yPercent: 0, rotateZ: 0, opacity: 1, duration: 1.1, stagger: 0.11, ease: 'power4.out', delay: 0.08 }
    );

    $$('.gsap-section-header').forEach(function (header) {
      var lines = $$('.split-line', header);
      if (lines.length) {
        gsap.fromTo(
          lines,
          { yPercent: 115, rotateZ: 1.5, opacity: 0 },
          {
            yPercent: 0, rotateZ: 0, opacity: 1, duration: 1.0, stagger: 0.1, ease: 'power4.out',
            scrollTrigger: { trigger: header, start: 'top 85%' }
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
            yPercent: 0, opacity: 1, duration: 0.95, stagger: 0.09, ease: 'power4.out',
            scrollTrigger: { trigger: spread, start: 'top 84%' }
          }
        );
      }

      gsap.fromTo(
        spread,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.95, ease: 'power3.out',
          scrollTrigger: {
            trigger: spread, start: 'top 84%',
            onEnter: function () {
              $$('.compression-bar', spread).forEach(function (bar) {
                var w = bar.getAttribute('data-target-width');
                if (w) gsap.to(bar, { width: w, duration: 1.3, ease: 'power3.out' });
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

  var compassLabel = $('#compassLabel');
  var chapters = $$('[data-chapter]');
  window.addEventListener('scroll', function () {
    if (!compassLabel || !chapters.length) return;
    var vh = window.innerHeight;
    var currentName = chapters[0].getAttribute('data-chapter');
    chapters.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= vh * 0.45) {
        currentName = sec.getAttribute('data-chapter');
      }
    });
    compassLabel.textContent = currentName;
  }, { passive: true });

  /* ---------- 11. About & Contact ---------- */
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
