"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LOGO_SRC = "/sviluppo-urbano-logo.png";

const DURATION_MS = 2200;
const FADE_MS = 350;
const FADE_START_MS = DURATION_MS - FADE_MS;

const CAMERA_START_Z = 14;
const CAMERA_END_Z = -32;
const LOGO_Z = -40;

const STAR_COUNT = 500;
const STREAK_COUNT = 220;

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

// Derivative of easeOutQuint, normalized to [0,1]: highest at t=0, zero at t=1.
function speedFactor(t: number) {
  return Math.pow(1 - t, 4);
}

function StarField() {
  const positions = useMemo(() => {
    const arr = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 34;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 34;
      arr[i * 3 + 2] = CAMERA_START_Z - Math.random() * (CAMERA_START_Z - LOGO_Z + 20);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

function Streaks({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(() => {
    const arr: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < STREAK_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 30,
        z: CAMERA_START_Z - Math.random() * (CAMERA_START_Z - LOGO_Z + 20),
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const speed = speedFactor(progressRef.current);
    const length = 0.08 + speed * 5.5;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      dummy.position.set(s.x, s.y, s.z);
      dummy.scale.set(0.025, 0.025, length);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STREAK_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#e8ecff" transparent opacity={0.7} depthWrite={false} />
    </instancedMesh>
  );
}

function Logo({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [aspect, setAspect] = useState(1);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(LOGO_SRC, (tex) => {
      if (cancelled) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      const img = tex.image as HTMLImageElement;
      if (img?.width && img?.height) setAspect(img.width / img.height);
      setTexture(tex);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const p = progressRef.current;
    const scale = THREE.MathUtils.lerp(0.6, 10, p);
    mesh.scale.set(scale * aspect, scale, 1);
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.opacity = THREE.MathUtils.lerp(0, 1, Math.min(p / 0.5, 1));
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, LOGO_Z]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0}
        emissive="#ffffff"
        emissiveMap={texture}
        emissiveIntensity={0.5}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Scene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  useFrame(({ camera }) => {
    camera.position.z = THREE.MathUtils.lerp(CAMERA_START_Z, CAMERA_END_Z, progressRef.current);
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 8]} intensity={1.4} />
      <StarField />
      <Streaks progressRef={progressRef} />
      <Logo progressRef={progressRef} />
    </>
  );
}

export default function LoginTransition3D({ onComplete }: { onComplete: () => void }) {
  const progressRef = useRef(0);
  const [opacity, setOpacity] = useState(1);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const linear = Math.min(elapsed / DURATION_MS, 1);
      progressRef.current = easeOutQuint(linear);

      if (elapsed >= FADE_START_MS) {
        const fadeT = Math.min((elapsed - FADE_START_MS) / FADE_MS, 1);
        setOpacity(1 - fadeT);
      }

      if (elapsed >= DURATION_MS) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [finish]);

  return (
    <div
      onClick={finish}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        opacity,
        cursor: "pointer",
      }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, CAMERA_START_Z], fov: 55, near: 0.1, far: 200 }}
      >
        <Scene progressRef={progressRef} />
      </Canvas>
    </div>
  );
}
