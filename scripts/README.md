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

## `generate-mock-products.mjs`

Creates the studio product artwork in `frontend/public/mock/`:

- `tee-front.svg`
- `tee-front-shading.svg`
- `tee-back.svg`
- `tee-back-shading.svg`
- `mug-side.svg`
- `mug-side-shading.svg`
- `cap-front.svg`
- `cap-front-shading.svg`
- `studio-preview.svg`

Run from the repository root:

```bash
npm run assets:studio
```

Or directly:

```bash
node scripts/generate-mock-products.mjs
```

The product definitions, colours, and normalized print areas live in `frontend/src/features/studio/mockProducts.ts`. Use the development-only `/dev/print-area` page to calibrate print areas after changing the artwork.

## When to change these scripts

Edit `generate-placeholders.mjs` only if the placeholder style or file names need to change. If its file names change, update the image paths in `frontend/src/content/index.ts` as well.

Edit `generate-mock-products.mjs` only if the studio product artwork or file names need to change. If its file names change, update `frontend/src/features/studio/mockProducts.ts`.

These files are temporary. Replace them with real brand and product assets before launch, then either delete the scripts or keep them as a way to regenerate neutral demo visuals.
