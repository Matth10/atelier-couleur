# Atelier Couleur — Design Spec

**Date:** 2026-08-21
**Status:** Approved design, pending implementation plan

## Goal

A free, self-paced, French-language course on color in interior design, replacing a €400 one-day pro training (Ressource "Formation Couleur en Visio": vocabulaire, psychologie, cercle chromatique, harmonies, analyse d'espace). Differentiator over the paid Zoom format: heavy interactivity — color is visual, every concept gets a manipulable widget.

All course content was verified against sources (2026-08-21, three research passes: theory, light, resources). Corrections from research are already folded into this spec.

## Non-goals

- No build step, no framework, no backend, no accounts.
- No tracking beyond localStorage progression.
- Not a Sweep product; lives in its own folder, untouched by CI.

## Structure

```
atelier-couleur/
  index.html            Accueil — parcours, progression
  01-vocabulaire.html   La couleur, comment ça marche
  02-cercle.html        Le cercle chromatique
  03-harmonies.html     Les harmonies de couleurs
  04-psychologie.html   Psychologie & symbolique
  05-lumiere.html       La lumière change tout
  06-palette.html       Composer une palette
  07-analyse.html       Analyser un espace
  08-exercices.html     Exercices & auto-évaluation
  assets/style.css      Shared design system
  assets/course.js      Shared nav/progress + widget helpers
```

- Static HTML, open `index.html` in a browser. Each lesson page may add a small inline `<script>` for its own widgets; shared logic lives in `course.js`.
- Trajectory: **comprendre (1-2) → outils (3-5) → application (6-8)**, ~20-30 min per lesson.
- Every lesson ends with: "Pour aller plus loin" (sources box) + "Marquer comme terminée" + prev/next nav.
- Progression: `localStorage` key `atelier-couleur:progress` = JSON array of completed lesson slugs. Index shows checkmarks + "reprendre où j'en étais". All reads/writes wrapped in try/catch; page fully functional without storage.

## Design system

- Ground `#FBFAF8`, dark `#1C1A17`; ink `#28231D` / `#EDE8E0`; hairlines `#E5DFD4` / `#3A362F`; accent outremer `#3542A0` (light) / `#8A96E8` (dark).
- Type: Prata (display), Karla (body), IBM Plex Mono (hex codes, data). Google Fonts with real fallback stacks.
- Both themes via token pattern: full light palette on `:root`; dark under `@media (prefers-color-scheme: dark)` guarded `:root:not([data-theme="light"])`; repeated under `:root[data-theme="dark"]`. `body` gets explicit token background.
- Lesson pages numbered (course = real sequence). Reading measure ~68ch; interactive "ateliers" in full-width tinted panels.
- The vivid color on the page comes from the widgets/swatches themselves; chrome stays quiet.
- `prefers-reduced-motion` respected; keyboard focus visible; widgets operable by keyboard where reasonable.

## Lessons — content & interactions

Content notes below are the verified facts each lesson must teach. Every lesson: 2-3 interactions minimum.

### 01 — La couleur, comment ça marche

Content: **TSL** = teinte / saturation / luminosité (standard French for HSL; "valeur" ≈ degré de clair-obscur, "ton" = variation d'une teinte par la valeur, "ton sur ton"). **Camaïeu** = tons différents d'une seule couleur (terme français traditionnel). Chaudes (rouge→jaune) avancent ("saillantes"), froides (vers le bleu) reculent ("fuyantes") — spatial perception lever for interiors. Warmth is **relative**: un bleu chaud, un jaune froid existent.
Interactions:
1. **Explorateur TSL**: 3 sliders → swatch live + hex; chaque slider isolé montre son effet.
2. **Chaud ou froid ?**: classer 8 échantillons par drag/clic, feedback immédiat, includes a "bleu chaud" trap to teach relativity.
3. **Test de la valeur**: two-color pairs, button simulates squint (blur/desaturate) to reveal value contrast.

### 02 — Le cercle chromatique

Content: painter's **RYB** wheel (primaires rouge/jaune/bleu → secondaires orange/vert/violet → tertiaires), the standard pedagogical tool in déco (Itten's 12-hue wheel). One-sentence honesty caveat: physically, subtractive primaries are CMY; RYB stays the harmony/mixing intuition tool.
Interactions:
1. **Roue 12 teintes cliquable** (canvas): click a hue → its name, family (primaire/secondaire/tertiaire), chaud/froid.
2. **Mélangeur**: pick 2 primaries → see the secondary; extends to tertiaries.

### 03 — Les harmonies de couleurs

Content: **camaïeu/monochrome**, **analogues** (adjacentes), **complémentaires**, **complémentaire divisée** (syn. "complémentaires adjacentes" — NOT "adoucies", term doesn't exist), **triadique**, **tétradique/carrée**, and the practical déco scheme **neutres + couleur d'accent**. Itten contrasts woven in selectively: chaud-froid, clair-obscur, complémentaires, quantité; **contraste simultané** as sidebar ("pourquoi ce gris paraît verdâtre à côté du rouge").
Interactions:
1. **Générateur d'harmonies**: pick base hue on a wheel + harmony mode → swatch row with hex codes.
2. **Devine l'harmonie**: 5 stylized SVG interiors, guess which harmony each uses, explained feedback.

### 04 — Psychologie & symbolique

Content: 8 couleurs (bleu, vert, jaune, rouge, terracotta/orangé, rose, neutres, noir) — associations + usage en intérieur (bleu: calme, chambres; jaune: pièces sombres/entrées; rouge: stimulant, par touches, salle à manger; etc.). **Honesty sidebar**: symbolism is cultural and historical, not universal (Michel Pastoureau; fr.wikipedia "Symbolisme des couleurs"); scientific evidence on psychological effects is young and fragile (Elliot 2015, Frontiers in Psychology — open access).
Interactions:
1. **Cartes à retourner**: recto couleur, verso associations + conseils pièce par pièce.
2. **Quiz "quelle couleur pour quelle pièce ?"**: scénarios (chambre d'adulte, cuisine sombre, bureau…), multiple valid answers, nuanced feedback.

### 05 — La lumière change tout

Content: **Orientation** (hémisphère nord): nord = lumière froide, constante → compenser par des tons chauds à base jaune **ou** assumer des couleurs profondes enveloppantes (dual advice, per Farrow & Ball); sud = généreuse toute la journée, l'orientation la plus permissive (supporte même les bleus froids); est = chaude le matin, froide le soir; ouest = l'inverse → règle "à quel moment vis-tu dans cette pièce ?". Blanc au nord tire sur le gris (Tollens). **Température de lumière artificielle**: 2700K chaud / 4000K neutre / 6500K lumière du jour; Kelvin bas = chaud (contre-intuitif); 2700K avive rouges/jaunes et éteint les bleus, 4000K+ l'inverse. **Métamérisme**: deux couleurs identiques sous une lumière, différentes sous une autre; frappe surtout gris/blancs/neutres. **Finitions**: mat absorbe la lumière (couleur stable, veloutée, masque les défauts), brillant réfléchit (reflets dépendant de l'angle, intensifie les foncés, révèle les défauts), satiné intermédiaire et plus facile à nettoyer. Brillance chiffrée sur 0-100 (UB), d'après les gammes publiées par Ressource: mates 2-4 % (Mat Poudré 2, Mat Essentiel 3, Laque Mate et Mat Soyeux 4), satinées 7-40 % (Satin Essentiel 7, Satin Velouté 10, Laque Satinée 40) — donc écart négligeable entre deux mats, très large entre deux satinés. Lessivabilité ≠ finition: des mats lessivables existent (Laque Mate, Mat Soyeux), un mat classique est seulement lavable. **Tester**: échantillons A4+ sur carton déplaçable, plusieurs murs, matin/midi/soir, jugés secs, à côté des éléments fixes (sol, menuiseries — présenté comme conseil du cours).
Interactions:
1. **La même pièce, quatre lumières**: SVG room, orientation selector nord/sud/est/ouest + time-of-day slider → light tint changes, same wall paint reads differently.
2. **Ce blanc n'est pas blanc**: one "white" swatch under 2700K / 4000K / 6500K side by side.
3. **Mat vs brillant**: same color, finish toggle changing highlight rendering.

### 06 — Composer une palette

Content: **règle 60-30-10** — 60% dominante (murs, grandes surfaces), 30% secondaire (mobilier, rideaux, textiles), 10% accent (accessoires, art). Framed as repère de proportion, pas une loi ("souvent attribuée à Mark McCauley, 2004"); mention that designers deliberately break it. Building from harmonies of lesson 3 + neutres.
Interactions:
1. **Pièce recolorable** (SVG salon: murs, mur d'accent, canapé, rideaux, coussins, déco): presets d'ambiance (apaisante, chaleureuse, contrastée, naturelle) + custom pickers per 60/30/10 slot.
2. **Répartition interactive**: drag proportions away from 60-30-10 and see the room tip into monotone or chaos.

### 07 — Analyser un espace

Content: méthode d'analyse — orientation & lumière, volumes & hauteur, usage & moments de vie, existant (sol, menuiseries, cheminée), circulation entre pièces, ambiance recherchée.
Interaction: **étude de cas à embranchements** — un salon orienté nord, sol chêne moyen, usage soir. Student makes choices at each step (compenser ou assumer ? quelle harmonie ? quelle répartition ?), the course reacts with consequences rendered in the SVG room; several valid paths, each debriefed.

### 08 — Exercices & auto-évaluation

Content: 3 exercices chez soi — (1) analyser une pièce de chez soi avec la méthode de la leçon 7; (2) reconstituer la palette d'une photo de magazine (identifier harmonie + proportions); (3) test réel d'échantillons A4 sur deux murs, observés à trois moments de la journée. Plus **quiz récapitulatif** (12-15 questions across all lessons, scored, per-question explanations, pointing back to lessons to review).

## Cas réels — real projects inside the lessons

Added 2026-08-21. Sourced from Ressource's free editorial section (`ressource-peintures.com/inspiration/`), verified page by page on that date.

**Why.** Every concept in the course is taught on invented swatches and a stylized SVG room. The "cas réel" panels anchor each one to a documented, visitable space with the real shade references, so a student can check the theory against something that exists.

**The component.** `<aside class="cas-reel">` — static HTML, no JS (content must not depend on a widget booting). Styled once in `style.css`: eyebrow `Cas réel` (+ optional `· harmonie`), `h3` with a muted `.cas-place` for the space type and location, a `.cas-swatches` grid (swatch + shade name + reference), two prose paragraphs reading the lesson's concept out of the space, and a `.cas-source` footer with the source link and the fidelity caveat.

**Fidelity policy — load-bearing.** No paint maker publishes numeric values for its shades, and the project photos are copyrighted and not reused. Every swatch is therefore *our* reconstruction from the shade name and the project description, and every panel says so in its footer. Lesson 01 carries the one-time explanation (`.note` after its first panel); lesson 05's test-protocol section ties it back to the "no screen replaces a painted card" rule. Where a colour is described in prose but has no published reference (the Gordes trio), the reference slot reads *d'après le texte* instead of a code. Never present a reconstruction as an official value.

**Placement** — one panel per concept, in the section that teaches it, never in an `.atelier`:

| Lesson | Case | Concept |
|---|---|---|
| 01 | Noir Coffee Shop, Paris 9e — `RMDV40 Musc` | Warm hue advancing; a whole small volume in one warm tone; value contrast carried by matter, not a second colour |
| 03 | Caracoli, restaurant Paris 18e — `eqRMDV39 Rose Ottoman`, `eqRMDV06 Lumière` | Camaïeu: the "white" is the palest ton of the same warm family, not a neutral |
| 03 | Les Hauts de Gordes, bastide Luberon — `STR11 Cordelière`, `ER45 Faon` + terre cuite / vert olive / jaune paille | Analogues on a continuous arc; same figure, different result once desaturated |
| 04 | L'Appartement Ressource, Paris — 7 refs (`R283`, `R206`, `R341`, `R406`, `R137`, `R480`, `R139`) | One palette per use, not per home; the cost is the transitions |
| 05 | Quatre blancs — `La Pureté`, `Le Cygne`, `L'Innocent`, `La Candeur` | A white is never pure; the sous-ton decides, chosen against orientation |
| 06 | Tour Maubourg, Paris — `09.R187 Le Piano` | 60-30-10 at its limit: proportions are visual, the 10 % need not be paint |
| 07 | Le Moulin Papotte, Bligny-sur-Ouche — `HEJU01`, `R151`, `R079`, `RMDV40` | The six-point method on a documented brief; existant and usage command |

**Cross-links.** The same reference reconstructs to the same hex everywhere (`RMDV40 Musc` in lessons 01 and 07), and lesson 07 uses that repeat to make its own point: a shade has no assigned use.

**Attribution.** Links are the attribution — every panel points back to the source page, and lesson 05's "Pour aller plus loin" credits the brillance figures to the mat/satiné article.

## "Pour aller plus loin" — verified resources

Per-lesson mapping; every link verified 2026-08-21. Caveats to print in the course: Paletton/Coolors/Elliot are in English; Tollens simulator requires a free account; Adobe Color is migrating into Adobe Express.

- **Outils**: Adobe Color (color.adobe.com/fr/create/color-wheel — roue interactive, harmonies, extraction depuis photo); Paletton (paletton.com — sans compte, simulation daltonisme, EN); Coolors (coolors.co — générateur rapide, freemium, EN).
- **Simulateurs**: Dulux Valentine Visualizer — **app mobile gratuite** (App Store id551996797 / Google Play), pas de version web stable; Tollens simulateur (tollens.com/simulateur-de-couleurs — gratuit, compte requis).
- **Articles**: Farrow & Ball "Comment la lumière métamorphose la couleur" (farrow-ball.com/fr/…, orientation par pièce, FR); Little Greene FR advice hub (littlegreene.fr — orientation); Ressource "Inspiration" (ressource-peintures.com/inspiration/ — choix des teintes, finitions); Argile conseils couleurs (argile-peinture.com).
- **Vidéo**: chaîne YouTube Sophie Ferjani (déco/couleur, FR); Docteur Peinture (technique d'application).
- **Livres (médiathèque)**: Johannes Itten, *Art de la couleur* (Dessain et Tolra; édition abrégée 2018 la plus courante); Eva Heller, *Psychologie de la couleur : effets et symboliques* (Pyramyd, 2009); Michel Pastoureau, *Bleu. Histoire d'une couleur* (Seuil).
- **Esprit critique**: Elliot 2015, "Color and psychological functioning" (Frontiers in Psychology, open access, EN); fr.wikipedia "Symbolisme des couleurs".

## Technical conventions

- Vanilla JS, no dependencies. Canvas for the wheel; inline SVG with CSS-variable fills for rooms; CSS for everything else.
- `course.js` exposes: progress read/write (try/catch'd), lesson-complete button wiring, prev/next nav injection from a static lesson manifest.
- Each widget is an IIFE bound to its own container; a broken widget must not break the page (defensive init: skip if container missing).
- French copy throughout, professional decorator vocabulary, tutoiement (course = atelier, ton direct).
- No external requests other than Google Fonts and outbound resource links.

## Testing

Manual: open each page in a browser; click through every interaction; verify both themes (OS toggle + data-theme stamps); verify progression survives reload and the site works with localStorage blocked; keyboard-tab through quizzes.

## Risks

- Canvas wheel click-detection math (angle→segment) — keep 12 discrete segments, no anti-aliased picking.
- SVG room reuse across lessons 5/6/7 — define it once as a JS template string in `course.js` parameterized by CSS variables, so the three lessons stay consistent.
