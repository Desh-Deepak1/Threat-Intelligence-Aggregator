import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ScanLine, ChevronDown, Check } from 'lucide-react';

interface SearchBarProps {
  onInvestigate: (indicator: string, type?: string) => void;
  isLoading: boolean;
}

const vectorOptions = [
  { id: '', label: 'AUTO DETECT' },
  { id: 'ip', label: 'IPv4 / IPv6' },
  { id: 'domain', label: 'DOMAIN' },
  { id: 'url', label: 'URL TARGET' },
  { id: 'hash', label: 'SHA256 / MD5' }
];

export const SearchBar: React.FC<SearchBarProps> = ({ onInvestigate, isLoading }) => {
  const [indicator, setIndicator] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicator.trim() || isLoading) return;
    onInvestigate(indicator.trim(), selectedType || undefined);
    setIsDropdownOpen(false);
  };

  const currentSelectionLabel = vectorOptions.find(opt => opt.id === selectedType)?.label;

  return (
    // z-[100] added here to force SearchBar above all other elements
    <div className="glass-panel rounded-3xl relative group z-[100]">
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-cyber-secondary/30 rounded-full blur-[100px] transition-all group-hover:bg-cyber-primary/30"></div>
      </div>
      
      <div className="p-8 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col xl:flex-row gap-5">
            
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <ScanLine className="w-6 h-6 text-cyber-primary" />
              </div>
              <input
                type="text"
                value={indicator}
                onChange={(e) => setIndicator(e.target.value)}
                placeholder="Inject payload (IP, Domain, Hash)..."
                className="w-full pl-16 pr-6 py-5 bg-[#030303] border-2 border-cyber-primary/40 rounded-2xl text-white font-bold placeholder-slate-400 focus:outline-none focus:border-cyber-primary focus:shadow-[0_0_30px_rgba(0,255,204,0.4)] font-mono text-base transition-all relative z-10"
              />
            </div>
            
            <div className="flex flex-wrap sm:flex-nowrap gap-4">
              
              <div className="relative min-w-[220px]" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-full px-6 py-5 flex items-center justify-between bg-[#030303] border-2 border-cyber-primary/40 rounded-2xl text-cyber-primary text-sm font-mono focus:outline-none hover:border-cyber-primary hover:shadow-[0_0_25px_rgba(0,255,204,0.4)] transition-all relative z-10"
                >
                  <span className="tracking-widest font-black">{currentSelectionLabel}</span>
                  <ChevronDown className={`w-6 h-6 text-cyber-primary transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu with fixed positioning relative to parent */}
                {isDropdownOpen && (
                  <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-[#0d0d12] border-2 border-cyber-primary rounded-xl shadow-[0_15px_50px_rgba(0,255,204,0.2)] overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2">
                    {vectorOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedType(opt.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-6 py-4 text-sm font-mono font-bold tracking-widest transition-colors flex items-center justify-between hover:bg-cyber-primary hover:text-black ${
                          selectedType === opt.id ? 'bg-cyber-primary text-black' : 'text-white'
                        }`}
                      >
                        {opt.label}
                        {selectedType === opt.id && <Check className="w-5 h-5 text-black" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !indicator.trim()}
                className="px-12 py-5 bg-cyber-primary hover:bg-white disabled:opacity-50 text-black font-black tracking-widest text-lg rounded-2xl transition-all duration-300 flex items-center justify-center flex-1 sm:flex-none shadow-[0_0_30px_rgba(0,255,204,0.6)] hover:shadow-[0_0_50px_rgba(255,255,255,0.8)] uppercase"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3 text-black" />
                    Scanning
                  </>
                ) : (
                  'Execute'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};