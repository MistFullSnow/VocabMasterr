import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-6 p-8 min-h-screen bg-transparent">
    <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
    </div>
    <p className="text-slate-500 font-bold animate-pulse text-xs uppercase tracking-widest">Constructing Module...</p>
  </div>
);