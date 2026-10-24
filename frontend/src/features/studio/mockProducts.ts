import type { Product } from "./types";

export const mockProducts: Product[] = [
  {
    _id: "tee-classic",
    name: "Classic Tee",
    category: "clothing",
    colors: [
      { id: "bone", name: "Bone", hex: "#E9E2D4" },
      { id: "black", name: "Black", hex: "#111111" },
      { id: "forest", name: "Forest", hex: "#033A34" },
      { id: "sand", name: "Sand", hex: "#EAC08C" },
      { id: "clay", name: "Clay", hex: "#C88F56" },
    ],
    views: [
      {
        id: "front",
        label: "Front",
        baseImage: "/mock/tee-front.svg",
        shadingImage: "/mock/tee-front-shading.svg",
        printArea: { x: 0.33, y: 0.3, w: 0.34, h: 0.36 },
        wrap: "none",
      },
      {
        id: "back",
        label: "Back",
        baseImage: "/mock/tee-back.svg",
        shadingImage: "/mock/tee-back-shading.svg",
        printArea: { x: 0.33, y: 0.3, w: 0.34, h: 0.36 },
        wrap: "none",
      },
    ],
    options: {
      sizes: ["S", "M", "L", "XL", "2XL"],
      printPositions: ["Front", "Back"],
      styles: ["Classic", "Oversized"],
    },
  },
  {
    _id: "mug-classic",
    name: "Classic Mug",
    category: "mugs",
    colors: [
      { id: "bone", name: "Bone", hex: "#E9E2D4" },
      { id: "forest", name: "Forest", hex: "#033A34" },
      { id: "clay", name: "Clay", hex: "#C88F56" },
    ],
    views: [
      {
        id: "side",
        label: "Side",
        baseImage: "/mock/mug-side.svg",
        shadingImage: "/mock/mug-side-shading.svg",
        printArea: { x: 0.29, y: 0.4, w: 0.37, h: 0.32 },
        wrap: "cylinder",
      },
    ],
    options: { styles: ["Classic", "Matte", "Glossy"] },
  },
  {
    _id: "cap-classic",
    name: "Classic Cap",
    category: "caps",
    colors: [
      { id: "forest", name: "Forest", hex: "#033A34" },
      { id: "sand", name: "Sand", hex: "#EAC08C" },
      { id: "bone", name: "Bone", hex: "#E9E2D4" },
    ],
    views: [
      {
        id: "front",
        label: "Front",
        baseImage: "/mock/cap-front.svg",
        shadingImage: "/mock/cap-front-shading.svg",
        printArea: { x: 0.39, y: 0.4, w: 0.22, h: 0.16 },
        wrap: "none",
      },
    ],
    options: { styles: ["Classic", "Dad cap", "Snapback"] },
  },
];
