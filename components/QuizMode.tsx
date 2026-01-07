import React, { useState, useEffect, useCallback } from 'react';
import { QuizCategory, Question, UserProfile } from '../types';
import { generateQuestions } from '../services/geminiService';
import { saveAttempt, getMasteredWords } from '../services/storageService';
import { QuizCard } from './QuizCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface QuizModeProps {
  category: QuizCategory;
  user: UserProfile;
  onExit: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ category, user, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current question state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  
  // Final summary state
  const [showSummary, setShowSummary] = useState(false);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setShowSummary(false);
    try {
      const mastered = getMasteredWords(user.email);
      const newQuestions = await generateQuestions(category, 5, mastered);
      setQuestions(newQuestions);
      setCurrentIndex(0);
      setSessionScore(0);
      setSessionTotal(0);
      setSelectedOption(null);
      setIsSubmitted(false);
    } catch (err) {
      setError("Failed to generate questions. Please check your internet or API limit.");
    } finally {
      setLoading(false);
    }
  }, [category, user.email]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsSubmitted(true);
    
    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correctAnswer;
    
    if (isCorrect) {
      setSessionScore(prev => prev + 1);
    }
    setSessionTotal(prev => prev + 1);
    
    // Save to persistence
    saveAttempt(user.email, category, currentQ.targetWord, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  };

  const handleFinish = () => {
    setShowSummary(true);
  };

  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="text-red-500 mb-4 text-xl">⚠️ {error}</div>
        <button 
            onClick={onExit}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
            Return Home
        </button>
      </div>
    );
  }

  // Session Summary Screen
  if (showSummary) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
             <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                 <h2 className="text-3xl font-bold text-gray-800 mb-4">Set Complete!</h2>
                 <div className="text-6xl font-black text-indigo-600 mb-2">
                     {Math.round((sessionScore / sessionTotal) * 100)}%
                 </div>
                 <p className="text-gray-500 mb-8">
                     You got {sessionScore} out of {sessionTotal} correct.
                 </p>
                 
                 <div className="space-y-3">
                     <button 
                        onClick={loadQuestions}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                     >
                        Start Next Set <ArrowRight className="w-4 h-4" />
                     </button>
                     <button 
                        onClick={onExit}
                        className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                     >
                        Back to Dashboard
                     </button>
                 </div>
             </div>
        </div>
     );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button 
            onClick={onExit}
            className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{category}</span>
            <span className="text-sm font-semibold text-gray-900">Question {currentIndex + 1} of {questions.length}</span>
          </div>
          <div className="w-16"></div> {/* Spacer for alignment */}
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
             <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((currentIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100}%` }}
             ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">
        {currentQ && (
            <QuizCard 
                question={currentQ}
                selectedOption={selectedOption}
                onSelectOption={handleOptionSelect}
                isSubmitted={isSubmitted}
            />
        )}

        {/* Footer Actions */}
        <div className="w-full max-w-2xl mt-8 flex justify-end">
            {isSubmitted && !isLastQuestion && (
                <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all font-semibold flex items-center gap-2"
                >
                    Next Question <ArrowRight className="w-5 h-5" />
                </button>
            )}
            
            {isSubmitted && isLastQuestion && (
                <button
                    onClick={handleFinish}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 hover:shadow-xl transition-all font-semibold flex items-center gap-2"
                >
                    Finish Quiz <CheckCircle2 className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};