# Scripts

Asset generation utilities for the Yuzersef build.

## `generate-placeholders.mjs`

Creates the placeholder logo and ten portfolio SVGs used by the site:

- `frontend/public/brand/logo-mark.svg`
- `frontend/public/portfolio/clothing-tee-halftone.svg`
- `frontend/public/portfolio/clothing-hoodie-arches.svg`
- `frontend/public/portfolio/mugs-wave.svg`
- `frontend/public/portfolio/mugs-sun.svg`
- `frontend/public/portfolio/caps-dots.svg`
- `frontend/public/portfolio/caps-stripes.svg`
- `frontend/public/portfolio/stickers-sheet.svg`
- `frontend/public/portfolio/stickers-badge.svg`
- `frontend/public/portfolio/cases-grid.svg`
- `frontend/public/portfolio/cases-arc.svg`

Run from the repository root:

```bash
npm run assets
```

Or directly:

```bash
node scripts/generate-placeholders.mjs
```

The script uses only Node.js built-ins. It writes UTF-8 SVG files and prints the number of generated files.

## When to change it

Edit this script only if the placeholder style or file names need to change. If file names change, update the image paths in `frontend/src/content/index.ts` as well.

These files are temporary. Replace them with real brand assets before launch, then either delete this script or keep it as a way to regenerate neutral demo visuals.
