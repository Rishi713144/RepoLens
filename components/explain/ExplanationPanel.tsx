"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ExplanationPanelProps {
  title: string;
  content: string;
  isLoading: boolean;
  onLevelChange: (level: "junior" | "mid" | "senior") => void;
  level: "junior" | "mid" | "senior";
}

export function ExplanationPanel({ title, content, isLoading, onLevelChange, level }: ExplanationPanelProps) {
  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-card">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex space-x-1 bg-background rounded-md border p-1">
          {(["junior", "mid", "senior"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLevelChange(l)}
              className={cn(
                "px-2 py-0.5 text-xs rounded capitalize transition-colors",
                level === l ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative min-h-0 custom-scrollbar">
        {content ? (
           <div className="prose prose-sm dark:prose-invert max-w-none font-sans pb-10 whitespace-pre-wrap">
            {content}
           </div>
        ) : (
          !isLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a file or folder to explain.
            </div>
          )
        )}
        
        {isLoading && (
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-background to-transparent flex justify-center">
             <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
