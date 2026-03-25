const ENGINE_BASE = process.env.NEXT_PUBLIC_ENGINE_API || 'http://localhost:3002';
const FINDER_BASE = process.env.NEXT_PUBLIC_FINDER_API || 'http://localhost:3001';

async function request<T>(base: string, path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

const engine = <T>(path: string, options?: RequestInit) => request<T>(ENGINE_BASE, path, options);
const finder = <T>(path: string, options?: RequestInit) => request<T>(FINDER_BASE, path, options);

// ─── Engine 数据查询 ───

export const getStats = () => engine<{ code: number; data: import('./types').Stats }>('/api/stats');

export const getSignals = (params?: { status?: string; limit?: number; offset?: number }) => {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.offset) q.set('offset', String(params.offset));
  return engine<{ code: number; data: import('./types').Signal[]; total: number }>(`/api/signals?${q}`);
};

export const getSignal = (address: string) =>
  engine<{ code: number; data: import('./types').Signal }>(`/api/signals/${address}`);

export const getTrades = (limit = 50) =>
  engine<{ code: number; data: import('./types').Trade[] }>(`/api/trades?limit=${limit}`);

export const getPositions = () =>
  engine<{ code: number; data: import('./types').Position[] }>('/api/positions');

export const getAnalysisHistory = (params?: { limit?: number; narrative_type?: string }) => {
  const q = new URLSearchParams();
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.narrative_type) q.set('narrative_type', params.narrative_type);
  return engine<{ code: number; data: unknown[] }>(`/api/analysis/history?${q}`);
};

export const getPatterns = () =>
  engine<{ code: number; data: { narrative_type: string; total: number; approved: number; rejected: number }[] }>('/api/analysis/patterns');

export const getNarratives = () =>
  engine<{ code: number; data: import('./types').NarrativeGroup[] }>('/api/narratives');

// ─── Engine 状态 + 配置 ───

export const getEngineStatus = () => engine<{ code: number; status: string; mode: string }>('/api/status');

export const getConfig = () => engine<{ code: number; data: Record<string, unknown> }>('/api/config');

export const updateConfig = (rules: Record<string, unknown>) =>
  engine<{ code: number }>('/api/config', { method: 'PUT', body: JSON.stringify({ rules }) });

// ─── Finder 账号管理（调用 finder API）───

export const getAccounts = () =>
  finder<{ code: number; data: import('./types').Account[] }>('/api/accounts');

export const createAccount = (data: { email: string; gmail_password: string; proxy?: string }) =>
  finder<{ code: number; data: import('./types').Account }>('/api/accounts', { method: 'POST', body: JSON.stringify(data) });

export const updateAccount = (id: number, data: Partial<{ email: string; gmail_password: string; proxy: string | null; enabled: boolean }>) =>
  finder<{ code: number }>(`/api/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteAccount = (id: number) =>
  finder<{ code: number }>(`/api/accounts/${id}`, { method: 'DELETE' });

// ─── Finder 配置（调用 finder API）───

export const getFinderConfig = () =>
  finder<{ code: number; data: import('./types').FinderConfig; minInterval: number }>('/api/finder/config');

export const updateFinderConfig = (data: Partial<import('./types').FinderConfig>) =>
  finder<{ code: number }>('/api/finder/config', { method: 'PUT', body: JSON.stringify(data) });

export const getFinderStatus = () =>
  finder<{ code: number; scraper: Record<string, unknown> }>('/api/status');
