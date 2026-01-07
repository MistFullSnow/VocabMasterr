import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LogIn, UserCircle2, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin({ email: email.trim().toLowerCase() });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-violet-200 rounded-full blur-[80px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-fuchsia-200 rounded-full blur-[80px] opacity-60"></div>

      <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full border border-white/50 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-200 rotate-3 transform hover:rotate-6 transition-transform">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">
            Vocab<span className="text-violet-600">Master</span>
          </h1>
          <p className="text-gray-500 mt-3 text-center text-sm font-medium leading-relaxed">
            Your intelligent companion for MBA CET Verbal Ability.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
              Email Address
            </label>
            <div className="relative">
                <UserCircle2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none text-gray-900 font-medium placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
          >
            Start Learning <LogIn className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                Progress stored locally
            </p>
        </div>
      </div>
    </div>
  );
};