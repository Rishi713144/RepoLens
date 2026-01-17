"use client";

import { DependencyNode } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, { 
    Background, 
    Controls, 
    Node, 
    Edge, 
    useNodesState, 
    useEdgesState,
    MarkerType,
    NodeMouseHandler
} from "reactflow";
import "reactflow/dist/style.css";

interface DependencyGraphProps {
    dependencies: DependencyNode[];
    onSelect: (path: string) => void;
}

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const radius = Math.min(600, nodes.length * 30);
    const centerX = 400;
    const centerY = 300;
    
    nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI;
        node.position = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };
    });

    return { nodes, edges };
};

export function DependencyGraph({ dependencies, onSelect }: DependencyGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (!dependencies.length) return;

        const newNodes: Node[] = dependencies.map((dep) => ({
            id: dep.id,
            data: { label: dep.path.split("/").pop() },
            position: { x: 0, y: 0 },
            style: { width: 150, fontSize: 12 },
            type: 'default'
        }));

        const newEdges: Edge[] = [];
        const depIdSet = new Set(dependencies.map(d => d.id));

        dependencies.forEach((dep) => {
            dep.imports.forEach((imp) => {
                let targetId = null;
                
                if (depIdSet.has(imp)) {
                    targetId = imp;
                } 
                else {
                    const candidates = [
                        imp + ".ts",
                        imp + ".tsx",
                        imp + ".js",
                        imp + ".jsx",
                        imp + "/index.ts",
                        imp + "/index.tsx"
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
                    newEdges.push({
                        id: `${dep.id}-${targetId}`,
                        source: dep.id,
                        target: targetId,
                        markerEnd: { type: MarkerType.ArrowClosed },
                        animated: true,
                        style: { stroke: '#b1b1b7' }
                    });
                }
            });
        });

        const layouted = getLayoutedElements(newNodes, newEdges);
        setNodes(layouted.nodes);
        setEdges(layouted.edges);

    }, [dependencies, setNodes, setEdges]);

    const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
        onSelect(node.id);
    }, [onSelect]);

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-xl border overflow-hidden">
             <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
             >
                <Background />
                <Controls />
             </ReactFlow>
        </div>
    );
}
