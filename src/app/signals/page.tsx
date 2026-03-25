'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSignals } from '@/lib/api';
import type { Signal } from '@/lib/types';

const statuses = ['', 'init', 'pending_analysis', 'approved', 'watch', 'rejected', 'error'];
const statusColor: Record<string, string> = {
  init: 'bg-gray-500',
  pending_analysis: 'bg-blue-500',
  approved: 'bg-green-500',
  watch: 'bg-yellow-500',
  rejected: 'bg-red-500',
  error: 'bg-orange-500',
};

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const limit = 20;

  const fetchData = async () => {
    try {
      const res = await getSignals({ status: status || undefined, limit, offset: page * limit });
      setSignals(res.data);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, [status, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Signals</h1>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(0); }}
              className={`text-xs px-3 py-1 rounded-full border ${status === s ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Total: {total}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Market Cap</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Liquidity</TableHead>
                <TableHead>Twitter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <div>{s.symbol}</div>
                    <div className="text-xs text-muted-foreground">{s.token_address.slice(0, 12)}...</div>
                  </TableCell>
                  <TableCell>${Math.round(s.market_cap).toLocaleString()}</TableCell>
                  <TableCell>${s.price?.toFixed(8)}</TableCell>
                  <TableCell>${Math.round(s.liquidity).toLocaleString()}</TableCell>
                  <TableCell>
                    {s.twitter_url ? (
                      <a href={s.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">
                        Link
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${statusColor[s.status] || ''} text-white text-xs`}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 分页 */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="text-sm px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {Math.ceil(total / limit) || 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * limit >= total}
              className="text-sm px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
