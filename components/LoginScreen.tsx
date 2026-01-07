import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, Globe2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10">
        
        <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-slate-900 text-white mb-6 shadow-2xl rotate-3">
                <Globe2 className="w-10 h-10" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-2">
                Vocab.
            </h1>
            <p className="text-slate-500 font-medium text-lg">
                MBA CET Intelligence Suite
            </p>
        </div>

        <div className="abstract-card p-2 rounded-[2rem]">
            <form onSubmit={handleSubmit} className="bg-white/50 rounded-[1.5rem] p-8 border border-white/50">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Identity</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full btn-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 group"
                    >
                        Begin Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </form>
        </div>
        
        <p className="text-center mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Powered by Gemini 3.0
        </p>

      </div>
    </div>
  );
};