import React from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, HelpCircle, Check, X } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  isSubmitted: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({ 
  question, 
  selectedOption, 
  onSelectOption,
  isSubmitted 
}) => {
  const getOptionStyle = (option: string) => {
    if (!isSubmitted) {
      return selectedOption === option
        ? "border-violet-600 bg-violet-50/50 ring-1 ring-violet-600 text-violet-900 shadow-md transform scale-[1.01]"
        : "border-gray-100 bg-white hover:bg-gray-50 text-gray-700 shadow-sm";
    }

    if (option === question.correctAnswer) {
      return "border-green-500 bg-green-50 text-green-900 shadow-md ring-1 ring-green-500";
    }

    if (selectedOption === option && option !== question.correctAnswer) {
      return "border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500";
    }

    return "border-transparent bg-gray-50 opacity-50 text-gray-400";
  };

  return (
    <div className="w-full max-w-xl mx-auto pb-24"> {/* Added padding-bottom for sticky footer */}
      <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3">
             {question.type}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
            {question.questionText}
          </h3>
      </div>

      <div className="space-y-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !isSubmitted && onSelectOption(option)}
            disabled={isSubmitted}
            className={`w-full text-left relative p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group active:scale-[0.98] ${getOptionStyle(option)}`}
          >
            <span className="font-semibold text-base md:text-lg pr-8">{option}</span>
            
            {/* Selection/Result Indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {!isSubmitted && (
                    <div className={`w-5 h-5 rounded-full border-2 ${selectedOption === option ? 'border-violet-600 bg-violet-600' : 'border-gray-200'} flex items-center justify-center transition-colors`}>
                        {selectedOption === option && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                )}
                {isSubmitted && option === question.correctAnswer && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                {isSubmitted && selectedOption === option && option !== question.correctAnswer && <XCircle className="w-6 h-6 text-red-600" />}
            </div>
          </button>
        ))}
      </div>

      {isSubmitted && (
        <div className={`mt-6 p-5 rounded-2xl border ${selectedOption === question.correctAnswer ? 'bg-green-50/80 border-green-200' : 'bg-red-50/80 border-red-200'} backdrop-blur-sm animate-fade-in`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${selectedOption === question.correctAnswer ? 'bg-green-100' : 'bg-red-100'}`}>
                {selectedOption === question.correctAnswer 
                    ? <Check className="w-4 h-4 text-green-700" />
                    : <X className="w-4 h-4 text-red-700" />
                }
            </div>
            <div>
              <p className={`font-bold text-sm mb-1 ${selectedOption === question.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                {selectedOption === question.correctAnswer ? 'Excellent!' : 'Not quite right'}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};