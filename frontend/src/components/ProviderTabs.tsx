import React, { useState } from 'react';
import { ProviderResult } from '../services/api';
import { Activity, Database, AlertCircle } from 'lucide-react';

interface ProviderTabsProps {
  providers: Record<string, ProviderResult>;
}

// Map raw API keys to friendly, easy-to-understand labels for non-tech users
const labelMap: Record<string, string> = {
  pulse_count: "Community Threat Reports",
  reputation: "Safety Reputation Score",
  country_name: "Origin Country",
  country: "Origin Country",
  asn: "Network Provider",
  as_owner: "Network Owner",
  tags: "Detected Categories",
  last_analysis_date: "Last Scanned On",
  validation: "Verification Status"
};

export const ProviderTabs: React.FC<ProviderTabsProps> = ({ providers }) => {
  const providerNames = Object.keys(providers);
  const [activeProvider, setActiveProvider] = useState<string>(providerNames[0] || '');

  if (providerNames.length === 0) return null;
  const currentResult = providers[activeProvider];

  const total = (currentResult.malicious_count + currentResult.suspicious_count + currentResult.harmless_count + currentResult.undetected_count) || 1;
  const malPercent = (currentResult.malicious_count / total) * 100;
  const harmPercent = (currentResult.harmless_count / total) * 100;

  // Smart formatter that converts technical data into plain English
  const formatIntelValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') return 'Not Available';

    if (key === 'pulse_count') {
      return value === 0 ? '0 (No reports found)' : `${value} Reports Filed`;
    }
    if (key === 'reputation') {
      return value === 0 ? 'Neutral (0)' : value > 0 ? `Safe / Positive (${value})` : `Dangerous (${value})`;
    }

    // Fix for [object Object] arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      if (typeof value[0] === 'object') {
        try {
          return value.map(v => v.name || v.source || 'Verified Source').join(', ');
        } catch (e) {
          return 'System Data';
        }
      }
      return value.join(', ');
    }

    if (typeof value === 'object') return 'System Verified';

    // Format Unix Timestamps
    if ((key.includes('date') || key.includes('time')) && typeof value === 'number' && value > 1000000000) {
      return new Date(value * 1000).toLocaleString('en-IN', { 
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
    }

    return String(value);
  };

  return (
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col z-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h3 className="text-sm font-mono font-bold tracking-[0.2em] text-white uppercase flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyber-primary" />
          Engine Telemetry
        </h3>
        
        <div className="flex bg-[#030303] p-1.5 rounded-xl border border-cyber-primary/30">
          {providerNames.map((name) => (
            <button
              key={name}
              onClick={() => setActiveProvider(name)}
              className={`px-6 py-2.5 rounded-lg text-sm font-mono font-black tracking-wider transition-all duration-300 ${
                activeProvider === name
                  ? 'bg-cyber-primary text-black shadow-[0_0_20px_rgba(0,255,204,0.6)]'
                  : 'text-slate-300 hover:text-white hover:bg-cyber-primary/20'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#030303] border border-red-500/40 p-5 rounded-2xl relative overflow-hidden group hover:border-red-500 transition-all">
          <div className="text-xs font-mono text-red-400 tracking-widest mb-2 uppercase font-bold">Malicious</div>
          <div className="text-5xl font-black text-red-500 font-mono">{currentResult.malicious_count}</div>
          <div className="absolute bottom-0 left-0 h-1.5 bg-red-500 transition-all duration-1000 shadow-[0_0_15px_rgba(239,68,68,0.8)]" style={{ width: `${malPercent}%` }}></div>
        </div>
        
        <div className="bg-[#030303] border border-amber-400/40 p-5 rounded-2xl group hover:border-amber-400 transition-all">
          <div className="text-xs font-mono text-amber-400 tracking-widest mb-2 uppercase font-bold">Suspicious</div>
          <div className="text-5xl font-black text-amber-400 font-mono">{currentResult.suspicious_count}</div>
        </div>

        <div className="bg-[#030303] border border-cyber-primary/40 p-5 rounded-2xl relative overflow-hidden group hover:border-cyber-primary transition-all">
          <div className="text-xs font-mono text-cyber-primary tracking-widest mb-2 uppercase font-bold">Clean / Safe</div>
          <div className="text-5xl font-black text-cyber-primary font-mono">{currentResult.harmless_count}</div>
          <div className="absolute bottom-0 left-0 h-1.5 bg-cyber-primary transition-all duration-1000 shadow-[0_0_15px_rgba(0,255,204,0.8)]" style={{ width: `${harmPercent}%` }}></div>
        </div>

        <div className="bg-[#030303] border border-slate-600 p-5 rounded-2xl group hover:border-white transition-all">
          <div className="text-xs font-mono text-slate-300 tracking-widest mb-2 uppercase font-bold">Undetected</div>
          <div className="text-5xl font-black text-white font-mono">{currentResult.undetected_count}</div>
        </div>
      </div>

      {currentResult.error_message && (
        <div className="mb-8 p-4 bg-amber-400/20 border border-amber-400/50 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
          <p className="text-sm font-mono text-white font-bold">{currentResult.error_message}</p>
        </div>
      )}

      {/* User-friendly Details Section */}
      <div className="flex-1 bg-[#030303] border border-cyber-primary/30 rounded-2xl p-6">
        <h4 className="text-sm font-mono text-cyber-primary font-bold uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
          <Database className="w-5 h-5" /> Threat Analysis Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(currentResult.details).map(([key, value]) => {
            const displayLabel = labelMap[key] || key.replace(/_/g, ' ');
            const displayValue = formatIntelValue(key, value);
            
            return (
              <div key={key} className="flex justify-between items-center py-3 px-4 rounded-xl bg-[#0a0a0a] border border-slate-700 hover:border-cyber-primary/50 transition-colors">
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold">{displayLabel}</span>
                <span className="text-sm font-mono font-black text-white max-w-[180px] truncate text-right" title={displayValue}>
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};