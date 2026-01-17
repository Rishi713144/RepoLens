"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RepoInput } from "@/components/explain/RepoInput";
import { FileTree } from "@/components/explain/FileTree";
import { DependencyGraph } from "@/components/graph/DependencyGraph";
import { ExplanationPanel } from "@/components/explain/ExplanationPanel";
import { RepoAnalysisResult, FileNode } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  FolderOpen, 
  Share2, 
  History, 
  LayoutDashboard, 
  Loader2,
  Sparkles
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

    const updatedHistory = [url, ...history.filter(h => h !== url)].slice(0, 5);
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
          packageJson: data.packageJsonContent
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
        
        if (!response.ok || !response.body) throw new Error("Failed to get explanation");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();  
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            setExplanation((prev) => prev + text);
        }
    } catch (err) {
        setExplanation("⚠️ Failed to generate explanation.");
    } finally {
        setIsExplaining(false);
    }
  };

  const fetchFileAndExplain = async (node: FileNode, levelOverride?: "junior" | "mid" | "senior") => {
      setSelectedFile(node);
      if (node.type === "dir") {
          triggerExplanation("folder", { path: node.path, children: node.children || [] }, levelOverride);
          return;
      }
      
      setIsExplaining(true);
      try {
          const res = await fetch("/api/file", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ repoUrl: currentRepoUrl, path: node.path })
          });
          
          let content = "(Failed to load content)";
          if (res.ok) {
              const data = await res.json();
              content = data.content;
          }

          const relatedNode = analysis?.dependencyGraph.find(n => n.id === node.path);
          triggerExplanation("file", { path: node.path, content, imports: relatedNode?.imports || [] }, levelOverride);
      } catch (e) {
          triggerExplanation("file", { path: node.path, content: "(Fetch failed)", imports: [] }, levelOverride);
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
          packageJson: analysis.packageJsonContent
        }, level);
      }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="border-b bg-card/50 backdrop-blur-md px-6 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-bold tracking-tight text-lg">RepoLens <span className="text-muted-foreground font-normal">AI</span></h1>
        </div>

        <div className="flex-1 max-w-2xl px-8">
          <RepoInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="capitalize px-3 py-1">
             Experience: <span className="text-primary ml-1 font-bold">{userLevel}</span>
          </Badge>
        </div>
      </header>

      <main className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {!analysis && !isLoading ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col items-center justify-center space-y-6 text-center"
            >
              <div className="p-4 bg-muted rounded-full">
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Understand any codebase in seconds.</h2>
                <p className="text-muted-foreground max-w-md">Paste a GitHub URL above to generate architecture insights, dependency maps, and AI-powered explanations.</p>
              </div>
              
              {history.length > 0 && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    <History className="w-3 h-3" /> Recent Projects
                  </div>
                  <div className="flex gap-2">
                    {history.map((url) => (
                      <button 
                        key={url} 
                        onClick={() => handleAnalyze(url)}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors border"
                      >
                        {url.split('/').slice(-2).join('/')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">Cloning and indexing repository...</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[calc(100vh-6rem)]"
            >
              {/* --- LEFT: FILE EXPLORER --- */}
              <Card className="w-full lg:w-64 shrink-0 flex flex-col shadow-xl border-border/40 overflow-hidden h-96 lg:h-full">
                <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                  <span className="text-xs font-bold uppercase tracking-tighter flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5" /> Explorer
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <FileTree 
                    nodes={analysis!.fileTree} 
                    onSelect={fetchFileAndExplain} 
                    selectedPath={selectedFile?.path}
                  />
                </div>
              </Card>

              {/* --- CENTER: VISUALIZATION --- */}
              <Card className="flex-1 flex flex-col shadow-xl border-border/40 relative overflow-hidden bg-dot-pattern min-h-[500px] h-[600px] lg:h-full">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur shadow-sm">
                    <Share2 className="w-3 h-3 mr-1.5 text-blue-500" /> 
                    Dependency Graph
                  </Badge>
                </div>
                <div className="flex-1 w-full relative">
                   <DependencyGraph 
                      dependencies={analysis!.dependencyGraph} 
                      onSelect={(path) => fetchFileAndExplain({ path, name: path.split('/').pop()!, type: 'file' })} 
                    />
                </div>
              </Card>

              {/* --- RIGHT: AI PANEL --- */}
              <div className="w-full lg:w-96 shrink-0 flex flex-col gap-4 overflow-hidden min-h-[500px] h-auto lg:h-full">
                <ExplanationPanel 
                  title={selectedFile ? selectedFile.name : "System Overview"}
                  content={explanation}
                  isLoading={isExplaining}
                  onLevelChange={handleLevelChange}
                  level={userLevel}
                />
                
                {error && (
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: 'auto' }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2"
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