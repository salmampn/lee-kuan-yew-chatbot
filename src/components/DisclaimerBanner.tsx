import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div
      id="mandatory-disclaimer-banner"
      className={`w-full border-b border-amber-900/20 bg-amber-50/90 dark:bg-amber-950/40 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 transition-colors ${
        compact ? 'text-[11px] py-1.5' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-start sm:items-center gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5 sm:mt-0" />
        <div className="leading-relaxed font-medium">
          <span className="font-semibold text-amber-950 dark:text-amber-100">Mandatory Disclosure: </span>
          This is an AI-generated educational tool based on selected public Lee Kuan Yew materials. It is not Lee Kuan Yew and does not reproduce his personal identity or guarantee historical accuracy.
        </div>
      </div>
    </div>
  );
};
