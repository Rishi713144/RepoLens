"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Billboard, Line } from "@react-three/drei";
import type { Line2 } from "three/examples/jsm/lines/Line2.js";
import type { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import * as THREE from "three";
import { DependencyNode } from "@/types";

interface ForceGraph3DProps {
  dependencies: DependencyNode[];
  onSelect: (path: string) => void;
}

interface GraphNode {
  id: string;
  label: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
}

interface GraphEdge {
  source: string;
  target: string;
}

function GraphNodeMesh({
  node,
  isHovered,
  isSelected,
  onPointerEnter,
  onPointerLeave,
  onClick,
}: {
  node: GraphNode;
  isHovered: boolean;
  isSelected: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.lerp(node.position, 0.1);
    const t = state.clock.elapsedTime;
    const s = isHovered ? 1.4 : isSelected ? 1.2 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.15);
    meshRef.current.position.y += Math.sin(t * 0.8 + node.position.x) * 0.02;
  });

  const color = isSelected ? "#60a5fa" : isHovered ? "#c8b4a0" : "#8b8b8b";
  const emissiveIntensity = isSelected ? 0.8 : isHovered ? 0.5 : 0.2;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={node.position}
        onPointerEnter={(e) => { e.stopPropagation(); onPointerEnter(); }}
        onPointerLeave={(e) => { e.stopPropagation(); onPointerLeave(); }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          wireframe={!isSelected}
          transparent
          opacity={isSelected ? 0.9 : 0.7}
        />
      </mesh>
      {(isHovered || isSelected) && (
        <Billboard position={[node.position.x, node.position.y + 0.6, node.position.z]}>
          <Text
            fontSize={0.18}
            color="#f8f7f5"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="#000000"
            maxWidth={3}
          >
            {node.label}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function EdgeLine({
  source,
  target,
  color,
  opacity,
}: {
  source: GraphNode;
  target: GraphNode;
  color: string;
  opacity: number;
}) {
  const lineRef = useRef<Line2>(null);

  useFrame(() => {
    if (!lineRef.current) return;
    const geo = lineRef.current.geometry as LineGeometry;
    geo.setPositions([
      source.position.x, source.position.y, source.position.z,
      target.position.x, target.position.y, target.position.z,
    ]);
  });

  return (
    <Line
      ref={lineRef}
      points={[
        [source.position.x, source.position.y, source.position.z],
        [target.position.x, target.position.y, target.position.z],
      ]}
      color={color}
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
}

export function ForceGraph3D({ dependencies, onSelect }: ForceGraph3DProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);

  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!dependencies.length) return;

    const depIdSet = new Set(dependencies.map((d) => d.id));

    if (!initializedRef.current) {
      const radius = Math.max(3, Math.sqrt(dependencies.length) * 1.5);
      nodesRef.current = dependencies.map((dep, index) => {
        const angle = (index / dependencies.length) * Math.PI * 2;
        const layer = Math.floor(index / 8);
        const r = radius * (0.5 + layer * 0.3);
        const y = (Math.random() - 0.5) * 4;
        return {
          id: dep.id,
          label: dep.path.split("/").pop() || dep.id,
          position: new THREE.Vector3(
            r * Math.cos(angle),
            y,
            r * Math.sin(angle)
          ),
          velocity: new THREE.Vector3(),
          targetPosition: new THREE.Vector3(
            r * Math.cos(angle),
            y,
            r * Math.sin(angle)
          ),
        };
      });
      initializedRef.current = true;
    } else {
      const existingIds = new Set(nodesRef.current.map((n) => n.id));
      dependencies.forEach((dep) => {
        if (!existingIds.has(dep.id)) {
          const angle = Math.random() * Math.PI * 2;
          const r = 5 + Math.random() * 3;
          nodesRef.current.push({
            id: dep.id,
            label: dep.path.split("/").pop() || dep.id,
            position: new THREE.Vector3(
              r * Math.cos(angle),
              (Math.random() - 0.5) * 4,
              r * Math.sin(angle)
            ),
            velocity: new THREE.Vector3(),
            targetPosition: new THREE.Vector3(),
          });
        }
      });
    }

    const newEdges: GraphEdge[] = [];
    dependencies.forEach((dep) => {
      dep.imports.forEach((imp) => {
        let targetId: string | null = null;

        if (depIdSet.has(imp)) {
          targetId = imp;
        } else {
          const candidates = [
            imp + ".ts",
            imp + ".tsx",
            imp + ".js",
            imp + ".jsx",
            imp + "/index.ts",
            imp + "/index.tsx",
          ];
          for (const cand of candidates) {
            if (depIdSet.has(cand)) {
              targetId = cand;
              break;
            }
          }
          if (!targetId && imp.startsWith(".")) {
            const name = imp.split("/").pop();
            if (name) {
              for (const id of Array.from(depIdSet)) {
                const idName = id.split("/").pop()?.split(".")[0];
                if (idName === name) {
                  targetId = id;
                  break;
                }
              }
            }
          }
        }

        if (targetId) {
          newEdges.push({ source: dep.id, target: targetId });
        }
      });
    });
    edgesRef.current = newEdges;
    forceUpdate((n) => n + 1);
  }, [dependencies]);

  useFrame(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    if (!nodes.length) return;

    const center = new THREE.Vector3();
    nodes.forEach((n) => center.add(n.position));
    center.divideScalar(nodes.length);

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      const toCenter = new THREE.Vector3().subVectors(center, node.position);
      node.velocity.add(toCenter.multiplyScalar(0.001));

      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const diff = new THREE.Vector3().subVectors(node.position, nodes[j].position);
        const dist = diff.length();
        if (dist < 0.01) continue;
        if (dist < 2) {
          node.velocity.add(diff.normalize().multiplyScalar(0.005 / dist));
        }
      }

      node.velocity.multiplyScalar(0.95);
      node.position.add(node.velocity);
    }

    for (const edge of edges) {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (source && target) {
        const diff = new THREE.Vector3().subVectors(target.position, source.position);
        const dist = diff.length();
        const idealDist = 2.5;
        const force = diff.normalize().multiplyScalar((dist - idealDist) * 0.003);
        source.velocity.add(force);
        target.velocity.sub(force);
      }
    }
  });

  const handleNodeClick = useCallback(
    (path: string) => {
      setSelectedNode(path);
      onSelect(path);
    },
    [onSelect]
  );

  return (
    <group>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={3}
        maxDistance={30}
      />

      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -5, -10]} intensity={0.4} color="#60a5fa" />

      {edgesRef.current.map((edge) => {
        const source = nodesRef.current.find((n) => n.id === edge.source);
        const target = nodesRef.current.find((n) => n.id === edge.target);
        if (!source || !target) return null;
        const isSel = edge.source === selectedNode || edge.target === selectedNode;
        return (
          <EdgeLine
            key={`${edge.source}-${edge.target}`}
            source={source}
            target={target}
            color={isSel ? "#60a5fa" : "#555555"}
            opacity={isSel ? 0.8 : 0.3}
          />
        );
      })}

      {nodesRef.current.map((node) => (
        <GraphNodeMesh
          key={node.id}
          node={node}
          isHovered={hoveredNode === node.id}
          isSelected={selectedNode === node.id}
          onPointerEnter={() => setHoveredNode(node.id)}
          onPointerLeave={() => setHoveredNode(null)}
          onClick={() => handleNodeClick(node.id)}
        />
      ))}
    </group>
  );
}
