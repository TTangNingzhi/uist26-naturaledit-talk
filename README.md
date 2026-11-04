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

The demo slide shows the paper's example-workflow figure until `figures/demo.mp4` exists; the video then replaces it and plays when the slide is reached. On the mapping slide, hovering a summary segment highlights its code lines.

## Structure

```
index.html          all slides (one <section class="slide"> each)
css/slides.css      tokens (ND palette), rail, stage, shared components
css/content.css     per-slide layout
js/slides.js        scaling, paging, outline rail, reveal animation, demos
figures/logos/      venue, institution, lab, sponsor, and NaturalEdit logos
figures/authors/    co-author headshots (alt title slide)
figures/paper/      paper figures (PDF → SVG via pdftocairo -svg)
vendor/fontawesome/ Font Awesome 6.7.2 (local, for offline use)
```

Slides are authored on a fixed 1600 × 900 canvas and scaled to fit the window. The outline rail is built from each slide's `data-title` and `data-group`.
