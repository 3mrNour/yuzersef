import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = path.join(root, "frontend", "public", "mock");
await mkdir(outDir, { recursive: true });

const C = {
  forest: "#033A34",
  deep: "#022521",
  light: "#D9D4C8",
  lighter: "#E5E0D5",
  mid: "#C4BDAF",
  dark: "#AAA294",
  sand: "#EAC08C",
  bone: "#F3EEE3",
  clay: "#C88F56",
};

const W = 900;
const H = 1100;

const teeFrontPath =
  "M286 230 Q352 206 404 168 Q450 232 496 168 Q548 206 614 230 L748 350 L664 448 L614 402 L614 866 Q450 902 286 866 L286 402 L236 448 L152 350 Z";
const teeBackPath =
  "M286 230 Q352 204 405 180 Q450 196 495 180 Q550 204 614 230 L748 350 L664 448 L614 402 L614 866 Q450 902 286 866 L286 402 L236 448 L152 350 Z";
const teaBackYoke = "M286 296 Q450 330 614 296";
const teeFrontNeck = "M404 168 Q450 232 496 168";
const teeBackNeck = "M405 180 Q450 208 495 180";
const mugBodyPath =
  "M252 330 H598 V800 A40 40 0 0 1 558 840 H292 A40 40 0 0 1 252 800 Z";
const mugHandlePath = "M596 430 H636 A86 86 0 0 1 636 602 H596";
const capDomePath = "M230 592 Q232 310 450 306 Q668 310 670 592 Z";
const capBrimPath =
  "M214 590 Q450 642 706 556 Q724 620 630 648 Q450 696 232 632 Q196 616 214 590 Z";

function svg({ defs = "", body, title }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title}">
  <defs>${defs}</defs>
  ${body}
