import React, { useRef, useEffect } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { ChatMessageItem } from './ChatMessageItem';
import { EmptyState } from './EmptyState';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectSampleQuestion: (question: string) => void;
  onInspectEvidence: (message: ChatMessage) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSelectSampleQuestion,
  onInspectEvidence,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
        <div className="py-6 bg-stone-50/50 dark:bg-stone-900/30 border-y border-stone-200/50 dark:border-stone-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center shadow-xs shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching source documents & synthesizing answer...</span>
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
