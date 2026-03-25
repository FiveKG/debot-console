const BASE = process.env.NEXT_PUBLIC_ENGINE_API || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

// ─── 数据查询 ───

export const getStats = () => request<{ code: number; data: import('./types').Stats }>('/api/stats');

export const getSignals = (params?: { status?: string; limit?: number; offset?: number }) => {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.offset) q.set('offset', String(params.offset));
  return request<{ code: number; data: import('./types').Signal[]; total: number }>(`/api/signals?${q}`);
};

export const getSignal = (address: string) =>
  request<{ code: number; data: import('./types').Signal }>(`/api/signals/${address}`);

export const getTrades = (limit = 50) =>
  request<{ code: number; data: import('./types').Trade[] }>(`/api/trades?limit=${limit}`);

export const getPositions = () =>
  request<{ code: number; data: import('./types').Position[] }>('/api/positions');

export const getAnalysisHistory = (params?: { limit?: number; narrative_type?: string }) => {
  const q = new URLSearchParams();
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.narrative_type) q.set('narrative_type', params.narrative_type);
  return request<{ code: number; data: unknown[] }>(`/api/analysis/history?${q}`);
};

export const getPatterns = () =>
  request<{ code: number; data: { narrative_type: string; total: number; approved: number; rejected: number }[] }>('/api/analysis/patterns');

export const getNarratives = () =>
  request<{ code: number; data: import('./types').NarrativeGroup[] }>('/api/narratives');

// ─── 系统状态 ───

export const getStatus = () => request<{ code: number; status: string }>('/api/status');

// ─── Engine 配置 ───

export const getConfig = () => request<{ code: number; data: Record<string, unknown> }>('/api/config');

export const updateConfig = (rules: Record<string, unknown>) =>
  request<{ code: number }>('/api/config', { method: 'PUT', body: JSON.stringify({ rules }) });

// ─── 账号管理 ───

export const getAccounts = () =>
  request<{ code: number; data: import('./types').Account[] }>('/api/accounts');

export const createAccount = (data: { email: string; gmail_password: string; proxy?: string }) =>
  request<{ code: number; data: import('./types').Account }>('/api/accounts', { method: 'POST', body: JSON.stringify(data) });

export const updateAccount = (id: number, data: Partial<{ email: string; gmail_password: string; proxy: string | null; enabled: boolean }>) =>
  request<{ code: number }>(`/api/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteAccount = (id: number) =>
  request<{ code: number }>(`/api/accounts/${id}`, { method: 'DELETE' });

// ─── Finder 配置 ───

export const getFinderConfig = () =>
  request<{ code: number; data: import('./types').FinderConfig; minInterval: number }>('/api/finder/config');

export const updateFinderConfig = (data: Partial<import('./types').FinderConfig>) =>
  request<{ code: number }>('/api/finder/config', { method: 'PUT', body: JSON.stringify(data) });
