import React from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, Check, X, Lightbulb } from 'lucide-react';

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
  const getOptionStyle = (option: string) => {
    // If option is hidden by 50/50 lifeline
    if (hiddenOptions.includes(option)) {
      return "invisible opacity-0 pointer-events-none"; 
    }

    if (!isSubmitted) {
      return selectedOption === option
        ? "border-violet-600 bg-violet-50 ring-2 ring-violet-600 text-violet-900 shadow-lg scale-[1.02]"
        : "border-slate-100 bg-white hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow-md hover:border-violet-200";
    }

    if (option === question.correctAnswer) {
      return "border-green-500 bg-green-50 text-green-900 shadow-md ring-1 ring-green-500";
    }

    if (selectedOption === option && option !== question.correctAnswer) {
      return "border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500";
    }

    return "border-transparent bg-slate-50/50 opacity-40 text-slate-400";
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-up"> 
      
      {/* Question Header */}
      <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-snug tracking-tight mb-4">
            {question.questionText}
          </h3>
          
          {hintRevealed && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm font-medium animate-fade-in">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Hint: {question.hint}</p>
            </div>
          )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !isSubmitted && onSelectOption(option)}
            disabled={isSubmitted || hiddenOptions.includes(option)}
            className={`w-full text-left relative p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group active:scale-[0.98] ${getOptionStyle(option)}`}
            style={{ animationDelay: `${idx * 50}ms`, transitionProperty: 'all' }}
          >
            <span className="font-semibold text-base md:text-lg pr-8">{option}</span>
            
            {/* Selection/Result Indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {!isSubmitted && !hiddenOptions.includes(option) && (
                    <div className={`w-5 h-5 rounded-full border-2 ${selectedOption === option ? 'border-violet-600 bg-violet-600 scale-110' : 'border-slate-200'} flex items-center justify-center transition-all duration-300`}>
                        {selectedOption === option && <div className="w-2 h-2 bg-white rounded-full animate-scale-in"></div>}
                    </div>
                )}
                {isSubmitted && option === question.correctAnswer && <CheckCircle2 className="w-6 h-6 text-green-600 animate-scale-in" />}
                {isSubmitted && selectedOption === option && option !== question.correctAnswer && <XCircle className="w-6 h-6 text-red-600 animate-scale-in" />}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation Card */}
      {isSubmitted && (
        <div className={`mt-8 p-6 rounded-3xl border backdrop-blur-md shadow-lg animate-slide-up ${selectedOption === question.correctAnswer ? 'bg-green-50/80 border-green-200/60' : 'bg-red-50/80 border-red-200/60'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-full shadow-inner ${selectedOption === question.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} animate-scale-in`}>
                {selectedOption === question.correctAnswer 
                    ? <Check className="w-5 h-5" />
                    : <X className="w-5 h-5" />
                }
            </div>
            <div>
              <p className={`font-black text-base mb-1.5 ${selectedOption === question.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                {selectedOption === question.correctAnswer ? 'Spot on!' : 'Not quite right'}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};