# Atelier Couleur Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free, self-paced, French, 8-lesson interactive course on color in interior design as a static site in `atelier-couleur/`.

**Architecture:** Plain HTML pages sharing one stylesheet (`assets/style.css`, design system) and one runtime (`assets/course.js`: lesson manifest, localStorage progress, nav injection, reusable widgets — RYB wheel, harmony math, quiz engine, SVG room). Each lesson page adds its own widgets in an inline `<script>` and widget-specific CSS in an inline `<style>` — lesson tasks never edit shared files.

**Tech Stack:** Vanilla HTML/CSS/JS. Canvas (wheel), inline SVG with CSS-variable fills (rooms). No build, no dependencies, no backend.

**Spec:** `atelier-couleur/SPEC.md` — READ IT FIRST. It contains the verified course content (facts, corrected terminology, resource URLs with caveats) that every lesson must teach. The plan references spec facts; the spec is the source of truth for copy.

## Global Constraints

- All copy in French, tutoiement, decorator vocabulary. Terminology exactly as in SPEC (e.g. "complémentaire divisée", never "complémentaires adoucies").
- Both themes via token pattern (SPEC "Design system"): full light palette on bare `:root`; dark tokens under `@media (prefers-color-scheme: dark)` guarded `:root:not([data-theme="light"])`; repeated under `:root[data-theme="dark"]`. Never define a color only inside a media/`[data-theme]` block. `body` background from a token.
- No external requests except Google Fonts + outbound resource links. No JS/CSS libraries.
- Every widget: IIFE bound to its container, `if (!el) return;` guard. A broken widget must not break the page.
- Accessibility: `:focus-visible` outlines, quiz/game controls are real `<button>`s, `prefers-reduced-motion` kills animations, canvas/SVG get `role="img"` + `aria-label`.
- localStorage access always try/catch'd; pages fully functional without it.
- Verification: `node --check` for `course.js`; pages are verified visually by the orchestrator at review checkpoints (open in browser, both themes). Subagents verify structure (files exist, ids referenced by JS exist in markup, links resolve).
- Commit after each task, message prefix `feat(atelier-couleur):`, trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

### Page skeleton (every lesson page, exact template)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{TITRE} — Atelier Couleur</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Prata&family=Karla:ital,wght@0,400;0,500;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
<style>/* styles propres à la page */</style>
</head>
<body data-lesson="{SLUG}">
<header class="site-header" data-nav></header>
<main>
  <p class="eyebrow">Leçon {N} · {PARTIE: Comprendre|Outils|Application} · ~{MIN} min</p>
  <h1>{TITRE}</h1>
  <p class="lede">{ACCROCHE}</p>
  <!-- sections de contenu + panneaux .atelier -->
  <aside class="further">
    <h2>Pour aller plus loin</h2>
    <ul><!-- liens du SPEC pour cette leçon, avec caveats (EN, compte requis…) --></ul>
  </aside>
</main>
<footer class="site-footer" data-lesson-nav></footer>
<script src="assets/course.js"></script>
<script>/* widgets de la page */</script>
</body>
</html>
```

Interactive panels: `<section class="atelier"><h2>Atelier — {nom}</h2>…</section>`.

---

### Task 1: Design system — `assets/style.css`

**Files:**
- Create: `atelier-couleur/assets/style.css`

**Interfaces:**
- Produces (class contract used by all pages): `.site-header`, `.site-footer`, `.eyebrow`, `.lede`, `.atelier`, `.further`, `.btn`, `.btn-done`, `.pager`, `.quiz`, `.quiz-choice`, `.is-right`, `.is-wrong`, `.quiz-feedback`, `.quiz-score`, `.swatch`, `.hex`, `.room`, `.card-grid`, `.flip`, `.note`, `.progress-list`, `.done-check`. CSS custom properties: `--paper --surface --ink --muted --line --accent --accent-ink --good --bad`.

- [ ] **Step 1: Write the stylesheet**

Complete file (extend spacing/detail freely, keep every token and class):

```css
/* Atelier Couleur — design system */
:root {
  --paper: #FBFAF8; --surface: #F2EFE8; --ink: #28231D; --muted: #6E6659;
  --line: #E5DFD4; --accent: #3542A0; --accent-ink: #FFFFFF;
  --good: #2E7D4F; --bad: #B3402E;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #1C1A17; --surface: #26221E; --ink: #EDE8E0; --muted: #A79D8E;
    --line: #3A362F; --accent: #8A96E8; --accent-ink: #16141C;
    --good: #7BC89A; --bad: #E08D7D;
  }
}
:root[data-theme="dark"] {
  --paper: #1C1A17; --surface: #26221E; --ink: #EDE8E0; --muted: #A79D8E;
  --line: #3A362F; --accent: #8A96E8; --accent-ink: #16141C;
  --good: #7BC89A; --bad: #E08D7D;
}

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background: var(--paper); color: var(--ink);
  font-family: Karla, "Helvetica Neue", Arial, sans-serif;
  font-size: 1.0625rem; line-height: 1.65;
}
h1, h2, h3 {
  font-family: Prata, Georgia, "Times New Roman", serif;
  font-weight: 400; line-height: 1.18; text-wrap: balance; margin: 2.2em 0 .5em;
}
h1 { font-size: 2.3rem; margin-top: .4em; }
h2 { font-size: 1.45rem; }
h3 { font-size: 1.15rem; }
a { color: var(--accent); }
code, .hex { font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace; font-size: .92em; }
main { max-width: 68ch; margin: 0 auto; padding: 16px 24px 96px; }
.eyebrow { text-transform: uppercase; letter-spacing: .14em; font-size: .75rem; color: var(--accent); font-weight: 700; margin-bottom: 0; }
.lede { font-size: 1.2rem; color: var(--muted); }
.note { border-left: 3px solid var(--accent); background: var(--surface); padding: 12px 16px; font-size: .95rem; }

.site-header { display: flex; gap: 16px; align-items: baseline; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid var(--line); }
.site-header .brand { font-family: Prata, Georgia, serif; font-size: 1.1rem; color: var(--ink); text-decoration: none; }
.site-header .crumb { color: var(--muted); font-size: .85rem; }

.atelier { background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: 24px 28px 28px; margin: 40px -48px; }
.atelier > h2 { margin-top: 0; font-size: 1.2rem; }
@media (max-width: 900px) { .atelier { margin-inline: -12px; } }

