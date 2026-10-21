import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export interface ProviderResult {
  provider_name: string;
  status: string;
  malicious_count: number;
  suspicious_count: number;
  harmless_count: number;
  undetected_count: number;
  details: Record<string, any>;
  error_message?: string;
}

export interface InvestigationResponse {
  indicator: string;
  indicator_type: string;
  risk_score: number;
  severity: string;
  providers: Record<string, ProviderResult>;
  summary: string;
  timestamp: string;
}

export const investigateIndicator = async (indicator: string, indicatorType?: string): Promise<InvestigationResponse> => {
  const response = await api.post<InvestigationResponse>('/api/v1/investigate', {
    indicator,
    indicator_type: indicatorType || null,
  });
  return response.data;
};

export const exportHistoryCsv = async (): Promise<void> => {
  const response = await api.get('/api/v1/history/export', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'threat_intelligence_report.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};