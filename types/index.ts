export type FileType = "file" | "dir";

export interface FileNode {
  path: string;
  name: string;
  type: FileType;
  children?: FileNode[];
  language?: string;
  size?: number;
}

export interface DependencyNode {
  id: string;
  path: string;
  imports: string[];
  importedBy: string[];
}

export interface TechStackConfig {
  frameworks: string[];
  languages: string[];
  tools: string[];
}

export interface RepoAnalysisResult {
  fileTree: FileNode[];
  dependencyGraph: DependencyNode[];
  techStack: TechStackConfig;
  summary?: string;
  readmeContent?: string;
  packageJsonContent?: string;
}

export interface ExplanationRequest {
  repoUrl: string;
  userLevel: "junior" | "mid" | "senior";
}

export interface AIExplanation {
  markdown: string;
}
