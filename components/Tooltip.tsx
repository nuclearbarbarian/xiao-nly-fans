"use client";

import { useState } from "react";

interface Citation {
  title: string;
  url: string;
}

interface TooltipProps {
  tweetId: string;
  tweetText: string;
}

export default function Tooltip({ tweetId, tweetText }: TooltipProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function fetchExplanation() {
    if (explanation) {
      setOpen(!open);
      return;
    }

    setOpen(true);
    setLoading(true);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweetText, tweetId }),
      });
      const data = await res.json();
      setExplanation(data.text || data.explanation || "No explanation available.");
      setCitations(data.citations || []);
    } catch {
      setExplanation("Failed to load explanation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={fetchExplanation}
        className="flex items-center gap-1.5 text-xs text-pink transition-colors hover:text-primary"
        aria-label="Explain this tweet"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        {open ? "Hide explanation" : "Explain this"}
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-white/10 bg-dark p-3 text-sm leading-relaxed text-white/80">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-gray">Generating explanation...</span>
            </div>
          ) : (
            <>
              <p>{explanation}</p>
              {citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-white/5 pt-2">
                  <span className="text-xs text-gray">Sources:</span>
                  {citations.map((cite, i) => (
                    <a
                      key={i}
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline decoration-primary/30 hover:decoration-primary"
                    >
                      {cite.title}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
