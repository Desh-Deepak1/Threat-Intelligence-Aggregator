import React from 'react';
import { Hexagon, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-cyber-primary/30 bg-cyber-bg/80 backdrop-blur-xl relative z-50 shadow-[0_4px_30px_rgba(0,255,204,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-cyber-primary/50 blur-md rounded-lg"></div>
            <Hexagon className="w-10 h-10 text-cyber-primary relative z-10 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-white">
              ThreatNexus <span className="text-white text-lg tracking-normal">by Deepak</span>
            </h1>
            <p className="text-[11px] text-cyber-primary font-mono tracking-[0.15em] uppercase mt-1 opacity-90">
              One Search. Unified Threat Intelligence.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-3 px-4 py-2 rounded-full border border-cyber-secondary/40 bg-cyber-secondary/10 shadow-[0_0_15px_rgba(176,38,255,0.2)]">
          <Activity className="w-4 h-4 text-cyber-secondary animate-pulse" />
          <span className="text-cyber-secondary text-xs font-mono font-bold tracking-widest">SYSTEM ONLINE</span>
        </div>
      </div>
    </header>
  );
};