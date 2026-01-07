import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, Globe2, Sparkles } from 'lucide-react';

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
      <div className="w-full max-w-lg relative z-10 animate-in">
        
        <div className="mb-12 text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500/20 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/10 text-cyan-400 mb-6 shadow-2xl shadow-cyan-900/20 rotate-3 backdrop-blur-md">
                <Globe2 className="w-10 h-10" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-2">
                Vocab.
            </h1>
            <p className="text-slate-400 font-medium text-lg">
                MBA CET Intelligence Suite
            </p>
        </div>

        <div className="glass-card p-1 rounded-[2.5rem]">
            <form onSubmit={handleSubmit} className="bg-slate-900/40 rounded-[2rem] p-8 border border-white/5">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 ml-1">Identity Protocol</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-4 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-inner"
                            placeholder="agent@example.com"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-white text-slate-950 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 group hover:bg-cyan-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        Initialize Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </form>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-8 opacity-60">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Powered by Gemini 3.0
            </p>
        </div>

      </div>
    </div>
  );
};