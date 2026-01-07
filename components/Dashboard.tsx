import React, { useEffect, useState } from 'react';
import { QuizCategory, UserProfile } from '../types';
import { getStats, getCategoryStats, clearData } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen, BrainCircuit, Lightbulb, PenTool, Trash2, Award, TrendingUp, AlertTriangle, ArrowRightLeft, Spline, LogOut, Sparkles, ChevronRight } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  onStartQuiz: (category: QuizCategory) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onStartQuiz, onLogout }) => {
  const [stats, setStats] = useState(getStats(user.email));
  const [catStats, setCatStats] = useState(getCategoryStats(user.email));

  useEffect(() => {
    setStats(getStats(user.email));
    setCatStats(getCategoryStats(user.email));
  }, [user.email]);

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
  
  // Custom Gradient Colors
  const COLORS = ['#8b5cf6', '#d946ef', '#f43f5e', '#ec4899', '#6366f1', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24 pt-4 md:pt-8 min-h-screen bg-slate-50/50">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">VocabMaster</span>
            </h1>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">{user.email}</p>
        </div>
        <button 
            onClick={onLogout}
            className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Logout"
        >
            <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-violet-200">
            <div className="flex items-center gap-2 mb-2 opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Accuracy</span>
            </div>
            <div className="text-3xl font-black">{overallAccuracy}%</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-gray-800 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-fuchsia-600">
                <Award className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Mastered</span>
            </div>
            <div className="text-3xl font-black text-gray-900">{stats.masteredWords.length}</div>
        </div>
      </div>

      {/* Start Quiz Section */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" /> Start Practice
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Object.values(QuizCategory).map((category, idx) => {
           const catStat = catStats.find(c => c.category === category);
           const attempts = catStat?.attempts || 0;
           
           return (
              <button
                key={category}
                onClick={() => onStartQuiz(category)}
                className="group relative flex flex-col bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-violet-300 hover:shadow-md transition-all active:scale-95 text-left h-32 justify-between overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full -mr-10 -mt-10 group-hover:from-violet-50 group-hover:to-fuchsia-50 transition-colors"></div>
                
                <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-gray-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300`}>
                  {getCategoryIcon(category)}
                </div>
                
                <div className="relative z-10">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight mb-0.5 pr-2">{category}</h3>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        {attempts} runs
                    </p>
                </div>
              </button>
           );
        })}
      </div>

      {/* Analytics */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Performance Breakdown</h2>
            <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-medium">Last 30 Days</div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catStats}>
                <XAxis dataKey="category" hide />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="accuracy" radius={[4, 4, 4, 4]}>
                  {catStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
             {catStats.slice(0, 4).map((c, i) => (
                 <div key={i} className="flex items-center gap-1 text-[10px] text-gray-500">
                     <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></span>
                     {c.category.split(' ')[0]}
                 </div>
             ))}
          </div>
      </div>
      
      <div className="text-center">
         <button 
            onClick={() => {
                if(confirm('Are you sure you want to reset all progress for this profile?')) {
                    clearData(user.email);
                }
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
        >
            <Trash2 className="w-3 h-3" /> Reset Data
        </button>
      </div>

    </div>
  );
};