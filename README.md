# Sakura Noskor — Personal Site

A custom animated portfolio (no build step) — plain HTML / CSS / JS, hosted on GitHub Pages.

## Features
- 🌸 Falling cherry-blossom petals (canvas)
- Typewriter tagline, scroll-reveal, count-up stats, equalizer + cursor glow
- Sections: About · Experience · Projects · Interests (Computer Vision · Music · Live Concerts) · Contact
- Fully responsive + respects `prefers-reduced-motion`

## Local preview
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Hosting (GitHub Pages)
The site lives at the repo **root** and is mirrored into **`docs/`**, so it works whether Pages
serves from `/ (root)` or `/docs` on the `main` branch. Edit the root files, then copy to `docs/`:
```bash
cp index.html styles.css script.js docs/
```
