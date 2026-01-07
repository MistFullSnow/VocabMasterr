import React, { useEffect, useState } from 'react';
import { QuizCategory, UserProfile, UserStats, CategoryStats, Difficulty } from '../types';
import { getStats, getCategoryStats, clearData } from '../services/storageService';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen, BrainCircuit, Lightbulb, PenTool, Trash2, Award, TrendingUp, AlertTriangle, ArrowRightLeft, Spline, LogOut, Sparkles, Target, Star, Layers } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  const overallAccuracy = stats.totalAttempts > 0 
    ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100) 
    : 0;

  const getCategoryIcon = (cat: QuizCategory) => {
    switch (cat) {
      case QuizCategory.SYNONYMS: return <BookOpen className="w-6 h-6" />;
      case QuizCategory.ANTONYMS: return <BrainCircuit className="w-6 h-6" />;
      case QuizCategory.IDIOMS: return <Lightbulb className="w-6 h-6" />;
      case QuizCategory.CLOZE: return <PenTool className="w-6 h-6" />;
      case QuizCategory.SPOT_ERROR: return <AlertTriangle className="w-6 h-6" />;
      case QuizCategory.SENTENCE_ARRANGEMENT: return <ArrowRightLeft className="w-6 h-6" />;
      case QuizCategory.POSSIBLE_STARTERS: return <Spline className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };
  
  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#22d3ee', '#67e8f9', '#f472b6', '#fb7185', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 pt-10">
      
      {/* Navbar */}
      <div className="flex justify-between items-center mb-12 animate-in">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-cyan-400 shadow-lg backdrop-blur-md">
                <span className="font-black text-xl">V.</span>
            </div>
            <div>
                <h1 className="text-xl font-bold text-white leading-none">VocabMaster</h1>
                <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                    {user.email}
                </p>
            </div>
        </div>
        <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
            <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar / Controls (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-8">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-[2rem] animate-in delay-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-violet-500/30 transition-colors">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/20 rounded-full blur-2xl -mr-6 -mt-6"></div>
                    <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-4xl font-black text-white">{overallAccuracy}%</span>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Accuracy</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-[2rem] animate-in delay-200 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-cyan-500/20 rounded-full blur-2xl -ml-6 -mb-6"></div>
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-4xl font-black text-white">{stats.masteredWords.length}</span>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Mastered</p>
                    </div>
                </div>
            </div>

            {/* Difficulty Selector */}
            <div className="glass-card p-6 rounded-[2rem] animate-in delay-300">
                <div className="flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Protocol Level</span>
                </div>
                <div className="space-y-3">
                    {Object.values(Difficulty).map((diff) => (
                    <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center justify-between group border ${
                        selectedDifficulty === diff 
                        ? 'bg-violet-600/20 border-violet-500/50 text-white shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                        }`}
                    >
                        <div>
                            <span className="font-bold text-sm block">{diff.split(' ')[0]}</span>
                            {diff.includes('CET') && <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block opacity-80">CET Standard</span>}
                        </div>
                        {selectedDifficulty === diff && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-scale-in" />}
                    </button>
                    ))}
                </div>
            </div>
            
            <button 
                onClick={() => {
                    if(confirm('Purge all mission data?')) clearData(user.email);
                }}
                className="w-full py-4 text-xs font-bold text-slate-600 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all flex items-center justify-center gap-2"
            >
                <Trash2 className="w-4 h-4" /> Reset System
            </button>

        </div>

        {/* Main Content (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Chart */}
            <div className="glass-card p-8 rounded-[2rem] animate-in delay-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-400" /> Performance Metrics
                    </h3>
                </div>
                <div className="h-48 w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={catStats} barSize={32}>
                        <XAxis dataKey="category" hide />
                        <Tooltip 
                            cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                            contentStyle={{ 
                                borderRadius: '16px', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                backgroundColor: 'rgba(2, 6, 23, 0.95)',
                                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.5)',
                                padding: '12px',
                                fontFamily: 'Outfit',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Bar dataKey="accuracy" radius={[8, 8, 8, 8]}>
                            {catStats.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Categories Grid */}
            <div>
                <div className="flex items-center gap-2 mb-6 px-2">
                     <Layers className="w-5 h-5 text-slate-500" />
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Training Modules</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.values(QuizCategory).map((category, idx) => {
                        const catStat = catStats.find(c => c.category === category);
                        const attempts = catStat?.attempts || 0;
                        
                        return (
                            <button
                                key={category}
                                onClick={() => onStartQuiz(category, selectedDifficulty)}
                                className="glass-card p-5 rounded-[1.5rem] text-left transition-all hover:-translate-y-1 flex flex-col justify-between h-40 group animate-in relative overflow-hidden"
                                style={{ animationDelay: `${400 + (idx * 50)}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all relative z-10">
                                    {getCategoryIcon(category)}
                                </div>
                                
                                <div className="relative z-10">
                                    <h4 className="font-bold text-slate-200 text-sm leading-tight mb-2 group-hover:text-white transition-colors">{category}</h4>
                                    <span className="text-[10px] font-semibold text-slate-500 bg-white/5 px-2 py-1 rounded-lg group-hover:text-cyan-300 group-hover:bg-cyan-900/20 transition-colors">
                                        {attempts} runs
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};