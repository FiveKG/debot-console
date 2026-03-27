'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getConfig, updateConfig, getAccounts, createAccount, updateAccount, deleteAccount, getFinderConfig, updateFinderConfig, getSellConfig, updateSellConfig } from '@/lib/api';
import type { Account, FinderConfig, SellConfig } from '@/lib/types';

export default function ConfigPage() {
  // Engine config
  const [rules, setRules] = useState<Record<string, unknown>>({});
  const [rulesJson, setRulesJson] = useState('');
  const [configMsg, setConfigMsg] = useState('');

  // Accounts
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newProxy, setNewProxy] = useState('');
  const [accountMsg, setAccountMsg] = useState('');

  // Finder config
  const [finderCfg, setFinderCfg] = useState<FinderConfig>({ poll_interval_seconds: '1', chain: 'solana', page_size: '50' });
  const [finderMsg, setFinderMsg] = useState('');

  // Sell config
  const [sellCfg, setSellCfg] = useState<SellConfig>({
    take_profit_pct: [0.2, 0.2, 0.1, 0.2, 0.3],
    take_profit_spreads: [0.01, 0.02, 0.03, 0.03, 0.03],
    stop_loss_pct: [0.2, 0.2, 0.1, 0.2, 0.3],
    stop_loss_spreads: [0.01, 0.02, 0.03, 0.03, 0.03],
  });
  const [sellMsg, setSellMsg] = useState('');

  useEffect(() => {
    getConfig().then(r => {
      setRules(r.data);
      setRulesJson(JSON.stringify(r.data, null, 2));
    }).catch(console.error);

    getAccounts().then(r => setAccounts(r.data)).catch(console.error);

    getFinderConfig().then(r => {
      setFinderCfg(r.data);
    }).catch(console.error);

    getSellConfig().then(r => setSellCfg(r.data)).catch(console.error);
  }, []);

  const saveConfig = async () => {
    try {
      const parsed = JSON.parse(rulesJson);
      await updateConfig(parsed);
      setRules(parsed);
      setConfigMsg('Saved');
      setTimeout(() => setConfigMsg(''), 2000);
    } catch (e) {
      setConfigMsg(e instanceof Error ? e.message : 'Error');
    }
  };

  const addAccount = async () => {
    if (!newEmail || !newPwd) return;
    try {
      await createAccount({ email: newEmail, gmail_password: newPwd, proxy: newProxy || undefined });
      setNewEmail(''); setNewPwd(''); setNewProxy('');
      const r = await getAccounts();
      setAccounts(r.data);
      setAccountMsg('Added');
      setTimeout(() => setAccountMsg(''), 2000);
    } catch (e) {
      setAccountMsg(e instanceof Error ? e.message : 'Error');
    }
  };

  const removeAccount = async (id: number) => {
    await deleteAccount(id);
    const r = await getAccounts();
    setAccounts(r.data);
  };

  const toggleAccount = async (acc: Account) => {
    await updateAccount(acc.id, { enabled: !acc.enabled });
    const r = await getAccounts();
    setAccounts(r.data);
  };

  const saveSellConfig = async () => {
    try {
      if (sellCfg.take_profit_pct.length !== sellCfg.take_profit_spreads.length) {
        setSellMsg('Take profit: pct 和 spreads 长度不一致'); return;
      }
      if (sellCfg.stop_loss_pct.length !== sellCfg.stop_loss_spreads.length) {
        setSellMsg('Stop loss: pct 和 spreads 长度不一致'); return;
      }
      await updateSellConfig(sellCfg);
      setSellMsg('Saved & Hot Reloaded');
      setTimeout(() => setSellMsg(''), 2000);
    } catch (e) {
      setSellMsg(e instanceof Error ? e.message : 'Error');
    }
  };

  const updateSellArray = (field: keyof SellConfig, index: number, value: string) => {
    const arr = [...sellCfg[field]];
    arr[index] = parseFloat(value) || 0;
    setSellCfg({ ...sellCfg, [field]: arr });
  };

  const addSellLevel = (type: 'take_profit' | 'stop_loss') => {
    setSellCfg({
      ...sellCfg,
      [`${type}_pct`]: [...sellCfg[`${type}_pct`], 0.1],
      [`${type}_spreads`]: [...sellCfg[`${type}_spreads`], 0.01],
    });
  };

  const removeSellLevel = (type: 'take_profit' | 'stop_loss', index: number) => {
    setSellCfg({
      ...sellCfg,
      [`${type}_pct`]: sellCfg[`${type}_pct`].filter((_: number, i: number) => i !== index),
      [`${type}_spreads`]: sellCfg[`${type}_spreads`].filter((_: number, i: number) => i !== index),
    });
  };

  const computeTriggers = (spreads: number[]) => {
    const triggers: number[] = [];
    let sum = 0;
    for (const s of spreads) { sum += s; triggers.push(sum); }
    return triggers;
  };

  const saveFinderConfig = async () => {
    try {
      const interval = parseFloat(finderCfg.poll_interval_seconds);
      if (!interval || interval <= 0) {
        setFinderMsg('Interval must be a positive number');
        return;
      }
      await updateFinderConfig(finderCfg);
      setFinderMsg('Saved');
      setTimeout(() => setFinderMsg(''), 2000);
    } catch (e) {
      setFinderMsg(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuration</h1>

      <Tabs defaultValue="finder">
        <TabsList>
          <TabsTrigger value="finder">Finder Settings</TabsTrigger>
          <TabsTrigger value="accounts">Accounts ({accounts.length})</TabsTrigger>
          <TabsTrigger value="trading">Trading Strategy</TabsTrigger>
          <TabsTrigger value="engine">Engine Rules</TabsTrigger>
        </TabsList>

        {/* Finder 配置 */}
        <TabsContent value="finder" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Finder Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Poll Interval (seconds)</label>
                  <Input
                    type="number"
                    min={0.1}
                    step="0.5"
                    value={finderCfg.poll_interval_seconds}
                    onChange={e => setFinderCfg({ ...finderCfg, poll_interval_seconds: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Chain</label>
                  <select
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                    value={finderCfg.chain}
                    onChange={e => setFinderCfg({ ...finderCfg, chain: e.target.value })}
                  >
                    {['solana', 'bsc', 'eth', 'base', 'tron'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Page Size</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={finderCfg.page_size}
                    onChange={e => setFinderCfg({ ...finderCfg, page_size: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={saveFinderConfig}>Save</Button>
                {finderMsg && <span className="text-sm text-green-600">{finderMsg}</span>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 账号管理 */}
        <TabsContent value="accounts" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Finder Accounts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Proxy</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{a.email}</TableCell>
                      <TableCell className="text-xs">{a.proxy || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`cursor-pointer ${a.enabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
                          onClick={() => toggleAccount(a)}
                        >
                          {a.enabled ? 'ON' : 'OFF'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button onClick={() => removeAccount(a.id)} className="text-red-500 text-sm hover:underline">
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator />

              <div className="flex gap-2">
                <Input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                <Input placeholder="Gmail App Password" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                <Input placeholder="Proxy (optional)" value={newProxy} onChange={e => setNewProxy(e.target.value)} />
                <Button onClick={addAccount}>Add</Button>
              </div>
              {accountMsg && <span className="text-sm text-green-600">{accountMsg}</span>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 卖出策略 */}
        <TabsContent value="trading" className="mt-4 space-y-4">
          {/* 止盈 */}
          <Card>
            <CardHeader><CardTitle>Take Profit (阶梯止盈)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Spread (间距)</TableHead>
                    <TableHead>Trigger (触发点)</TableHead>
                    <TableHead>Sell % (卖出比例)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellCfg.take_profit_spreads.map((_, i) => {
                    const triggers = computeTriggers(sellCfg.take_profit_spreads);
                    return (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                          <Input type="number" step="0.001" min="0" className="w-24"
                            value={sellCfg.take_profit_spreads[i]}
                            onChange={e => updateSellArray('take_profit_spreads', i, e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">+{(triggers[i] * 100).toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" min="0" max="1" className="w-24"
                            value={sellCfg.take_profit_pct[i]}
                            onChange={e => updateSellArray('take_profit_pct', i, e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <button onClick={() => removeSellLevel('take_profit', i)} className="text-red-500 text-sm hover:underline">Remove</button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="flex items-center gap-4 mt-2">
                <Button variant="outline" size="sm" onClick={() => addSellLevel('take_profit')}>+ Add Level</Button>
                <span className="text-xs text-muted-foreground">
                  Pct Sum: {sellCfg.take_profit_pct.reduce((a, b) => a + b, 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 止损 */}
          <Card>
            <CardHeader><CardTitle>Stop Loss (阶梯止损)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Spread (间距)</TableHead>
                    <TableHead>Trigger (触发点)</TableHead>
                    <TableHead>Sell % (卖出比例)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellCfg.stop_loss_spreads.map((_, i) => {
                    const triggers = computeTriggers(sellCfg.stop_loss_spreads);
                    return (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                          <Input type="number" step="0.001" min="0" className="w-24"
                            value={sellCfg.stop_loss_spreads[i]}
                            onChange={e => updateSellArray('stop_loss_spreads', i, e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">-{(triggers[i] * 100).toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" min="0" max="1" className="w-24"
                            value={sellCfg.stop_loss_pct[i]}
                            onChange={e => updateSellArray('stop_loss_pct', i, e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <button onClick={() => removeSellLevel('stop_loss', i)} className="text-red-500 text-sm hover:underline">Remove</button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="flex items-center gap-4 mt-2">
                <Button variant="outline" size="sm" onClick={() => addSellLevel('stop_loss')}>+ Add Level</Button>
                <span className="text-xs text-muted-foreground">
                  Pct Sum: {sellCfg.stop_loss_pct.reduce((a, b) => a + b, 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button onClick={saveSellConfig}>Save & Hot Reload</Button>
            {sellMsg && <span className="text-sm text-green-600">{sellMsg}</span>}
          </div>
        </TabsContent>

        {/* Engine 规则 */}
        <TabsContent value="engine" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Engine Decision Rules (config.json)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full h-80 font-mono text-sm border rounded p-3"
                value={rulesJson}
                onChange={e => setRulesJson(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button onClick={saveConfig}>Save</Button>
                {configMsg && <span className="text-sm text-green-600">{configMsg}</span>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
