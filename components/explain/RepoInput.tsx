"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";

interface RepoInputProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
  currentUrl?: string;
}

export function RepoInput({ onAnalyze, isLoading, currentUrl }: RepoInputProps) {
  const [url, setUrl] = useState(currentUrl || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
        <input
          type="text"
          placeholder="https://github.com/owner/repo"
          className="glass-input w-full h-10 rounded-xl pl-10 pr-4 text-sm text-[#f8f7f5] placeholder:text-[#555]"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "glass-button h-10 px-5 rounded-xl text-sm flex items-center gap-2",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze"
        )}
      </button>
    </form>
  );
}
