import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      id="chat-input-wrapper"
      className="w-full border-t border-stone-200/90 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 p-3 sm:p-4 backdrop-blur-xs"
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className="relative flex-1 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/60 focus-within:border-stone-700 dark:focus-within:border-stone-300 focus-within:ring-1 focus-within:ring-stone-500 transition-all">
            <textarea
              id="chat-query-textarea"
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || disabled}
              placeholder="Ask about governance, leadership, geopolitics, economic strategy, or life principles..."
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none max-h-44 leading-relaxed"
            />
          </div>

          <button
            id="send-chat-button"
            type="submit"
            disabled={!input.trim() || isLoading || disabled}
            aria-label="Send message"
            className="p-3 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs shrink-0 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-2 px-1">
          <span>Grounded retrieval from verified Lee Kuan Yew public documents</span>
          <span className="hidden sm:inline">Press Enter to send &bull; Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
};
