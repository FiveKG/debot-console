'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SystemPage() {
  const [engineStatus, setEngineStatus] = useState<string>('unknown');
  const [finderStatus, setFinderStatus] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    try {
      const engineApi = process.env.NEXT_PUBLIC_ENGINE_API || 'http://localhost:3001';
      const finderApi = process.env.NEXT_PUBLIC_FINDER_API || 'http://localhost:8000';

      // Engine
      try {
        const r = await fetch(`${engineApi}/api/status`);
        const d = await r.json();
        setEngineStatus(d.status || 'error');
      } catch {
        setEngineStatus('offline');
      }

      // Finder
      try {
        const r = await fetch(`${finderApi}/api/status`);
        const d = await r.json();
        setFinderStatus(d.scraper || null);
      } catch {
        setFinderStatus(null);
      }

      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Status</h1>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Engine */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Debot Engine</span>
              <Badge variant="secondary" className={engineStatus === 'running' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                {engineStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port</span>
                <span>3001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endpoint</span>
                <span>/api/notify</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Debot Finder</span>
              <Badge variant="secondary" className={finderStatus ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                {finderStatus ? 'running' : 'offline'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {finderStatus ? (
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Rounds</span>
                  <span>{(finderStatus as Record<string, unknown>).total_rounds as number ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Errors</span>
                  <span>{(finderStatus as Record<string, unknown>).total_errors as number ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Tokens Found</span>
                  <span>{(finderStatus as Record<string, unknown>).total_new_tokens as number ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Poll Interval</span>
                  <span>{(finderStatus as Record<string, unknown>).poll_interval as number ?? '-'}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Scrape</span>
                  <span className="text-xs">{(finderStatus as Record<string, unknown>).last_scrape as string ?? '-'}</span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Finder is offline</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
