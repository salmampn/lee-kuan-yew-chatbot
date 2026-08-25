import React, { useRef, useEffect, useState } from 'react';
import { Loader2, Sparkles, AlertCircle, Square, Clock } from 'lucide-react';
import { ChatMessage } from '../types';
import { ChatMessageItem } from './ChatMessageItem';
import { EmptyState } from './EmptyState';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectSampleQuestion: (question: string) => void;
  onInspectEvidence: (message: ChatMessage) => void;
  onStopGeneration?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSelectSampleQuestion,
  onInspectEvidence,
  onStopGeneration,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Live timer while synthesizing
  useEffect(() => {
    if (!isLoading) {
      setElapsedSeconds(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds((Date.now() - startTime) / 1000);
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyState onSelectQuestion={onSelectSampleQuestion} />
      </div>
    );
  }

  return (
    <div id="chat-messages-container" className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-900">
      {messages.map((msg) => (
        <ChatMessageItem
          key={msg.id}
          message={msg}
          onInspectEvidence={onInspectEvidence}
        />
      ))}

      {isLoading && (
        <div className="py-6 bg-stone-50/70 dark:bg-stone-900/40 border-y border-stone-200/60 dark:border-stone-800/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center shadow-xs shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-500" />
                  <span>Synthesizing grounded answer...</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-600 dark:text-stone-400 bg-stone-200/70 dark:bg-stone-800 px-2 py-0.5 rounded-full border border-stone-300/60 dark:border-stone-700">
                    <Clock className="w-3 h-3" />
                    {elapsedSeconds.toFixed(1)}s
                  </span>
                </div>

                {onStopGeneration && (
                  <button
                    id="stop-generation-btn"
                    onClick={onStopGeneration}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700/80 transition-colors shadow-2xs cursor-pointer"
                    title="Cancel synthesis"
                  >
                    <Square className="w-3 h-3 fill-current text-amber-600 dark:text-amber-400" />
                    <span>Stop</span>
                  </button>
                )}
              </div>
              <div className="h-3.5 bg-stone-200/70 dark:bg-stone-800 rounded w-3/4 animate-pulse" />
              <div className="h-3.5 bg-stone-200/70 dark:bg-stone-800 rounded w-5/6 animate-pulse" />
              <div className="h-3.5 bg-stone-200/70 dark:bg-stone-800 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
};
