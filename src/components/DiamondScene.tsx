/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float, Text, PerspectiveCamera, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

function Particles({ currentScene }: { currentScene: number }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 1200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (THREE.MathUtils.randFloatSpread(150));
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#1a5490"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.35}
      />
    </Points>
  );
}

function ChurchEntrance({ currentScene, onEnter, onInvest }: { currentScene: number, onEnter: () => void, onInvest: () => void }) {
  const groupRef = useRef<THREE.Group>(null!);
  const leftDoorRef = useRef<THREE.Group>(null!);
  const rightDoorRef = useRef<THREE.Group>(null!);
  const [hoveredLeft, setHoveredLeft] = useState(false);
  const [hoveredRight, setHoveredRight] = useState(false);
  const [clicked, setClicked] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    if (currentScene === 9) {
      gsap.to(groupRef.current.position, { z: 40, duration: 4, ease: "power2.out" });
      gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 3 });
    } else {
      gsap.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 1 });
      gsap.to(groupRef.current.position, { z: 120, duration: 2 });
    }
  }, [currentScene]);

  useFrame((state, delta) => {
    // Hover animation for left door
    if (leftDoorRef.current && !clicked) {
      const targetRot = hoveredLeft ? -Math.PI / 6 : 0;
      leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(leftDoorRef.current.rotation.y, targetRot, 0.1);
    }
    // Hover animation for right door
    if (rightDoorRef.current && !clicked) {
      const targetRot = hoveredRight ? Math.PI / 6 : 0;
      rightDoorRef.current.rotation.y = THREE.MathUtils.lerp(rightDoorRef.current.rotation.y, targetRot, 0.1);
    }

    if (clicked) {
      const door = clicked === 'left' ? leftDoorRef.current : rightDoorRef.current;
      const targetRot = clicked === 'left' ? -Math.PI / 1.5 : Math.PI / 1.5;
      if (door) {
        door.rotation.y = THREE.MathUtils.lerp(door.rotation.y, targetRot, 0.05);
      }
      // Zoom effect
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 150, 0.04);
    }
  });

  const handleClick = (side: 'left' | 'right') => {
    setClicked(side);
    // Delay the action to allow for the zoom animation
    setTimeout(() => {
      if (side === 'left') onEnter();
      else onInvest();
    }, 1000);
  };

  return (
    <group ref={groupRef} position={[0, -5, 120]} scale={[0, 0, 0]}>
      {/* Ground Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[100, 200]} />
        <MeshReflectorMaterial
          mirror={1}
          blur={[300, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={30}
          roughness={0.8}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#111111"
          metalness={0.8}
        />
      </mesh>

      {/* Stylized Church Facade */}
      <group position={[0, -5, -20]}>
        {/* Light Shaft out of the church */}
        <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[15, 60, 100, 32, 1, true]} />
          <meshBasicMaterial color="#1a5490" transparent opacity={0.08} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Main Body */}
        <mesh position={[0, 15, 0]}>
          <boxGeometry args={[70, 50, 5]} />
          <meshStandardMaterial color="#e8eef7" roughness={0.6} metalness={0.2} emissive="#1a5490" emissiveIntensity={0.03} />
        </mesh>
        {/* Tower */}
        <mesh position={[0, 55, 0]}>
          <boxGeometry args={[15, 40, 5]} />
          <meshStandardMaterial color="#dde6f0" roughness={0.6} emissive="#1a5490" emissiveIntensity={0.02} />
        </mesh>
        <mesh position={[0, 80, 0]}>
          <coneGeometry args={[10, 20, 4]} />
          <meshStandardMaterial color="#1a5490" metalness={1} roughness={0.2} emissive="#1a5490" emissiveIntensity={0.5} />
        </mesh>

        {/* Interior Glow */}
        <pointLight position={[0, 0, -5]} intensity={20} color="#f5d27a" distance={150} />
        <spotLight position={[0, 60, -15]} intensity={15} color="#ffffff" angle={1} penumbra={1} />
        <group position={[-15, -10, 3]}>
          <mesh>
            <planeGeometry args={[12, 22]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <group
            ref={leftDoorRef}
            position={[6, 0, 0.1]}
            onPointerOver={() => setHoveredLeft(true)}
            onPointerOut={() => setHoveredLeft(false)}
            onClick={() => handleClick('left')}
          >
            <mesh position={[-6, 0, 0]}>
              <boxGeometry args={[12, 22, 1]} />
              <meshStandardMaterial color="#dde6f0" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Text Label */}
            <Suspense fallback={null}>
              <Text
                position={[-6, 0, 1]}
                fontSize={1.2}
                color="#ffffff"
                maxWidth={8}
                textAlign="center"
                onPointerOver={(e) => e.stopPropagation()}
              >
                NOT NOW
              </Text>
            </Suspense>
          </group>
        </group>

        <group position={[15, -10, 3]}>
          <mesh>
            <planeGeometry args={[12, 22]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <group
            ref={rightDoorRef}
            position={[-6, 0, 0.1]}
            onPointerOver={() => setHoveredRight(true)}
            onPointerOut={() => setHoveredRight(false)}
            onClick={() => handleClick('right')}
          >
            <mesh position={[6, 0, 0]}>
              <boxGeometry args={[12, 22, 1]} />
              <meshStandardMaterial color="#1a5490" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Text Label */}
            <Suspense fallback={null}>
              <Text
                position={[6, 0, 1]}
                fontSize={1.2}
                color="#000000"
                maxWidth={8}
                textAlign="center"
                onPointerOver={(e) => e.stopPropagation()}
              >
                INVEST IN FAITH
              </Text>
            </Suspense>
          </group>
        </group>

        {/* Lights inside the church */}
        <pointLight position={[0, 0, -10]} intensity={5} color="#1a5490" distance={100} />
      </group>
    </group>
  );
}

