/* Storm site, rain + procedural lightning canvas, nav, release wiring. No dependencies. */
(function () {
  "use strict";
  var R = window.STORM_RELEASE || {};
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Release wiring ---------- */
  function wire() {
    document.querySelectorAll("[data-download]").forEach(function (a) {
      a.setAttribute("href", R.downloadUrl || "#");
      if (R.fileName) a.setAttribute("download", R.fileName);
    });
    document.querySelectorAll("[data-version]").forEach(function (el) { el.textContent = R.version || ""; });
    document.querySelectorAll("[data-release-date]").forEach(function (el) { el.textContent = R.date || ""; });
    document.querySelectorAll("[data-sha256]").forEach(function (el) { el.textContent = R.sha256 || ""; });
    document.querySelectorAll("[data-size]").forEach(function (el) {
      if (R.sizeLabel) el.textContent = R.sizeLabel; else el.hidden = true;
    });
    document.querySelectorAll("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = document.querySelector(b.getAttribute("data-copy"));
        if (!t || !navigator.clipboard) return;
        navigator.clipboard.writeText(t.textContent.trim()).then(function () {
          var o = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = o; }, 1400);
        });
      });
    });
    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();

    var toggle = document.querySelector(".nav-toggle"), nav = document.getElementById("nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.addEventListener("click", function (e) {
        if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
      });
    }

    var els = document.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); }
    else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px" });
      els.forEach(function (e) { io.observe(e); });
    }
  }

  /* ---------- Sky ---------- */
  function Sky(canvas, opts) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = 1;
    var drops = [], bolts = [], flash = 0, nextStrike = 900, last = 0, running = false, visible = true;
    var density = opts.density || 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round((W * H) / 5200 * density);
      drops = [];
      for (var i = 0; i < n; i++) drops.push(drop(true));
      if (!running) draw(0);
    }
    function drop(anyY) {
      var z = Math.random();
      return { x: Math.random() * (W + 200) - 100, y: anyY ? Math.random() * H : -20 - Math.random() * 100,
        len: 10 + z * 22, v: 520 + z * 760, a: 0.08 + z * 0.32, w: z > 0.8 ? 1.4 : 1 };
    }

    // Midpoint-displacement bolt with forks.
    function makeBolt(x0, y0, x1, y1, spread, depth) {
      var pts = [[x0, y0], [x1, y1]];
      var off = spread;
      for (var g = 0; g < 7; g++) {
        var np = [pts[0]];
        for (var i = 0; i < pts.length - 1; i++) {
          var a = pts[i], b = pts[i + 1];
          var mx = (a[0] + b[0]) / 2 + (Math.random() - 0.5) * off;
          var my = (a[1] + b[1]) / 2 + (Math.random() - 0.5) * off * 0.25;
          np.push([mx, my], b);
        }
        pts = np; off *= 0.52;
      }
      var forks = [];
      if (depth < 2) {
        var count = depth === 0 ? 2 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
        for (var f = 0; f < count; f++) {
          var p = pts[Math.floor(pts.length * (0.15 + Math.random() * 0.6))];
          var ang = (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.7);
          var L = (y1 - y0) * (0.18 + Math.random() * 0.3) / (depth + 1);
          forks.push(makeBolt(p[0], p[1], p[0] + Math.sin(ang) * L, p[1] + Math.cos(ang) * L, spread * 0.45, depth + 1));
        }
      }
      return { pts: pts, forks: forks, depth: depth };
    }
    function strike() {
      var side = Math.random() < 0.5 ? 0.04 + Math.random() * 0.26 : 0.70 + Math.random() * 0.26; // keep bolts off the centred text
      var x = W * side;
      var groundY = H * (0.7 + Math.random() * 0.3);
      bolts.push({ tree: makeBolt(x, -10, x + (side < 0.5 ? -1 : 1) * Math.random() * W * 0.08, groundY, Math.min(W, 900) * 0.35, 0), life: 1, flick: 0 });
      flash = 1;
    }
    function strokeBolt(b, alpha) {
      var w = b.depth === 0 ? 2.6 : b.depth === 1 ? 1.4 : 0.8;
      ctx.beginPath();
      ctx.moveTo(b.pts[0][0], b.pts[0][1]);
      for (var i = 1; i < b.pts.length; i++) ctx.lineTo(b.pts[i][0], b.pts[i][1]);
      ctx.strokeStyle = "rgba(79,168,255," + (alpha * 0.55) + ")"; ctx.lineWidth = w * 5; ctx.stroke();
      ctx.strokeStyle = "rgba(235,246,255," + alpha + ")"; ctx.lineWidth = w; ctx.stroke();
      b.forks.forEach(function (f) { strokeBolt(f, alpha * 0.8); });
    }

    function draw(dt) {
      ctx.clearRect(0, 0, W, H);
      // Clouds glow at top
      var g = ctx.createRadialGradient(W * 0.5, -H * 0.2, 0, W * 0.5, -H * 0.2, Math.max(W, H) * 0.9);
      g.addColorStop(0, "rgba(40,80,150," + (0.35 + flash * 0.5) + ")");
      g.addColorStop(1, "rgba(5,6,11,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // Rain
      ctx.lineCap = "round";
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        d.y += d.v * dt; d.x += d.v * dt * 0.12;
        if (d.y > H + 20) { drops[i] = drop(false); continue; }
        ctx.strokeStyle = "rgba(170,210,255," + (d.a + flash * 0.3) + ")";
        ctx.lineWidth = d.w;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.len * 0.12, d.y - d.len); ctx.stroke();
      }

      // Bolts
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "lighter";
      for (var j = bolts.length - 1; j >= 0; j--) {
        var b = bolts[j];
        b.life -= dt * 2.4;
        b.flick += dt;
        if (b.life <= 0) { bolts.splice(j, 1); continue; }
        var a = b.life > 0.6 ? 1 : b.life / 0.6;
        if (b.life > 0.3 && Math.sin(b.flick * 70) < -0.6) a *= 0.35; // flicker / restrike
        strokeBolt(b.tree, a);
      }
      ctx.globalCompositeOperation = "source-over";

      if (flash > 0) {
        ctx.fillStyle = "rgba(190,220,255," + (flash * 0.18) + ")";
        ctx.fillRect(0, 0, W, H);
        flash = Math.max(0, flash - dt * 3.2);
      }
    }

    function loop(t) {
      if (!running) return;
      var dt = last ? Math.min((t - last) / 1000, 0.05) : 0.016; last = t;
      nextStrike -= dt * 1000;
      if (nextStrike <= 0) { strike(); if (Math.random() < 0.3) setTimeout(strike, 140); nextStrike = (opts.minGap || 2600) + Math.random() * (opts.gapJitter || 4200); }
      draw(dt);
      requestAnimationFrame(loop);
    }
    function start() { if (running || reduce || !visible || document.hidden) return; running = true; last = 0; requestAnimationFrame(loop); }
    function stop() { running = false; }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
    }
    resize();
    if (reduce) {
      // Still frame: one frozen bolt, no motion.
      strike(); flash = 0.25; bolts[0].life = 1; draw(0);
    } else {
      nextStrike = opts.firstStrike || 700;
      start();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    wire();
    var hero = document.getElementById("sky");
    if (hero) Sky(hero, { density: 1, firstStrike: 600 });
    var small = document.getElementById("sky-sm");
    if (small) Sky(small, { density: 0.6, firstStrike: 1400, minGap: 5000, gapJitter: 6000 });
  });
})();
