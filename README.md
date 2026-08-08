# Perla Makhoul, researcher website

Static site. No build step, no dependencies. Open `index.html` in any browser, or drop the whole
`site/` folder onto Netlify / GitHub Pages / any web host.

## Contact details

Live in `contact.html`: email `perlamkl@hotmail.com` (appears twice: the card and the form's
`data-to`), ORCID `0009-0008-3114-7888`, LinkedIn `/in/perlamakhoul`, based in Madrid.
The location also appears in the rail footer of every page.

## Pages

| File | Page |
|---|---|
| `index.html` | Landing / About me / short bio |
| `research.html` | Research: MSc, PhD and the two postdoctoral projects |
| `publications.html` | Publications & patents |
| `cv.html` | CV (page + a Download CV button serving assets/files/Perla-Makhoul-CV-2026.pdf) |
| `workshops.html` | Scientific outreach (workshops + competitions) |
| `conferences.html` | Conferences, talks and posters |
| `contact.html` | Contact |

## Structure

```
site/
├── *.html               one file per page; the left rail is repeated in each
├── assets/
│   ├── css/style.css    all styling, design tokens at the top
│   ├── js/main.js       all behaviour, one small module per feature
│   ├── img/             web-optimised images (originals untouched in ../PHOTOS)
│   └── files/           poster PDFs
└── README.md
```

## Design

- **Layout.** A three-column grid; the left column is a sticky rail (name, menu button, navigation),
  the other two carry the content. Collapses to a single column below 1080px.
- **Navigation.** Collapsed behind the "Menu" button in the rail. Once opened it stays open across
  pages (remembered in `localStorage` under `pm-nav`).
- **Type.** Fraunces for titles, Figtree for body text, both from Google Fonts with system
  serif/sans fallbacks if offline.
- **Color.** A very light ochre ground with soft pastel accents. No borders, no rules, no visible
  gridlines anywhere; separation comes from spacing, tinted surfaces and soft shadows.
- **Palettes.** The ◐ floating button cycles ochre → rose → sage and remembers the choice.

To change any color globally, edit the `:root` block at the top of `assets/css/style.css`.

## Interactive bits

- Floating action dock, bottom right: `+` opens palette / print / contact; back-to-top appears
  after 400px of scroll.
- Hover (or tap, on touch) any photo to reveal its caption.
- Expandable abstracts on the research page.
- Filter chips and one-click "copy citation" on the publications page.
- Click any research figure or poster to open it full size.
- Scroll-reveal animations and a reading-progress bar.
- All motion respects `prefers-reduced-motion`.

## Adding a publication

Copy an existing `<article class="pub">` block in `publications.html` and edit it. The
`data-kind` attribute drives the filters. Use any of `published`, `first`, `coauthor`
(space-separated, e.g. `data-kind="published first"`).

## Editorial conventions

Two rules Perla asked for, worth keeping when adding content:

- **"leukemia", never "leukaemia".** US spelling throughout (tumor, hematological, program).
- **No em or en dashes.** Use commas in prose and hyphens in ranges (2021-2024).
  The middot separator (·) is fine.

## Held back until publication

The graphical abstracts and the full abstracts for the two postdoctoral projects were removed
from `research.html` while the papers are unpublished. The figure files were moved out of the
served folder to `../_unpublished_figures/`. Each of those two projects in `research.html`
carries a `RESTORE WHEN PUBLISHED` comment explaining how to put them back.

The two unpublished manuscripts were removed from `publications.html` for the same reason:

- "The bioactivation of EAPB02303 by catechol-O-methyltransferase…" (Oncogenesis, under review)
- "NPM1 in acute myeloid leukemia: molecular architecture…" (in preparation)
