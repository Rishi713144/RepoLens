"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CodeOrbProps {
  nodeCount?: number;
  radius?: number;
}

function OrbNode({ position, delay }: { position: [number, number, number]; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime + delay;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.3;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.5) * 0.2;
    const scale = 1 + Math.sin(t * 1.2) * 0.3;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.08, 1]} />
      <meshStandardMaterial
        color="#c8b4a0"
        emissive="#c8b4a0"
        emissiveIntensity={0.5}
        wireframe
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function OrbEdge({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([...start, ...end]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const mat = new THREE.LineBasicMaterial({ color: "#c8b4a0", transparent: true, opacity: 0.15 });
    return new THREE.Line(geo, mat);
  }, [start, end]);

  return <primitive object={lineObj} />;
}

export function CodeOrb({ nodeCount = 30, radius = 2.5 }: CodeOrbProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { nodes, edges } = useMemo(() => {
    const n: { pos: [number, number, number]; delay: number }[] = [];
    const e: { start: [number, number, number]; end: [number, number, number] }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = radius * (0.6 + Math.random() * 0.4);
      const pos: [number, number, number] = [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ];
      n.push({ pos, delay: Math.random() * 10 });
    }

    for (let i = 0; i < nodeCount; i++) {
      const connections = 1 + Math.floor(Math.random() * 3);
      for (let c = 0; c < connections; c++) {
        const j = Math.floor(Math.random() * nodeCount);
        if (i !== j) {
          e.push({ start: n[i].pos, end: n[j].pos });
        }
      }
    }

    return { nodes: n, edges: e };
  }, [nodeCount, radius]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[radius * 0.45, 2]} />
        <meshStandardMaterial
          color="#1a1d18"
          emissive="#c8b4a0"
          emissiveIntensity={0.05}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {edges.map((edge, i) => (
        <OrbEdge key={`e-${i}`} start={edge.start} end={edge.end} />
      ))}

      {nodes.map((node, i) => (
        <OrbNode key={`n-${i}`} position={node.pos} delay={node.delay} />
      ))}

      <mesh>
        <icosahedronGeometry args={[radius * 1.2, 1]} />
        <meshStandardMaterial
          color="#c8b4a0"
          wireframe
          transparent
          opacity={0.04}
        />
      </mesh>
    </group>
  );
}
