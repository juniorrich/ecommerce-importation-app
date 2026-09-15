'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ClipboardList, Users, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin/reports', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/users', label: 'Customers', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full shrink-0 border-espresso-700 bg-espresso-950 md:w-56 md:border-r">
      <div className="flex flex-col gap-1 p-4 md:sticky md:top-16">
        <p className="mb-2 px-2 font-display text-sm text-ivory-100">Dashboard</p>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded px-2.5 py-2 text-sm text-sand-400 transition-colors hover:bg-espresso-800 hover:text-ivory-200',
              pathname.startsWith(href) && 'bg-espresso-800 text-gold-400'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <Link
          href="/"
          className="mt-4 flex items-center gap-2.5 border-t border-espresso-700 px-2.5 pt-4 text-sm text-sand-500 hover:text-ivory-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Storefront
        </Link>
      </div>
    </aside>
  );
}
