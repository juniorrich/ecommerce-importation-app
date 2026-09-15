'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-64px)] md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-espresso-950 p-12 md:flex">
        <p className="font-display text-lg text-ivory-100">Kwabena &amp; Co.</p>
        <blockquote className="font-display text-2xl italic leading-snug text-ivory-200">
          "An account here is the start of a paper trail — one you can
          actually follow, end to end."
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
          <h1 className="font-display text-2xl text-ivory-100">Create an account</h1>
          <p className="mt-1.5 text-sm text-sand-400">It takes a minute</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Full name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="024XXXXXXX"
            />
            <Input
              label="Password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? 'Creating account' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-sand-400">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
