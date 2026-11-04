# NaturalEdit: UIST 2026 Talk

Slides for *NaturalEdit: Code Modification through Direct Interaction with Adaptive Natural Language Representation* (UIST 2026, Detroit). 10-minute talk + 2-minute Q&A.

Plain HTML/CSS/JS, no build step.

## Run

Open `index.html` in a browser. Everything works offline.

| Key | Action |
|---|---|
| ↓ → Space PgDn | Next slide |
| ↑ ← PgUp | Previous slide |
| Home / End | First / last slide |
| O | Toggle outline rail |
| F | Fullscreen |

Append `#n` to the URL to open slide *n*. Print from the browser to export a PDF (one slide per page).

Two slides are interactive:

- **Structural Alignment** steps through four code edits (original, reformat, add helper above, rewrite loop). The next/previous keys walk the steps before moving to the next slide; the editor tabs jump to a step directly.
- **Live Demo** plays `figures/demo.mp4`, the live demo section cut from the UIST video (1:33 to 3:19, frame-exact, offline). The **YouTube** toggle embeds the public video over the same range: put the video ID in the iframe's `data-youtube` attribute. YouTube embeds generally need the deck served over http(s) (e.g., `python3 -m http.server`), not opened as a local file. If `demo.mp4` is missing, the slide falls back to YouTube.

## Structure

```
index.html          all slides (one <section class="slide"> each)
css/slides.css      tokens (ND palette), rail, stage, shared components
css/content.css     per-slide layout
js/slides.js        scaling, paging, outline rail, reveal animation, step-through, demo
figures/demo.mp4    recorded live demo clip, with demo-poster.jpg as its first frame
figures/logos/      venue, institution, lab, sponsor, and NaturalEdit logos
figures/paper/      paper figures (PDF → SVG via pdftocairo -svg)
vendor/fontawesome/ Font Awesome 6.7.2 (local, for offline use)
```

Slides are authored on a fixed 1600 × 900 canvas and scaled to fit the window. The outline rail is built from each slide's `data-title` and `data-group`.
