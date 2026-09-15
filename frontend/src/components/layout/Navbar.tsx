'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const links = [
  { href: '/products', label: 'Catalogue' },
  { href: '/orders', label: 'Track an order' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-espresso-700 bg-espresso-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-lg tracking-tight text-ivory-100">
          Kwabena&nbsp;&amp;&nbsp;Co.
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm text-sand-400 transition-colors hover:text-ivory-200',
                pathname.startsWith(link.href) && 'text-gold-400'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {isAdmin && (
            <Link
              href="/admin/products"
              className="flex items-center gap-1.5 text-sm text-sand-400 hover:text-ivory-200"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
          <Link href="/cart" className="relative text-sand-400 hover:text-ivory-200">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-semibold text-espresso-950">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3 border-l border-espresso-700 pl-5">
              <span className="text-sm text-sand-400">{user.name.split(' ')[0]}</span>
              <button
                onClick={logout}
                aria-label="Log out"
                className="text-sand-500 hover:text-ivory-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 border-l border-espresso-700 pl-5 text-sm text-sand-400 hover:text-ivory-200"
            >
              <UserIcon className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>

        <button
          className="text-ivory-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-espresso-700 md:hidden"
          >
            <div className="flex flex-col gap-4 px-5 py-5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-sand-300"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/cart" onClick={() => setOpen(false)} className="text-sm text-sand-300">
                Cart{itemCount > 0 ? ` (${itemCount})` : ''}
              </Link>
              {isAdmin && (
                <Link href="/admin/products" onClick={() => setOpen(false)} className="text-sm text-sand-300">
                  Dashboard
                </Link>
              )}
              {user ? (
                <button onClick={logout} className="text-left text-sm text-sand-300">
                  Log out
                </button>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="text-sm text-sand-300">
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
