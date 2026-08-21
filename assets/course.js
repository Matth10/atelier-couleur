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
    canvas.tabIndex = 0;
    canvas.onkeydown = (e) => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); const cur = state.selected.length ? state.selected[0] : 0; const next = (cur + (e.key === 'ArrowRight' ? 1 : 11)) % 12; if (state.onPick) state.onPick(next); };
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
          fs.querySelectorAll('.quiz-choice').forEach((x) => { x.disabled = true; });
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
