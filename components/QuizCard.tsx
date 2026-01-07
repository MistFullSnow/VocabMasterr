import React from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

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
        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700";
    }

    if (option === question.correctAnswer) {
      return "border-green-500 bg-green-50 text-green-700";
    }

    if (selectedOption === option && option !== question.correctAnswer) {
      return "border-red-500 bg-red-50 text-red-700";
    }

    return "border-gray-200 opacity-60 text-gray-500";
  };

  const getIcon = (option: string) => {
    if (!isSubmitted) return null;
    if (option === question.correctAnswer) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (selectedOption === option && option !== question.correctAnswer) return <XCircle className="w-5 h-5 text-red-600" />;
    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center space-x-2 mb-4">
             <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide rounded-full">
               {question.type}
             </span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
            {question.questionText}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !isSubmitted && onSelectOption(option)}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between group ${getOptionStyle(option)}`}
              >
                <span className="font-medium text-lg">{option}</span>
                {getIcon(option)}
              </button>
            ))}
          </div>

          {isSubmitted && (
            <div className={`mt-6 p-4 rounded-lg ${selectedOption === question.correctAnswer ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
              <div className="flex items-start gap-3">
                <HelpCircle className={`w-5 h-5 mt-0.5 ${selectedOption === question.correctAnswer ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                  <p className={`font-bold mb-1 ${selectedOption === question.correctAnswer ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedOption === question.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">Explanation: </span>
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};