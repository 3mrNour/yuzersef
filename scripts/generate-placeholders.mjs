import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = path.join(root, "frontend", "public", "portfolio");
await mkdir(outDir, { recursive: true });

const C = {
  forest: "#04594F",
  deep: "#033A34",
  dark: "#022521",
  cream: "#F3EEE3",
  bone: "#E4DCCB",
  sand: "#EAC08C",
  clay: "#C88F56",
};

const W = 800;
const H = 1000;

function frame({ bg, accent, art, label, seed = 0 }) {
  const dots = `<pattern id="bgdots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.1" fill="${accent}" opacity="0.16"/>
    </pattern>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    ${dots}
    <clipPath id="artclip"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect width="${W}" height="${H}" fill="url(#bgdots)"/>
  <g clip-path="url(#artclip)">
    ${art}
  </g>
  ${cropMarks(accent)}
  <g fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="13" letter-spacing="3" opacity="0.72">
    <text x="64" y="930">YUZERSEF</text>
    <text x="${W - 64}" y="930" text-anchor="end">DEMO ${String(seed).padStart(2, "0")}</text>
  </g>
  <text x="400" y="972" text-anchor="middle" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="12" letter-spacing="4" opacity="0.5">${label}</text>
</svg>`;
}

function cropMarks(color) {
  const m = 42;
  const len = 22;
  return `<g stroke="${color}" stroke-width="1.4" opacity="0.55" fill="none">
    <path d="M${m} ${m + len} V${m} H${m + len}"/>
    <path d="M${W - m} ${m + len} V${m} H${W - m - len}"/>
    <path d="M${m} ${H - m - len} V${H - m} H${m + len}"/>
    <path d="M${W - m} ${H - m - len} V${H - m} H${W - m - len}"/>
  </g>`;
}

function halftone({ color, cx, cy, r, gap = 15, dot = 5 }) {
  let out = "";
  for (let y = cy - r; y <= cy + r; y += gap) {
    for (let x = cx - r; x <= cx + r; x += gap) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r) continue;
      const size = dot * (1 - (d / r) * 0.45);
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(2)}" fill="${color}"/>`;
    }
  }
  return out;
}

function arches({ color, cx, cy, r, count = 5, width = 10 }) {
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const radius = r - i * (r / count) * 0.62;
    out += `<path d="M${cx - radius} ${cy + r * 0.55} A${radius} ${radius} 0 0 1 ${cx + radius} ${cy + r * 0.55}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  }
  return out;
}

function waves({ color, cx, cy, r, count = 7 }) {
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const y = cy - r + (i * (r * 2)) / (count - 1);
    out += `<path d="M${cx - r} ${y} Q${cx - r / 2} ${y - 20} ${cx} ${y} T${cx + r} ${y}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/>`;
  }
  return out;
}

function sun({ color, cx, cy, r }) {
  let out = `<circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="${color}"/>`;
  for (let i = 0; i < 12; i += 1) {
    const angle = (Math.PI * 2 * i) / 12;
    const x1 = cx + Math.cos(angle) * r * 0.6;
    const y1 = cy + Math.sin(angle) * r * 0.6;
    const x2 = cx + Math.cos(angle) * r * 0.92;
    const y2 = cy + Math.sin(angle) * r * 0.92;
    out += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${color}" stroke-width="9" stroke-linecap="round"/>`;
  }
  return out;
}

function grid({ color, cx, cy, size = 150, gap = 25, width = 4 }) {
  let out = "";
  for (let x = cx - size; x <= cx + size; x += gap) {
    out += `<line x1="${x}" y1="${cy - size}" x2="${x}" y2="${cy + size}" stroke="${color}" stroke-width="${width}"/>`;
  }
  for (let y = cy - size; y <= cy + size; y += gap) {
    out += `<line x1="${cx - size}" y1="${y}" x2="${cx + size}" y2="${y}" stroke="${color}" stroke-width="${width}"/>`;
  }
  return out;
}

