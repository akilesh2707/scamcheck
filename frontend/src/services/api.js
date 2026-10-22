import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const client = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the auth token, when present, to every outgoing request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('scamcheck_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const reportMatch = config.url?.match(/\/analyze\/([a-zA-Z0-9_-]+)$/);
  if (reportMatch && !config.headers['X-Report-Token']) {
    const reportId = reportMatch[1];
    const reportToken = localStorage.getItem(`scamcheck_report_token_${reportId}`);
    if (reportToken) {
      config.headers['X-Report-Token'] = reportToken;
    }
  }
  return config;
});

/**
 * Normalizes any failure (network, timeout, HTTP error) into a single
 * shape the UI can render without knowing which layer failed.
 */
export class ApiError extends Error {
  constructor({ message, code, status, details, retryAfter }) {
    super(message);
    this.name = 'ApiError';
    this.code = code || 'UNKNOWN_ERROR';
    this.status = status ?? null;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

function normalizeError(error) {
  if (axios.isCancel?.(error)) {
    return new ApiError({ message: 'Request cancelled', code: 'CANCELLED' });
  }

  if (error.code === 'ECONNABORTED') {
    return new ApiError({
      message: "This is taking longer than expected. The analysis service may be busy — please try again.",
      code: 'TIMEOUT',
    });
  }

  if (!error.response) {
    return new ApiError({
      message: "ScamCheck can't reach the analysis service right now. Make sure the backend is running and try again.",
      code: 'NETWORK_ERROR',
    });
  }

  const { status, data } = error.response;
  const serverError = data?.error;

  if (status === 429) {
    const retryAfter = Number(error.response.headers?.['retry-after']) || serverError?.details?.retryAfter;
    return new ApiError({
      message: 'Too many requests. Please wait a moment and try again.',
      code: 'RATE_LIMIT_EXCEEDED',
      status,
      retryAfter,
    });
  }

  if (status === 401) {
    return new ApiError({
      message: serverError?.message || 'Please sign in to continue.',
      code: serverError?.code || 'UNAUTHORIZED',
      status,
    });
  }

  if (status === 404) {
    return new ApiError({
      message: serverError?.message || 'We could not find what you were looking for.',
      code: serverError?.code || 'NOT_FOUND',
      status,
    });
  }

  if (status === 400) {
    let msg = serverError?.message || 'Paste an opportunity message or enter a valid URL.';
    if (serverError?.code === 'SCAMCHECK_INVALID_INPUT' && Array.isArray(serverError?.details) && serverError.details.length > 0) {
      msg = serverError.details[0].message;
    }

    return new ApiError({
      message: msg,
      code: serverError?.code || 'INVALID_INPUT',
      status,
      details: serverError?.details,
    });
  }

  if (status === 501) {
    return new ApiError({
      message: serverError?.message || 'This input type is not supported yet.',
      code: 'NOT_IMPLEMENTED',
      status,
    });
  }

  if (status >= 500) {
    return new ApiError({
      message: 'Something went wrong on our end while analyzing this. Please try again shortly.',
      code: serverError?.code || 'INTERNAL_SERVER_ERROR',
      status,
    });
  }

  return new ApiError({
    message: serverError?.message || 'Something unexpected happened.',
    code: serverError?.code || 'UNKNOWN_ERROR',
    status,
  });
}

async function request(fn) {
  try {
    const res = await fn();
    if (res.data && res.data.success === false) {
      throw normalizeError({ response: { status: res.status, data: res.data } });
    }
    return res.data?.data ?? res.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw normalizeError(error);
  }
}

export const api = {
  health: () => request(() => client.get('/health')),

  analyzeText: (text, userProfile) =>
    request(() => client.post('/analyze', { inputType: 'text', text, ...(userProfile ? { userProfile } : {}) })),

  analyzeUrl: (url, userProfile) =>
    request(() => client.post('/analyze', { inputType: 'url', url, ...(userProfile ? { userProfile } : {}) })),

  analyzeScreenshot: (file, userProfile) =>
    request(() => {
      const formData = new window.FormData();
      formData.append('inputType', 'screenshot');
      formData.append('file', file);
      if (userProfile) {
        formData.append('userProfile', JSON.stringify(userProfile));
      }
      return client.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }),

  analyzePdf: (file, userProfile) =>
    request(() => {
      const formData = new window.FormData();
      formData.append('inputType', 'pdf');
      formData.append('file', file);
      if (userProfile) {
        formData.append('userProfile', JSON.stringify(userProfile));
      }
      return client.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }),

  getReport: (id, token) =>
    request(() => {
      const reportToken = token || localStorage.getItem(`scamcheck_report_token_${id}`);
      const headers = reportToken ? { 'X-Report-Token': reportToken } : {};
      return client.get(`/analyze/${id}`, { headers });
    }),

  getHistory: (page = 1, limit = 20) =>
    request(() => client.get('/analyze/history', { params: { page, limit } })),

  register: (email, password, name) =>
    request(() => client.post('/auth/register', { email, password, name })),

  login: (email, password) => request(() => client.post('/auth/login', { email, password })),

  me: () => request(() => client.get('/auth/me')),

  getUserProfile: () => request(() => client.get('/auth/user-profile')),

  updateUserProfile: (profile) => request(() => client.put('/auth/user-profile', profile)),

  getExtensionCode: () => request(() => client.post('/auth/extension/code')),
};

export function isValidUrl(value) {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
