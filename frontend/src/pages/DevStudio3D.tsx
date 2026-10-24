import {
  ArrowCounterClockwise,
  DownloadSimple,
  ImageSquare,
  Info,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type RefObject,
} from "react";
import * as THREE from "three";
import type { PrintPlacement } from "../lib/api";
import { mockProducts } from "../features/studio/mockProducts";
import { cn } from "../lib/cn";
import { buttonClass } from "../lib/styles";
import { useLanguage } from "../providers/LanguageProvider";

const MODEL_URL = "/models/shirt_baked.glb";
const SHIRT_HEIGHT = 1.7;
const SLEEVE_BOUNDARY = 0.36;
const DEFAULT_SCALE = 0.3;
const SURFACE_OFFSET = 0.008;

type Zone = "front" | "back" | "left-sleeve" | "right-sleeve";

interface ZoneDecal {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  scale: number;
  spin: number;
}

type DecalMap = Partial<Record<Zone, ZoneDecal>>;

interface DesignAsset {
  texture: THREE.Texture;
  aspect: number;
  previewUrl: string;
}

type DesignMap = Partial<Record<Zone, DesignAsset>>;

const ZONES: { id: Zone; theta: number }[] = [
  { id: "front", theta: 0 },
  { id: "back", theta: Math.PI },
  { id: "left-sleeve", theta: Math.PI / 2 },
  { id: "right-sleeve", theta: -Math.PI / 2 },
];

const zoneLabel: Record<PrintPlacement, { ar: string; en: string }> = {
  front: { ar: "الأمام", en: "Front" },
  back: { ar: "الخلف", en: "Back" },
  "left-sleeve": { ar: "الكم الأيسر", en: "Left sleeve" },
  "right-sleeve": { ar: "الكم الأيمن", en: "Right sleeve" },
  custom: { ar: "موضع مخصص", en: "Custom" },
};

function zoneFromPoint(point: THREE.Vector3): Zone {
  if (Math.abs(point.x) > SLEEVE_BOUNDARY) {
    return point.x > 0 ? "left-sleeve" : "right-sleeve";
  }
  return point.z >= 0 ? "front" : "back";
}

