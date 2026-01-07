import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { QuizMode } from './components/QuizMode';
import { LoginScreen } from './components/LoginScreen';
import { QuizCategory, UserProfile, Difficulty } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeCategory, setActiveCategory] = useState<QuizCategory | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

  // Check for existing session on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('vocab_master_last_user');
    if (savedEmail) {
      setUser({ email: savedEmail });
    }
  }, []);

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('vocab_master_last_user', profile.email);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveCategory(null);
    localStorage.removeItem('vocab_master_last_user');
  };

  const handleStartQuiz = (category: QuizCategory, difficulty: Difficulty) => {
    setActiveCategory(category);
    setActiveDifficulty(difficulty);
  };

  const handleExitQuiz = () => {
    setActiveCategory(null);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    // Removed bg-slate-50 and text-gray-900 to allow index.html cosmic theme to show
    <div className="min-h-screen font-sans text-slate-100 selection:bg-cyan-500/30">
      {activeCategory ? (
        <QuizMode 
          category={activeCategory} 
          difficulty={activeDifficulty} 
          user={user} 
          onExit={handleExitQuiz} 
        />
      ) : (
        <Dashboard user={user} onStartQuiz={handleStartQuiz} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;