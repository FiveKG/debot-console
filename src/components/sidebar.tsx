'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEngineStatus } from '@/lib/api';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/signals', label: 'Signals', icon: '📡' },
  { href: '/trades', label: 'Trades', icon: '💰' },
  { href: '/analysis', label: 'Analysis', icon: '🧠' },
  { href: '/config', label: 'Config', icon: '⚙️' },
  { href: '/system', label: 'System', icon: '🖥️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mode, setMode] = useState<string>('');

  useEffect(() => {
    getEngineStatus().then(r => setMode(r.mode || 'unknown')).catch(() => setMode('offline'));
    const timer = setInterval(() => {
      getEngineStatus().then(r => setMode(r.mode || 'unknown')).catch(() => setMode('offline'));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="w-56 border-r bg-muted/30 p-4 flex flex-col gap-1">
      <div className="font-bold text-lg mb-2 px-2">Debot Console</div>

      {mode && (
        <div className={`text-xs font-medium px-3 py-1.5 rounded mb-3 text-center ${
          mode === 'test' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
          mode === 'production' ? 'bg-red-100 text-red-800 border border-red-300' :
          'bg-gray-100 text-gray-600 border border-gray-300'
        }`}>
          {mode === 'test' ? '🧪 TEST MODE' : mode === 'production' ? '🔴 PRODUCTION' : '⚪ ' + mode.toUpperCase()}
        </div>
      )}

      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
            pathname.startsWith(item.href)
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </aside>
  );
}
