import React, { useEffect, useState } from 'react';
import { QuizCategory, UserProfile, UserStats, CategoryStats, Difficulty } from '../types';
import { getStats, getCategoryStats, clearData } from '../services/storageService';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen, BrainCircuit, Lightbulb, PenTool, Trash2, Award, TrendingUp, AlertTriangle, ArrowRightLeft, Spline, LogOut, Sparkles, Cloud, Zap, Target } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface DashboardProps {
  user: UserProfile;
  onStartQuiz: (category: QuizCategory, difficulty: Difficulty) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onStartQuiz, onLogout }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [catStats, setCatStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const s = await getStats(user.email);
      const c = await getCategoryStats(user.email);
      setStats(s);
      setCatStats(c);
      setLoading(false);
    };
    fetchData();
  }, [user.email]);

  if (loading || !stats) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <LoadingSpinner />
        </div>
    );
  }

  const overallAccuracy = stats.totalAttempts > 0 
    ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100) 
    : 0;

  const getCategoryIcon = (cat: QuizCategory) => {
    switch (cat) {
      case QuizCategory.SYNONYMS: return <BookOpen className="w-5 h-5" />;
      case QuizCategory.ANTONYMS: return <BrainCircuit className="w-5 h-5" />;
      case QuizCategory.IDIOMS: return <Lightbulb className="w-5 h-5" />;
      case QuizCategory.CLOZE: return <PenTool className="w-5 h-5" />;
      case QuizCategory.SPOT_ERROR: return <AlertTriangle className="w-5 h-5" />;
      case QuizCategory.SENTENCE_ARRANGEMENT: return <ArrowRightLeft className="w-5 h-5" />;
      case QuizCategory.POSSIBLE_STARTERS: return <Spline className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };
  
  const COLORS = ['#8b5cf6', '#d946ef', '#f43f5e', '#ec4899', '#6366f1', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="min-h-screen bg-[#F0F4F8] relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200/50 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 pb-24 pt-4 md:pt-8 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-slide-up">
          <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  Vocab<span className="text-violet-600">Master</span>
              </h1>
              <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {user.email} 
                  <Cloud className="w-3 h-3 text-slate-400" />
              </p>
          </div>
          <button 
              onClick={onLogout}
              className="p-2.5 bg-white/70 backdrop-blur-md border border-white/50 rounded-xl shadow-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-105"
              aria-label="Logout"
          >
              <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="mb-8 animate-slide-up delay-100" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-3">
             <Target className="w-4 h-4 text-violet-600" />
             <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Select Difficulty</span>
          </div>
          <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl inline-flex shadow-sm border border-white/50 w-full md:w-auto">
            {Object.values(Difficulty).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedDifficulty === diff 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 scale-100' 
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                }`}
              >
                {diff.replace(' (CET Level)', '')}
                {diff.includes('CET') && <span className="hidden md:inline text-[10px] ml-1 opacity-80">(CET)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-slide-up delay-200" style={{ animationFillMode: 'both' }}>
          <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-6 text-white shadow-xl shadow-violet-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 opacity-90">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Accuracy</span>
                </div>
                <div className="text-4xl font-black tracking-tight">{overallAccuracy}%</div>
                <div className="text-xs font-medium text-white/70 mt-1">Lifetime Performance</div>
              </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-slate-800 shadow-lg shadow-slate-200/50 border border-white/50 relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-100/50 rounded-full blur-xl -ml-5 -mb-5 group-hover:bg-amber-200/50 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-amber-600">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Mastered</span>
                </div>
                <div className="text-4xl font-black text-slate-800">{stats.masteredWords.length}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">Words & Concepts</div>
              </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="flex items-center justify-between mb-4 animate-slide-up delay-300" style={{ animationFillMode: 'both' }}>
           <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
               <Zap className="w-4 h-4" />
             </div>
             Practice Zones
           </h2>
           <span className="text-xs font-medium text-slate-400 bg-white/50 px-2 py-1 rounded-lg border border-white/50">
             {selectedDifficulty} Mode
           </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.values(QuizCategory).map((category, idx) => {
             const catStat = catStats.find(c => c.category === category);
             const attempts = catStat?.attempts || 0;
             
             return (
                <button
                  key={category}
                  onClick={() => onStartQuiz(category, selectedDifficulty)}
                  className="group relative flex flex-col bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-sm border border-white/60 hover:border-violet-300/50 hover:shadow-lg hover:shadow-violet-100/50 transition-all active:scale-[0.98] text-left h-36 justify-between overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${350 + (idx * 50)}ms`, animationFillMode: 'both' }}
                >
                  <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full -mr-8 -mt-8 group-hover:from-violet-50 group-hover:to-fuchsia-50 transition-colors duration-500"></div>
                  
                  <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-2 bg-slate-50 text-violet-600 group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-fuchsia-600 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 shadow-sm`}>
                    {getCategoryIcon(category)}
                  </div>
                  
                  <div className="relative z-10">
                      <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 pr-2">{category}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-slate-300 group-hover:bg-violet-400"></span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-violet-500 transition-colors">
                            {attempts} runs
                        </p>
                      </div>
                  </div>
                </button>
             );
          })}
        </div>

        {/* Analytics Chart */}
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/60 mb-8 animate-slide-up delay-500" style={{ animationFillMode: 'both' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Performance Insights
              </h2>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="category" hide />
                  <Tooltip 
                    cursor={{fill: 'rgba(139, 92, 246, 0.05)'}}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid rgba(255,255,255,0.8)', 
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar dataKey="accuracy" radius={[6, 6, 6, 6]} barSize={40}>
                    {catStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
        
        <div className="text-center animate-fade-in delay-700 pb-8" style={{ animationFillMode: 'both' }}>
           <button 
              onClick={() => {
                  if(confirm('Are you sure you want to reset all progress for this profile?')) {
                      clearData(user.email);
                  }
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-all"
          >
              <Trash2 className="w-3 h-3" /> Reset Progress
          </button>
        </div>

      </div>
    </div>
  );
};