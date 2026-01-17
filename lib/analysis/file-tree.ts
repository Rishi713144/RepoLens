import { FileNode } from "@/types";

const IGNORED_PATHS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".DS_Store",
  ".vscode",
  ".idea",
  "yarn.lock",
  "package-lock.json",
  "pnpm-lock.yaml",
]);

export function buildFileTree(flatPaths: { path: string; mode: string; type: string; size?: number }[]): FileNode[] {
  const root: FileNode[] = [];
  const map = new Map<string, FileNode>();

  const filteredPaths = flatPaths.filter((p) => {
    const parts = p.path.split("/");
    return !parts.some((part) => IGNORED_PATHS.has(part));
  });

  for (const item of filteredPaths) {
    const parts = item.path.split("/");
    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let node = currentLevel.find((n) => n.name === part);

      if (!node) {
        const isFile = index === parts.length - 1 && item.type === "blob";
        node = {
            path: currentPath,
            name: part,
            type: isFile ? "file" : "dir",
            children: isFile ? undefined : [],
            size: item.size
        };
        currentLevel.push(node);
      }

      if (node.type === "dir") {
        currentLevel = node.children!;
      }
    });
  }

  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "dir" ? -1 : 1;
    });
    nodes.forEach(n => {
      if (n.children) sortNodes(n.children);
    });
  };

  sortNodes(root);
  return root;
}
