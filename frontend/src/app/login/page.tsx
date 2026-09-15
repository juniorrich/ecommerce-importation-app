'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-64px)] md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-espresso-950 p-12 md:flex">
        <p className="font-display text-lg text-ivory-100">Kwabena &amp; Co.</p>
        <blockquote className="font-display text-2xl italic leading-snug text-ivory-200">
          "Every parcel carries a manifest code from the moment it leaves
          origin — so does every account."
        </blockquote>
        <p className="text-xs text-sand-500">Curated imports, cleared and delivered.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center px-6 py-16"
      >
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl text-ivory-100">Welcome back</h1>
          <p className="mt-1.5 text-sm text-sand-400">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? 'Signing in' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-sand-400">
            New here?{' '}
            <Link href="/register" className="text-gold-400 hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-8 rounded border border-espresso-700 bg-espresso-800 p-3.5 text-xs text-sand-500">
            <p className="text-sand-400">Demo accounts</p>
            <p className="mt-1">Admin — admin@example.com / admin123</p>
            <p>Customer — customer@example.com / customer123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
