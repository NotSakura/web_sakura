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
})();
