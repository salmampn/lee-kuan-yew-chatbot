import React from 'react';
import { Compass, ShieldCheck, Globe, TrendingUp, GraduationCap, Lightbulb, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onSelectQuestion: (question: string) => void;
}

interface QuestionCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: string[];
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectQuestion }) => {
  const categories: QuestionCategory[] = [
    {
      title: 'Governance & Anti-Corruption',
      icon: ShieldCheck,
      questions: [
        'How did Singapore eliminate corruption and maintain absolute standards of integrity in government?',
        'Why did Lee Kuan Yew believe competitive civil service salaries were essential to prevent graft?',
      ],
    },
    {
      title: 'Geopolitics & Small State Strategy',
      icon: Globe,
      questions: [
        'How should small states navigate great power rivalry between the United States and China?',
        'Why was an enduring balance of power in the Asia-Pacific considered essential for regional stability?',
      ],
    },
    {
      title: 'Economics, Survival & Housing',
      icon: TrendingUp,
      questions: [
        'Why did Singapore reject populist welfare subsidies in favor of workfare and home ownership?',
        'How did Singapore attract foreign MNCs and build an industrial base after the 1965 separation?',
      ],
    },
    {
      title: 'Talent, Education & Bilingualism',
      icon: GraduationCap,
      questions: [
        'What was the rationale behind Singapore’s bilingual policy with English as the working language?',
        'Why is strict meritocracy considered the primary driver of national survival?',
      ],
    },
    {
      title: 'Modern Scenarios & Hypotheticals',
      icon: Sparkles,
      questions: [
        'How would Singapore’s core governance principles approach modern AI regulation and automation?',
        'What historical framework applies to modern demographic decline and low fertility rates?',
      ],
    },
  ];

  return (
    <div id="chat-empty-state" className="max-w-3xl mx-auto py-8 px-4 text-stone-800 dark:text-stone-200">
      {/* Title & Introduction */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 mb-2 shadow-xs">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-stone-950 dark:text-stone-50 font-serif">
          What Would Lee Kuan Yew Do?
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
          An educational RAG dialogue grounded in curated archival speeches, interviews, and public writings. Ask about statecraft, geopolitics, economic survival, and governance.
        </p>
      </div>

      {/* Categorized Prompt Chips */}
      <div className="space-y-5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-200 dark:border-stone-800 pb-2">
          <span>Sample Historical & Analytical Queries</span>
          <span>Click to ask</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs space-y-2.5 hover:border-stone-400 dark:hover:border-stone-700 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-stone-100">
                  <Icon className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                  <span>{cat.title}</span>
                </div>
                <div className="space-y-1.5">
                  {cat.questions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      id={`sample-q-${idx}-${qIdx}`}
                      onClick={() => onSelectQuestion(q)}
                      className="w-full text-left p-2 rounded-lg text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 hover:text-stone-950 dark:hover:text-stone-100 transition-all leading-snug cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                    >
                      &ldquo;{q}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
