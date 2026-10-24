import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/shirt_baked.glb";
const LOGO_URL = "/brand/logo.png";
const SHIRT_HEIGHT = 1.7;
const SURFACE_OFFSET = 0.01;
const TEE_TINT = "#111111";
const LOGO_WIDTH = 0.46;
const LOGO_ASPECT = 233 / 780;

function frameFromNormal(normal: THREE.Vector3): THREE.Quaternion {
  const z = normal.clone().normalize();
  const upRef = Math.abs(z.y) > 0.985 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
  const x = new THREE.Vector3().crossVectors(upRef, z).normalize();
  const y = new THREE.Vector3().crossVectors(z, x).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

function TeeModel() {
  const { scene } = useGLTF(MODEL_URL);
  const [logoReady, setLogoReady] = useState(0);

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

    const position = geometry.getAttribute("position");
    const normalAttr = geometry.getAttribute("normal");
    let bestScore = -Infinity;
    let anchor = new THREE.Vector3(0, 0.24, 0.42);
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      if (y < 0.05 || y > 0.55) continue;
      if (Math.abs(x) > 0.35) continue;
      if (normalAttr && normalAttr.getZ(i) < 0.6) continue;
      const score = z - Math.abs(x) * 0.6;
      if (score > bestScore) {
        bestScore = score;
        anchor = new THREE.Vector3(x, y, z);
      }
    }

    const standard = source.material as THREE.MeshStandardMaterial;
    return { geometry, map: standard.map ?? null, anchor };
  }, [scene]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: rig?.map ?? null,
      roughness: 0.92,
      metalness: 0.02,
      color: new THREE.Color(TEE_TINT),
    });
  }, [rig]);

  const logoTexture = useMemo(() => {
    const image = new Image();
    const texture = new THREE.Texture(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    image.onload = () => {
      texture.needsUpdate = true;
      setLogoReady((value) => value + 1);
    };
    image.src = LOGO_URL;
    return texture;
  }, []);

  useEffect(() => () => material.dispose(), [material]);

  if (!rig) return null;

  const orientation = frameFromNormal(new THREE.Vector3(0, 0, 1));
  const shift = rig.anchor.clone().add(new THREE.Vector3(0, 0, SURFACE_OFFSET));
  const scale: [number, number, number] = [LOGO_WIDTH, LOGO_WIDTH * LOGO_ASPECT, 1];

  return (
    <mesh geometry={rig.geometry} material={material}>
      <mesh
        position={shift}
        quaternion={orientation}
        scale={scale}
        visible={logoReady > 0}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          map={logoTexture}
          transparent
          polygonOffset
          polygonOffsetFactor={-8}
          depthWrite={false}
        />
      </mesh>
    </mesh>
  );
}

export function TeePreview3D() {
  return (
    <Canvas camera={{ position: [0, 0.45, 3.9], fov: 32 }}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[2.6, 3.2, 2.4]} intensity={1.7} />
      <directionalLight position={[-2.6, 1.6, -2.2]} intensity={0.7} />
      <directionalLight position={[0, 1.8, -3.2]} intensity={0.5} />
      <TeeModel />
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
        autoRotate
        autoRotateSpeed={-0.9}
        minDistance={2.1}
        maxDistance={5}
        minPolarAngle={0.9}
        maxPolarAngle={2}
        target={[0, 0.02, 0]}
      />
    </Canvas>
  );
}