function frameFromNormal(normal: THREE.Vector3): THREE.Quaternion {
  const z = normal.clone().normalize();
  const upRef = Math.abs(z.y) > 0.985 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
  const x = new THREE.Vector3().crossVectors(upRef, z).normalize();
  const y = new THREE.Vector3().crossVectors(z, x).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

function shortestAngle(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

interface DirectTarget {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
  hasPointerCapture?: (pointerId: number) => boolean;
}

interface StageProps {
  tintHex: string;
  designs: DesignMap;
  decals: DecalMap;
  onPlaceDecal: (zone: Zone, position: THREE.Vector3, normal: THREE.Vector3, from?: Zone) => void;
  onActivateZone: (zone: Zone) => void;
  flyThetaRef: RefObject<number | null>;
  autoZoneRef: RefObject<Zone | null>;
  pendingPlaceRef: RefObject<Zone | null>;
}

function ShirtStage({
  tintHex,
  designs,
  decals,
  onPlaceDecal,
  onActivateZone,
  flyThetaRef,
  autoZoneRef,
  pendingPlaceRef,
}: StageProps) {
  const { scene } = useGLTF(MODEL_URL);
  const [dragging, setDragging] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const dragZoneRef = useRef<Zone | null>(null);
  const controls = useThree((state) => state.controls) as {
    enabled: boolean;
  } | null;
  const normalMatrix = useMemo(() => new THREE.Matrix3(), []);

  const rig = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) meshes.push(object as THREE.Mesh);
    });
    const source = meshes[0];
    if (!source || !source.geometry) return null;
    const geometry = source.geometry.clone();
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return null;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const factor = SHIRT_HEIGHT / Math.max(size.y, 1e-4);
    geometry.translate(-center.x, -center.y, -center.z);
    geometry.scale(factor, factor, factor);
    const sleeveAnchors: { left: THREE.Vector3 | null; right: THREE.Vector3 | null } = {
      left: null,
      right: null,
    };
    const position = geometry.getAttribute("position");
    const normalAttr = geometry.getAttribute("normal");
    const best: Record<"left" | "right", { score: number; point: THREE.Vector3 | null }> = {
      left: { score: -Infinity, point: null },
      right: { score: -Infinity, point: null },
    };    const loose: Record<"left" | "right", { depth: number; point: THREE.Vector3 | null }> = {
      left: { depth: Infinity, point: null },
      right: { depth: Infinity, point: null },
    };
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      if (y < 0.14 || y > 0.58) continue;
      const sx = Math.abs(x);
      if (sx < 0.38) continue;
      const side: "left" | "right" = x >= 0 ? "left" : "right";
      const sign = x >= 0 ? 1 : -1;
      const faceScore = (normalAttr ? normalAttr.getX(i) : x) * sign;
      if (faceScore < 0.55) {
        const depth = Math.abs(z);
        if (depth < loose[side].depth) {
          loose[side] = { depth, point: new THREE.Vector3(x, y, z) };
        }
        continue;
      }
      if (y > best[side].score) {
        best[side] = { score: y, point: new THREE.Vector3(x, y, z) };
      }
    }
    sleeveAnchors.left = best.left.point ?? loose.left.point;
    sleeveAnchors.right = best.right.point ?? loose.right.point;
    const standard = source.material as THREE.MeshStandardMaterial;
    return { geometry, map: standard.map ?? null, sleeveAnchors };
  }, [scene]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: rig?.map ?? null,
      roughness: 0.92,
      metalness: 0.02,
      color: new THREE.Color(tintHex),
    });
  }, [rig, tintHex]);

  useEffect(() => {
    if (!dragging) return;
    const onEnd = () => {
      dragZoneRef.current = null;
      setDragging(false);
      if (controls) controls.enabled = true;
    };
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    return () => {
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
  }, [dragging, controls]);

  const hitFromEvent = useCallback(
    (event: ThreeEvent<PointerEvent>): { point: THREE.Vector3; normal: THREE.Vector3 } | null => {
      const mesh = meshRef.current;
      if (!mesh) return null;
      const shirtHit = event.intersections.find((entry) => entry.object === mesh) ?? event;
      const face = shirtHit.face;
      const point = shirtHit.point;
      if (!face || !point) return null;
      const normal = face.normal.clone();
      normal.applyMatrix3(normalMatrix.getNormalMatrix(mesh.matrixWorld)).normalize();
      return { point: point.clone(), normal };
    },
    [normalMatrix],
  );

  function beginDrag(zone: Zone) {
    dragZoneRef.current = zone;
    setDragging(true);
    if (controls) controls.enabled = false;
    onActivateZone(zone);
  }

  function handleSurfaceDown(event: ThreeEvent<PointerEvent>) {
    const hit = hitFromEvent(event);
    if (!hit) return;
    const zone = zoneFromPoint(hit.point);
    if (!designs[zone]) return;
    event.stopPropagation();
    onPlaceDecal(zone, hit.point, hit.normal);
    beginDrag(zone);
    const target = event.target as DirectTarget | null;
    try {
      target?.setPointerCapture?.(event.pointerId);
    } catch {
      // capture can be unavailable mid-gesture
    }
  }

  function handleDecalDown(zone: Zone) {
    return (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      beginDrag(zone);
      const target = event.target as DirectTarget | null;
      try {
        target?.setPointerCapture?.(event.pointerId);
      } catch {
        // capture can be unavailable mid-gesture
      }
    };
  }

  function handleSurfaceMove(event: ThreeEvent<PointerEvent>) {
    const zone = dragZoneRef.current;
    if (!zone) return;
    const hit = hitFromEvent(event);
    if (!hit) return;
    const actual = zoneFromPoint(hit.point);
    const transferred = actual !== zone;
    onPlaceDecal(actual, hit.point, hit.normal, transferred ? zone : undefined);
    if (transferred) {
      dragZoneRef.current = actual;
      onActivateZone(actual);
    }
  }

  function handleSurfaceUp(event: ThreeEvent<PointerEvent>) {
    if (controls) controls.enabled = true;
    dragZoneRef.current = null;
    setDragging(false);
    const target = event.target as DirectTarget | null;
    if (target?.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture?.(event.pointerId);
    }
  }

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const orbitControls = state.controls as { target?: THREE.Vector3 } | null;
    const target = orbitControls?.target ?? null;

    if (mesh && target) {
      let pendingZone: Zone | null = null;
      if (autoZoneRef.current && designs[autoZoneRef.current]) {
        pendingZone = autoZoneRef.current;
        autoZoneRef.current = null;
      } else if (pendingPlaceRef.current && flyThetaRef.current === null) {
        pendingZone = pendingPlaceRef.current;
        pendingPlaceRef.current = null;
      }
      if (pendingZone && designs[pendingZone]) {
        const isSleeve =
          pendingZone === "left-sleeve" || pendingZone === "right-sleeve";
        const anchor = isSleeve && rig
          ? rig.sleeveAnchors[pendingZone === "left-sleeve" ? "left" : "right"]
          : null;
        if (anchor) {
          onPlaceDecal(
            pendingZone,
            anchor.clone(),
            new THREE.Vector3(pendingZone === "left-sleeve" ? 1 : -1, 0, 0),
          );
          onActivateZone(pendingZone);
        } else {
          const aimY = isSleeve ? 0.12 : 0.02;
          const radius = state.camera.position.distanceTo(target);
          const spherical = new THREE.Spherical().setFromVector3(
            state.camera.position.clone().sub(target),
          );
          const zoneTheta =
            ZONES.find((entry) => entry.id === pendingZone)?.theta ?? 0;
          const droneCam = state.camera.clone();
          droneCam.position
            .setFromSpherical(new THREE.Spherical(radius, spherical.phi, zoneTheta))
            .add(target);
          droneCam.lookAt(target);
          droneCam.updateMatrixWorld();
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(0, aimY), droneCam);
          const hit = raycaster.intersectObject(mesh, false)[0];
          if (hit && hit.face) {
            const normal = hit.face.normal.clone();
            normal.applyMatrix3(normalMatrix.getNormalMatrix(mesh.matrixWorld)).normalize();
            onPlaceDecal(pendingZone, hit.point.clone(), normal);
            onActivateZone(pendingZone);
          }
        }
      }
    }

    const wanted = flyThetaRef.current;
    if (wanted === null || !target) return;
    const offset = state.camera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    const diff = shortestAngle(spherical.theta, wanted);
    const step = Math.min(1, delta * 6);
    spherical.theta += diff * step;
    offset.setFromSpherical(spherical);
    state.camera.position.copy(target).add(offset);
    if (Math.abs(diff) < 0.006) flyThetaRef.current = null;
  });

  const zoneEntries = ZONES.flatMap((zone) => {
    const decal = decals[zone.id];
    const design = designs[zone.id];
    if (!decal || !design) return [];
    const frame = frameFromNormal(decal.normal);
    const spinQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      (decal.spin * Math.PI) / 180,
    );
    const orientation = frame.multiply(spinQuat);
    const shift = decal.position.clone().addScaledVector(decal.normal, SURFACE_OFFSET);
    const scale: [number, number, number] = [
      decal.scale,
      Math.max(0.02, decal.scale * design.aspect),
      1,
    ];
    return [{ zone: zone.id, orientation, shift, scale, texture: design.texture }];
  });

  if (!rig) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={rig.geometry}
      material={material}
      onPointerDown={handleSurfaceDown}
      onPointerMove={handleSurfaceMove}
      onPointerUp={handleSurfaceUp}
      onPointerCancel={handleSurfaceUp}
    >
      {zoneEntries.map(({ zone, orientation, shift, scale, texture }) => (
        <mesh
          key={zone}
          position={shift}
          quaternion={orientation}
          scale={scale}
          onPointerDown={handleDecalDown(zone)}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            map={texture}
            transparent
            polygonOffset
            polygonOffsetFactor={-8}
            depthWrite={false}
          />
        </mesh>
      ))}
    </mesh>
  );
}

