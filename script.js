/* ===========================================================
   Sakura Noskor — interactions
   =========================================================== */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- nav scroll state + progress + active link ---------- */
  const nav = document.querySelector(".nav");
  const bar = document.querySelector(".scroll-progress");
  const links = [...document.querySelectorAll(".nav__links a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";

    let current = sections[0];
    for (const s of sections) if (s.offsetTop - 120 <= y) current = s;
    links.forEach((a) =>
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + (current && current.id))
    );
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- equalizer random heights (fallback if animation ok) ---------- */
  document.querySelectorAll(".equalizer span").forEach((s, i) => {
    s.style.animationDelay = (i % 5) * 0.12 + "s";
  });

  /* ---------- count-up stats ---------- */
  const stats = document.querySelectorAll(".stat__n[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    const sio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          const decimals = target % 1 !== 0 ? 1 : 0;
          const dur = 1400;
          let start = null;
          function step(t) {
            if (start === null) start = t;
            const p = Math.min((t - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(decimals) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          sio.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    stats.forEach((s) => sio.observe(s));
  } else {
    stats.forEach((s) => (s.textContent = s.dataset.count + (s.dataset.suffix || "")));
  }

  /* ---------- typewriter tagline ---------- */
  const tw = document.querySelector(".tw");
  if (tw && !reduce) {
    const words = (tw.dataset.words || "").split(",");
    let wi = 0,
      ci = 0,
      deleting = false;
    function type() {
      const word = words[wi];
      tw.textContent = word.slice(0, ci);
      if (!deleting) {
        if (ci < word.length) {
          ci++;
          setTimeout(type, 70);
        } else {
          deleting = true;
          setTimeout(type, 1500);
        }
      } else {
        if (ci > 0) {
          ci--;
          setTimeout(type, 35);
        } else {
          deleting = false;
          wi = (wi + 1) % words.length;
          setTimeout(type, 300);
        }
      }
    }
    type();
  } else if (tw) {
    tw.textContent = (tw.dataset.words || "").split(",")[0];
  }

  /* ---------- cursor glow + card glow ---------- */
  const glow = document.querySelector(".cursor-glow");
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (glow && fine && !reduce) {
    window.addEventListener("mousemove", (e) => {
      glow.style.opacity = "1";
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    document.addEventListener("mouseleave", () => (glow.style.opacity = "0"));
  }
  document.querySelectorAll(".card").forEach((card) => {
    const g = card.querySelector(".card__glow");
    if (!g) return;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      g.style.left = e.clientX - r.left + "px";
      g.style.top = e.clientY - r.top + "px";
    });
  });

  /* ---------- falling sakura petals (canvas) ---------- */
  const canvas = document.getElementById("petals");
  if (canvas && !reduce) {
    const ctx = canvas.getContext("2d");
    let w, h, petals;
    const COUNT = () => Math.min(38, Math.floor(window.innerWidth / 32));
    const colors = ["#ffb3c6", "#ff9ec2", "#ff6f9c", "#e5a9ff"];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function makePetal() {
      return {
        x: Math.random() * w,
        y: Math.random() * -h,
        r: 5 + Math.random() * 7,
        sway: 0.5 + Math.random() * 1.5,
        speed: 0.6 + Math.random() * 1.4,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05,
        phase: Math.random() * Math.PI * 2,
        color: colors[(Math.random() * colors.length) | 0],
        alpha: 0.5 + Math.random() * 0.5,
      };
    }

    function init() {
      resize();
      petals = Array.from({ length: COUNT() }, makePetal);
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      // simple petal shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.r, -p.r, p.r, p.r, 0, p.r * 1.4);
      ctx.bezierCurveTo(-p.r, p.r, -p.r, -p.r, 0, 0);
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.phase += 0.02;
        p.x += Math.sin(p.phase) * p.sway;
        p.y += p.speed;
        p.angle += p.spin;
        if (p.y > h + 20) {
          Object.assign(p, makePetal(), { y: -20, x: Math.random() * w });
        }
        drawPetal(p);
      }
      requestAnimationFrame(tick);
    }

    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(init, 150);
    });
    init();
    tick();
  }

  /* ---------- lo-fi CD player + floating notes ---------- */
  const cd = document.getElementById("cd");
  const audio = document.getElementById("lofiAudio");
  if (cd && audio) {
    // note layer
    const layer = document.createElement("div");
    layer.className = "note-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    const glyphs = ["♪", "♫", "♩", "♬", "♪", "♫"];
    const colors = ["#ff9ec2", "#ffb3c6", "#b98cff", "#ff6f9c"];
    let notes = [];
    let spawnTimer = null;
    let rafId = null;
    let falling = false;

    function cdCenter() {
      const r = cd.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function spawnNote() {
      const el = document.createElement("span");
      el.className = "music-note";
      el.textContent = glyphs[(Math.random() * glyphs.length) | 0];
      const c = cdCenter();
      const size = 14 + Math.random() * 14;
      el.style.fontSize = size + "px";
      el.style.color = colors[(Math.random() * colors.length) | 0];
      el.style.opacity = "0";
      layer.appendChild(el);
      notes.push({
        el,
        x: c.x + (Math.random() * 24 - 12),
        y: c.y - 12,
        vx: Math.random() * 0.8 - 0.4,
        vy: -(0.8 + Math.random() * 0.8),
        rot: Math.random() * 60 - 30,
        vr: Math.random() * 2 - 1,
        // notes rise at most ~a quarter of the screen height above the CD
        ceiling: c.y - window.innerHeight * 0.25 * (0.72 + Math.random() * 0.28),
        alpha: 0,
      });
    }

    function loop() {
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        if (falling) {
          n.vy += 0.28; // gravity pulls them back down
          n.alpha -= 0.006;
        } else if (n.y <= n.ceiling) {
          n.vy *= 0.6; // reached the quarter-screen ceiling: settle and fade
          n.alpha -= 0.02;
        } else {
          n.vy *= 0.995; // keep drifting up, fading in
          n.alpha = Math.min(1, n.alpha + 0.03);
        }
        n.x += n.vx;
        n.y += n.vy;
        n.rot += n.vr;
        n.el.style.transform = `translate(${n.x}px, ${n.y}px) rotate(${n.rot}deg)`;
        n.el.style.opacity = Math.max(0, n.alpha);
        if (n.alpha <= 0 || n.y > window.innerHeight + 60 || n.y < -80) {
          n.el.remove();
          notes.splice(i, 1);
        }
      }
      if (notes.length || !falling) rafId = requestAnimationFrame(loop);
      else rafId = null;
    }

    function startNotes() {
      falling = false;
      if (!spawnTimer) spawnTimer = setInterval(spawnNote, 420);
      if (!rafId) rafId = requestAnimationFrame(loop);
      spawnNote();
    }

    function dropNotes() {
      falling = true;
      if (spawnTimer) {
        clearInterval(spawnTimer);
        spawnTimer = null;
      }
      // give each floating note a downward kick so they visibly fall
      notes.forEach((n) => {
        n.vy = Math.max(n.vy, 0.5 + Math.random());
      });
      if (!rafId) rafId = requestAnimationFrame(loop);
    }

    function play() {
      audio.play().then(() => {
        cd.classList.add("is-playing");
        cd.setAttribute("aria-pressed", "true");
        startNotes();
        disarmUnlock();
      }).catch(() => {
        // browser blocked autoplay: start on the first user interaction instead
        cd.setAttribute("aria-pressed", "false");
        armUnlock();
      });
    }

    function pause() {
      audio.pause();
      cd.classList.remove("is-playing");
      cd.setAttribute("aria-pressed", "false");
      dropNotes();
    }

    // if autoplay is blocked, start on the first gesture anywhere (except the CD,
    // which manages its own toggle)
    let unlockers = [];
    function armUnlock() {
      if (unlockers.length) return;
      const evs = ["pointerdown", "keydown", "touchend", "click"];
      const h = (e) => {
        if (e.target && e.target.closest && e.target.closest("#cd")) return;
        play();
      };
      evs.forEach((ev) => document.addEventListener(ev, h, { passive: true }));
      unlockers = evs.map((ev) => [ev, h]);
    }
    function disarmUnlock() {
      unlockers.forEach(([ev, h]) => document.removeEventListener(ev, h));
      unlockers = [];
    }

    cd.addEventListener("click", () => (audio.paused ? play() : pause()));
    audio.addEventListener("ended", pause); // safety, though it loops

    audio.volume = 0.6;
    play(); // try to autostart on load; falls back to first user gesture
  }
})();