function stripes({ color, cx, cy, size = 150, gap = 22, width = 8 }) {
  let out = "";
  for (let i = -size; i <= size; i += gap) {
    out += `<line x1="${cx - size}" y1="${cy + i}" x2="${cx + size}" y2="${cy + i - size}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  }
  return out;
}

const tee = `M250 268 Q300 248 336 232 Q400 284 464 232 Q500 248 550 268 L642 372 L570 448 L530 404 L530 782 Q400 808 270 782 L270 404 L230 448 L158 372 Z`;
const hoodie = `M256 286 Q302 254 336 240 Q400 292 464 240 Q498 254 544 286 L650 388 L578 468 L534 424 L534 792 Q400 818 266 792 L266 424 L222 468 L150 388 Z`;
const hood = `M330 246 Q400 186 470 246 Q444 330 400 342 Q356 330 330 246 Z`;
const mugBody = `M250 336 h300 v330 a34 34 0 0 1 -34 34 h-232 a34 34 0 0 1 -34 -34 Z`;
const mugHandle = `M550 398 h30 a62 62 0 0 1 0 124 h-30`;
const capDome = `M206 566 Q212 316 400 316 Q588 316 594 566 Z`;
const capBrim = `M196 566 Q400 614 624 548 Q640 606 562 626 Q380 662 206 608 Q180 592 196 566 Z`;
const caseBody = `M262 208 h276 a44 44 0 0 1 44 44 v520 a44 44 0 0 1 -44 44 h-276 a44 44 0 0 1 -44 -44 v-520 a44 44 0 0 1 44 -44 Z`;

function offset(d, color, dx = 8, dy = 10) {
  return `<path d="${d}" fill="${color}" transform="translate(${dx} ${dy})"/>`;
}

const pieces = {
  "clothing-tee-halftone.svg": frame({
    bg: C.forest,
    accent: C.bone,
    seed: 1,
    label: "PRINTED TEE",
    art: `
      ${offset(tee, C.sand, 9, 12)}
      <path d="${tee}" fill="${C.cream}"/>
      <path d="M336 232 Q400 300 464 232" fill="none" stroke="${C.forest}" stroke-width="8" opacity="0.5"/>
      ${halftone({ color: C.forest, cx: 400, cy: 430, r: 88, gap: 16, dot: 5.4 })}
      <circle cx="400" cy="430" r="100" fill="none" stroke="${C.forest}" stroke-width="3" opacity="0.35"/>`,
  }),
  "clothing-hoodie-arches.svg": frame({
    bg: C.cream,
    accent: C.forest,
    seed: 2,
    label: "HOODIE",
    art: `
      ${offset(hood, C.clay, 8, 10)}
      <path d="${hood}" fill="${C.sand}"/>
      ${offset(hoodie, C.clay, 8, 10)}
      <path d="${hoodie}" fill="${C.deep}"/>
      <path d="M266 424 L266 792 Q400 818 534 792 L534 424" fill="none" stroke="${C.cream}" stroke-width="3" opacity="0.25"/>
      <rect x="330" y="660" width="140" height="84" rx="10" fill="none" stroke="${C.cream}" stroke-width="4" opacity="0.55"/>
      <path d="M356 300 L350 392 M444 300 L450 392" stroke="${C.cream}" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
      ${arches({ color: C.sand, cx: 400, cy: 430, r: 84, count: 4, width: 9 })}`,
  }),
  "mugs-wave.svg": frame({
    bg: C.forest,
    accent: C.bone,
    seed: 3,
    label: "MUG",
    art: `
      <path d="${mugHandle}" fill="none" stroke="${C.sand}" stroke-width="38" stroke-linecap="round" transform="translate(9 11)"/>
      <path d="${mugBody}" fill="${C.sand}" transform="translate(9 11)"/>
      <path d="${mugHandle}" fill="none" stroke="${C.cream}" stroke-width="34" stroke-linecap="round"/>
      <path d="${mugBody}" fill="${C.cream}"/>
      <path d="M250 372 h300" stroke="${C.forest}" stroke-width="5" opacity="0.28"/>
      ${waves({ color: C.forest, cx: 400, cy: 505, r: 108, count: 7 })}`,
  }),
  "mugs-sun.svg": frame({
    bg: C.cream,
    accent: C.forest,
    seed: 4,
    label: "MUG",
    art: `
      <path d="${mugHandle}" fill="none" stroke="${C.clay}" stroke-width="38" stroke-linecap="round" transform="translate(9 11)"/>
      <path d="${mugBody}" fill="${C.clay}" transform="translate(9 11)"/>
      <path d="${mugHandle}" fill="none" stroke="${C.deep}" stroke-width="34" stroke-linecap="round"/>
      <path d="${mugBody}" fill="${C.deep}"/>
      ${sun({ color: C.sand, cx: 400, cy: 500, r: 104 })}`,
  }),
  "caps-dots.svg": frame({
    bg: C.forest,
    accent: C.bone,
    seed: 5,
    label: "CAP",
    art: `
      ${offset(capBrim, C.sand, 9, 11)}
      ${offset(capDome, C.sand, 9, 11)}
      <path d="${capBrim}" fill="${C.cream}"/>
      <path d="${capDome}" fill="${C.cream}"/>
      <path d="M400 322 V566" stroke="${C.forest}" stroke-width="3" opacity="0.18"/>
      <path d="M212 560 Q400 604 588 560" stroke="${C.forest}" stroke-width="4" fill="none" opacity="0.28"/>
      ${halftone({ color: C.forest, cx: 400, cy: 452, r: 62, gap: 13, dot: 4.6 })}`,
  }),
  "caps-stripes.svg": frame({
    bg: C.deep,
    accent: C.bone,
    seed: 6,
    label: "CAP",
    art: `
      ${offset(capBrim, C.cream, 8, 10)}
      ${offset(capDome, C.cream, 8, 10)}
      <path d="${capBrim}" fill="${C.sand}"/>
      <path d="${capDome}" fill="${C.sand}"/>
      ${stripes({ color: C.deep, cx: 400, cy: 442, size: 74, gap: 20, width: 9 })}`,
  }),
  "stickers-sheet.svg": frame({
    bg: C.forest,
    accent: C.bone,
    seed: 7,
    label: "STICKER SHEET",
    art: `
      <rect x="218" y="238" width="364" height="520" rx="26" fill="${C.sand}" transform="translate(10 12)"/>
      <rect x="218" y="238" width="364" height="520" rx="26" fill="${C.cream}"/>
      <circle cx="308" cy="338" r="46" fill="${C.forest}"/>
      <circle cx="308" cy="338" r="20" fill="${C.sand}"/>
      <rect x="396" y="292" width="92" height="92" rx="20" fill="none" stroke="${C.forest}" stroke-width="10"/>
      <path d="M310 470 l26 40 46 8 -34 34 8 46 -46 -24 -46 24 8 -46 -34 -34 46 -8 Z" fill="${C.clay}"/>
      <circle cx="468" cy="508" r="42" fill="none" stroke="${C.forest}" stroke-width="10"/>
      <rect x="288" y="606" width="228" height="70" rx="35" fill="${C.deep}"/>
      <circle cx="330" cy="641" r="16" fill="${C.sand}"/>
      <circle cx="380" cy="641" r="16" fill="${C.cream}"/>
      <circle cx="430" cy="641" r="16" fill="${C.clay}"/>`,
  }),
  "stickers-badge.svg": frame({
    bg: C.cream,
    accent: C.forest,
    seed: 8,
    label: "DIE-CUT STICKER",
    art: `
      <circle cx="410" cy="490" r="208" fill="${C.clay}" transform="translate(10 12)"/>
      <circle cx="400" cy="480" r="208" fill="${C.forest}"/>
      <circle cx="400" cy="480" r="168" fill="none" stroke="${C.cream}" stroke-width="10" stroke-dasharray="26 16"/>
      <circle cx="400" cy="480" r="112" fill="${C.sand}"/>
      <circle cx="400" cy="480" r="54" fill="${C.deep}"/>
      <circle cx="400" cy="480" r="18" fill="${C.cream}"/>`,
  }),
  "cases-grid.svg": frame({
    bg: C.forest,
    accent: C.bone,
    seed: 9,
    label: "PHONE CASE",
    art: `
      <rect x="218" y="208" width="364" height="608" rx="44" fill="${C.sand}" transform="translate(9 11)"/>
      <rect x="218" y="208" width="364" height="608" rx="44" fill="${C.cream}"/>
      <rect x="294" y="264" width="128" height="132" rx="28" fill="${C.forest}"/>
      <circle cx="330" cy="300" r="15" fill="${C.cream}"/>
      <circle cx="330" cy="348" r="15" fill="${C.cream}"/>
      <circle cx="386" cy="324" r="20" fill="${C.sand}"/>
      ${grid({ color: C.forest, cx: 400, cy: 610, size: 88, gap: 22, width: 4 })}`,
  }),
  "cases-arc.svg": frame({
    bg: C.deep,
    accent: C.bone,
    seed: 10,
    label: "PHONE CASE",
    art: `
      <rect x="218" y="208" width="364" height="608" rx="44" fill="${C.cream}" transform="translate(9 11)"/>
      <rect x="218" y="208" width="364" height="608" rx="44" fill="${C.sand}"/>
      <rect x="294" y="264" width="128" height="132" rx="28" fill="${C.deep}"/>
      <circle cx="330" cy="300" r="15" fill="${C.sand}"/>
      <circle cx="330" cy="348" r="15" fill="${C.sand}"/>
      ${arches({ color: C.deep, cx: 400, cy: 500, r: 120, count: 5, width: 12 })}`,
  }),
};

for (const [name, svg] of Object.entries(pieces)) {
  await writeFile(path.join(outDir, name), `${svg.trim()}\n`, "utf8");
}

await writeFile(
  path.join(root, "frontend", "public", "brand", "logo-mark.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Yuzersef">
  <circle cx="19" cy="24" r="12.5" fill="none" stroke="${C.sand}" stroke-width="3"/>
  <circle cx="29" cy="24" r="12.5" fill="none" stroke="${C.cream}" stroke-width="3"/>
  <circle cx="24" cy="24" r="3.4" fill="${C.sand}"/>
</svg>
`,
  "utf8",
);

console.log(`Wrote ${Object.keys(pieces).length} portfolio placeholders and the logo mark.`);
