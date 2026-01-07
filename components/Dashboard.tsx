import React, { useEffect, useState } from 'react';
import { QuizCategory, UserProfile } from '../types';
import { getStats, getCategoryStats, clearData } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen, BrainCircuit, Lightbulb, PenTool, Trash2, Award, TrendingUp, AlertTriangle, ArrowRightLeft, Spline, LogOut, User } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  onStartQuiz: (category: QuizCategory) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onStartQuiz, onLogout }) => {
  const [stats, setStats] = useState(getStats(user.email));
  const [catStats, setCatStats] = useState(getCategoryStats(user.email));

  useEffect(() => {
    // Refresh stats on mount or user change
    setStats(getStats(user.email));
    setCatStats(getCategoryStats(user.email));
  }, [user.email]);

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

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#84cc16'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <User className="w-5 h-5" />
             </div>
             <div>
                 <p className="text-xs text-gray-400 font-bold uppercase">Logged in as</p>
                 <p className="text-sm font-semibold text-gray-800">{user.email}</p>
             </div>
        </div>
        <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
        >
            <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <header className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">VocabMaster MBA</h1>
          <p className="text-gray-500 mt-2">Track your Verbal Ability progress</p>
        </div>
        <div className="flex gap-3">
             <div className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow-md flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold">{overallAccuracy}%</span> Accuracy
            </div>
             <div className="bg-emerald-600 text-white px-5 py-2 rounded-lg shadow-md flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="font-bold">{stats.masteredWords.length}</span> Mastered
            </div>
        </div>
      </header>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Performance by Category</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catStats} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="category" width={140} tick={{fontSize: 11, fontWeight: 500}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={24}>
                  {catStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Summary */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold mb-2">Keep going!</h2>
                <p className="text-indigo-100 mb-6">Practice makes perfect. The more questions you answer, the smarter your future quizzes become.</p>
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-indigo-400 pb-2">
                        <span className="text-indigo-100">Questions Attempted</span>
                        <span className="text-2xl font-bold">{stats.totalAttempts}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-indigo-400 pb-2">
                        <span className="text-indigo-100">Correct Answers</span>
                        <span className="text-2xl font-bold">{stats.correctAttempts}</span>
                    </div>
                </div>
            </div>
            
             <button 
                onClick={() => {
                    if(confirm('Are you sure you want to reset all progress for this profile?')) {
                        clearData(user.email);
                    }
                }}
                className="mt-6 flex items-center justify-center gap-2 text-xs text-indigo-200 hover:text-white transition-colors"
            >
                <Trash2 className="w-3 h-3" /> Reset Profile Progress
            </button>
        </div>
      </div>

      {/* Quiz Launchers */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Start a Quiz</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(QuizCategory).map((category) => (
          <button
            key={category}
            onClick={() => onStartQuiz(category)}
            className="group relative overflow-hidden bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 text-left"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-600`}>
                {getCategoryIcon(category)}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gray-50 group-hover:bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform duration-300`}>
               {getCategoryIcon(category)}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{category}</h3>
            <p className="text-sm text-gray-500">
               {catStats.find(c => c.category === category)?.attempts || 0} attempts
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};