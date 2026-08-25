import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  Plus,
  RefreshCw,
  FolderArchive,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { SourceDocument } from '../types';
import { parseUploadedFile } from '../utils/ragEngine';
import { chunkText } from '../data/defaultCorpus';

interface KnowledgeBaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SourceDocument[];
  onAddDocument: (doc: SourceDocument) => void;
  onToggleDocument: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
  onResetCorpus: () => void;
  onPreviewDocument: (doc: SourceDocument) => void;
}

export const KnowledgeBaseDrawer: React.FC<KnowledgeBaseDrawerProps> = ({
  isOpen,
  onClose,
  documents,
  onAddDocument,
  onToggleDocument,
  onDeleteDocument,
  onResetCorpus,
  onPreviewDocument,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCitation, setCustomCitation] = useState('');
  const [customContent, setCustomContent] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { text, title } = await parseUploadedFile(file);

        if (!text || text.trim().length < 30) {
          setUploadError(`File "${file.name}" contains too little extractable text.`);
          continue;
        }

        const docId = `user_doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const chunks = chunkText(docId, file.name, title, text, 650, 120);

        const newDoc: SourceDocument = {
          id: docId,
          name: file.name,
          title: title || file.name,
          category: 'user_upload',
          content: text,
          chunks,
          sizeBytes: file.size || new Blob([text]).size,
          uploadedAt: Date.now(),
          enabled: true,
          sourceCitation: `User Uploaded Document (${file.name})`,
        };

        onAddDocument(newDoc);
      }
    } catch (err: any) {
      console.error('Upload processing error:', err);
      setUploadError(err?.message || 'Failed to parse uploaded document.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customContent.trim()) return;

    const title = customTitle.trim() || 'Custom Source Excerpt';
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    const docId = `custom_text_${Date.now()}`;
    const chunks = chunkText(docId, filename, title, customContent, 600, 100);

    const newDoc: SourceDocument = {
      id: docId,
      name: filename,
      title: title,
      category: 'user_upload',
      content: customContent,
      chunks,
      sizeBytes: new Blob([customContent]).size,
      uploadedAt: Date.now(),
      enabled: true,
      sourceCitation: customCitation.trim() || 'Custom user knowledge entry',
    };

    onAddDocument(newDoc);
    setCustomTitle('');
    setCustomCitation('');
    setCustomContent('');
    setIsAddingText(false);
  };

  const totalChunks = documents.filter((d) => d.enabled).reduce((acc, d) => acc + d.chunks.length, 0);
  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.sourceCitation && d.sourceCitation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      id="knowledge-base-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="knowledge-base-panel"
        className="bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 w-full max-w-xl h-full flex flex-col shadow-2xl text-stone-800 dark:text-stone-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/90 dark:bg-stone-900/90">
          <div className="flex items-center gap-2.5">
            <FolderArchive className="w-5 h-5 text-stone-800 dark:text-stone-200" />
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Knowledge Base & Sources
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {documents.filter((d) => d.enabled).length} active documents &bull; {totalChunks} indexed chunks
              </p>
            </div>
          </div>
          <button
            id="close-kb-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action / Upload Area */}
        <div className="p-6 space-y-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-950/20">
          <div
            id="doc-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-stone-800 bg-stone-100 dark:border-stone-200 dark:bg-stone-800/60'
                : 'border-stone-300 dark:border-stone-700 hover:border-stone-500 hover:bg-stone-100/50 dark:hover:bg-stone-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.pdf,.json,.csv,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="flex flex-col items-center justify-center gap-1.5">
              <UploadCloud className="w-6 h-6 text-stone-600 dark:text-stone-400" />
              <p className="text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100">
                {isProcessing ? 'Processing & chunking documents...' : 'Upload source speeches, interviews, or articles'}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Supports TXT, MD, PDF, JSON, CSV &bull; Auto-chunked for RAG retrieval
              </p>
            </div>
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Secondary manual text insertion toggle */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              id="toggle-add-snippet-btn"
              onClick={() => setIsAddingText(!isAddingText)}
              className="text-xs font-medium text-stone-700 dark:text-stone-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAddingText ? 'Cancel text input' : 'Paste raw speech or quote text'}
            </button>
            <button
              id="reset-corpus-btn"
              onClick={onResetCorpus}
              title="Restore original curated Lee Kuan Yew speeches"
              className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Restore Curated Corpus
            </button>
          </div>

          {/* Inline Add Text Form */}
          {isAddingText && (
            <form onSubmit={handleAddCustomText} className="p-4 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2.5">
              <input
                type="text"
                placeholder="Document Title (e.g. 1980 National Day Speech)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
              <input
                type="text"
                placeholder="Source Citation / Context (optional)"
                value={customCitation}
                onChange={(e) => setCustomCitation(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
              <textarea
                placeholder="Paste speech text, interview transcript, or article excerpt..."
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                rows={4}
                required
                className="w-full text-xs px-3 py-2 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
              <button
                type="submit"
                className="w-full py-1.5 text-xs font-semibold rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Index & Add to Knowledge Base
              </button>
            </form>
          )}
        </div>

        {/* Search documents bar */}
        <div className="px-6 py-2 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search indexed sources by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-stone-100/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              No matching source documents found.
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  doc.enabled
                    ? 'border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60'
                    : 'border-stone-200/50 dark:border-stone-800/40 bg-stone-100/40 dark:bg-stone-950/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={doc.enabled}
                      onChange={() => onToggleDocument(doc.id)}
                      title={doc.enabled ? 'Enabled in RAG retrieval' : 'Disabled from RAG retrieval'}
                      className="mt-1 rounded text-stone-900 focus:ring-stone-500 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {doc.title}
                        </h4>
                        {doc.year && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            {doc.year}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {doc.name} &bull; {doc.chunks.length} chunks &bull; {(doc.sizeBytes / 1024).toFixed(1)} KB
                      </p>
                      {doc.sourceCitation && (
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 italic line-clamp-1 mt-0.5">
                          {doc.sourceCitation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`preview-doc-${doc.id}`}
                      onClick={() => onPreviewDocument(doc)}
                      title="Inspect chunks and full text"
                      className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-doc-${doc.id}`}
                      onClick={() => onDeleteDocument(doc.id)}
                      title="Remove from knowledge base"
                      className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-950/60 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex items-center justify-between text-xs text-stone-500">
          <span>RAG Knowledge Base Active</span>
          <button
            id="done-kb-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
