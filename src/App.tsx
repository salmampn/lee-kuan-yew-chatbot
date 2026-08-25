/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SourceDocument, ChatMessage, RetrievedSource } from './types';
import { getInitialCorpus } from './data/defaultCorpus';
import { retrieveRelevantChunks, isModernOrHypotheticalQuery } from './utils/ragEngine';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { KnowledgeBaseDrawer } from './components/KnowledgeBaseDrawer';
import { AboutModal } from './components/AboutModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { EvidencePanel } from './components/EvidencePanel';
import { ClearHistoryModal } from './components/ClearHistoryModal';

const SESSION_STORAGE_KEY = 'wwlkyd_chat_session_v1';
const SESSION_DOCS_KEY = 'wwlkyd_custom_docs_v1';

export default function App() {
  // Knowledge Base State
  const [documents, setDocuments] = useState<SourceDocument[]>(() => {
    return getInitialCorpus();
  });

  // Session-only Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [evidenceMode, setEvidenceMode] = useState(false);
  const [isKbOpen, setIsKbOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<SourceDocument | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Evidence Panel active context
  const [activeEvidenceContext, setActiveEvidenceContext] = useState<{
    evidence: RetrievedSource[];
    question?: string;
    hasInsufficientEvidence?: boolean;
  }>({
    evidence: [],
  });

  // Persist messages to sessionStorage only
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
      console.warn('Could not write to sessionStorage:', err);
    }
  }, [messages]);

  // Compute active chunks
  const enabledDocs = documents.filter((d) => d.enabled);
  const totalChunks = enabledDocs.reduce((acc, doc) => acc + doc.chunks.length, 0);

  // Document Management handlers
  const handleAddDocument = (doc: SourceDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleToggleDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleResetCorpus = () => {
    setDocuments(getInitialCorpus());
  };

  const handleClearSession = () => {
    setIsClearModalOpen(true);
  };

  const handleConfirmClear = () => {
    setMessages([]);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear sessionStorage:', e);
    }
    setActiveEvidenceContext({ evidence: [] });
  };

  // Stop in-flight generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Main RAG Send handler
  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: queryText.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const startTime = Date.now();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // 1. Check if modern or hypothetical question
      const isModernOrHypo = isModernOrHypotheticalQuery(queryText);

      // 2. Gather all active chunks
      const allActiveChunks = enabledDocs.flatMap((doc) => doc.chunks);

      // 3. Perform hybrid BM25 + semantic retrieval
      const { retrieved, maxScore } = retrieveRelevantChunks(queryText, allActiveChunks, 4);

      // 4. If no relevant evidence was found at all
      if (retrieved.length === 0 || maxScore < 1.0) {
        const insufficientMsg: ChatMessage = {
          id: `asst_${Date.now()}`,
          role: 'assistant',
          content: 'I do not have sufficient evidence in the available sources to answer that reliably.',
          timestamp: Date.now(),
          sourcesUsed: [],
          retrievedContext: [],
          isModernOrHypothetical: isModernOrHypo,
          hasInsufficientEvidence: true,
          queryTimeMs: Date.now() - startTime,
        };

        setMessages([...newMessages, insufficientMsg]);
        setActiveEvidenceContext({
          evidence: [],
          question: queryText,
          hasInsufficientEvidence: true,
        });
        setIsLoading(false);
        return;
      }

      // Update evidence panel state
      setActiveEvidenceContext({
        evidence: retrieved,
        question: queryText,
        hasInsufficientEvidence: false,
      });

      // 5. Call Server RAG API Endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          question: queryText,
          history: newMessages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          retrievedContext: retrieved,
          isModernOrHypothetical: isModernOrHypo,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'I do not have sufficient evidence in the available sources to answer that reliably.',
        timestamp: Date.now(),
        sourcesUsed: data.sourcesUsed && data.sourcesUsed.length > 0 ? data.sourcesUsed : retrieved.slice(0, 3),
        retrievedContext: retrieved,
        isModernOrHypothetical: data.isModernOrHypothetical ?? isModernOrHypo,
        hasInsufficientEvidence: data.hasInsufficientEvidence ?? false,
        queryTimeMs: Date.now() - startTime,
      };

      setMessages([...newMessages, assistantMsg]);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('User cancelled answer generation.');
        return;
      }
      console.error('RAG Generation Error:', err);

      const insufficientMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content:
          'I do not have sufficient evidence in the available sources to answer that reliably.',
        timestamp: Date.now(),
        sourcesUsed: [],
        retrievedContext: [],
        isModernOrHypothetical: isModernOrHypotheticalQuery(queryText),
        hasInsufficientEvidence: true,
        queryTimeMs: Date.now() - startTime,
      };

      setMessages([...newMessages, insufficientMsg]);

      setActiveEvidenceContext({
        evidence: [],
        question: queryText,
        hasInsufficientEvidence: true,
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleInspectEvidence = (message: ChatMessage) => {
    setActiveEvidenceContext({
      evidence: message.retrievedContext || message.sourcesUsed || [],
      question: message.content.slice(0, 100),
      hasInsufficientEvidence: message.hasInsufficientEvidence,
    });
    setEvidenceMode(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-stone-100/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans antialiased overflow-hidden selection:bg-stone-200 dark:selection:bg-stone-800">
      {/* 1. Header with Title & Action Controls */}
      <Header
        documentCount={enabledDocs.length}
        chunkCount={totalChunks}
        evidenceMode={evidenceMode}
        onToggleEvidenceMode={() => setEvidenceMode(!evidenceMode)}
        onOpenKnowledgeBase={() => setIsKbOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onClearSession={handleClearSession}
        hasMessages={messages.length > 0}
      />

      {/* 2. Prominent Mandatory Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 3. Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Chat Flow */}
        <main className="flex flex-col flex-1 h-full min-w-0 bg-white dark:bg-stone-900">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            onSelectSampleQuestion={handleSendMessage}
            onInspectEvidence={handleInspectEvidence}
            onStopGeneration={handleStopGeneration}
          />
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStop={handleStopGeneration}
          />
        </main>

        {/* 4. Evidence Mode Inspector Side Panel */}
        {evidenceMode && (
          <EvidencePanel
            isOpen={evidenceMode}
            onClose={() => setEvidenceMode(false)}
            evidence={activeEvidenceContext.evidence}
            question={activeEvidenceContext.question}
            hasInsufficientEvidence={activeEvidenceContext.hasInsufficientEvidence}
          />
        )}
      </div>

      {/* Modals & Drawers */}
      <KnowledgeBaseDrawer
        isOpen={isKbOpen}
        onClose={() => setIsKbOpen(false)}
        documents={documents}
        onAddDocument={handleAddDocument}
        onToggleDocument={handleToggleDocument}
        onDeleteDocument={handleDeleteDocument}
        onResetCorpus={handleResetCorpus}
        onPreviewDocument={(doc) => setPreviewDoc(doc)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      <ClearHistoryModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClear}
        messageCount={messages.length}
      />
    </div>
  );
}
