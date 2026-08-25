import React, { useState } from 'react';
import { X, FileText, Hash, Calendar, BookOpen, Layers } from 'lucide-react';
import { SourceDocument } from '../types';

interface DocumentPreviewModalProps {
  document: SourceDocument | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'chunks'>('chunks');

  if (!document) return null;

  return (
    <div
      id="doc-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="doc-preview-modal-container"
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden text-stone-800 dark:text-stone-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-stone-700 dark:text-stone-300" />
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {document.title}
              </h2>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-stone-500 dark:text-stone-400">
              <span className="font-mono">{document.name}</span>
              {document.year && <span>• Year: {document.year}</span>}
              <span>• {document.chunks.length} indexed chunks</span>
              <span>• {(document.sizeBytes / 1024).toFixed(1)} KB</span>
            </div>
            {document.sourceCitation && (
              <p className="mt-1.5 text-xs text-stone-600 dark:text-stone-300 italic">
                Citation: {document.sourceCitation}
              </p>
            )}
          </div>
          <button
            id="close-doc-preview-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center px-6 border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950/30 gap-4">
          <button
            id="doc-tab-chunks-btn"
            onClick={() => setActiveTab('chunks')}
            className={`py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chunks'
                ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Indexed Chunks ({document.chunks.length})
          </button>
          <button
            id="doc-tab-text-btn"
            onClick={() => setActiveTab('text')}
            className={`py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'text'
                ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Full Document Text
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'chunks' ? (
            <div className="space-y-4">
              {document.chunks.map((chunk, idx) => (
                <div
                  key={chunk.id}
                  className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" />
                      Chunk #{idx + 1} &bull; {chunk.pageOrSection}
                    </span>
                    <span className="font-mono text-[11px]">
                      ~{chunk.tokenCount || Math.ceil(chunk.text.length / 4)} tokens
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-950/20">
              <pre className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap font-sans leading-relaxed">
                {document.content}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex justify-end">
          <button
            id="close-doc-preview-bottom-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
