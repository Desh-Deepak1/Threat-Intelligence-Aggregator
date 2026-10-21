import React from 'react';
import { Download, History, FileSpreadsheet } from 'lucide-react';
import { exportHistoryCsv } from '../services/api';

interface HistoryTableProps {
  onExport: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ onExport }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Investigation Logs & Reports</h3>
        </div>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-all flex items-center space-x-2 border border-slate-700"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export CSV Report</span>
        </button>
      </div>

      <div className="text-center py-8 text-slate-500 text-xs">
        Active investigation logs are recorded during your current session. Click export above to download your CSV report.
      </div>
    </div>
  );
};