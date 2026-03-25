'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPatterns, getNarratives } from '@/lib/api';
import type { NarrativeGroup } from '@/lib/types';

export default function AnalysisPage() {
  const [patterns, setPatterns] = useState<{ narrative_type: string; total: number; approved: number; rejected: number }[]>([]);
  const [narratives, setNarratives] = useState<NarrativeGroup[]>([]);

  useEffect(() => {
    getPatterns().then(r => setPatterns(r.data)).catch(console.error);
    getNarratives().then(r => setNarratives(r.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analysis</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 叙事类型统计 */}
        <Card>
          <CardHeader><CardTitle>Narrative Patterns</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Narrative</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Rejected</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patterns.map((p) => (
                  <TableRow key={p.narrative_type}>
                    <TableCell className="font-medium">{p.narrative_type}</TableCell>
                    <TableCell>{p.total}</TableCell>
                    <TableCell className="text-green-600">{p.approved}</TableCell>
                    <TableCell className="text-red-600">{p.rejected}</TableCell>
                    <TableCell>{p.total > 0 ? Math.round(p.approved / p.total * 100) : 0}%</TableCell>
                  </TableRow>
                ))}
                {patterns.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-muted-foreground">No data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 叙事消耗追踪 */}
        <Card>
          <CardHeader><CardTitle>Narrative Groups</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Narrative</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Peak MC</TableHead>
                  <TableHead>Consumed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {narratives.map((n) => {
                  const tokens = JSON.parse(n.tokens || '[]');
                  return (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium text-sm">{n.narrative_key.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{tokens.length}</TableCell>
                      <TableCell>${Math.round(n.peak_market_cap).toLocaleString()}</TableCell>
                      <TableCell>
                        {n.is_consumed ? (
                          <span className="text-red-500">{n.consumed_symbol || 'Yes'}</span>
                        ) : (
                          <span className="text-green-500">Active</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {narratives.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-muted-foreground">No data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
