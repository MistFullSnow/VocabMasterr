import React from 'react';
import { Question } from '../types';
import { Check, X, Lightbulb, Sparkles } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  isSubmitted: boolean;
  hiddenOptions: string[];
  hintRevealed: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({ 
  question, 
  selectedOption, 
  onSelectOption,
  isSubmitted,
  hiddenOptions,
  hintRevealed
}) => {
  
  // Highlight Logic: Finds the target word and wraps it in a glowing styled span for Dark Mode
  const renderQuestionText = () => {
    if (!question.targetWord) return question.questionText;

    const parts = question.questionText.split(new RegExp(`(${question.targetWord})`, 'gi'));
    
    return parts.map((part, i) => 
        part.toLowerCase() === question.targetWord.toLowerCase() ? (
            <span key={i} className="relative inline-block px-1 mx-0.5">
                {/* Glow effect */}
                <span className="absolute inset-0 bg-violet-500/20 blur-md rounded-lg -z-10"></span>
                <span className="font-extrabold text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)] border-b-2 border-violet-500/50">{part}</span>
            </span>
        ) : (
            <span key={i} className="font-normal text-slate-200">{part}</span>
        )
    );
  };

  const getOptionStyle = (option: string) => {
    if (hiddenOptions.includes(option)) return "invisible opacity-0 pointer-events-none";

    if (!isSubmitted) {
      return selectedOption === option
        ? "bg-violet-600/20 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-slate-400 hover:text-white";
    }

    if (option === question.correctAnswer) {
      return "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
    }

    if (selectedOption === option && option !== question.correctAnswer) {
      return "bg-red-500/20 border-red-500/50 text-red-300";
    }

    return "bg-white/5 opacity-20 text-slate-600 border-transparent";
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in"> 
      
      {/* Question Card */}
      <div className="glass-card p-8 rounded-[2.5rem] mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <Sparkles className="w-24 h-24 text-violet-500" />
          </div>

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-4 border border-white/5">
                {question.type}
            </span>
            <h3 className="text-2xl md:text-3xl font-medium leading-normal mb-2">
                {renderQuestionText()}
            </h3>
          </div>
          
          {hintRevealed && (
            <div className="mt-6 flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-200 text-sm font-medium animate-in backdrop-blur-md">
                <Lightbulb className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <p>Hint: {question.hint}</p>
            </div>
          )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !isSubmitted && onSelectOption(option)}
            disabled={isSubmitted || hiddenOptions.includes(option)}
            className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group active:scale-[0.98] ${getOptionStyle(option)}`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <span className="font-semibold text-lg">{option}</span>
            
            {/* Status Icon */}
            {isSubmitted && option === question.correctAnswer && (
                <div className="bg-emerald-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-emerald-400" /></div>
            )}
            {isSubmitted && selectedOption === option && option !== question.correctAnswer && (
                <div className="bg-red-500/20 p-1 rounded-full"><X className="w-4 h-4 text-red-400" /></div>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {isSubmitted && (
        <div className="mt-6 p-6 rounded-3xl glass-card animate-in border-t-4 border-t-violet-500">
            <h4 className="font-bold text-white mb-2">Analysis</h4>
            <p className="text-slate-300 leading-relaxed">
              {question.explanation}
            </p>
        </div>
      )}
    </div>
  );
};