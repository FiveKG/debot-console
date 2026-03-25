'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStats, getSignals, getPositions } from '@/lib/api';
import type { Stats, Signal, Position } from '@/lib/types';

const statusColor: Record<string, string> = {
  init: 'bg-gray-500',
  pending_analysis: 'bg-blue-500',
  approved: 'bg-green-500',
  watch: 'bg-yellow-500',
  rejected: 'bg-red-500',
  error: 'bg-orange-500',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [s, sig, pos] = await Promise.all([
        getStats(),
        getSignals({ limit: 10 }),
        getPositions(),
      ]);
      setStats(s.data);
      setSignals(sig.data);
      setPositions(pos.data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today Signals</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.todaySignals ?? '-'}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Approved</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats?.approved ?? '-'}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Trades</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalTrades ?? '-'}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.winRate ?? 0}%</div></CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 最近信号 */}
        <Card>
          <CardHeader><CardTitle>Recent Signals</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {signals.length === 0 && <div className="text-muted-foreground text-sm">No signals yet</div>}
              {signals.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div>
                    <span className="font-medium">{s.symbol}</span>
                    <span className="text-muted-foreground ml-2">${Math.round(s.market_cap).toLocaleString()}</span>
                  </div>
                  <Badge variant="secondary" className={`${statusColor[s.status] || ''} text-white text-xs`}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 活跃持仓 */}
        <Card>
          <CardHeader><CardTitle>Active Positions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {positions.length === 0 && <div className="text-muted-foreground text-sm">No active positions</div>}
              {positions.map((p) => {
                const multiplier = p.buy_price > 0 ? (p.current_price / p.buy_price) : 0;
                const pnl = (multiplier - 1) * 100;
                return (
                  <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <div>
                      <span className="font-medium">{p.symbol}</span>
                      <span className="text-muted-foreground ml-2">{multiplier.toFixed(2)}x</span>
                    </div>
                    <span className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
