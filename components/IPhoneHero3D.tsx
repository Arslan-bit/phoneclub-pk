"use client";
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, MeshTransmissionMaterial, Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function IPhoneModel() {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* iPhone body */}
        <RoundedBox args={[1.1, 2.3, 0.12]} radius={0.12} smoothness={8}>
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.1}
          />
        </RoundedBox>

        {/* Screen */}
        <RoundedBox
          ref={screenRef}
          args={[0.95, 2.05, 0.01]}
          radius={0.08}
          smoothness={8}
          position={[0, 0, 0.065]}
        >
          <meshStandardMaterial
            color="#0a0a1a"
            metalness={0.1}
            roughness={0.0}
            emissive="#1a0a3a"
            emissiveIntensity={0.4}
          />
        </RoundedBox>

        {/* Screen glow overlay */}
        <RoundedBox
          args={[0.9, 1.95, 0.005]}
          radius={0.07}
          smoothness={8}
          position={[0, 0, 0.072]}
        >
          <MeshTransmissionMaterial
            backside={false}
            samples={4}
            thickness={0.1}
            roughness={0}
            transmissionSampler={false}
            transmission={0.95}
            ior={1.5}
            chromaticAberration={0.06}
            anisotropy={0.1}
            distortion={0.0}
            distortionScale={0.3}
            temporalDistortion={0.5}
            color="#c9a227"
          />
        </RoundedBox>

        {/* Dynamic Island */}
        <RoundedBox
          args={[0.28, 0.07, 0.02]}
          radius={0.035}
          smoothness={4}
          position={[0, 0.92, 0.075]}
        >
          <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.2} />
        </RoundedBox>

        {/* Side buttons */}
        <RoundedBox args={[0.025, 0.18, 0.04]} radius={0.01} position={[-0.565, 0.3, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.1} />
        </RoundedBox>
        <RoundedBox args={[0.025, 0.12, 0.04]} radius={0.01} position={[-0.565, 0.05, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.1} />
        </RoundedBox>
        <RoundedBox args={[0.025, 0.12, 0.04]} radius={0.01} position={[-0.565, -0.12, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.1} />
        </RoundedBox>
        <RoundedBox args={[0.025, 0.22, 0.04]} radius={0.01} position={[0.565, 0.1, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.1} />
        </RoundedBox>

        {/* Bottom USB-C port */}
        <RoundedBox args={[0.18, 0.04, 0.02]} radius={0.02} position={[0, -1.12, 0.06]}>
          <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.2} />
        </RoundedBox>

        {/* Camera bump */}
        <RoundedBox args={[0.42, 0.42, 0.05]} radius={0.08} position={[-0.2, 0.72, -0.085]}>
          <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        {/* Camera lenses */}
        {[[-0.26, 0.82], [-0.14, 0.82], [-0.26, 0.68]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, -0.1]}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 32]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

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
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#c9a227" />
        <pointLight position={[-5, -5, 3]} intensity={1} color="#4a00e0" />
        <pointLight position={[0, 5, -5]} intensity={1.5} color="#ffffff" />
        <Stars radius={80} depth={50} count={3000} factor={3} saturation={0} fade speed={1} />
        <Suspense fallback={null}>
          <IPhoneModel />
          <GoldRing radius={1.8} speed={0.3} />
          <GoldRing radius={2.3} speed={-0.2} />
          <GoldRing radius={2.8} speed={0.15} />
        </Suspense>
      </Canvas>
    </div>
  );
}
