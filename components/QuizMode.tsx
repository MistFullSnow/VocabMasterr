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
        <div className="text-red-400 mb-4 text-xl font-bold">Signal Lost</div>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={onExit} className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20">Abort Mission</button>
      </div>
    );
  }

  if (showSummary) {
     return (
        <div className="min-h-screen flex items-center justify-center p-4 animate-in relative overflow-hidden">
             
             <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center relative z-10 animate-in border border-violet-500/20">
                 
                 <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-white rotate-6 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                    <CheckCircle2 className="w-12 h-12" />
                 </div>

                 <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Mission Complete</h2>
                 <p className="text-slate-400 mb-8 font-medium">Neural pathways reinforced.</p>
                 
                 <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
                     <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Score</div>
                     <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                         {sessionScore}
                     </div>
                 </div>
                 
                 <div className="space-y-3">
                     <button 
                        onClick={loadQuestions}
                        className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-cyan-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                     >
                        <RefreshCcw className="w-4 h-4" /> Go Again
                     </button>
                     <button 
                        onClick={onExit}
                        className="w-full py-4 bg-transparent border border-white/10 text-slate-400 rounded-xl font-bold hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2"
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
      <div className="px-6 py-4 sticky top-0 z-20 flex justify-between items-center safe-area-pt backdrop-blur-xl bg-slate-950/60 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={onExit} className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{category}</span>
                <span className="text-xs font-bold text-cyan-400">{difficulty.split(' ')[0]} PROTOCOL</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                  <Zap className={`w-4 h-4 ${streak > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                  <span className={`text-sm font-bold ${streak > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>{streak}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 shadow-sm">
                  <span className="text-sm font-black text-white tracking-wide">{sessionScore} pts</span>
              </div>
          </div>
      </div>

      {/* Neon Progress Bar */}
      <div className="w-full h-1 bg-slate-900">
          <div 
            className={`h-full transition-all duration-100 ease-linear shadow-[0_0_10px_currentColor] ${
                timeLeft > 60 ? 'bg-emerald-500 text-emerald-500' : timeLeft > 30 ? 'bg-amber-500 text-amber-500' : 'bg-red-500 text-red-500'
            }`} 
            style={{ width: `${timeLeft}%` }}
          ></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto pb-32 flex flex-col justify-center">
        <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-widest px-2">
                <span>Seq {currentIndex + 1} / {questions.length}</span>
                <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> Time Dilation Active</span>
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
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border backdrop-blur-md transition-all active:scale-95 ${
                            fiftyFiftyUsed 
                            ? 'bg-white/5 text-slate-600 border-white/5 cursor-not-allowed' 
                            : 'bg-slate-900/60 border-white/20 text-indigo-300 hover:text-white hover:border-white/40'
                        }`}
                    >
                        <Divide className="w-4 h-4" /> 50/50
                    </button>
                    <button 
                        onClick={handleHint}
                        disabled={hintUsed}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border backdrop-blur-md transition-all active:scale-95 ${
                            hintUsed 
                            ? 'bg-white/5 text-slate-600 border-white/5 cursor-not-allowed' 
                            : 'bg-slate-900/60 border-white/20 text-amber-300 hover:text-white hover:border-white/40'
                        }`}
                    >
                        <HelpCircle className="w-4 h-4" /> Hint
                    </button>
                </div>
            )}

            {/* Action Button Container */}
            <div className="glass-card p-4 rounded-[1.5rem] border-t border-white/10 shadow-2xl">
                {isSubmitted ? (
                    <button
                        onClick={isLastQuestion ? handleFinish : handleNext}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-in ${
                            isLastQuestion 
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                            : 'bg-violet-600 hover:bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                        }`}
                    >
                        {isLastQuestion ? 'Complete Session' : 'Next Sequence'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                ) : (
                    <div className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest py-3 animate-pulse">
                        Awaiting Input...
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};