.btn, .quiz-choice, .btn-done {
  font: inherit; cursor: pointer; border: 1px solid var(--line);
  background: var(--paper); color: var(--ink); border-radius: 4px; padding: 8px 14px;
}
.btn:hover, .quiz-choice:hover { border-color: var(--accent); }
.btn.is-active, .btn[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.quiz fieldset { border: 1px solid var(--line); border-radius: 6px; padding: 16px; margin: 16px 0; }
.quiz legend { font-weight: 700; padding: 0 6px; }
.quiz-choice { display: block; width: 100%; text-align: left; margin: 6px 0; }
.quiz-choice.is-right { border-color: var(--good); box-shadow: inset 3px 0 0 var(--good); }
.quiz-choice.is-wrong { border-color: var(--bad); box-shadow: inset 3px 0 0 var(--bad); }
.quiz-feedback { font-size: .95rem; color: var(--muted); margin: 10px 0 0; }
.quiz-score { font-weight: 700; }

.swatch { display: inline-block; width: 72px; height: 72px; border-radius: 6px; border: 1px solid var(--line); vertical-align: middle; }
.room { width: 100%; height: auto; border-radius: 6px; border: 1px solid var(--line); display: block; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
.flip { perspective: 800px; cursor: pointer; border: 0; background: none; padding: 0; font: inherit; color: inherit; }
.flip .inner { position: relative; transform-style: preserve-3d; transition: transform .5s; min-height: 190px; }
.flip.is-flipped .inner { transform: rotateY(180deg); }
.flip .face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 6px; border: 1px solid var(--line); padding: 12px; }
.flip .back { transform: rotateY(180deg); background: var(--surface); font-size: .85rem; text-align: left; overflow: auto; }

.site-footer { max-width: 68ch; margin: 0 auto; padding: 0 24px 64px; }
.pager { display: flex; justify-content: space-between; gap: 16px; margin-top: 18px; border-top: 1px solid var(--line); padding-top: 18px; }
.pager a { text-decoration: none; max-width: 45%; }
.btn-done[aria-pressed="true"] { background: var(--good); border-color: var(--good); color: var(--paper); }

.progress-list { list-style: none; padding: 0; }
.progress-list li { display: flex; gap: 12px; align-items: baseline; padding: 12px 4px; border-bottom: 1px solid var(--line); }
.progress-list .done-check { color: var(--good); font-weight: 700; width: 1.2em; }
.progress-list a { text-decoration: none; }
.progress-list .meta { margin-left: auto; color: var(--muted); font-size: .85rem; white-space: nowrap; }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 2: Verify structure**

Run: `grep -c 'data-theme="dark"' atelier-couleur/assets/style.css` → ≥1; `grep -c 'prefers-color-scheme' …` → 1; `grep -c 'prefers-reduced-motion' …` → 1.

- [ ] **Step 3: Commit** — `feat(atelier-couleur): design system stylesheet`

---

### Task 2: Shared runtime — `assets/course.js`

**Files:**
- Create: `atelier-couleur/assets/course.js`

**Interfaces:**
- Produces `window.AC`:
  - `AC.LESSONS: [{slug, title, min}]` (8 entries, order = course order)
  - `AC.progress: {get(): string[], has(slug): boolean, toggle(slug)}`
  - `AC.HUES: [{name, hex, family: 'primaire'|'secondaire'|'tertiaire', temp: 'chaud'|'froid'|'transition'}]` — 12 RYB hues, index 0 = Rouge, clockwise
  - `AC.HARMONIES: {camaieu|analogue|complementaire|divisee|triadique|tetradique: {label, of(i): number[]}}`
  - `AC.drawWheel(canvas, state)` — `state: {selected: number[], onPick(i)}`; call again to re-render
  - `AC.quiz(el, items)` — `items: [{q, choices: [{t, ok: boolean, why}]}]`; immediate feedback, score at end
  - `AC.roomSVG()` → SVG string; recolorable via CSS vars `--c60 --c30 --c10` on a wrapper element; the SVG has class `room`
  - Auto-runs on DOMContentLoaded: fills `[data-nav]` header and `[data-lesson-nav]` footer from `body[data-lesson]`

- [ ] **Step 1: Write the runtime**

Complete file:

```js
/* Atelier Couleur — runtime partagé */
(function () {
  'use strict';

  const LESSONS = [
    { slug: '01-vocabulaire', title: 'La couleur, comment ça marche', min: 25 },
    { slug: '02-cercle', title: 'Le cercle chromatique', min: 20 },
    { slug: '03-harmonies', title: 'Les harmonies de couleurs', min: 30 },
    { slug: '04-psychologie', title: 'Psychologie & symbolique', min: 25 },
    { slug: '05-lumiere', title: 'La lumière change tout', min: 30 },
    { slug: '06-palette', title: 'Composer une palette', min: 30 },
    { slug: '07-analyse', title: 'Analyser un espace', min: 25 },
    { slug: '08-exercices', title: 'Exercices & auto-évaluation', min: 30 },
  ];

  const KEY = 'atelier-couleur:progress';
  const progress = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } },
    has(slug) { return progress.get().includes(slug); },
    toggle(slug) {
      try {
        const p = progress.get();
        const i = p.indexOf(slug);
        if (i >= 0) p.splice(i, 1); else p.push(slug);
        localStorage.setItem(KEY, JSON.stringify(p));
      } catch (e) { /* stockage indisponible : on continue sans */ }
    },
  };

  const HUES = [
    { name: 'Rouge', hex: '#C93A32', family: 'primaire', temp: 'chaud' },
    { name: 'Rouge orangé', hex: '#D95B2E', family: 'tertiaire', temp: 'chaud' },
    { name: 'Orangé', hex: '#E67E2E', family: 'secondaire', temp: 'chaud' },
    { name: 'Jaune orangé', hex: '#EFA63C', family: 'tertiaire', temp: 'chaud' },
    { name: 'Jaune', hex: '#F0C64B', family: 'primaire', temp: 'chaud' },
    { name: 'Jaune vert', hex: '#A9B24A', family: 'tertiaire', temp: 'transition' },
    { name: 'Vert', hex: '#5D9C55', family: 'secondaire', temp: 'froid' },
    { name: 'Bleu vert', hex: '#3E8B89', family: 'tertiaire', temp: 'froid' },
    { name: 'Bleu', hex: '#35669F', family: 'primaire', temp: 'froid' },
    { name: 'Bleu violet', hex: '#4B4F9B', family: 'tertiaire', temp: 'froid' },
    { name: 'Violet', hex: '#6F4B9B', family: 'secondaire', temp: 'froid' },
    { name: 'Rouge violet', hex: '#9C3F72', family: 'tertiaire', temp: 'transition' },
  ];

  const HARMONIES = {
    camaieu: { label: 'Camaïeu', of: (i) => [i] },
    analogue: { label: 'Analogues', of: (i) => [(i + 11) % 12, i, (i + 1) % 12] },
    complementaire: { label: 'Complémentaires', of: (i) => [i, (i + 6) % 12] },
    divisee: { label: 'Complémentaire divisée', of: (i) => [i, (i + 5) % 12, (i + 7) % 12] },
    triadique: { label: 'Triadique', of: (i) => [i, (i + 4) % 12, (i + 8) % 12] },
    tetradique: { label: 'Tétradique', of: (i) => [i, (i + 3) % 12, (i + 6) % 12, (i + 9) % 12] },
  };

  function drawWheel(canvas, state) {
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth || 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const c = size / 2, r0 = size * 0.22, r1 = size * 0.46;
    const ink = getComputedStyle(document.body).getPropertyValue('--ink').trim() || '#000';
    HUES.forEach((h, i) => {
      const a0 = ((i - 0.5) / 12) * 2 * Math.PI - Math.PI / 2;
      const a1 = ((i + 0.5) / 12) * 2 * Math.PI - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(c, c, r1, a0, a1);
      ctx.arc(c, c, r0, a1, a0, true);
      ctx.closePath();
      const dim = state.selected.length && !state.selected.includes(i);
      ctx.globalAlpha = dim ? 0.22 : 1;
      ctx.fillStyle = h.hex;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (state.selected.includes(i)) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = ink;
        ctx.stroke();
      }
    });
    canvas.style.cursor = 'pointer';
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - c, y = e.clientY - rect.top - c;
      const d = Math.hypot(x, y);
      if (d < r0 || d > r1) return;
      let ang = Math.atan2(y, x) + Math.PI / 2;
      if (ang < 0) ang += 2 * Math.PI;
      const i = Math.round((ang / (2 * Math.PI)) * 12) % 12;
      if (state.onPick) state.onPick(i);
    };
  }

  function quiz(el, items) {
    if (!el) return;
    let score = 0, answered = 0;
    const wrap = document.createElement('div');
    wrap.className = 'quiz';
    items.forEach((item) => {
      const fs = document.createElement('fieldset');
      const lg = document.createElement('legend');
      lg.textContent = item.q;
      fs.append(lg);
      const fb = document.createElement('p');
      fb.className = 'quiz-feedback';
      item.choices.forEach((ch) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-choice';
        b.textContent = ch.t;
        b.addEventListener('click', () => {
          if (fs.dataset.done) return;
          fs.dataset.done = '1';
          answered += 1;
          if (ch.ok) score += 1;
          b.classList.add(ch.ok ? 'is-right' : 'is-wrong');
          fb.textContent = (ch.ok ? '✔ ' : '✘ ') + ch.why;
          fs.append(fb);
          if (answered === items.length) {
            const s = document.createElement('p');
            s.className = 'quiz-score';
            s.textContent = 'Score : ' + score + ' / ' + items.length;
            wrap.append(s);
          }
        });
        fs.append(b);
      });
      wrap.append(fs);
    });
    el.append(wrap);
  }

  function roomSVG() {
    return '' +
'<svg class="room" viewBox="0 0 640 400" role="img" aria-label="Salon illustré : murs, canapé, rideaux, coussins et accessoires">' +
'<rect width="640" height="400" fill="var(--c60, #E5DFD4)"/>' +
'<rect y="308" width="640" height="92" fill="#B49873"/>' +
'<rect y="308" width="640" height="4" fill="#96794F" opacity=".5"/>' +
'<rect x="36" y="56" width="150" height="188" fill="#D8E7F2" stroke="#8C8478" stroke-width="6"/>' +
'<rect x="108" y="56" width="6" height="188" fill="#8C8478"/>' +
'<rect x="18" y="44" width="34" height="230" fill="var(--c30, #8FA3A0)"/>' +
'<rect x="190" y="44" width="34" height="230" fill="var(--c30, #8FA3A0)"/>' +
'<rect x="250" y="66" width="118" height="92" fill="var(--c10, #C99A5B)"/>' +
'<rect x="261" y="77" width="96" height="70" fill="#F4F1E8"/>' +
'<circle cx="309" cy="112" r="22" fill="var(--c10, #C99A5B)" opacity=".55"/>' +
'<rect x="380" y="156" width="212" height="52" rx="12" fill="var(--c30, #8FA3A0)"/>' +
'<rect x="368" y="196" width="236" height="86" rx="14" fill="var(--c30, #8FA3A0)"/>' +
'<rect x="388" y="204" width="56" height="38" rx="8" fill="var(--c10, #C99A5B)"/>' +
'<rect x="456" y="204" width="56" height="38" rx="8" fill="var(--c10, #C99A5B)" opacity=".65"/>' +
'<rect x="380" y="282" width="26" height="30" fill="#7A6A52"/>' +
'<rect x="566" y="282" width="26" height="30" fill="#7A6A52"/>' +
'<ellipse cx="200" cy="340" rx="128" ry="24" fill="var(--c30, #8FA3A0)" opacity=".5"/>' +
'<rect x="606" y="120" width="8" height="130" fill="#5E6B54"/>' +
'<path d="M610 120 q -26 -30 -8 -58 q 20 24 8 58 z" fill="#6F8161"/>' +
'<path d="M610 130 q 26 -24 12 -52 q -22 20 -12 52 z" fill="#7C8F6C"/>' +
'<rect x="588" y="250" width="44" height="60" fill="var(--c10, #C99A5B)"/>' +
'</svg>';
  }

  function initPage() {
    const slug = document.body.dataset.lesson || null;
    const i = slug ? LESSONS.findIndex((l) => l.slug === slug) : -1;
    const header = document.querySelector('[data-nav]');
    if (header) {
      header.innerHTML =
        '<a class="brand" href="index.html">Atelier Couleur</a>' +
        (i >= 0 ? '<span class="crumb">Leçon ' + (i + 1) + ' / ' + LESSONS.length + '</span>' : '');
    }
    const foot = document.querySelector('[data-lesson-nav]');
    if (foot && i >= 0) {
      const prev = LESSONS[i - 1], next = LESSONS[i + 1];
      const doneLabel = (d) => (d ? '✔ Leçon terminée' : 'Marquer comme terminée');
      foot.innerHTML =
        '<button type="button" class="btn-done" aria-pressed="' + progress.has(slug) + '">' +
        doneLabel(progress.has(slug)) + '</button>' +
        '<nav class="pager" aria-label="Navigation entre leçons">' +
        (prev
          ? '<a href="' + prev.slug + '.html">← ' + prev.title + '</a>'
          : '<a href="index.html">← Accueil</a>') +
        (next
          ? '<a href="' + next.slug + '.html">' + next.title + ' →</a>'
          : '<a href="index.html">Retour à l’accueil →</a>') +
        '</nav>';
      foot.querySelector('.btn-done').addEventListener('click', (e) => {
        progress.toggle(slug);
        const d = progress.has(slug);
        e.target.textContent = doneLabel(d);
        e.target.setAttribute('aria-pressed', String(d));
      });
    }
  }

  window.AC = { LESSONS, progress, HUES, HARMONIES, drawWheel, quiz, roomSVG };
  document.addEventListener('DOMContentLoaded', initPage);
})();
```

- [ ] **Step 2: Verify** — Run: `node --check atelier-couleur/assets/course.js` → exit 0.
- [ ] **Step 3: Commit** — `feat(atelier-couleur): shared runtime (manifest, progress, wheel, quiz, room)`

---

### Task 3: Accueil — `index.html`

**Files:**
- Create: `atelier-couleur/index.html`

**Interfaces:**
- Consumes: `AC.LESSONS`, `AC.progress`, classes `.progress-list .done-check .meta`.

- [ ] **Step 1: Write the page**

Use the page skeleton WITHOUT `data-lesson` on body and WITHOUT `[data-lesson-nav]` footer content (keep the footer element with a small credit line: « Cours libre et gratuit, construit à partir de sources vérifiées — aucune inscription, ta progression reste dans ton navigateur. »). Content:

1. `h1` **Atelier Couleur** ; lede : apprendre à choisir et marier les couleurs en décoration d'intérieur — l'équivalent d'une journée de formation pro, gratuit, à ton rythme.
2. Short intro (3 paragraphs): what you'll be able to do (analyser une pièce, construire une harmonie, composer une palette qui tient compte de la lumière) ; how it works (8 leçons, ~20-30 min, chaque concept se manipule) ; trajectory **Comprendre (1-2) → Outils (3-5) → Application (6-8)**.
3. `#lessons` container → JS renders `ul.progress-list`: per lesson `✔` (or `·`) + `Leçon N — Titre` link + `.meta` "~X min". Above the list, if progress non-empty and incomplete: link « Reprendre : Leçon N — Titre » pointing at first uncompleted lesson.
4. `.note` : la progression est enregistrée uniquement dans ce navigateur.

Inline script:

```js
(function () {
  const el = document.getElementById('lessons');
  if (!el || !window.AC) return;
  const done = AC.progress.get();
  const next = AC.LESSONS.find((l) => !done.includes(l.slug));
  if (done.length && next) {
    const p = document.createElement('p');
    const i = AC.LESSONS.indexOf(next);
    p.innerHTML = '<a class="btn" href="' + next.slug + '.html">Reprendre : Leçon ' + (i + 1) + ' — ' + next.title + '</a>';
    el.append(p);
  }
  const ul = document.createElement('ul');
  ul.className = 'progress-list';
  AC.LESSONS.forEach((l, i) => {
    const li = document.createElement('li');
    const d = done.includes(l.slug);
    li.innerHTML = '<span class="done-check">' + (d ? '✔' : '·') + '</span>' +
      '<a href="' + l.slug + '.html">Leçon ' + (i + 1) + ' — ' + l.title + '</a>' +
      '<span class="meta">~' + l.min + ' min</span>';
    ul.append(li);
  });
  el.append(ul);
})();
```

- [ ] **Step 2: Verify** — `grep -c 'id="lessons"' atelier-couleur/index.html` → 1; all 8 lesson hrefs will be produced by JS (no hardcoded list to check). Orchestrator opens in browser at review.
- [ ] **Step 3: Commit** — `feat(atelier-couleur): accueil with parcours and progression`

---

### Task 4: Leçon 01 — `01-vocabulaire.html`

**Files:**
- Create: `atelier-couleur/01-vocabulaire.html`

**Interfaces:**
- Consumes: page skeleton, `.atelier`, `.swatch`, `.hex`, `.btn`.

**Content (write full French prose from SPEC §01):** TSL (teinte/saturation/luminosité), valeur ≈ clair-obscur, ton & ton sur ton, camaïeu (définition CNRTL : tons différents d'une seule couleur), chaudes avancent / froides reculent (levier spatial : une pièce étroite paraît plus large avec un mur du fond froid), la chaleur est relative (un bleu chaud existe).

- [ ] **Step 1: Write page + Atelier 1 « Explorateur TSL »**

Three `<input type="range">` (T 0-360, S 0-100 default 70, L 0-100 default 55), a 120px swatch, `.hex` readout, and a live sentence naming what changed. Widget:

```js
(function () {
  const el = document.getElementById('tsl');
  if (!el) return;
  const [t, s, l] = ['t', 's', 'l'].map((id) => document.getElementById('tsl-' + id));
  const sw = document.getElementById('tsl-swatch'), out = document.getElementById('tsl-out');
  function hex(h, sv, lv) {
    const a = (sv / 100) * Math.min(lv / 100, 1 - lv / 100);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const c = lv / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return '#' + f(0) + f(8) + f(4);
  }
  function render() {
    const c = 'hsl(' + t.value + ' ' + s.value + '% ' + l.value + '%)';
    sw.style.background = c;
    out.textContent = hex(+t.value, +s.value, +l.value).toUpperCase() +
      ' — teinte ' + t.value + '°, saturation ' + s.value + ' %, luminosité ' + l.value + ' %';
  }
  [t, s, l].forEach((r) => r.addEventListener('input', render));
  render();
})();
```

- [ ] **Step 2: Atelier 2 « Chaud ou froid ? »**

8 swatch cards, each with two buttons Chaud / Froid, immediate feedback. Data (include the two nuance traps):

```js
const ITEMS = [
  { hex: '#C93A32', name: 'Rouge brique', t: 'chaud', why: 'Famille rouge→jaune : chaud.' },
  { hex: '#35669F', name: 'Bleu de Prusse', t: 'froid', why: 'Les bleus sont le cœur des froids.' },
  { hex: '#EFA63C', name: 'Ocre doré', t: 'chaud', why: 'Jaune orangé : chaud, il avance.' },
  { hex: '#3E8B89', name: 'Bleu canard', t: 'froid', why: 'Bleu-vert : froid, il recule.' },
  { hex: '#9C3F72', name: 'Framboise', t: 'chaud', why: 'Piège : un rouge violacé reste chaud… mais c’est un chaud « refroidi » par le bleu. La chaleur est relative.' },
  { hex: '#A9B24A', name: 'Vert anis', t: 'froid', why: 'Piège inverse : un vert jauni est un froid « réchauffé ». Les transitions existent.' },
  { hex: '#E67E2E', name: 'Orangé', t: 'chaud', why: 'Le plus chaud du cercle.' },
  { hex: '#6F4B9B', name: 'Violet', t: 'froid', why: 'Dominante bleue : froid.' },
];
```

Widget: render each item as a card (swatch + name + two buttons); on click, disable the pair, mark `is-right`/`is-wrong`, show `why`. Reuse quiz styling classes.

- [ ] **Step 3: Atelier 3 « Le test de la valeur »**

Two sample pairs side by side: A = rouge `#C0453C` / vert `#4E8A54` (hues differ, values close), B = bleu clair `#B9CBDE` / bleu nuit `#25344E` (camaïeu, values far apart). A button « Plisser les yeux » toggles class `squint` on the container; CSS: `.squint .pair { filter: grayscale(1) blur(3px); }`. Copy explains: contraste de teinte ≠ contraste de valeur; A devient presque uniforme, B reste lisible — c'est la valeur qui structure une pièce.

- [ ] **Step 4: « Pour aller plus loin »** — Adobe Color (roue interactive, FR) ; Itten *Art de la couleur* (médiathèque, l'édition abrégée est la plus courante).
- [ ] **Step 5: Verify** — `grep -c 'id="tsl"' …` → 1; ids `tsl-t tsl-s tsl-l tsl-swatch tsl-out` all present; page loads course.js.
- [ ] **Step 6: Commit** — `feat(atelier-couleur): leçon 01 vocabulaire`

---

### Task 5: Leçon 02 — `02-cercle.html`

**Files:**
- Create: `atelier-couleur/02-cercle.html`

**Interfaces:**
- Consumes: `AC.HUES`, `AC.drawWheel`.

**Content (SPEC §02):** cercle RYB de peintre (Itten, 12 teintes), primaires rouge/jaune/bleu → secondaires → tertiaires ; caveat honnête d'une phrase : physiquement les primaires soustractives sont cyan/magenta/jaune, le cercle RYB reste l'outil d'intuition pour mélanger et marier.

- [ ] **Step 1: Atelier 1 « La roue »**

`<canvas id="wheel" style="width:min(360px,90%)" aria-label="Cercle chromatique de 12 teintes" role="img"></canvas>` + info panel `#wheel-info`. Script: `const state = { selected: [], onPick(i) { state.selected = [i]; AC.drawWheel(cv, state); info.innerHTML = name + famille + température; } }; AC.drawWheel(cv, state);` Info shows: `AC.HUES[i].name`, `famille : primaire|secondaire|tertiaire`, `température : chaud|froid|transition` with one-line explanation per family. Re-render on `resize`.

- [ ] **Step 2: Atelier 2 « Le mélangeur »**

Buttons for the 3 primaries; pick two → shows resulting secondary swatch + equation « Rouge + Jaune = Orangé ». Then a second row: pick a primary + adjacent secondary → tertiary (« Bleu + Vert = Bleu vert »). Data: pairs map onto `AC.HUES` indices: R(0)+J(4)=Orangé(2), J(4)+B(8)=Vert(6), B(8)+R(0)=Violet(10); tertiaires: 0+2→1, 2+4→3, 4+6→5, 6+8→7, 8+10→9, 10+0→11. Implement: selection state array, on 2 picks look up map (key = sorted indices joined), render swatches `AC.HUES[k].hex`, reset button.

- [ ] **Step 3: « Pour aller plus loin »** — Adobe Color ; Paletton (EN, sans compte, simulation daltonisme).
- [ ] **Step 4: Verify** — `node --check` n/a (inline); grep ids `wheel`, `wheel-info`, `mixer`; page references `AC.drawWheel`.
- [ ] **Step 5: Commit** — `feat(atelier-couleur): leçon 02 cercle chromatique`

---

### Task 6: Leçon 03 — `03-harmonies.html`

**Files:**
- Create: `atelier-couleur/03-harmonies.html`

**Interfaces:**
- Consumes: `AC.HUES`, `AC.HARMONIES`, `AC.drawWheel`, `AC.quiz`.

**Content (SPEC §03):** the 6 harmony types with exact French names (camaïeu/monochrome ; analogues ; complémentaires ; **complémentaire divisée** — syn. « complémentaires adjacentes » ; triadique ; tétradique) + the practical scheme **neutres + couleur d'accent**. Weave in Itten contrasts: chaud-froid, clair-obscur, complémentaires, quantité (motive la proportion → leçon 6) ; sidebar `.note` **contraste simultané** : pourquoi un gris paraît verdâtre à côté d'un rouge.

- [ ] **Step 1: Atelier 1 « Générateur d'harmonies »**

Wheel canvas + 6 mode buttons (`AC.HARMONIES` keys) + output row of swatches with `.hex` labels. State `{base: 8, mode: 'complementaire'}`; on pick or mode change: `const idx = AC.HARMONIES[mode].of(base); AC.drawWheel(cv, {selected: idx, onPick});` render swatches. For `camaieu`, output 4 swatches of the base hue at L 30/45/60/80 (build with `color-mix(in srgb, HEX, white/black N%)` or precomputed hsl string) — copy explains camaïeu varies value, not hue.

- [ ] **Step 2: Atelier 2 « Devine l'harmonie »**

4 stylized SVG moodboards (5 horizontal color bands each, inline SVG) + `AC.quiz`. Boards: (1) camaïeu de bleus `#DCE6F0 #A9C0D8 #6E93B8 #3D6285 #22405C`; (2) analogues jaune/orangé `#F0C64B #EFA63C #E67E2E #D95B2E` + neutre `#EDE7DA`; (3) complémentaires bleu/orangé `#35669F #E67E2E` + neutres; (4) triadique rouge/jaune/bleu désaturés `#B05A52 #D8B860 #5A7B9E` + neutre. Each quiz item: q = « Moodboard N : quelle harmonie ? », 4 choices, `why` names the wheel geometry.

- [ ] **Step 3: « Pour aller plus loin »** — Paletton ; Coolors (EN, freemium) ; Itten.
- [ ] **Step 4: Verify** — greps: `complémentaire divisée` present, `adoucies` ABSENT (`! grep -qi 'adoucie' 03-harmonies.html`).
- [ ] **Step 5: Commit** — `feat(atelier-couleur): leçon 03 harmonies`

---

### Task 7: Leçon 04 — `04-psychologie.html`

**Files:**
- Create: `atelier-couleur/04-psychologie.html`

**Interfaces:**
- Consumes: `AC.quiz`, `.card-grid`, `.flip`.

**Content (SPEC §04):** 8 cartes + honesty sidebar `.note` : la symbolique est culturelle et historique, pas universelle (Michel Pastoureau) ; les preuves scientifiques d'effets psychologiques sont jeunes et fragiles (Elliot 2015) — utilise ces associations comme des conventions partagées, pas des lois.

- [ ] **Step 1: Atelier 1 « Les cartes »**

Flip cards (button.flip > .inner > .face.front/.face.back, toggle `is-flipped` on click). Data:

```js
const CARDS = [
  { hex: '#35669F', name: 'Bleu', back: 'Calme, confiance, fraîcheur. En intérieur : chambres, bureaux, salles de bain. Au nord il grise — voir leçon 5.' },
  { hex: '#5D9C55', name: 'Vert', back: 'Nature, équilibre, repos visuel. Pièces à vivre, chambres ; se marie aux bois.' },
  { hex: '#F0C64B', name: 'Jaune', back: 'Lumière, énergie, optimisme. Entrées sombres, cuisines ; par touches dans les pièces de repos.' },
  { hex: '#C93A32', name: 'Rouge', back: 'Stimulant, convivial, appétit. Salle à manger, par touches (10 %) ; envahissant en grande surface.' },
  { hex: '#C1683F', name: 'Terracotta', back: 'Chaleur, terre, convivialité méditerranéenne. Salons, cuisines ; superbe avec des neutres et du lin.' },
  { hex: '#D8A0A6', name: 'Rose', back: 'Douceur, intimité. Chambres, coins lecture ; les roses terreux vieillissent mieux que les roses bonbon.' },
  { hex: '#B8AE9C', name: 'Neutres', back: 'Beige, grège, blanc cassé : la base des 60 %. Leur sous-ton (chaud/froid) décide de tout — leçon 5.' },
  { hex: '#2E2B28', name: 'Noir', back: 'Profondeur, structure, graphisme. Encadrements, soubassements, petites pièces assumées.' },
];
```

- [ ] **Step 2: Atelier 2 « Quelle couleur pour quelle pièce ? »**

`AC.quiz` with 4 scenarios; several answers defensible — the `why` says so explicitly. Items: chambre d'adulte (ok: bleu/vert doux — why mentions rose terreux aussi valable) ; cuisine sombre orientée nord (ok: jaune/ocre — why: compenser la lumière froide) ; salle à manger conviviale (ok: touches de rouge/terracotta) ; bureau où se concentrer (ok: vert/bleu grisé — why: éviter la sur-stimulation).

- [ ] **Step 3: « Pour aller plus loin »** — fr.wikipedia « Symbolisme des couleurs » ; Elliot 2015 (Frontiers, open access, EN) ; Eva Heller *Psychologie de la couleur* ; Pastoureau *Bleu* (médiathèque).
- [ ] **Step 4: Verify** — grep `Pastoureau` and `Elliot` present; 8 `.flip` cards rendered by data length.
- [ ] **Step 5: Commit** — `feat(atelier-couleur): leçon 04 psychologie`

---

### Task 8: Leçon 05 — `05-lumiere.html`

**Files:**
- Create: `atelier-couleur/05-lumiere.html`

**Interfaces:**
- Consumes: `AC.roomSVG`.

**Content (SPEC §05, all verified):** orientations (nord froid constant → compenser chaud à base jaune OU assumer profond enveloppant ; sud généreux toute la journée, le plus permissif ; est chaud matin / froid soir ; ouest inverse → « à quel moment vis-tu ici ? » ; blanc au nord tire vers le gris) ; Kelvin 2700/4000/6500, bas = chaud (contre-intuitif), 2700K avive rouges/jaunes ; métamérisme (surtout gris/blancs/neutres) ; finitions mat (absorbe, stable, masque) / brillant (réfléchit selon l'angle, intensifie les foncés, révèle) / satiné (intermédiaire lessivable) ; protocole de test : cartons A4+ déplaçables, plusieurs murs, matin/midi/soir, peinture sèche, à côté des éléments fixes.

- [ ] **Step 1: Atelier 1 « La même pièce, quatre lumières »**

Room in a `position:relative` wrapper with fixed palette (`--c60:#E8E2D4; --c30:#8FA3A0; --c10:#C1683F`), plus overlay `div.light` (absolute, inset 0, `mix-blend-mode: multiply`). 4 orientation buttons + time slider (0=matin, 1=soir). Tint function (lerp between endpoints per orientation):

```js
const TINTS = {
  nord:  { a: ['#AEC1D6', 0.30], b: ['#A8BCD4', 0.32] },
  sud:   { a: ['#FFE3B8', 0.14], b: ['#FFD9A0', 0.20] },
  est:   { a: ['#FFD9A0', 0.30], b: ['#B4C4D8', 0.24] },
  ouest: { a: ['#B4C4D8', 0.24], b: ['#FFBE7A', 0.32] },
};
function apply(o, t) {
  const { a, b } = TINTS[o];
  overlay.style.background = t < 0.5 ? a[0] : b[0];
  overlay.style.opacity = a[1] + (b[1] - a[1]) * t;
  caption.textContent = CAPTIONS[o]; // one verified sentence per orientation
}
```

(A sharper implementation may lerp the hex channels; the two-step swap is acceptable.) Caption sentences restate the brand-verified advice per orientation.

- [ ] **Step 2: Atelier 2 « Ce blanc n'est pas blanc »**

Three columns, same swatch `#F4F1E8`, each under an overlay: 2700K `#FFB870` @ .25, 4000K `#FFF2DC` @ .08, 6500K `#CFE0F0` @ .18, labeled with Kelvin + usage (chambre / cuisine / lumière du jour). Copy: Kelvin bas = chaud ; le même blanc cassé vire crème ou grisé selon l'ampoule → métamérisme paragraph follows.

- [ ] **Step 3: Atelier 3 « Mat ou brillant ? »**

One color `#3D6285`, toggle buttons Mat / Satiné / Brillant switching a class on a large swatch: `.finish-mat` flat; `.finish-satin` adds `background-image: linear-gradient(115deg, rgba(255,255,255,.10) 0%, transparent 40%)`; `.finish-brillant` gradient `rgba(255,255,255,.35) 0%, transparent 35%` + a second hard highlight band. Caption changes per finish (absorbe/réfléchit/intermédiaire + où l'utiliser).

- [ ] **Step 4: « Pour aller plus loin »** — Farrow & Ball « Comment la lumière métamorphose la couleur » (FR) ; Little Greene FR advice hub ; Ressource Inspiration (finitions) ; app Dulux Valentine Visualizer (gratuite, App Store/Google Play).
- [ ] **Step 5: Verify** — grep ids `light-room light-overlay` etc.; grep `2700` `4000` `6500` present; grep `métamérisme` present.
- [ ] **Step 6: Commit** — `feat(atelier-couleur): leçon 05 lumière`

---

### Task 9: Leçon 06 — `06-palette.html`

**Files:**
- Create: `atelier-couleur/06-palette.html`

**Interfaces:**
- Consumes: `AC.roomSVG`.

**Content (SPEC §06):** 60-30-10 (60 dominante murs/grandes surfaces ; 30 secondaire mobilier/rideaux/textiles ; 10 accent accessoires/art) ; repère, pas une loi — « souvent attribuée à Mark McCauley (2004) » ; les décorateurs la détournent sciemment ; construire à partir des harmonies de la leçon 3 + neutres.

- [ ] **Step 1: Atelier 1 « La pièce recolorable »**

Room wrapper with CSS vars + 4 preset buttons + 3 `<input type="color">` (Dominante 60 / Secondaire 30 / Accent 10):

```js
const PRESETS = {
  apaisante:   ['#D8DBD3', '#8FA3A0', '#C99A5B'],
  chaleureuse: ['#E8D9C4', '#B4653F', '#3E5C50'],
  contrastee:  ['#EDEAE2', '#2F3D66', '#E0A426'],
  naturelle:   ['#E5DFD2', '#7A8B6F', '#A85B3C'],
};
function paint([c60, c30, c10]) {
  room.style.setProperty('--c60', c60);
  room.style.setProperty('--c30', c30);
  room.style.setProperty('--c10', c10);
  [i60, i30, i10].forEach((inp, k) => { inp.value = [c60, c30, c10][k]; });
}
```

Color inputs call `paint` with current values. Under the room, a legend mapping 60/30/10 → murs / canapé-rideaux-tapis / coussins-art-céramique.

- [ ] **Step 2: Atelier 2 « Et si on cassait la règle ? »**

Scenario buttons re-painting the same room to show proportion failure/effect, each with one explanatory sentence displayed:
- « 60-30-10 » — preset chaleureuse (référence équilibrée).
- « Monotone 90-8-2 » — `['#E8D9C4', '#E0D2BC', '#D8CCB6']` : sans contraste de valeur ni d'accent, l'œil n'a rien à accrocher.
- « Inversée : l'accent en dominante » — `['#3E5C50', '#B4653F', '#E8D9C4']` : possible, mais la pièce devient enveloppante/sombre — un choix fort, pas un défaut (cf. stratégie « assumer » de la leçon 5).
- « Égalitaire 33-33-33 » — `['#E8D9C4', '#B4653F', '#3E5C50']` appliqué en redistribuant : ici simulate by ALSO setting `--c10` on large zones — implement a 4th CSS var mode: add class `equal` on wrapper with CSS overriding some rects (`.equal .room rect:nth-of-type(1) { … }` is brittle — instead provide a second room instance painted with the 3 colors spread evenly via swapped vars `['#B4653F', '#3E5C50', '#E8D9C4']`) : les trois couleurs se battent, aucune ne domine.

- [ ] **Step 3: « Pour aller plus loin »** — Adobe Color (extraire une palette d'une photo) ; Coolors ; Tollens simulateur (gratuit, compte requis) ; app Dulux Valentine Visualizer.
- [ ] **Step 4: Verify** — grep `McCauley` present with « souvent attribuée » framing; grep `PRESETS`; 4 preset buttons.
- [ ] **Step 5: Commit** — `feat(atelier-couleur): leçon 06 palette 60-30-10`

---

### Task 10: Leçon 07 — `07-analyse.html`

**Files:**
- Create: `atelier-couleur/07-analyse.html`

**Interfaces:**
- Consumes: `AC.roomSVG`.

**Content (SPEC §07):** la méthode en 6 points (orientation & lumière ; volumes & hauteur ; usage & moments de vie ; existant : sol, menuiseries, cheminée ; circulation entre pièces ; ambiance recherchée) — présentée comme checklist réutilisable (celle de l'exercice 1, leçon 8).

- [ ] **Step 1: Atelier « Étude de cas : le salon nord »**

Branching case study. Setup text: salon orienté nord, sol chêne moyen (fixe), usage principal le soir, ambiance recherchée : chaleureuse. Room rendered live; each step applies choices cumulatively; debrief at end summarizes the path taken and states that other paths were valid.

```js
const STEPS = [
  { q: 'Lumière froide et constante. Ta stratégie de base ?', choices: [
    { t: 'Compenser : dominante chaude à base jaune', vars: { c60: '#E9DCC3' },
      why: 'Classique et sûr : les tons à base jaune réchauffent la lumière du nord (conseil Farrow & Ball).' },
    { t: 'Assumer : dominante profonde enveloppante', vars: { c60: '#41505C' },
      why: 'Assumé et cosy : au nord, une couleur profonde crée un écrin — l’autre stratégie validée par les coloristes.' } ] },
  { q: 'Usage le soir, ambiance chaleureuse. Quelle harmonie pour le duo secondaire/accent ?', choices: [
    { t: 'Camaïeu de la dominante', vars: { c30: 'CAMAIEU', c10: 'CAMAIEU2' },
      why: 'Doux et unifié ; attention à garder du contraste de valeur (leçon 1).' },
    { t: 'Complémentaire divisée autour de la dominante', vars: { c30: 'DIV1', c10: 'DIV2' },
      why: 'Vivant sans l’affrontement de la complémentaire pure.' } ] },
  { q: 'Répartition ?', choices: [
    { t: '60-30-10 classique', vars: {},
      why: 'Le repère : dominante sur les murs, secondaire en mobilier/rideaux, accent en accessoires.' },
    { t: 'Accent renforcé (50-30-20)', vars: { boost: true },
      why: 'Le soir, sous 2700K, les accents chauds s’aviveront — dose en connaissance de cause (leçon 5).' } ] },
];
```

Implementation note: replace the placeholder tokens with concrete hexes per path — precompute the 4 combinations (base chaude/profonde × camaïeu/divisée): chaude+camaïeu `c30:#CDBA94, c10:#8F7B54`; chaude+divisée `c30:#5F7E9E, c10:#B04A5A`; profonde+camaïeu `c30:#5C6B78, c10:#8CA0B0`; profonde+divisée `c30:#C98A4B, c10:#B04A5A`. Store chosen path in a small state object; final debrief lists the 3 choices with their `why` texts + sentence « Il n'y avait pas de mauvaise réponse : il y avait des partis pris. »

- [ ] **Step 2: « Pour aller plus loin »** — Farrow & Ball lumière (FR) ; Sophie Ferjani (YouTube, FR) ; Ressource Inspiration.
- [ ] **Step 3: Verify** — grep `STEPS`; no literal `CAMAIEU`/`DIV1` placeholder tokens remain (`! grep -q 'CAMAIEU' 07-analyse.html`).
- [ ] **Step 4: Commit** — `feat(atelier-couleur): leçon 07 analyse d'espace`

---

### Task 11: Leçon 08 — `08-exercices.html`

**Files:**
- Create: `atelier-couleur/08-exercices.html`

**Interfaces:**
- Consumes: `AC.quiz`.

- [ ] **Step 1: Write the 3 exercises (prose, numbered sections)**

1. **Analyse ta propre pièce** — apply the leçon-7 checklist (repeat the 6 points as a printable list) ; livrable : une fiche d'une page.
2. **Rétro-ingénierie d'une photo** — prendre une photo d'intérieur (magazine, Pinterest) ; identifier dominante/secondaire/accent, l'harmonie du cercle, les proportions ; vérifier avec l'extracteur de palette d'Adobe Color.
3. **Le test réel** — acheter 2-3 testeurs ; cartons A4+ ; deux murs différents ; observer matin/midi/soir, peinture sèche, à côté du sol et des menuiseries ; noter ce qui change (c'est le métamérisme en action).

- [ ] **Step 2: Quiz récapitulatif (AC.quiz, 12 items)**

Questions with correct answer + `why` (each `why` points back to its lesson):
1. 2700K, plus chaud ou plus froid que 6500K ? → plus chaud (Kelvin bas = chaud, L5)
2. Deux stratégies valables pour une pièce au nord ? → compenser chaud OU assumer profond (L5)
3. Complémentaire du bleu sur le cercle RYB ? → orangé (L2)
4. Les 60 % de la règle couvrent… ? → murs/grandes surfaces (L6)
5. Métamérisme ? → deux couleurs identiques sous une lumière, différentes sous une autre (L5)
6. Camaïeu ? → tons différents d'une même couleur (L1)
7. Les couleurs froides… ? → reculent, agrandissent (L1)
8. Complémentaire divisée ? → base + les deux voisines de sa complémentaire (L3)
9. Finition mat vs brillant ? → mat absorbe/stabilise, brillant réfléchit selon l'angle (L5)
10. Tester un échantillon ? → sec, A4+, plusieurs murs, matin/midi/soir (L5/L8)
11. Contraste simultané ? → une couleur voisine modifie la perception (gris verdâtre près du rouge) (L3)
12. La symbolique des couleurs est… ? → culturelle et historique, pas universelle (L4)

Each item: 3-4 choices, plausible distractors, `why` one sentence.

- [ ] **Step 3: Closing section « Et après ? »** — recap of the resource list (tools/simulateurs/livres, condensed from SPEC with caveats) + invitation à refaire les ateliers des leçons 3, 6 et 7 avec sa propre pièce.
- [ ] **Step 4: Verify** — quiz has 12 items (`grep -c 'why:' 08-exercices.html` ≥ 12); links match SPEC URLs.
- [ ] **Step 5: Commit** — `feat(atelier-couleur): leçon 08 exercices et quiz final`

---

### Task 12: Cohérence finale

**Files:**
- Modify: any page fixing issues found; no new files.

- [ ] **Step 1: Link check** — every `href` between pages resolves to an existing file; every lesson has the skeleton parts (`data-nav`, `data-lesson-nav`, `data-lesson` matching `AC.LESSONS` slugs, `.further` block). Script check: `for f in atelier-couleur/0*.html; do grep -L 'data-lesson-nav' $f; done` → empty.
- [ ] **Step 2: Terminology sweep** — `! grep -riq 'adoucie' atelier-couleur/` ; `grep -riq 'complémentaire divisée' atelier-couleur/03-harmonies.html`.
- [ ] **Step 3: Theme sweep** — no hex colors for text/backgrounds outside widgets in page-level styles (widget swatch hexes are fine); every inline `<style>` uses tokens for chrome.
- [ ] **Step 4: Orchestrator visual pass** — open all 9 pages, both themes, click every widget; verify progression: complete lesson 1, reload index, checkmark + « Reprendre : Leçon 2 ».
- [ ] **Step 5: Commit** — `feat(atelier-couleur): final consistency pass`
