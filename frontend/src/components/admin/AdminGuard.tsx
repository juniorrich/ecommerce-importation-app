'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-400" strokeWidth={1.25} />
          <h1 className="mt-4 font-display text-2xl text-ivory-100">Restricted area</h1>
          <p className="mt-2 text-sm text-sand-400">
            This section is for administrators only. If that's you, sign in
            with an admin account.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded bg-gold-500 px-6 py-2.5 text-sm font-medium text-espresso-950 hover:bg-gold-400"
          >
            Back to the storefront
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
