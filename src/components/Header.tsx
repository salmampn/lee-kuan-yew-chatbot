import React from 'react';
import {
  Compass,
  FolderArchive,
  Sparkles,
  HelpCircle,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface HeaderProps {
  documentCount: number;
  chunkCount: number;
  evidenceMode: boolean;
  onToggleEvidenceMode: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenAbout: () => void;
  onClearSession: () => void;
  hasMessages: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  documentCount,
  chunkCount,
  evidenceMode,
  onToggleEvidenceMode,
  onOpenKnowledgeBase,
  onOpenAbout,
  onClearSession,
  hasMessages,
}) => {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 w-full border-b border-stone-200/90 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif tracking-tight truncate">
              What Would Lee Kuan Yew Do?
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block truncate">
              Educational RAG Platform &bull; Archival Speeches & Materials
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Evidence Mode Switch */}
          <button
            id="toggle-evidence-mode-btn"
            onClick={onToggleEvidenceMode}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
              evidenceMode
                ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-xs'
                : 'bg-stone-100/80 text-stone-700 hover:bg-stone-200/70 border-stone-200 dark:bg-stone-800/80 dark:text-stone-300 dark:border-stone-700'
            }`}
            title="Toggle Evidence Mode to inspect retrieved passages"
          >
            <Sparkles className={`w-3.5 h-3.5 ${evidenceMode ? 'text-amber-300 dark:text-amber-600' : 'text-stone-500'}`} />
            <span className="hidden md:inline">Evidence Mode:</span>
            <span className="text-[11px] uppercase tracking-wide">{evidenceMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Knowledge Base Button with active badge */}
          <button
            id="open-knowledge-base-btn"
            onClick={onOpenKnowledgeBase}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200/70 dark:hover:bg-stone-700/70 border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Manage uploaded sources and knowledge base"
          >
            <FolderArchive className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
            <span className="hidden sm:inline">Sources</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200">
              {documentCount}
            </span>
          </button>

          {/* About / Methodology Modal Button */}
          <button
            id="open-about-modal-btn"
            onClick={onOpenAbout}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="About RAG methodology, ethics, & limitations"
            aria-label="About"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Clear Session */}
          {hasMessages && (
            <button
              id="clear-session-btn"
              onClick={onClearSession}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200/70 dark:hover:bg-stone-700/70 border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Clear current session chat history"
              aria-label="Clear session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
