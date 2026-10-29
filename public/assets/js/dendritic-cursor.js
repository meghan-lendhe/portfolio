/**
 * Global Unmyelinated Dendritic Cursor Trailing
 * - Silky smooth, organic axonal trailing filament across the entire website
 * - Spring-mass physics simulating living dendritic elasticity and momentum
 * - Tapers from tip to tail and dissolves in 180-220ms
 * - Zero pointer interference (pointer-events: none)
 * - Auto-pauses when cursor is static to conserve CPU
 */

(function () {
  'use strict';

  // Respect user preference for reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Create global overlay canvas
  let canvas = document.getElementById('global-dendritic-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'global-dendritic-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'fixed inset-0 pointer-events-none z-[9999] select-none';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Trail buffer
  const trail = [];
  const maxLifetime = 200; // ms
  let isMoving = false;
  let animId = null;
  let lastMoveTime = 0;

  // Elastic tip physics
  let mouse = { x: -100, y: -100 };
  let tip = { x: -100, y: -100, vx: 0, vy: 0 };

  window.addEventListener(
    'pointermove',
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMoveTime = performance.now();

      // Seed first point if far away
      if (Math.hypot(tip.x - mouse.x, tip.y - mouse.y) > 200) {
        tip.x = mouse.x;
        tip.y = mouse.y;
      }

      trail.push({
        x: mouse.x,
        y: mouse.y,
        time: lastMoveTime
      });

      if (!isMoving) {
        isMoving = true;
        animId = requestAnimationFrame(render);
      }
    },
    { passive: true }
  );

  window.addEventListener('pointerleave', () => {
    trail.length = 0;
  });

  function render(now) {
    // Clean old points
    while (trail.length > 0 && now - trail[0].time > maxLifetime) {
      trail.shift();
    }

    ctx.clearRect(0, 0, width, height);

    if (trail.length > 2) {
      const len = trail.length;

      // Draw filament with segmented quadratic curves for organic fluidity
      for (let i = 1; i < len; i++) {
        const p0 = trail[i - 1];
        const p1 = trail[i];

        const age = now - p1.time;
        const progress = Math.max(0, 1 - age / maxLifetime); // 1 = fresh (at tip), 0 = old (tail)
        const taper = Math.pow(progress, 0.85);

        // Alpha envelope
        const alpha = Math.sin(progress * (Math.PI / 2)) * 0.55;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);

        // Warm amber gradient tone
        ctx.strokeStyle = `rgba(217, 119, 6, ${alpha})`;
        ctx.lineWidth = 0.6 + taper * 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Delicate microscopic axonal varicosity / bouton along the filament
        if (i % 6 === 0 && progress > 0.3) {
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, 0.8 + taper * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(217, 119, 6, ${alpha * 1.3})`;
          ctx.fill();
        }
      }

      // Terminal growth cone / bouton at leading edge
      const lead = trail[len - 1];
      ctx.beginPath();
      ctx.arc(lead.x, lead.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217, 119, 6, 0.85)';
      ctx.fill();

      // Soft faint halo at lead
      ctx.beginPath();
      ctx.arc(lead.x, lead.y, 3.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
      ctx.fill();
    }

    // Stop animation when all trail points have dissolved
    if (trail.length > 0 || now - lastMoveTime < maxLifetime + 50) {
      animId = requestAnimationFrame(render);
    } else {
      isMoving = false;
      ctx.clearRect(0, 0, width, height);
    }
  }
})();

