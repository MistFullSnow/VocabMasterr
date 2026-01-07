import React, { useState, useEffect, useCallback } from 'react';
import { QuizCategory, Question, UserProfile } from '../types';
import { generateQuestions } from '../services/geminiService';
import { saveAttempt, getMasteredWords } from '../services/storageService';
import { QuizCard } from './QuizCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowRight, X, CheckCircle2, RefreshCcw, Home } from 'lucide-react';

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
      // Now async
      const mastered = await getMasteredWords(user.email);
      const newQuestions = await generateQuestions(category, 5, mastered);
      setQuestions(newQuestions);
      setCurrentIndex(0);
      setSessionScore(0);
      setSessionTotal(0);
      setSelectedOption(null);
      setIsSubmitted(false);
    } catch (err) {
      setError("Failed to generate questions. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, [category, user.email]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleOptionSelect = async (option: string) => {
    setSelectedOption(option);
    setIsSubmitted(true);
    
    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correctAnswer;
    
    if (isCorrect) {
      setSessionScore(prev => prev + 1);
    }
    setSessionTotal(prev => prev + 1);
    
    // Now async, but we don't need to await it for the UI to proceed
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="text-red-500 mb-4 text-xl font-bold">Oops!</div>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
            onClick={onExit}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 shadow-lg"
        >
            Go Back
        </button>
      </div>
    );
  }

  if (showSummary) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
             <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                 
                 <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-violet-600" />
                 </div>

                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Complete!</h2>
                 <p className="text-gray-500 mb-8 text-sm">Here is how you performed in this set.</p>
                 
                 <div className="flex justify-center items-end gap-2 mb-8">
                     <span className="text-6xl font-black text-violet-600 tracking-tighter">
                         {Math.round((sessionScore / sessionTotal) * 100)}
                     </span>
                     <span className="text-xl text-gray-400 font-bold mb-2">%</span>
                 </div>
                 
                 <div className="space-y-3">
                     <button 
                        onClick={loadQuestions}
                        className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                     >
                        <RefreshCcw className="w-4 h-4" /> Try Another Set
                     </button>
                     <button 
                        onClick={onExit}
                        className="w-full py-4 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                     >
                        <Home className="w-4 h-4" /> Dashboard
                     </button>
                 </div>
             </div>
        </div>
     );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button 
            onClick={onExit}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{category}</span>
            <div className="flex gap-1">
                 {questions.map((_, i) => (
                     <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i <= currentIndex ? 'bg-violet-600' : 'bg-gray-200'}`}></div>
                 ))}
            </div>
          </div>
          
          <div className="w-8"></div> {/* Spacer */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {currentQ && (
            <QuizCard 
                question={currentQ}
                selectedOption={selectedOption}
                onSelectOption={handleOptionSelect}
                isSubmitted={isSubmitted}
            />
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-30 safe-area-pb">
        <div className="max-w-xl mx-auto">
            {isSubmitted ? (
                 <button
                    onClick={isLastQuestion ? handleFinish : handleNext}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                        isLastQuestion 
                        ? 'bg-green-600 shadow-green-200' 
                        : 'bg-violet-600 shadow-violet-200'
                    }`}
                >
                    {isLastQuestion ? 'Finish Result' : 'Next Question'}
                    <ArrowRight className="w-5 h-5" />
                </button>
            ) : (
                <button disabled className="w-full py-4 rounded-xl font-bold bg-gray-200 text-gray-400 cursor-not-allowed">
                    Select an answer
                </button>
            )}
        </div>
      </div>
    </div>
  );
};