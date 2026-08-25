import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Quote, ExternalLink, Sparkles } from 'lucide-react';
import { RetrievedSource } from '../types';

interface SourcesUsedListProps {
  sources: RetrievedSource[];
  onOpenEvidence?: () => void;
}

export const SourcesUsedList: React.FC<SourcesUsedListProps> = ({
  sources,
  onOpenEvidence,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!sources || sources.length === 0) return null;

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div
      id="sources-used-container"
      className="mt-4 pt-3.5 border-t border-stone-200/80 dark:border-stone-800/80 text-xs text-stone-700 dark:text-stone-300"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
          <FileText className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
          <span>Sources used ({sources.length})</span>
        </div>
        {onOpenEvidence && (
          <button
            id="view-evidence-context-btn"
            onClick={onOpenEvidence}
            className="text-[11px] font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            Inspect Evidence Context
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {sources.map((src, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={`${src.chunkId}_${idx}`}
              className="rounded-lg border border-stone-200 dark:border-stone-800/80 bg-stone-50/60 dark:bg-stone-950/40 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleExpand(idx)}
                className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-stone-100/50 dark:hover:bg-stone-900/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold shrink-0">
                    [{idx + 1}]
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 truncate text-xs">
                    {src.documentName}
                  </span>
                  {src.pageOrSection && (
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 shrink-0 font-normal">
                      &bull; {src.pageOrSection}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {src.relevanceScore > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700/50">
                      Score: {Math.round(src.relevanceScore * 100)}%
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3.5 pb-3 pt-1 text-xs border-t border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-900/30 space-y-1.5">
                  <p className="text-[11px] font-medium text-stone-800 dark:text-stone-200">
                    Title: {src.documentTitle}
                  </p>
                  <div className="p-2.5 rounded bg-stone-100/70 dark:bg-stone-950/60 border border-stone-200/60 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-serif italic text-xs leading-relaxed flex gap-2">
                    <Quote className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <div>{src.excerpt}</div>
                  </div>
                  {src.matchedKeywords && src.matchedKeywords.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 pt-0.5">
                      <span>Matched terms:</span>
                      <div className="flex flex-wrap gap-1">
                        {src.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-1 py-0.2 rounded bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-[10px]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
