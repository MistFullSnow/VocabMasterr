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
  
  // Highlight Logic: Finds the target word and wraps it in a styled span
  const renderQuestionText = () => {
    if (!question.targetWord) return question.questionText;

    // Use regex to find the word, case insensitive, preserving the original casing in the text
    const parts = question.questionText.split(new RegExp(`(${question.targetWord})`, 'gi'));
    
    return parts.map((part, i) => 
        part.toLowerCase() === question.targetWord.toLowerCase() ? (
            <span key={i} className="relative inline-block px-1 mx-0.5">
                <span className="absolute inset-0 bg-indigo-100 -skew-y-2 rounded-lg -z-10"></span>
                <span className="font-extrabold text-indigo-900">{part}</span>
            </span>
        ) : (
            <span key={i} className="font-normal">{part}</span>
        )
    );
  };

  const getOptionStyle = (option: string) => {
    if (hiddenOptions.includes(option)) return "invisible opacity-0 pointer-events-none";

    if (!isSubmitted) {
      return selectedOption === option
        ? "bg-slate-900 text-white shadow-xl scale-[1.02] border-slate-900"
        : "bg-white/50 border-white/60 hover:bg-white hover:border-slate-200 text-slate-600 hover:text-slate-900";
    }

    if (option === question.correctAnswer) {
      return "bg-emerald-100 border-emerald-200 text-emerald-800 ring-1 ring-emerald-300";
    }

    if (selectedOption === option && option !== question.correctAnswer) {
      return "bg-rose-50 border-rose-200 text-rose-800 ring-1 ring-rose-200";
    }

    return "bg-slate-50 opacity-40 text-slate-400 border-transparent";
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in"> 
      
      {/* Question Card */}
      <div className="abstract-card p-8 rounded-[2.5rem] mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles className="w-24 h-24 text-indigo-500" />
          </div>

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/60 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 border border-white">
                {question.type}
            </span>
            <h3 className="text-2xl md:text-3xl font-medium text-slate-800 leading-normal mb-2">
                {renderQuestionText()}
            </h3>
          </div>
          
          {hintRevealed && (
            <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50/80 border border-amber-100 rounded-2xl text-amber-800 text-sm font-medium animate-in">
                <Lightbulb className="w-5 h-5 flex-shrink-0 text-amber-500" />
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
                <div className="bg-emerald-200 p-1 rounded-full"><Check className="w-4 h-4 text-emerald-800" /></div>
            )}
            {isSubmitted && selectedOption === option && option !== question.correctAnswer && (
                <div className="bg-rose-200 p-1 rounded-full"><X className="w-4 h-4 text-rose-800" /></div>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {isSubmitted && (
        <div className="mt-6 p-6 rounded-3xl abstract-card animate-in border-t-4 border-t-indigo-500">
            <h4 className="font-bold text-slate-900 mb-2">Analysis</h4>
            <p className="text-slate-600 leading-relaxed">
              {question.explanation}
            </p>
        </div>
      )}
    </div>
  );
};