</svg>`;
}

function teeBase({ back = false } = {}) {
  const silhouette = back ? teeBackPath : teeFrontPath;
  const neck = back ? teeBackNeck : teeFrontNeck;
  return `<g>
    <path d="${silhouette}" fill="${C.light}" stroke="${C.dark}" stroke-width="4"/>
    <path d="${neck}" fill="none" stroke="${C.mid}" stroke-width="18" stroke-linecap="round"/>
    <path d="${neck}" fill="none" stroke="${C.dark}" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
    <path d="M286 402 L286 866 M614 402 L614 866" fill="none" stroke="${C.mid}" stroke-width="4" opacity="0.7"/>
    <path d="M236 448 L286 402 M664 448 L614 402" fill="none" stroke="${C.mid}" stroke-width="4" opacity="0.7"/>
    <path d="M310 864 Q450 894 590 864" fill="none" stroke="${C.mid}" stroke-width="3" opacity="0.55"/>
    ${back ? `<path d="${teaBackYoke}" fill="none" stroke="${C.mid}" stroke-width="3" opacity="0.7"/>` : ""}
  </g>`;
}

function teeShading({ back = false } = {}) {
  const silhouette = back ? teeBackPath : teeFrontPath;
  return `<g clip-path="url(#teeClip)">
    <path d="M286 230 L152 350 L236 448 L286 402 Z" fill="#000" opacity="0.18"/>
    <path d="M614 230 L748 350 L664 448 L614 402 Z" fill="#000" opacity="0.22"/>
    <path d="M292 430 Q318 610 300 860" fill="none" stroke="#000" stroke-width="34" opacity="0.12"/>
    <path d="M608 430 Q582 610 600 860" fill="none" stroke="#000" stroke-width="34" opacity="0.16"/>
    <path d="M360 296 Q450 324 540 296" fill="none" stroke="#000" stroke-width="20" opacity="0.18"/>
    <path d="M330 700 Q360 760 350 850" fill="none" stroke="#fff" stroke-width="18" opacity="0.18"/>
    <path d="M560 650 Q540 720 556 808" fill="none" stroke="#fff" stroke-width="14" opacity="0.14"/>
    <ellipse cx="450" cy="852" rx="120" ry="18" fill="#000" opacity="0.12"/>
  </g>`;
}

const teeDefs = `<clipPath id="teeClip"><path d="${teeFrontPath}"/></clipPath>`;
const teeBackDefs = `<clipPath id="teeClip"><path d="${teeBackPath}"/></clipPath>`;

const assets = {
  "tee-front.svg": svg({
    title: "Blank t-shirt front mockup",
    body: teeBase(),
  }),
  "tee-front-shading.svg": svg({
    title: "T-shirt front shading overlay",
    defs: teeDefs,
    body: teeShading(),
  }),
  "tee-back.svg": svg({
    title: "Blank t-shirt back mockup",
    body: teeBase({ back: true }),
  }),
  "tee-back-shading.svg": svg({
    title: "T-shirt back shading overlay",
    defs: teeBackDefs,
    body: teeShading({ back: true }),
  }),
  "mug-side.svg": svg({
    title: "Blank mug side mockup",
    body: `<g>
      <path d="${mugHandlePath}" fill="none" stroke="${C.light}" stroke-width="44" stroke-linecap="round"/>
      <path d="${mugHandlePath}" fill="none" stroke="${C.dark}" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
      <path d="${mugBodyPath}" fill="${C.light}" stroke="${C.dark}" stroke-width="4"/>
      <ellipse cx="425" cy="330" rx="173" ry="22" fill="${C.lighter}" stroke="${C.dark}" stroke-width="3"/>
      <ellipse cx="425" cy="330" rx="144" ry="12" fill="${C.mid}"/>
      <path d="M252 390 H598" stroke="${C.mid}" stroke-width="3" opacity="0.45"/>
      <path d="M286 836 Q425 856 564 836" fill="none" stroke="${C.mid}" stroke-width="3" opacity="0.45"/>
    </g>`,
  }),
  "mug-side-shading.svg": svg({
    title: "Mug shading overlay",
    defs: `<clipPath id="mugClip"><path d="${mugBodyPath}"/><path d="${mugHandlePath}" fill="none" stroke="#000" stroke-width="44" stroke-linecap="round"/></clipPath>`,
    body: `<g clip-path="url(#mugClip)">
      <rect x="252" y="330" width="64" height="510" fill="#fff" opacity="0.18"/>
      <rect x="520" y="330" width="80" height="510" fill="#000" opacity="0.15"/>
      <path d="M270 430 Q292 620 278 810" fill="none" stroke="#000" stroke-width="30" opacity="0.1"/>
      <path d="M590 610 Q626 590 610 500" fill="none" stroke="#000" stroke-width="26" opacity="0.13"/>
      <path d="M286 820 Q425 840 564 820" fill="none" stroke="#000" stroke-width="18" opacity="0.12"/>
      <ellipse cx="425" cy="330" rx="144" ry="12" fill="#000" opacity="0.18"/>
    </g>`,
  }),
  "cap-front.svg": svg({
    title: "Blank cap front mockup",
    body: `<g>
      <path d="${capDomePath}" fill="${C.light}" stroke="${C.dark}" stroke-width="4"/>
      <path d="${capBrimPath}" fill="${C.light}" stroke="${C.dark}" stroke-width="4"/>
      <path d="M450 308 V590" fill="none" stroke="${C.mid}" stroke-width="3" opacity="0.7"/>
      <path d="M360 320 Q342 452 338 584" fill="none" stroke="${C.mid}" stroke-width="3" opacity="0.55"/>
      <path d="M540 320 Q558 452 562 584" fill="none" stroke="${C.mid}" stroke-width="3" opacity="0.55"/>
      <path d="M228 588 Q450 632 678 574" fill="none" stroke="${C.mid}" stroke-width="3" opacity="0.5"/>
      <circle cx="450" cy="312" r="12" fill="${C.mid}"/>
    </g>`,
  }),
  "cap-front-shading.svg": svg({
    title: "Cap shading overlay",
    defs: `<clipPath id="capClip"><path d="${capDomePath}"/><path d="${capBrimPath}"/></clipPath>`,
    body: `<g clip-path="url(#capClip)">
      <path d="M236 560 Q256 356 450 314 Q644 356 664 560 Z" fill="#fff" opacity="0.16"/>
      <path d="M230 592 Q240 350 450 310" fill="none" stroke="#000" stroke-width="46" opacity="0.09"/>
      <path d="M670 592 Q660 350 450 310" fill="none" stroke="#000" stroke-width="54" opacity="0.15"/>
      <path d="M230 590 Q450 642 706 556" fill="none" stroke="#000" stroke-width="22" opacity="0.13"/>
      <path d="M260 626 Q450 674 640 618" fill="none" stroke="#fff" stroke-width="12" opacity="0.13"/>
    </g>`,
  }),
};

const preview = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Mockup studio preview">
  <defs>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.1" fill="${C.bone}" opacity="0.12"/>
    </pattern>
    <clipPath id="previewClip"><path d="${teeFrontPath}"/></clipPath>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.sand}" stop-opacity="0.18"/>
      <stop offset="0.55" stop-color="${C.sand}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.forest}"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <ellipse cx="450" cy="906" rx="250" ry="34" fill="${C.deep}" opacity="0.55"/>
  <path d="${teeFrontPath}" fill="${C.sand}" stroke="${C.clay}" stroke-width="4"/>
  <path d="${teeFrontNeck}" fill="none" stroke="${C.clay}" stroke-width="18" stroke-linecap="round"/>
  <g clip-path="url(#previewClip)">
    <path d="M286 230 L152 350 L236 448 L286 402 Z" fill="#000" opacity="0.1"/>
    <path d="M614 230 L748 350 L664 448 L614 402 Z" fill="#000" opacity="0.1"/>
    <path d="M292 430 Q318 610 300 860" fill="none" stroke="#000" stroke-width="34" opacity="0.06"/>
    <path d="M608 430 Q582 610 600 860" fill="none" stroke="#000" stroke-width="34" opacity="0.08"/>
  </g>
  <g transform="translate(450 505)" fill="none" stroke="${C.forest}" stroke-width="7">
    <circle cx="-28" cy="0" r="34"/>
    <circle cx="28" cy="0" r="34"/>
    <circle cx="0" cy="0" r="8" fill="${C.forest}" stroke="none"/>
  </g>
  <text x="450" y="596" text-anchor="middle" fill="${C.forest}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="6">YUZERSEF</text>
  <rect x="297" y="330" width="306" height="396" fill="none" stroke="${C.forest}" stroke-width="2" stroke-dasharray="12 10" opacity="0.35"/>
</svg>`;

assets["studio-preview.svg"] = preview;

for (const [name, content] of Object.entries(assets)) {
  await writeFile(path.join(outDir, name), `${content.trim()}\n`, "utf8");
}

console.log(`Wrote ${Object.keys(assets).length} mock product assets to frontend/public/mock.`);
