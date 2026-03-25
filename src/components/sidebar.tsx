'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <aside className="w-56 border-r bg-muted/30 p-4 flex flex-col gap-1">
      <div className="font-bold text-lg mb-4 px-2">Debot Console</div>
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
