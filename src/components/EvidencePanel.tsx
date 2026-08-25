import React, { useState } from 'react';
import { X, Sparkles, FileText, Hash, CheckCircle, Database, Layers, Search } from 'lucide-react';
import { RetrievedSource } from '../types';

interface EvidencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: RetrievedSource[];
  question?: string;
  hasInsufficientEvidence?: boolean;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  isOpen,
  onClose,
  evidence,
  question,
  hasInsufficientEvidence,
}) => {
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const filteredEvidence = evidence.filter(
    (ev) =>
      ev.documentTitle.toLowerCase().includes(filterText.toLowerCase()) ||
      ev.documentName.toLowerCase().includes(filterText.toLowerCase()) ||
      ev.excerpt.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <aside
      id="evidence-inspector-panel"
      className="w-full lg:w-96 shrink-0 border-l border-stone-200 dark:border-stone-800 bg-stone-50/95 dark:bg-stone-900/95 flex flex-col h-full shadow-lg z-20 transition-all"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-stone-700 dark:text-stone-300" />
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Evidence Context Inspector
          </h3>
        </div>
        <button
          id="close-evidence-panel-btn"
          onClick={onClose}
          className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Query Banner */}
      {question && (
        <div className="px-5 py-3 bg-stone-100/60 dark:bg-stone-950/40 border-b border-stone-200 dark:border-stone-800 text-xs">
          <span className="font-semibold uppercase text-[10px] tracking-wider text-stone-500 block mb-0.5">
            Active Query:
          </span>
          <p className="text-stone-800 dark:text-stone-200 font-medium line-clamp-2">
            &ldquo;{question}&rdquo;
          </p>
        </div>
      )}

      {/* Filter / Search within retrieved context */}
      <div className="px-5 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Filter retrieved passages..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-7 pr-3 py-1 text-xs rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Evidence List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {hasInsufficientEvidence ? (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-semibold">Insufficient Knowledge Base Match</p>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
              No indexed source documents scored above the reliability threshold for this specific query. The model has output the mandatory standard fallback message.
            </p>
          </div>
        ) : filteredEvidence.length === 0 ? (
          <div className="text-center py-12 text-xs text-stone-400">
            {evidence.length === 0
              ? 'Ask a question or select an answer to inspect its retrieved evidence.'
              : 'No passages match your filter.'}
          </div>
        ) : (
          filteredEvidence.map((ev, idx) => (
            <div
              key={`${ev.chunkId}_${idx}`}
              className="p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/60 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold inline-block mb-1">
                    Passage #{idx + 1}
                  </span>
                  <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                    {ev.documentTitle}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-mono">
                    {ev.documentName} &bull; {ev.pageOrSection}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Match: {Math.round(ev.relevanceScore * 100)}%
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-stone-50 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
                {ev.excerpt}
              </div>

              {ev.matchedKeywords && ev.matchedKeywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 text-[10px] text-stone-500 pt-1">
                  <span className="text-stone-400">Tokens:</span>
                  {ev.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-1 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-[10px]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-[11px] text-stone-500 flex items-center justify-between">
        <span>RAG Context Pipeline</span>
        <span className="font-mono text-[10px]">{filteredEvidence.length} chunks analyzed</span>
      </div>
    </aside>
  );
};
