import React, { useEffect, useState } from 'react';
import { QuizCategory, UserProfile, UserStats, CategoryStats, Difficulty } from '../types';
import { getStats, getCategoryStats, clearData } from '../services/storageService';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen, BrainCircuit, Lightbulb, PenTool, Trash2, Award, TrendingUp, AlertTriangle, ArrowRightLeft, Spline, LogOut, Sparkles, Zap, Target, Star, Layers } from 'lucide-react';
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
  
  const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 pt-10">
      
      {/* Navbar */}
      <div className="flex justify-between items-center mb-12 animate-in">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <span className="font-black text-xl">V.</span>
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">VocabMaster</h1>
                <p className="text-xs font-medium text-slate-500 mt-1">{user.email}</p>
            </div>
        </div>
        <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors shadow-sm"
        >
            <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar / Controls (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-8">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div className="abstract-card p-6 rounded-[2rem] animate-in delay-100 flex flex-col justify-between h-40">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-4xl font-black text-slate-800">{overallAccuracy}%</span>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Accuracy</p>
                    </div>
                </div>
                <div className="abstract-card p-6 rounded-[2rem] animate-in delay-200 flex flex-col justify-between h-40">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-4xl font-black text-slate-800">{stats.masteredWords.length}</span>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Mastered</p>
                    </div>
                </div>
            </div>

            {/* Difficulty Selector */}
            <div className="abstract-card p-6 rounded-[2rem] animate-in delay-300">
                <div className="flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Intensity</span>
                </div>
                <div className="space-y-2">
                    {Object.values(Difficulty).map((diff) => (
                    <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center justify-between group border-2 ${
                        selectedDifficulty === diff 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]' 
                        : 'bg-white border-transparent hover:border-slate-200 text-slate-500'
                        }`}
                    >
                        <div>
                            <span className="font-bold text-sm block">{diff.split(' ')[0]}</span>
                            {diff.includes('CET') && <span className="text-[10px] opacity-70">CET Exam Standard</span>}
                        </div>
                        {selectedDifficulty === diff && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                    </button>
                    ))}
                </div>
            </div>
            
            <button 
                onClick={() => {
                    if(confirm('Reset all progress?')) clearData(user.email);
                }}
                className="w-full py-4 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 className="w-4 h-4" /> Reset All Data
            </button>

        </div>

        {/* Main Content (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Chart */}
            <div className="abstract-card p-8 rounded-[2rem] animate-in delay-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 text-lg">Performance Curve</h3>
                    <div className="flex gap-2">
                        {/* Legend or controls could go here */}
                    </div>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={catStats} barSize={32}>
                        <XAxis dataKey="category" hide />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                                padding: '12px',
                                fontFamily: 'Outfit'
                            }}
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
                     <Layers className="w-5 h-5 text-slate-400" />
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Training Modules</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.values(QuizCategory).map((category, idx) => {
                        const catStat = catStats.find(c => c.category === category);
                        const attempts = catStat?.attempts || 0;
                        
                        return (
                            <button
                                key={category}
                                onClick={() => onStartQuiz(category, selectedDifficulty)}
                                className="abstract-card p-5 rounded-[1.5rem] text-left transition-all hover:bg-white flex flex-col justify-between h-40 group animate-in"
                                style={{ animationDelay: `${400 + (idx * 50)}ms` }}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all shadow-sm">
                                    {getCategoryIcon(category)}
                                </div>
                                
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{category}</h4>
                                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
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