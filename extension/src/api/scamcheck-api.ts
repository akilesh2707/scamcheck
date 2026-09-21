import type { AnalysisReport, AnalyzeRequest } from '../types/analysis';

const DEFAULT_API_URL = 'http://localhost:5001';
const API_URL = import.meta.env.VITE_SCAMCHECK_API_URL || DEFAULT_API_URL;

let currentToken: string | null = null;

export function setAuthToken(token: string) {
  currentToken = token;
}

function getHeaders(isFormData = false) {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  return headers;
}

export async function analyzePageText(text: string): Promise<AnalysisReport> {
  const payload: AnalyzeRequest = {
    inputType: 'text',
    text
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || `API Error: ${response.status}`);
    }

    return result.data as AnalysisReport;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Analysis request timed out.');
    }
    throw error;
  }
}

export async function analyzeImage(blob: Blob): Promise<AnalysisReport> {
  const formData = new FormData();
  formData.append('inputType', 'screenshot');
  formData.append('file', blob);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for images

  try {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || `API Error: ${response.status}`);
    }

    return result.data as AnalysisReport;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Analysis request timed out.');
    }
    throw error;
  }
}

export async function exchangePairingCode(code: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/auth/extension/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || `API Error: ${response.status}`);
  }
  
  return result.data.token;
}
