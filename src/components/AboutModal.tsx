import React from 'react';
import { X, BookOpen, Layers, AlertTriangle, ShieldCheck, Database } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="about-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="about-modal-container"
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-stone-800 dark:text-stone-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              About This Educational RAG System
            </h2>
          </div>
          <button
            id="close-about-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm leading-relaxed">
          {/* Required Statement Box */}
          <div className="p-4 rounded-lg bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium">
            <p>
              This application uses retrieval-augmented generation (RAG): it searches uploaded source documents for relevant evidence before generating an answer. Limitations include incomplete coverage, retrieval errors, and possible model mistakes.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              Strict Ethical & Methodological Guardrails
            </h3>
            <ul className="space-y-2 text-stone-600 dark:text-stone-300 list-disc list-inside">
              <li>
                <strong className="text-stone-900 dark:text-stone-100">No Identity Mimicry:</strong> The system will never claim to be Lee Kuan Yew and speaks exclusively as an analytical educational engine.
              </li>
              <li>
                <strong className="text-stone-900 dark:text-stone-100">Grounded in Evidence:</strong> Statements regarding historical policies, beliefs, or governance philosophies are restricted to indexed passages. If no relevant evidence exists in the corpus, the model strictly reports insufficient evidence.
              </li>
              <li>
                <strong className="text-stone-900 dark:text-stone-100">Historical Lens for Modern Scenarios:</strong> When queried on contemporary events (e.g. AI governance, modern tech competition, modern geopolitics), answers are explicitly prefaced under a “Historical lens” heading as analytical inferences from historical principles rather than real statements.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              How the RAG Architecture Works
            </h3>
            <ol className="space-y-2 text-stone-600 dark:text-stone-300 list-decimal list-inside">
              <li>
                <span className="font-semibold text-stone-900 dark:text-stone-100">Corpus Indexing:</span> Uploaded documents (and curated archival speeches) are split into semantic chunks with metadata (source title, section, page references).
              </li>
              <li>
                <span className="font-semibold text-stone-900 dark:text-stone-100">Hybrid Retrieval:</span> Incoming queries are matched against document chunks using BM25 lexical token matching, semantic concept expansion, and phrase scoring.
              </li>
              <li>
                <span className="font-semibold text-stone-900 dark:text-stone-100">Evidence Extraction:</span> Top-ranked passages are synthesized and cited alongside the answer.
              </li>
              <li>
                <span className="font-semibold text-stone-900 dark:text-stone-100">Session Ephemerality:</span> Chat history and temporary user uploads reside only within the current browser session.
              </li>
            </ol>
          </div>

          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span>Knowledge Base: Speeches, Interviews, Memoirs</span>
            <span className="font-mono text-[11px]">Strict RAG v2.5</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex justify-end">
          <button
            id="dismiss-about-btn"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