function SceneContent({ currentScene, isStarted, onEnter, onInvest }: { currentScene: number, isStarted: boolean, onEnter: () => void, onInvest: () => void }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const { mouse } = useThree();

  const stations = useMemo(() => [
    { pos: [0, 0, 300], rot: [0, 0, 0] },
    { pos: [3, 1, 270], rot: [-0.1, -0.2, 0] },
    { pos: [-4, 0, 240], rot: [0, 0.3, 0] },
    { pos: [5, -1, 210], rot: [0.1, -0.3, 0] },
    { pos: [0, 2, 180], rot: [-0.15, 0, 0] },
    { pos: [-3, 0, 150], rot: [0, 0.2, 0] },
    { pos: [4, 1, 120], rot: [0.1, -0.3, 0] },
    { pos: [-4, -1, 90], rot: [-0.1, 0.2, 0] },
    { pos: [2, 2, 60], rot: [0.1, -0.1, 0] },
    { pos: [0, 1, 40], rot: [0, 0, 0] },
    { pos: [0, 0, 0], rot: [0, 0, 0] },
  ], []);

  const sceneData = useMemo(() => [
    { title: "HEKAN", scale: 2 },
    { title: "60th", scale: 2.5 },
    { title: "KADUNA", scale: 1.5 },
    { title: "AMOS KIRI", scale: 1.2 },
    { title: "SPEAKERS", scale: 1.2 },
    { title: "ONE IN CHRIST", scale: 1.5 },
    { title: "LEGACY", scale: 1.8 },
    { title: "HEALING", scale: 1.5 },
    { title: "LEARNING", scale: 1.5 },
    { title: "DECISION", scale: 2.5 },
    { title: "BEYOND", scale: 1.5 },
  ], []);

  useEffect(() => {
    if (!isStarted && currentScene === 0) return;
    const target = stations[currentScene] || stations[0];
    gsap.to(cameraRef.current.position, {
      x: target.pos[0] + (currentScene === 9 ? mouse.x * 2 : 0),
      y: target.pos[1] + (currentScene === 9 ? mouse.y * 1 : 0),
      z: target.pos[2],
      duration: 2.5,
      ease: "power2.inOut"
    });
    gsap.to(cameraRef.current.rotation, {
      x: target.rot[0],
      y: target.rot[1],
      z: target.rot[2],
      duration: 2.5,
      ease: "power2.inOut"
    });
  }, [currentScene, isStarted, stations, mouse]);

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 0, 350]} fov={50} />

      <group>
        <ChurchEntrance currentScene={currentScene} onEnter={onEnter} onInvest={onInvest} />

        {/* Road of Light */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.1, 150]}>
          <planeGeometry args={[4, 300]} />
          <meshBasicMaterial color="#1a5490" transparent opacity={0.1} />
        </mesh>

        {stations.map((s, i) => (
          <group key={i} position={[s.pos[0], s.pos[1], s.pos[2] - 15]}>
            <Suspense fallback={null}>
              <Text
                position={[0, 0, 0]}
                fontSize={sceneData[i]?.scale || 1}
                color="#1a5490"
                font="https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm4_Tg.woff2"
                anchorX="center"
                anchorY="middle"
                maxWidth={10}
              >
                {sceneData[i]?.title}
                <meshStandardMaterial color="#1a5490" emissive="#1a5490" emissiveIntensity={2} />
              </Text>
            </Suspense>
          </group>
        ))}
      </group>
    </>
  );
}

export default function DiamondScene({ currentScene, isStarted, onEnter, onInvest }: { currentScene: number, isStarted: boolean, onEnter: () => void, onInvest: () => void }) {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 350], fov: 50, far: 2000 }}
      >
        <color attach="background" args={["#f4f7fb"]} />
        <fog attach="fog" args={["#e8eef7", 10, 200]} />

        <ambientLight intensity={2.5} />
        <pointLight position={[100, 100, 100]} intensity={3} color="#ffffff" />
        <spotLight position={[0, 80, 80]} intensity={8} color="#1a5490" angle={0.6} penumbra={1} />

        <Particles currentScene={currentScene} />
        <SceneContent currentScene={currentScene} isStarted={isStarted} onEnter={onEnter} onInvest={onInvest} />
      </Canvas>
    </div>
  );
}
