/**
 * Fondo red neuronal (canvas) — DESACTIVADO.
 * Para volver a usarlo: descomentar este archivo y el <script> en index.html / gracias.html.
 */
/*
(function () {
  var COLORS = [
    [0, 232, 255],
    [46, 232, 184],
    [34, 232, 132],
  ];

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function init() {
    var container = document.querySelector(".page-mesh");
    if (!container) return;

    var canvas = document.createElement("canvas");
    canvas.className = "page-mesh__canvas";
    canvas.setAttribute("aria-hidden", "true");
    container.replaceChildren(canvas);

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var particles = [];
    var rafId = null;
    var width = 0;
    var height = 0;
    var dpr = 1;
    var reduced = prefersReducedMotion();

    function particleCount() {
      var area = width * height;
      var base = Math.floor(area / 9500);
      if (width < 520) return Math.min(52, Math.max(32, base));
      if (width < 900) return Math.min(72, Math.max(44, base));
      return Math.min(92, Math.max(56, base));
    }

    function linkDistance() {
      if (width < 520) return 135;
      if (width < 900) return 165;
      return 185;
    }

    function speed() {
      if (width < 520) return 0.28;
      return 0.35;
    }

    function createParticle() {
      var color = COLORS[Math.floor(Math.random() * COLORS.length)];
      var s = speed();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * s,
        vy: (Math.random() - 0.5) * s,
        r: Math.random() * 1.6 + 1.1,
        color: color,
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var target = particleCount();
      while (particles.length < target) particles.push(createParticle());
      while (particles.length > target) particles.pop();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      var maxDist = linkDistance();
      var maxDistSq = maxDist * maxDist;
      var i;
      var j;
      var a;
      var b;
      var dx;
      var dy;
      var distSq;
      var dist;
      var alpha;

      for (i = 0; i < particles.length; i++) {
        for (j = i + 1; j < particles.length; j++) {
          a = particles[i];
          b = particles[j];
          dx = a.x - b.x;
          dy = a.y - b.y;
          distSq = dx * dx + dy * dy;
          if (distSq > maxDistSq) continue;
          dist = Math.sqrt(distSq);
          alpha = (1 - dist / maxDist) * 0.2;
          ctx.strokeStyle = "rgba(46, 232, 184, " + alpha + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      var glowBlur = width < 520 ? 10 : width < 900 ? 14 : 18;

      for (i = 0; i < particles.length; i++) {
        a = particles[i];
        var cr = a.color[0];
        var cg = a.color[1];
        var cb = a.color[2];

        ctx.save();
        ctx.shadowColor = "rgba(" + cr + "," + cg + "," + cb + ",0.95)";
        ctx.shadowBlur = glowBlur;
        ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + ",1)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function tick() {
      if (!reduced) {
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x <= 0 || p.x >= width) p.vx *= -1;
          if (p.y <= 0 || p.y >= height) p.vy *= -1;
          p.x = Math.max(0, Math.min(width, p.x));
          p.y = Math.max(0, Math.min(height, p.y));
        }
      }
      draw();
      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (rafId) cancelAnimationFrame(rafId);
      resize();
      if (reduced) {
        draw();
        return;
      }
      rafId = requestAnimationFrame(tick);
    }

    function stop() {
      if (!rafId) return;
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        if (reduced) draw();
      }, 120);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
*/
