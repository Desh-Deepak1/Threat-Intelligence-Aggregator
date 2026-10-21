import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { RiskGauge } from './components/RiskGauge';
import { ProviderTabs } from './components/ProviderTabs';
import { investigateIndicator, exportHistoryCsv, InvestigationResponse } from './services/api';
import { AlertTriangle, Crosshair, Download } from 'lucide-react';

export default function App() {
  const [currentResult, setCurrentResult] = useState<InvestigationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInvestigate = async (indicator: string, type?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await investigateIndicator(indicator, type);
      setCurrentResult(data);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.response?.data?.detail || 'System link failure. Unable to fetch threat intelligence.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportHistoryCsv();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen cyber-grid flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10">
        <SearchBar onInvestigate={handleInvestigate} isLoading={isLoading} />

        {errorMessage && (
          <div className="glass-panel !border-red-500/50 p-5 rounded-2xl flex items-center space-x-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
            <span className="text-red-400 font-mono text-sm tracking-wide">{errorMessage}</span>
          </div>
        )}

        {currentResult ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              <div className="lg:col-span-1">
                <RiskGauge
                  score={currentResult.risk_score}
                  severity={currentResult.severity}
                  summary={currentResult.summary}
                />
              </div>
              <div className="lg:col-span-2">
                <ProviderTabs providers={currentResult.providers} />
              </div>
            </div>
            
            {/* Custom CSV Download Button */}
            <div className="flex justify-end">
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-[#040114]/80 border-2 border-cyber-secondary/30 hover:border-cyber-primary text-cyber-primary hover:text-white font-mono text-xs font-bold tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center gap-3"
              >
                <Download className="w-4 h-4" />
                EXPORT CSV REPORT
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-20 text-center flex flex-col items-center justify-center relative z-0">
            <div className="relative">
              <div className="absolute inset-0 bg-cyber-primary/20 blur-2xl rounded-full"></div>
              <Crosshair className="w-16 h-16 text-cyber-primary mb-6 relative z-10 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3 tracking-widest uppercase">Target Acquisition Standby</h3>
            <p className="text-slate-400 max-w-lg mx-auto font-mono text-sm">
              Input network indicator (IP, Domain, URL, or Hash) to initiate multi-engine threat analysis sequence.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}