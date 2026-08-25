import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  User,
  Compass,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, RetrievedSource } from '../types';
import { SourcesUsedList } from './SourcesUsedList';

interface ChatMessageItemProps {
  message: ChatMessage;
  onInspectEvidence: (message: ChatMessage) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onInspectEvidence,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = message.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      id={`message-${message.id}`}
      className={`group w-full py-4 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-stone-50/50 dark:bg-stone-900/40 border-y border-stone-200/50 dark:border-stone-800/50'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-3.5 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-stone-300 dark:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 shadow-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Sender & Meta Header */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {isUser ? 'You' : 'Educational Analyst (RAG)'}
              </span>
              {!isUser && message.isModernOrHypothetical && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                  Historical Inference
                </span>
              )}
              {!isUser && message.hasInsufficientEvidence && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-300 border border-red-300/60 dark:border-red-800">
                  Insufficient Evidence
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-stone-400 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>{wordCount} words</span>
              <button
                id={`copy-msg-btn-${message.id}`}
                onClick={handleCopy}
                className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                title="Copy message text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed space-y-3">
            {isUser ? (
              <p className="whitespace-pre-wrap font-medium">{message.content}</p>
            ) : (
              <div className="prose prose-stone dark:prose-invert max-w-none text-sm leading-relaxed prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1.5 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
                <Markdown>{message.content}</Markdown>
              </div>
            )}
          </div>

          {/* Sources Used (for Assistant) */}
          {!isUser && message.sourcesUsed && message.sourcesUsed.length > 0 && (
            <SourcesUsedList
              sources={message.sourcesUsed}
              onOpenEvidence={() => onInspectEvidence(message)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
