import React from 'react';
import { Skull, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  severity: string;
  summary: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, severity, summary }) => {
  const isCritical = score >= 75;
  const isWarning = score >= 25 && score < 75;
  
  const colorClass = isCritical ? 'text-red-500' : isWarning ? 'text-amber-400' : 'text-cyber-green';
  const shadowClass = isCritical ? 'shadow-[0_0_40px_rgba(239,68,68,0.4)]' : isWarning ? 'shadow-[0_0_40px_rgba(251,191,36,0.4)]' : 'shadow-[0_0_40px_rgba(0,255,136,0.4)]';

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`glass-panel rounded-3xl p-8 flex flex-col items-center justify-center h-full relative overflow-hidden ${isCritical ? 'border-red-500/50' : ''}`}>
      <h3 className="text-xs font-mono font-bold tracking-[0.3em] text-slate-400 uppercase mb-8">Threat Level</h3>
      
      <div className={`relative flex items-center justify-center rounded-full ${shadowClass} mb-8`}>
        <svg className="w-48 h-48 transform -rotate-90">
          <circle cx="96" cy="96" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
          <circle
            cx="96" cy="96" r={radius}
            stroke="currentColor" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className={`fill-none transition-all duration-1500 ease-out ${colorClass}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          {isCritical ? <Skull className="w-10 h-10 text-red-500 mb-2 animate-pulse" /> : isWarning ? <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" /> : <ShieldCheck className="w-10 h-10 text-cyber-green mb-2" />}
          <span className="text-4xl font-black text-white font-mono">{score}</span>
        </div>
      </div>

      <div className={`px-6 py-2 rounded-full border font-black tracking-widest uppercase text-sm mb-6 ${isCritical ? 'bg-red-500/10 border-red-500 text-red-500' : isWarning ? 'bg-amber-400/10 border-amber-400 text-amber-400' : 'bg-cyber-green/10 border-cyber-green text-cyber-green'}`}>
        {severity}
      </div>

      <p className="text-sm text-slate-400 text-center font-mono leading-relaxed">{summary}</p>
    </div>
  );
};