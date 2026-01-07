import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QuizCategory, Question, UserProfile, Difficulty } from '../types';
import { generateQuestions } from '../services/geminiService';
import { saveAttempt, getMasteredWords } from '../services/storageService';
import { QuizCard } from './QuizCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowRight, X, CheckCircle2, RefreshCcw, Home, Timer, Zap, HelpCircle, Divide } from 'lucide-react';

interface QuizModeProps {
  category: QuizCategory;
  difficulty: Difficulty;
  user: UserProfile;
  onExit: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ category, difficulty, user, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Game State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  // Lifelines
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(100); // Percentage
  const timerRef = useRef<number | null>(null);

  const getTimerDuration = () => {
    switch(difficulty) {
      case Difficulty.EASY: return 45;
      case Difficulty.MEDIUM: return 30; // CET Standard
      case Difficulty.HARD: return 20;
      default: return 30;
    }
  };

  const [showSummary, setShowSummary] = useState(false);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setShowSummary(false);
    try {
      const mastered = await getMasteredWords(user.email);
      const newQuestions = await generateQuestions(category, difficulty, 5, mastered);
      setQuestions(newQuestions);
      resetQuestionState();
      setSessionScore(0);
      setStreak(0);
    } catch (err) {
      setError("Failed to generate questions. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, [category, difficulty, user.email]);

  const resetQuestionState = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setHiddenOptions([]);
    setHintUsed(false);
    setFiftyFiftyUsed(false);
    setTimeLeft(100);
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = getTimerDuration();
    const step = 100 / (duration * 10); // Update every 100ms
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - step;
      });
    }, 100);
  };

  const handleTimeUp = () => {
    setIsSubmitted(true);
    // Auto-select nothing or mark as missed, handled by UI state
  };

  useEffect(() => {
    loadQuestions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadQuestions]);

  const handleOptionSelect = async (option: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(option);
    setIsSubmitted(true);
    
    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correctAnswer;
    
    // Score Calculation: Base (10) + Speed Bonus + Streak Bonus
    if (isCorrect) {
      const speedBonus = Math.round(timeLeft / 10);
      const streakBonus = streak * 2;
      setSessionScore(prev => prev + 10 + speedBonus + streakBonus);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    saveAttempt(user.email, category, currentQ.targetWord, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetQuestionState();
    }
  };

  const handleFinish = () => {
    setShowSummary(true);
  };

  // Lifeline Handlers
  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed || isSubmitted) return;
    const currentQ = questions[currentIndex];
    const wrongOptions = currentQ.options.filter(o => o !== currentQ.correctAnswer);
    // Shuffle and pick 2 to hide
    const shuffled = wrongOptions.sort(() => 0.5 - Math.random());
    setHiddenOptions(shuffled.slice(0, 2));
    setFiftyFiftyUsed(true);
    setSessionScore(prev => Math.max(0, prev - 2)); // Small penalty cost
  };

  const handleHint = () => {
    if (hintUsed || isSubmitted) return;
    setHintUsed(true);
    setSessionScore(prev => Math.max(0, prev - 2)); // Small penalty cost
  };

  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;
  const currentQ = questions[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center animate-fade-in">
        <div className="text-red-500 mb-4 text-xl font-bold">Oops!</div>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={onExit} className="px-6 py-3 bg-gray-900 text-white rounded-xl shadow-lg">Go Back</button>
      </div>
    );
  }

  if (showSummary) {
     const maxPossibleBase = questions.length * 10;
     const percentage = Math.min(100, Math.round((sessionScore / (maxPossibleBase * 1.5)) * 100)); // Approx max including bonuses

     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-fade-in relative overflow-hidden">
             {/* Simple CSS Confetti Background */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute animate-float opacity-50" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: '10px', height: '10px',
                        background: ['#8b5cf6', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 3)],
                        animationDuration: `${3 + Math.random() * 5}s`
                    }}></div>
                ))}
             </div>

             <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center relative z-10 border border-white/50 animate-scale-in">
                 <div className="w-24 h-24 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-300">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                 </div>

                 <h2 className="text-2xl font-black text-slate-800 mb-2">Practice Complete!</h2>
                 <p className="text-slate-500 mb-6 font-medium">Your score reflects speed & accuracy.</p>
                 
                 <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
                     <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Total Score</div>
                     <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                         {sessionScore}
                     </div>
                 </div>
                 
                 <div className="space-y-3">
                     <button 
                        onClick={loadQuestions}
                        className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                     >
                        <RefreshCcw className="w-5 h-5" /> Play Again
                     </button>
                     <button 
                        onClick={onExit}
                        className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                     >
                        <Home className="w-5 h-5" /> Dashboard
                     </button>
                 </div>
             </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Top Stats Bar */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm border-b border-slate-100 sticky top-0 z-20 flex justify-between items-center safe-area-pt">
          <div className="flex items-center gap-4">
            <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{category}</span>
                <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full w-fit">{difficulty.split(' ')[0]} Mode</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-amber-700">{streak}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                  <span className="text-sm font-black text-slate-700">{sessionScore} pts</span>
              </div>
          </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full h-1.5 bg-slate-200">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${
                timeLeft > 60 ? 'bg-green-500' : timeLeft > 30 ? 'bg-amber-500' : 'bg-red-500'
            }`} 
            style={{ width: `${timeLeft}%` }}
          ></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto pb-32">
        <div className="max-w-xl mx-auto flex justify-between text-xs font-bold text-slate-400 mb-4 px-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> Speed Bonus Active</span>
        </div>

        {currentQ && (
            <QuizCard 
                key={currentQ.id}
                question={currentQ}
                selectedOption={selectedOption}
                onSelectOption={handleOptionSelect}
                isSubmitted={isSubmitted}
                hiddenOptions={hiddenOptions}
                hintRevealed={hintUsed}
            />
        )}
      </div>

      {/* Bottom Lifelines & Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-30">
        
        {/* Lifelines (Only visible if not submitted) */}
        {!isSubmitted && (
            <div className="flex justify-center gap-4 mb-4">
                <button 
                    onClick={handleFiftyFifty}
                    disabled={fiftyFiftyUsed}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all active:scale-95 ${
                        fiftyFiftyUsed ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100'
                    }`}
                >
                    <Divide className="w-4 h-4" /> 50/50
                </button>
                <button 
                    onClick={handleHint}
                    disabled={hintUsed}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all active:scale-95 ${
                        hintUsed ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-amber-600 hover:bg-amber-50 border border-amber-100'
                    }`}
                >
                    <HelpCircle className="w-4 h-4" /> Hint
                </button>
            </div>
        )}

        {/* Action Button */}
        <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 pb-6 safe-area-pb">
            <div className="max-w-xl mx-auto">
                {isSubmitted ? (
                    <button
                        onClick={isLastQuestion ? handleFinish : handleNext}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-scale-in ${
                            isLastQuestion ? 'bg-green-600 shadow-green-200' : 'bg-violet-600 shadow-violet-200'
                        }`}
                    >
                        {isLastQuestion ? 'View Results' : 'Next Question'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                ) : (
                    <div className="text-center text-slate-400 text-sm font-medium py-3 animate-pulse">
                        Select an option to lock answer
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};