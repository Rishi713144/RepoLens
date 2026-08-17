"use client";

import { FileNode } from "@/types";
import { Folder, File, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  nodes: FileNode[];
  onSelect: (node: FileNode) => void;
  selectedPath?: string;
}

const FileTreeNode = ({
  node,
  onSelect,
  selectedPath,
  depth = 0,
}: {
  node: FileNode;
  onSelect: (n: FileNode) => void;
  selectedPath?: string;
  depth?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.path === selectedPath;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
    onSelect(node);
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1.5 px-2 cursor-pointer transition-all text-sm select-none rounded-md mx-1",
          isSelected
            ? "bg-[#c8b4a0]/10 text-[#c8b4a0] font-medium"
            : "text-[#a3a3a3] hover:bg-white/5 hover:text-[#f8f7f5]"
        )}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={handleClick}
      >
        <span className="mr-1 w-4 h-4 flex items-center justify-center shrink-0">
          {hasChildren &&
            (isOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            ))}
        </span>

        {node.type === "dir" ? (
          <Folder
            className={cn(
              "h-4 w-4 mr-2",
              isOpen ? "text-[#c8b4a0] fill-[#c8b4a0]/10" : "text-[#6b5545]"
            )}
          />
        ) : (
          <File className="h-4 w-4 mr-2 text-[#555]" />
        )}

        <span className="truncate">{node.name}</span>
      </div>

      {isOpen && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function FileTree({ nodes, onSelect, selectedPath }: FileTreeProps) {
  return (
    <div className="w-full overflow-auto h-full space-y-0.5 p-2">
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          onSelect={onSelect}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  );
}
