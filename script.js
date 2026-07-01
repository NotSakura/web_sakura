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

  /* ---------- ambient instrumentals (original, synthesized) ---------- */
  // NOTE: every track below is an original royalty-free loop generated with the
  // Web Audio API in real time, not a copyrighted recording.
  const cd = document.getElementById("cd");
  const cdMenu = document.getElementById("cdMenu");
  if (cd && cdMenu) {
    // each track: barLen, padType, arpType, filter cutoff/Q, delay, master gain,
    // whether it has an arpeggio and a bass note, and its chord progression.
    const TRACKS = [
      {
        name: "Sakura Dream", barLen: 2.0, pad: "sine", arp: "triangle",
        cutoff: 1900, q: 0.5, delay: 0.28, fb: 0.28, gain: 0.16, useArp: true, bass: false,
        prog: [
          { pad: [220.0, 261.63, 329.63], arp: [440.0, 523.25, 659.25, 523.25] },
          { pad: [174.61, 220.0, 261.63], arp: [349.23, 440.0, 523.25, 440.0] },
          { pad: [130.81, 164.81, 196.0], arp: [392.0, 523.25, 659.25, 523.25] },
          { pad: [196.0, 246.94, 293.66], arp: [392.0, 493.88, 587.33, 493.88] },
        ],
      },
      {
        name: "Lo-fi Study", barLen: 2.6, pad: "triangle", arp: "sine",
        cutoff: 1150, q: 0.7, delay: 0.36, fb: 0.34, gain: 0.17, useArp: true, bass: true,
        prog: [
          { pad: [146.83, 174.61, 220.0, 261.63], arp: [293.66, 349.23, 440.0, 349.23] },
          { pad: [196.0, 246.94, 293.66, 349.23], arp: [392.0, 493.88, 587.33, 493.88] },
          { pad: [130.81, 164.81, 196.0, 246.94], arp: [523.25, 659.25, 493.88, 659.25] },
          { pad: [220.0, 261.63, 329.63, 392.0], arp: [440.0, 523.25, 659.25, 523.25] },
        ],
      },
      {
        name: "Synthwave", barLen: 1.6, pad: "sawtooth", arp: "sawtooth",
        cutoff: 2600, q: 2.5, delay: 0.24, fb: 0.3, gain: 0.12, useArp: true, bass: true,
        prog: [
          { pad: [130.81, 155.56, 196.0], arp: [523.25, 622.25, 784.0, 622.25] },
          { pad: [174.61, 207.65, 261.63], arp: [698.46, 830.61, 1046.5, 830.61] },
          { pad: [207.65, 261.63, 311.13], arp: [830.61, 1046.5, 1244.5, 1046.5] },
          { pad: [233.08, 293.66, 349.23], arp: [932.33, 1174.66, 1396.91, 1174.66] },
        ],
      },
      {
        name: "8-bit Quest", barLen: 1.4, pad: "square", arp: "square",
        cutoff: 3800, q: 1, delay: 0.16, fb: 0.18, gain: 0.09, useArp: true, bass: true,
        prog: [
          { pad: [261.63, 329.63, 392.0], arp: [523.25, 659.25, 784.0, 659.25] },
          { pad: [196.0, 246.94, 293.66], arp: [392.0, 493.88, 587.33, 493.88] },
          { pad: [220.0, 261.63, 329.63], arp: [440.0, 523.25, 659.25, 523.25] },
          { pad: [174.61, 220.0, 261.63], arp: [349.23, 440.0, 523.25, 440.0] },
        ],
      },
      {
        name: "Ambient Drift", barLen: 3.2, pad: "sine", arp: "sine",
        cutoff: 900, q: 0.4, delay: 0.5, fb: 0.42, gain: 0.2, useArp: false, bass: true,
        prog: [
          { pad: [174.61, 261.63, 349.23] },
          { pad: [220.0, 329.63, 440.0] },
          { pad: [146.83, 220.0, 293.66] },
          { pad: [116.54, 174.61, 233.08] },
        ],
      },
    ];

    let ctx, master, filter, delay, feedback;
    let current = -1, timer = null, bar = 0, nextTime = 0;

    function buildGraph() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      delay = ctx.createDelay();
      feedback = ctx.createGain();
      filter.connect(master);
      filter.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(master);
      master.connect(ctx.destination);
    }

    function note(freq, start, dur, type, peak) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.connect(g);
      g.connect(filter);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(peak, start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.start(start);
      o.stop(start + dur + 0.05);
    }

    function scheduleBar() {
      const t = TRACKS[current];
      const chord = t.prog[bar % t.prog.length];
      chord.pad.forEach((f) => note(f, nextTime, t.barLen * 0.95, t.pad, 0.05));
      if (t.bass) note(chord.pad[0] / 2, nextTime, t.barLen * 0.95, "triangle", 0.06);
      if (t.useArp && chord.arp) {
        const step = t.barLen / chord.arp.length;
        chord.arp.forEach((f, i) => note(f, nextTime + i * step, step * 0.9, t.arp, 0.08));
      }
      bar++;
      nextTime += t.barLen;
      const ahead = (nextTime - ctx.currentTime) * 1000 - 120;
      timer = setTimeout(scheduleBar, Math.max(0, ahead));
    }

    function play(index) {
      if (!ctx) buildGraph();
      if (ctx.state === "suspended") ctx.resume();
      if (timer) clearTimeout(timer);
      const t = TRACKS[index];
      current = index;
      bar = 0;
      master.gain.value = t.gain;
      filter.frequency.value = t.cutoff;
      filter.Q.value = t.q;
      delay.delayTime.value = t.delay;
      feedback.gain.value = t.fb;
      nextTime = ctx.currentTime + 0.08;
      scheduleBar();
      cd.classList.add("is-playing");
      updateActive();
    }

    function stop() {
      if (timer) clearTimeout(timer);
      timer = null;
      current = -1;
      if (ctx) ctx.suspend();
      cd.classList.remove("is-playing");
      updateActive();
    }

    const items = [...cdMenu.querySelectorAll(".cd-menu__item")];
    function updateActive() {
      items.forEach((b) => b.classList.toggle("is-active", b.dataset.track == current));
    }

    function toggleMenu(open) {
      const show = open === undefined ? cdMenu.hidden : open;
      cdMenu.hidden = !show;
      cd.setAttribute("aria-expanded", String(show));
    }

    cd.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    items.forEach((b) => {
      b.addEventListener("click", () => {
        if (b.dataset.track === "stop") stop();
        else play(parseInt(b.dataset.track, 10));
      });
    });

    // click outside closes the menu
    document.addEventListener("click", (e) => {
      if (!cdMenu.hidden && !e.target.closest(".cd-wrap")) toggleMenu(false);
    });
  }
})();
