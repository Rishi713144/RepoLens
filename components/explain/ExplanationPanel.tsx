"use client";

import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ExplanationPanelProps {
  title: string;
  content: string;
  isLoading: boolean;
  onLevelChange: (level: "junior" | "mid" | "senior") => void;
  level: "junior" | "mid" | "senior";
}

export function ExplanationPanel({
  title,
  content,
  isLoading,
  onLevelChange,
  level,
}: ExplanationPanelProps) {
  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-semibold text-sm text-[#f8f7f5] truncate max-w-45">
          {title}
        </h3>
        <div className="level-toggle">
          {(["junior", "mid", "senior"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLevelChange(l)}
              className={level === l ? "active" : ""}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative min-h-0">
        {content ? (
          <ReactMarkdown className="prose prose-sm prose-invert max-w-none font-sans pb-10 prose-headings:text-[#f8f7f5] prose-p:text-[#a3a3a3] prose-code:text-[#c8b4a0] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/5">
            {content}
          </ReactMarkdown>
        ) : (
          !isLoading && (
            <div className="flex items-center justify-center h-full text-[#555] text-sm">
              Select a file or folder to explain.
            </div>
          )
        )}

        {isLoading && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-[#0a0a0a] to-transparent flex justify-center">
            <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
              <Loader2 className="w-4 h-4 animate-spin text-[#c8b4a0]" />
              <span>Analyzing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
