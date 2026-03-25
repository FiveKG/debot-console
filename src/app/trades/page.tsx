'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTrades, getPositions } from '@/lib/api';
import type { Trade, Position } from '@/lib/types';

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    getTrades(100).then(r => setTrades(r.data)).catch(console.error);
    getPositions().then(r => setPositions(r.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trades & Positions</h1>

      <Tabs defaultValue="positions">
        <TabsList>
          <TabsTrigger value="positions">Active Positions ({positions.length})</TabsTrigger>
          <TabsTrigger value="history">Trade History ({trades.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.length === 0 && <div className="text-muted-foreground">No active positions</div>}
            {positions.map((p) => {
              const multiplier = p.buy_price > 0 ? p.current_price / p.buy_price : 0;
              const pnl = (multiplier - 1) * 100;
              const tpHit = JSON.parse(p.tp_levels_hit || '[]');
              return (
                <Card key={p.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between">
                      <span>{p.symbol}</span>
                      <span className={`text-lg ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {multiplier.toFixed(2)}x
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buy Price</span>
                      <span>${p.buy_price?.toFixed(8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current</span>
                      <span>${p.current_price?.toFixed(8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PnL</span>
                      <span className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining</span>
                      <span>{p.remaining_percent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TP Hit</span>
                      <span>{tpHit.length > 0 ? tpHit.map((t: number) => `${t}x`).join(', ') : 'None'}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>SOL Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>PnL</TableHead>
                    <TableHead>TX</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={t.action === 'buy' ? 'default' : 'secondary'}>
                          {t.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.sol_amount?.toFixed(4)} SOL</TableCell>
                      <TableCell>${t.price?.toFixed(8)}</TableCell>
                      <TableCell>
                        {t.pnl_percent != null ? (
                          <span className={t.pnl_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {t.pnl_percent >= 0 ? '+' : ''}{t.pnl_percent.toFixed(1)}%
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {t.txid ? (
                          <a href={`https://solscan.io/tx/${t.txid}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">
                            {t.txid.slice(0, 8)}...
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
