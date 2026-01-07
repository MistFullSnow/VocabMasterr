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
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(100);
  const timerRef = useRef<number | null>(null);

  const [showSummary, setShowSummary] = useState(false);

  const getTimerDuration = () => {
    switch(difficulty) {
      case Difficulty.EASY: return 45;
      case Difficulty.MEDIUM: return 30;
      case Difficulty.HARD: return 20;
      default: return 30;
    }
  };

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
    const step = 100 / (duration * 10);
    
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

  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed || isSubmitted) return;
    const currentQ = questions[currentIndex];
    const wrongOptions = currentQ.options.filter(o => o !== currentQ.correctAnswer);
    const shuffled = wrongOptions.sort(() => 0.5 - Math.random());
    setHiddenOptions(shuffled.slice(0, 2));
    setFiftyFiftyUsed(true);
    setSessionScore(prev => Math.max(0, prev - 2));
  };

  const handleHint = () => {
    if (hintUsed || isSubmitted) return;
    setHintUsed(true);
    setSessionScore(prev => Math.max(0, prev - 2));
  };

  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;
  const currentQ = questions[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in">
        <div className="text-rose-500 mb-4 text-xl font-bold">Connection Error</div>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={onExit} className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800">Return Home</button>
      </div>
    );
  }

  if (showSummary) {
     return (
        <div className="min-h-screen flex items-center justify-center p-4 animate-in relative overflow-hidden">
             
             <div className="abstract-card p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center relative z-10 animate-in">
                 
                 <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-white rotate-6 shadow-xl shadow-indigo-200">
                    <CheckCircle2 className="w-12 h-12" />
                 </div>

                 <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Session Complete</h2>
                 <p className="text-slate-500 mb-8 font-medium">Your brain is getting stronger.</p>
                 
                 <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                     <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total Score</div>
                     <div className="text-5xl font-black text-indigo-600">
                         {sessionScore}
                     </div>
                 </div>
                 
                 <div className="space-y-3">
                     <button 
                        onClick={loadQuestions}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                     >
                        <RefreshCcw className="w-4 h-4" /> Go Again
                     </button>
                     <button 
                        onClick={onExit}
                        className="w-full py-4 bg-transparent border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                     >
                        <Home className="w-4 h-4" /> Dashboard
                     </button>
                 </div>
             </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4 sticky top-0 z-20 flex justify-between items-center safe-area-pt backdrop-blur-md bg-white/30 border-b border-white/20">
          <div className="flex items-center gap-4">
            <button onClick={onExit} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{category}</span>
                <span className="text-xs font-bold text-slate-900">{difficulty.split(' ')[0]} MODE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                  <Zap className={`w-4 h-4 ${streak > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                  <span className="text-sm font-bold text-slate-700">{streak}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                  <span className="text-sm font-black text-slate-800 tracking-wide">{sessionScore} pts</span>
              </div>
          </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100">
          <div 
            className={`h-full transition-all duration-100 ease-linear rounded-r-full ${
                timeLeft > 60 ? 'bg-emerald-500' : timeLeft > 30 ? 'bg-amber-500' : 'bg-rose-500'
            }`} 
            style={{ width: `${timeLeft}%` }}
          ></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto pb-32 flex flex-col justify-center">
        <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest px-2">
                <span>Question {currentIndex + 1} / {questions.length}</span>
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
      </div>

      {/* Bottom Lifelines & Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-30 pointer-events-none">
        <div className="pointer-events-auto p-4 max-w-2xl mx-auto w-full">
            
            {/* Lifelines */}
            {!isSubmitted && (
                <div className="flex justify-center gap-4 mb-4">
                    <button 
                        onClick={handleFiftyFifty}
                        disabled={fiftyFiftyUsed}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm bg-white border shadow-lg transition-all active:scale-95 ${
                            fiftyFiftyUsed 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100 shadow-none' 
                            : 'border-slate-100 text-slate-600 hover:text-indigo-600'
                        }`}
                    >
                        <Divide className="w-4 h-4" /> 50/50
                    </button>
                    <button 
                        onClick={handleHint}
                        disabled={hintUsed}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm bg-white border shadow-lg transition-all active:scale-95 ${
                            hintUsed 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100 shadow-none' 
                            : 'border-slate-100 text-slate-600 hover:text-amber-600'
                        }`}
                    >
                        <HelpCircle className="w-4 h-4" /> Hint
                    </button>
                </div>
            )}

            {/* Action Button Container */}
            <div className="abstract-card p-4 rounded-[1.5rem] border-t border-white/50 shadow-2xl">
                {isSubmitted ? (
                    <button
                        onClick={isLastQuestion ? handleFinish : handleNext}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-in ${
                            isLastQuestion 
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200' 
                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200'
                        }`}
                    >
                        {isLastQuestion ? 'Complete Session' : 'Next Question'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                ) : (
                    <div className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest py-3 animate-pulse">
                        Select an option to continue
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};