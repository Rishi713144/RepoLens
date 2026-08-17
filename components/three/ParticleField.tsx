"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  color?: string;
  size?: number;
  spread?: number;
  speed?: number;
}

export function ParticleField({
  count = 2000,
  color = "#c8b4a0",
  size = 0.015,
  spread = 50,
  speed = 0.3,
}: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const [positions, velocities, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;

      vel[i * 3] = (Math.random() - 0.5) * speed * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * speed * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * speed * 0.01;

      sz[i] = Math.random() * size + size * 0.5;
    }

    return [pos, vel, sz];
  }, [count, spread, speed, size]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      posArray[i3] += velocities[i3] + Math.sin(time * 0.2 + i * 0.01) * 0.002;
      posArray[i3 + 1] += velocities[i3 + 1] + Math.cos(time * 0.15 + i * 0.01) * 0.002;
      posArray[i3 + 2] += velocities[i3 + 2];

      if (Math.abs(posArray[i3]) > spread / 2) velocities[i3] *= -1;
      if (Math.abs(posArray[i3 + 1]) > spread / 2) velocities[i3 + 1] *= -1;
      if (Math.abs(posArray[i3 + 2]) > spread / 2) velocities[i3 + 2] *= -1;

      const dx = mouseRef.current.x * 10 - posArray[i3];
      const dy = mouseRef.current.y * 10 - posArray[i3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 8) {
        const force = (8 - dist) * 0.0003;
        posArray[i3] -= dx * force;
        posArray[i3 + 1] -= dy * force;
      }
    }

    posAttr.needsUpdate = true;
    meshRef.current.rotation.y = time * 0.02;
    meshRef.current.rotation.x = Math.sin(time * 0.01) * 0.1;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
