"use client";

import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { RepoInput } from "@/components/explain/RepoInput";
import { FileTree } from "@/components/explain/FileTree";
import { DependencyGraph } from "@/components/graph/DependencyGraph";
import { ExplanationPanel } from "@/components/explain/ExplanationPanel";
import { ParticleField } from "@/components/three/ParticleField";
import { RepoAnalysisResult, FileNode } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  FolderOpen,
  Share2,
  History,
  Code,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<RepoAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [userLevel, setUserLevel] = useState<"junior" | "mid" | "senior">("mid");
  const [currentRepoUrl, setCurrentRepoUrl] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showFileTree, setShowFileTree] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("repo_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setSelectedFile(null);
    setExplanation("");
    setCurrentRepoUrl(url);

    const updatedHistory = [url, ...history.filter((h) => h !== url)].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem("repo_history", JSON.stringify(updatedHistory));

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to analyze repo");
      }

      const data: RepoAnalysisResult = await res.json();
      setAnalysis(data);

      triggerExplanation("architecture", {
        tree: data.fileTree,
        techStack: data.techStack,
        readme: data.readmeContent,
        packageJson: data.packageJsonContent,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerExplanation = async (
    type: "architecture" | "file" | "folder",
    context: any,
    levelOverride?: "junior" | "mid" | "senior"
  ) => {
    setIsExplaining(true);
    setExplanation("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, context, level: levelOverride || userLevel }),
      });

      if (!response.ok || !response.body)
        throw new Error("Failed to get explanation");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setExplanation((prev) => prev + text);
      }
    } catch {
      setExplanation("Failed to generate explanation.");
    } finally {
      setIsExplaining(false);
    }
  };

  const fetchFileAndExplain = async (
    node: FileNode,
    levelOverride?: "junior" | "mid" | "senior"
  ) => {
    setSelectedFile(node);
    if (node.type === "dir") {
      triggerExplanation(
        "folder",
        { path: node.path, children: node.children || [] },
        levelOverride
      );
      return;
    }

    setIsExplaining(true);
    try {
      const res = await fetch("/api/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: currentRepoUrl, path: node.path }),
      });

      let content = "(Failed to load content)";
      if (res.ok) {
        const data = await res.json();
        content = data.content;
      }

      const relatedNode = analysis?.dependencyGraph.find(
        (n) => n.id === node.path
      );
      triggerExplanation(
        "file",
        { path: node.path, content, imports: relatedNode?.imports || [] },
        levelOverride
      );
    } catch {
      triggerExplanation(
        "file",
        { path: node.path, content: "(Fetch failed)", imports: [] },
        levelOverride
      );
    }
  };

  const handleLevelChange = (level: "junior" | "mid" | "senior") => {
    setUserLevel(level);
    if (!analysis) return;

    if (selectedFile) {
      fetchFileAndExplain(selectedFile, level);
    } else {
      triggerExplanation("architecture", {
        tree: analysis.fileTree,
        techStack: analysis.techStack,
        readme: analysis.readmeContent,
        packageJson: analysis.packageJsonContent,
      }, level);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-[#f8f7f5]">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.1} />
            <ParticleField
              count={analysis ? 1000 : 1500}
              spread={40}
              speed={0.15}
              color={analysis ? "#c8b4a0" : "#60a5fa"}
              size={0.01}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Header */}
      <header className="relative z-20 glass-panel-light px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#c8b4a0] p-1.5 rounded-lg">
            <Code className="w-5 h-5 text-black" />
          </div>
          <h1 className="font-bold tracking-tight text-lg">
            RepoLens <span className="text-[#a3a3a3] font-normal">AI</span>
          </h1>
        </div>

        <div className="flex-1 max-w-2xl px-8">
          <RepoInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        <div className="flex items-center gap-3">
          <div className="level-toggle">
            {(["junior", "mid", "senior"] as const).map((l) => (
              <button
                key={l}
                onClick={() => handleLevelChange(l)}
                className={userLevel === l ? "active" : ""}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-4">
        <AnimatePresence mode="wait">
          {!analysis && !isLoading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-[calc(100vh-5rem)] flex flex-col items-center justify-center space-y-6 text-center"
            >
              <div className="p-5 glass-panel rounded-2xl">
                <Sparkles className="w-12 h-12 text-[#c8b4a0] animate-pulse" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Understand any codebase in{" "}
                  <span className="text-gradient">seconds</span>.
                </h2>
                <p className="text-[#a3a3a3] max-w-md mx-auto">
                  Paste a GitHub URL above to generate architecture insights,
                  3D dependency maps, and AI-powered explanations.
                </p>
              </div>

              {history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#555] uppercase tracking-widest">
                    <History className="w-3 h-3" /> Recent Projects
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {history.map((url) => (
                      <button
                        key={url}
                        onClick={() => handleAnalyze(url)}
                        className="text-xs px-4 py-2 rounded-full glass-panel-light hover:bg-[#c8b4a0]/10 hover:border-[#c8b4a0]/20 transition-all text-[#a3a3a3] hover:text-[#f8f7f5]"
                      >
                        {url.split("/").slice(-2).join("/")}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[calc(100vh-5rem)] flex flex-col items-center justify-center space-y-5"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-[#c8b4a0]/20 border-t-[#c8b4a0] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Code className="w-6 h-6 text-[#c8b4a0]" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-[#f8f7f5]">
                  Cloning and indexing repository...
                </p>
                <p className="text-xs text-[#555]">
                  Building file tree & dependency graph
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 h-[calc(100vh-5rem)]"
            >
              {/* File Explorer */}
              <AnimatePresence>
                {showFileTree && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 260, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0 flex flex-col glass-panel rounded-2xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#a3a3a3]">
                        <FolderOpen className="w-3.5 h-3.5" /> Explorer
                      </span>
                      <button
                        onClick={() => setShowFileTree(false)}
                        className="p-1 rounded-md hover:bg-white/5 transition-colors text-[#555] hover:text-[#a3a3a3]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <FileTree
                        nodes={analysis!.fileTree}
                        onSelect={fetchFileAndExplain}
                        selectedPath={selectedFile?.path}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dependency Graph */}
              <div className="flex-1 flex flex-col glass-panel rounded-2xl relative overflow-hidden">
                {!showFileTree && (
                  <button
                    onClick={() => setShowFileTree(true)}
                    className="absolute top-3 left-3 z-10 p-2 glass-panel-light rounded-lg hover:bg-white/5 transition-colors text-[#a3a3a3] hover:text-[#f8f7f5]"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                )}
                <div className="absolute top-3 left-14 z-10 pointer-events-none">
                  <Badge
                    variant="secondary"
                    className="bg-black/40 backdrop-blur-sm border-white/5 text-[#a3a3a3]"
                  >
                    <Share2 className="w-3 h-3 mr-1.5 text-blue-400" />
                    Dependency Graph
                  </Badge>
                </div>
                <div className="flex-1 w-full relative">
                  <DependencyGraph
                    dependencies={analysis!.dependencyGraph}
                    onSelect={(path) =>
                      fetchFileAndExplain({
                        path,
                        name: path.split("/").pop()!,
                        type: "file",
                      })
                    }
                  />
                </div>
              </div>

              {/* AI Explanation Panel */}
              <div className="w-96 shrink-0 flex flex-col gap-4 overflow-hidden">
                <ExplanationPanel
                  title={selectedFile ? selectedFile.name : "System Overview"}
                  content={explanation}
                  isLoading={isExplaining}
                  onLevelChange={handleLevelChange}
                  level={userLevel}
                />

                {error && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    className="p-3 rounded-xl glass-panel border-red-500/20 text-red-400 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
