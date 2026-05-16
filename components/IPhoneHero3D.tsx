"use client";
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import Image from "next/image";

function GoldRing({ radius, speed }: { radius: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * speed;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshStandardMaterial
        color="#c9a227"
        metalness={1}
        roughness={0.1}
        emissive="#c9a227"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function IPhoneHero3D() {
  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas — rings + stars only */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#c9a227" />
        <pointLight position={[-5, -5, 3]} intensity={1} color="#4a00e0" />
        <Stars radius={80} depth={50} count={3000} factor={3} saturation={0} fade speed={1} />
        <Suspense fallback={null}>
          <GoldRing radius={1.8} speed={0.3} />
          <GoldRing radius={2.3} speed={-0.2} />
          <GoldRing radius={2.8} speed={0.15} />
        </Suspense>
      </Canvas>

      {/* Real iPhone image — centered over canvas */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="relative w-72 h-[520px] md:w-80 md:h-[580px] lg:w-96 lg:h-[640px] drop-shadow-2xl"
          style={{ animation: "iphone-rotate 8s ease-in-out infinite" }}
        >
          <Image
            src="/images/iphone.png"
            alt="iPhone"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <style>{`
        @keyframes iphone-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes iphone-rotate {
          0%, 100% { transform: translateY(0px) rotateY(0deg); }
          25% { transform: translateY(-9px) rotateY(8deg); }
          50% { transform: translateY(-18px) rotateY(0deg); }
          75% { transform: translateY(-9px) rotateY(-8deg); }
        }
      `}</style>
    </div>
  );
}