export function DevStudio3D() {
  const { lang } = useLanguage();
  const tee = mockProducts[0];
  const [tintHex, setTintHex] = useState(tee.colors[0].hex);
  const [designs, setDesigns] = useState<DesignMap>({});
  const [activeZone, setActiveZone] = useState<Zone>("front");
  const [isExporting, setIsExporting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const flyThetaRef = useRef<number | null>(null);
  const autoZoneRef = useRef<Zone | null>(null);
  const pendingPlaceRef = useRef<Zone | null>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [decals, setDecals] = useState<DecalMap>({});
  const designsRef = useRef<DesignMap>({});
  useEffect(() => {
    designsRef.current = designs;
  }, [designs]);
  const hasDesigns = Object.keys(designs).length > 0;
  const hasDecals = Object.keys(decals).length > 0;

  const placeDecal = useCallback(
    (zone: Zone, position: THREE.Vector3, normal: THREE.Vector3, from?: Zone) => {
      if (from && from !== zone) {
        const dragged = designsRef.current[from];
        const target = designsRef.current[zone];
        if (dragged && dragged !== target) {
          if (target) {
            URL.revokeObjectURL(target.previewUrl);
            target.texture.dispose();
          }
          setDesigns((current) => {
            const next = { ...current };
            next[zone] = dragged;
            delete next[from];
            return next;
          });
        }
      }
      setDecals((current) => {
        const draggedDecal = from ? current[from] : undefined;
        const next = { ...current };
        if (from && from !== zone) delete next[from];
        next[zone] = {
          position,
          normal,
          scale: draggedDecal?.scale ?? next[zone]?.scale ?? DEFAULT_SCALE,
          spin: draggedDecal?.spin ?? next[zone]?.spin ?? 0,
        };
        return next;
      });
      setActiveZone(zone);
    },
    [],
  );

  const setDecalTransform = useCallback((zone: Zone, patch: { scale?: number; spin?: number }) => {
    setDecals((current) => {
      const existing = current[zone];
      if (!existing) return current;
      return { ...current, [zone]: { ...existing, ...patch } };
    });
  }, []);

  const clearZone = useCallback((zone: Zone) => {
    setDecals((current) => {
      const next = { ...current };
      delete next[zone];
      return next;
    });
  }, []);

  const acceptFaceFile = useCallback(
    (zone: Zone, file: File) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const accepted =
        ["image/png", "image/jpeg", "image/svg+xml"].includes(file.type) ||
        ["png", "jpg", "jpeg", "svg"].includes(extension);
      if (!accepted) {
        setUploadError(lang === "ar" ? "صيغة غير مدعومة — استخدم PNG أو JPG أو SVG" : "Unsupported format — use PNG, JPG or SVG");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(lang === "ar" ? "الملف أكبر من 5 ميجابايت" : "File is larger than 5 MB");
        return;
      }
      setUploadError(null);
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) {
          URL.revokeObjectURL(url);
          setUploadError(lang === "ar" ? "تعذر قراءة أبعاد الصورة" : "Could not read image dimensions");
          return;
        }
        const previous = designsRef.current[zone];
        if (previous) {
          URL.revokeObjectURL(previous.previewUrl);
          previous.texture.dispose();
        }
        const texture = new THREE.Texture(image);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        texture.needsUpdate = true;
        setDesigns((current) => ({
          ...current,
          [zone]: {
            texture,
            aspect: image.naturalHeight / image.naturalWidth,
            previewUrl: url,
          },
        }));
        autoZoneRef.current = zone;
        setActiveZone(zone);
        flyThetaRef.current = ZONES.find((item) => item.id === zone)?.theta ?? 0;
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        setUploadError(lang === "ar" ? "تعذر تحميل الصورة" : "Could not load image");
      };
      image.src = url;
    },
    [lang],
  );

  const handleFaceFileChange = useCallback(
    (zone: Zone) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      acceptFaceFile(zone, file);
    },
    [acceptFaceFile],
  );

  const removeFaceDesign = useCallback(
    (zone: Zone) => {
      const design = designs[zone];
      if (!design) return;
      URL.revokeObjectURL(design.previewUrl);
      design.texture.dispose();
      setDesigns((current) => {
        const next = { ...current };
        delete next[zone];
        return next;
      });
      setDecals((current) => {
        const next = { ...current };
        delete next[zone];
        return next;
      });
    },
    [designs],
  );

  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) acceptFaceFile(activeZone, file);
    },
    [acceptFaceFile, activeZone],
  );

  const loadHeaderLogo = useCallback(
    () =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = "/brand/logo.png";
      }),
    [],
  );

  const composeFaceSheet = useCallback(async (): Promise<string | null> => {
    const gl = glRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!gl || !scene || !camera) return null;
    const dom = gl.domElement;
    const target = new THREE.Vector3(0, 0.02, 0);
    const savedPosition = camera.position.clone();
    const spherical = new THREE.Spherical().setFromVector3(savedPosition.clone().sub(target));
    const radius = spherical.radius;
    const phi = spherical.phi;
    const shots: { zone: Zone; url: string }[] = [];
    try {
      for (const { id, theta } of ZONES) {
        const offset = new THREE.Vector3().setFromSpherical(new THREE.Spherical(radius, phi, theta));
        camera.position.copy(target).add(offset);
        camera.lookAt(target);
        gl.render(scene, camera);
        shots.push({ zone: id, url: dom.toDataURL("image/png") });
      }
    } finally {
      camera.position.copy(savedPosition);
      camera.lookAt(target);
      gl.render(scene, camera);
    }
    let faces: HTMLImageElement[];
    try {
      faces = await Promise.all(
        shots.map(
          ({ url }) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const image = new Image();
              image.onload = () => resolve(image);
              image.onerror = () => reject(new Error("face render"));
              image.src = url;
            }),
        ),
      );
    } catch {
      return null;
    }
    const logoImage = await loadHeaderLogo();
    if (!faces.length) return null;
    const cellRatio = dom.height / Math.max(1, dom.width);
    const sheetW = 1360;
    const pad = 32;
    const gap = 24;
    const labelH = 38;
    const cellW = (sheetW - pad * 2 - gap) / 2;
    const cellH = Math.round(cellW * cellRatio);
    const headerH = 148;
    const row1Y = headerH + gap;
    const label1Y = row1Y + cellH + 6;
    const row2Y = label1Y + labelH;
    const label2Y = row2Y + cellH + 6;
    const footerY = label2Y + labelH + 6;
    const footerH = 92;
    const sheetH = footerY + footerH;
    const sheet = document.createElement("canvas");
    sheet.width = sheetW;
    sheet.height = sheetH;
    const ctx = sheet.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#04211d";
    ctx.fillRect(0, 0, sheetW, sheetH);
    if (logoImage) {
      const logoH = 72;
      const logoW = (logoImage.width / logoImage.height) * logoH;
      ctx.drawImage(logoImage, sheetW - pad - logoW, 26, logoW, logoH);
    }
    ctx.fillStyle = "#f0d9b2";
    ctx.font = '600 34px "Reem Kufi Arabic", "IBM Plex Sans Arabic", sans-serif';
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(
      lang === "ar" ? "استوديو الطباعة — نموذج ثلاثي الأبعاد" : "Print Studio — 3D Mockup",
      pad,
      62,
    );
    ctx.fillStyle = "rgba(240, 217, 178, 0.28)";
    ctx.fillRect(pad, headerH - 4, sheetW - pad * 2, 1);
    faces.forEach((image, index) => {
      const column = index % 2;
      const row = index / 2 | 0;
      const x = pad + column * (cellW + gap);
      const y = row === 0 ? row1Y : row2Y;
      ctx.fillStyle = "#0a4038";
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 18);
      ctx.fill();
      ctx.strokeStyle = "rgba(240, 217, 178, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.drawImage(image, x, y, cellW, cellH);
      ctx.fillStyle = "rgba(240, 217, 178, 0.75)";
      ctx.font = '500 20px "IBM Plex Sans Arabic", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(zoneLabel[shots[index].zone][lang === "ar" ? "ar" : "en"], x + cellW / 2, y + cellH + 22);
    });
    ctx.fillStyle = "rgba(240, 217, 178, 0.85)";
    ctx.font = '600 24px "Reem Kufi Arabic", "IBM Plex Sans Arabic", sans-serif';
    ctx.fillText(
      lang === "ar" ? "يوزرسيف" : "Yuzersef",
      sheetW / 2,
      footerY + 36,
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = '400 16px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillText(
      lang === "ar"
        ? "نموذج معاينة مولّد آليًا — Classic Tee"
        : "Automated preview sheet — Classic Tee",
      sheetW / 2,
      footerY + 66,
    );
    return sheet.toDataURL("image/png");
  }, [lang, loadHeaderLogo]);

  const handleDownload = useCallback(async () => {
    const gl = glRef.current;
    if (!gl || !hasDecals || isExporting) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      const url = gl.domElement.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "yuzersef-studio3d-view.png";
      link.click();
    } finally {
      setIsExporting(false);
    }
  }, [hasDecals, isExporting]);

  const handleExportSheet = useCallback(async () => {
    if (!hasDecals || isExporting) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      const url = await composeFaceSheet();
      if (!url) return;
      const link = document.createElement("a");
      link.href = url;
      link.download = "yuzersef-mockup-sheet.png";
      link.click();
    } finally {
      setIsExporting(false);
    }
  }, [composeFaceSheet, hasDecals, isExporting]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (window as unknown as { __ys3dComposeSheet?: () => Promise<string | null> }).__ys3dComposeSheet = composeFaceSheet;
  }, [composeFaceSheet]);

  const activeDecal = decals[activeZone];

  const headerLabel = zoneLabel[activeZone][lang === "ar" ? "ar" : "en"];

  return (
    <div className="min-h-screen bg-forest-950 text-bone">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <header className="border-b border-bone/10 pb-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-sand/40 bg-sand/10 px-3 py-1 text-xs font-semibold text-sand">
            <Info aria-hidden="true" size={14} />
            {lang === "ar" ? "نموذج تجريبي — ثلاثي الأبعاد" : "DEV prototype — 3D studio"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            {lang === "ar" ? "استوديو طباعة ثلاثي الأبعاد" : "3D print studio"}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-bone/60">
            {lang === "ar"
              ? "لكل جهة لوحتها الخاصة: ارفع أو أزل صورة مستقلة للأمام والخلف والكمين، ثم صدّر ورقة واحدة تجمع كل الجهات بشعار يوزرسيف."
              : "Every face has its own panel: add or remove an image for front, back and both sleeves, then export one branded sheet with all views."}
          </p>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <section className="overflow-hidden rounded-[var(--radius-card)] border border-bone/15 bg-forest-900">
            <div className="flex items-center justify-between gap-3 border-b border-bone/10 px-4 py-3 text-sm">
              <span className="truncate text-bone/75">
                Classic Tee (3D) <span className="text-bone/40">/ {headerLabel}</span>
              </span>
              <span className="rounded-full border border-bone/15 px-2.5 py-0.5 text-xs text-bone/50">
                {lang === "ar"
                  ? `${Object.keys(decals).length} تصميم`
                  : `${Object.keys(decals).length} design${Object.keys(decals).length === 1 ? "" : "s"}`}
              </span>
            </div>
            <div
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
              className="relative h-[58vh] min-h-[420px] bg-[radial-gradient(120%_120%_at_50%_10%,#0a4038_0%,#032b26_55%,#022421_100%)] sm:h-[520px] lg:h-[640px]"
            >
              <Canvas
                shadows
                dpr={[1, 2]}
                gl={{ preserveDrawingBuffer: true, antialias: true }}
                camera={{ position: [0, 0.45, 3.9], fov: 32 }}
                onCreated={({ gl, scene, camera }) => {
                  glRef.current = gl;
                  sceneRef.current = scene;
                  cameraRef.current = camera as THREE.PerspectiveCamera;
                }}
              >
                <ambientLight intensity={0.85} />
                <directionalLight position={[2.6, 3.2, 2.4]} intensity={1.7} />
                <directionalLight position={[-2.6, 1.6, -2.2]} intensity={0.7} />
                <directionalLight position={[0, 1.8, -3.2]} intensity={0.5} />
                <ShirtStage
                  tintHex={tintHex}
                  designs={designs}
                  decals={decals}
                  onPlaceDecal={placeDecal}
                  onActivateZone={setActiveZone}
                  flyThetaRef={flyThetaRef}
                  autoZoneRef={autoZoneRef}
                  pendingPlaceRef={pendingPlaceRef}
                />
                <ContactShadows
                  position={[0, -0.92, 0]}
                  opacity={0.5}
                  scale={4.5}
                  blur={2.4}
                  far={1.6}
                  resolution={256}
                  color="#04211d"
                />
                <OrbitControls
                  makeDefault
                  enablePan={false}
                  enableDamping
                  dampingFactor={0.08}
                  minDistance={1.9}
                  maxDistance={5.5}
                  target={[0, 0.02, 0]}
                />
              </Canvas>
              {!hasDesigns ? (
                <div className="pointer-events-none absolute inset-0 grid place-items-center p-5">
                  <span className="flex max-w-[30ch] flex-col items-center gap-2 rounded-2xl border border-bone/15 bg-forest-950/70 px-5 py-4 text-center text-sm leading-relaxed text-bone/75 backdrop-blur-sm">
                    <ImageSquare aria-hidden="true" size={22} className="text-sand/80" />
                    {lang === "ar"
                      ? "ارفع صورة لكل جهة من اللوحة الجانبية — أو اسحبها وأفلته هنا لتُضاف للجهة النشطة."
                      : "Upload an image for any face from the panel — or drag & drop it here to add it to the active face."}
                  </span>
                </div>
              ) : null}
            </div>
            <p className="border-t border-bone/10 px-4 py-3 text-xs leading-relaxed text-bone/50">
              {lang === "ar"
                ? "اسحب لتدوير القميص · عجلة الفأرة للتكبير · [ و ] لتغيير حجم التصميم النشط · الصور المسحوبة تُضاف للجهة النشطة"
                : "Drag to rotate the shirt · wheel to zoom · [ and ] resize the active design · dropped images land on the active face"}
            </p>
          </section>

          <aside className="space-y-5 rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/45 p-5">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
                {lang === "ar" ? "جهات الطباعة" : "Print faces"}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-bone/55">
                {lang === "ar"
                  ? "لكل جهة صورتها وزر حذفها الخاص — الرفع يثبّت التصميم تلقائيًا على تلك الجهة."
                  : "Each face has its own image and remove button — uploading auto-places the design on that face."}
              </p>
              <div className="mt-3 space-y-2">
                {ZONES.map((zone) => {
                  const design = designs[zone.id];
                  const decal = decals[zone.id];
                  const isActive = activeZone === zone.id;
                  const label = zoneLabel[zone.id][lang === "ar" ? "ar" : "en"];
                  return (
                    <div
                      key={zone.id}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border p-2 transition-colors",
                        isActive ? "border-sand/70 bg-sand/10" : "border-bone/15 bg-forest-950/40",
                      )}
                    >
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => {
                          setActiveZone(zone.id);
                          if (design && !decal) pendingPlaceRef.current = zone.id;
                          flyThetaRef.current = zone.theta;
                        }}
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-xl text-start"
                      >
                        {design ? (
                          <img
                            src={design.previewUrl}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded-lg border border-bone/10 object-contain"
                          />
                        ) : (
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-dashed border-bone/20 text-bone/30">
                            <ImageSquare aria-hidden="true" size={16} />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className={cn("block truncate text-sm", isActive ? "text-sand" : "text-bone/85")}>
                            {label}
                          </span>
                          <span className="block text-[11px] text-bone/45">
                            {lang === "ar"
                              ? decal
                                ? "موضوعة"
                                : design
                                  ? "في انتظار التثبيت"
                                  : "فارغة"
                              : decal
                                ? "Placed"
                                : design
                                  ? "Awaiting placement"
                                  : "Empty"}
                          </span>
                        </span>
                      </button>
                      <div className="relative shrink-0">
                        <span
                          aria-hidden="true"
                          className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-bone/20 text-bone/70 transition-colors hover:border-sand hover:text-sand"
                        >
                          <UploadSimple aria-hidden="true" size={16} />
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,.png,.jpg,.jpeg,.svg"
                          onChange={handleFaceFileChange(zone.id)}
                          aria-label={lang === "ar" ? `رفع صورة — ${label}` : `Upload image — ${label}`}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFaceDesign(zone.id)}
                        disabled={!design}
                        aria-label={lang === "ar" ? `حذف صورة — ${label}` : `Remove image — ${label}`}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-bone/40 transition-colors hover:text-danger disabled:opacity-30"
                      >
                        <Trash aria-hidden="true" size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {uploadError ? (
                <p role="alert" className="mt-2 text-xs leading-relaxed text-danger">
                  {uploadError}
                </p>
              ) : null}
            </section>

            <section className="border-t border-bone/10 pt-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
                {lang === "ar" ? "لون القميص" : "Shirt color"}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {tee.colors.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.hex === tintHex}
                    aria-label={item.name}
                    title={item.name}
                    onClick={() => setTintHex(item.hex)}
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full border transition-[transform,border-color,box-shadow]",
                      item.hex === tintHex
                        ? "border-sand shadow-[0_0_0_2px_var(--color-forest-900),0_0_0_4px_var(--color-sand)]"
                        : "border-bone/25 hover:scale-105 hover:border-bone/50",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="block h-7 w-7 rounded-full border border-black/15"
                      style={{ backgroundColor: item.hex }}
                    />
                  </button>
                ))}
              </div>
            </section>

            <section className="border-t border-bone/10 pt-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
                  {lang === "ar" ? "تحكم التصميم النشط" : "Active design controls"}
                </h2>
                <button
                  type="button"
                  onClick={() => clearZone(activeZone)}
                  disabled={!activeDecal}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-2 text-xs text-bone/55 transition-colors hover:text-danger disabled:opacity-40"
                >
                  <ArrowCounterClockwise aria-hidden="true" size={14} />
                  {lang === "ar" ? "إزالة من هذه الجهة" : "Clear this zone"}
                </button>
              </div>
              <label className="mt-4 block">
                <span className="flex items-center justify-between gap-3 text-sm text-bone/75">
                  <span>{lang === "ar" ? "حجم التصميم" : "Design size"}</span>
                  <span className="text-xs text-sand/80">
                    {activeDecal ? `${Math.round((activeDecal.scale / 1.7) * 100)}%` : "—"}
                  </span>
                </span>
                <input
                  type="range"
                  min={0.12}
                  max={0.6}
                  step={0.01}
                  value={activeDecal?.scale ?? DEFAULT_SCALE}
                  disabled={!activeDecal}
                  onChange={(event) => setDecalTransform(activeZone, { scale: Number(event.target.value) })}
                  className="mt-2 w-full accent-sand disabled:opacity-40"
                />
              </label>
              <label className="mt-4 block">
                <span className="flex items-center justify-between gap-3 text-sm text-bone/75">
                  <span>{lang === "ar" ? "دوران التصميم" : "Design rotation"}</span>
                  <span className="text-xs text-sand/80">{activeDecal ? `${activeDecal.spin}°` : "—"}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={activeDecal?.spin ?? 0}
                  disabled={!activeDecal}
                  onChange={(event) => setDecalTransform(activeZone, { spin: Number(event.target.value) })}
                  className="mt-2 w-full accent-sand disabled:opacity-40"
                />
              </label>
              {!activeDecal && hasDesigns ? (
                <p className="mt-2 text-xs leading-relaxed text-bone/45">
                  {lang === "ar"
                    ? "لا يوجد تصميم مثبت في هذه الجهة — اضغط على القميص لوضعه."
                    : "No design placed in this zone yet — click the shirt to place it."}
                </p>
              ) : null}
            </section>

            <section className="border-t border-bone/10 pt-5 space-y-3">
              <button
                type="button"
                onClick={handleExportSheet}
                disabled={!hasDecals || isExporting}
                className={cn(buttonClass("primary"), "w-full")}
              >
                <DownloadSimple aria-hidden="true" size={18} />
                {lang === "ar" ? "تنزيل ورقة كل الجهات" : "Download all-faces sheet"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!hasDecals || isExporting}
                className={cn(buttonClass("secondary"), "w-full")}
              >
                <DownloadSimple aria-hidden="true" size={18} />
                {lang === "ar" ? "تنزيل المنظر الحالي" : "Download current view"}
              </button>
              {isExporting ? (
                <p className="text-center text-xs text-bone/50">
                  {lang === "ar" ? "جارٍ التجهيز…" : "Preparing…"}
                </p>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
