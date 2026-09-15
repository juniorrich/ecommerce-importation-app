'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProducts, getCategories } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import Skeleton from '@/components/ui/Skeleton';
import { ShieldCheck, PackageSearch, Route } from 'lucide-react';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ featured: 'true', limit: 8 }),
      getCategories().catch(() => ({ data: { data: [] } })),
    ])
      .then(([productsRes, categoriesRes]) => {
        setFeatured(productsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero — the one bold animated moment: a shipping route drawing in */}
      <section className="relative overflow-hidden border-b border-espresso-700">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:py-28">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="font-display text-4xl leading-[1.1] text-ivory-100 md:text-[3.25rem]"
            >
              From the port of origin to your doorstep in Ghana.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              className="mt-5 max-w-md text-base leading-relaxed text-sand-400"
            >
              We source, clear customs, and deliver — every order carries its
              own manifest code so you can follow it the whole way.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/products"
                className="rounded bg-gold-500 px-6 py-3 text-sm font-medium text-espresso-950 transition-colors hover:bg-gold-400"
              >
                Browse the catalogue
              </Link>
              <Link
                href="/orders"
                className="rounded border border-espresso-600 px-6 py-3 text-sm text-ivory-200 transition-colors hover:border-gold-500 hover:text-gold-400"
              >
                Track an order
              </Link>
            </motion.div>
          </div>

          <div className="relative hidden items-center justify-center md:flex">
            <svg viewBox="0 0 400 300" className="w-full max-w-sm" fill="none">
              <circle cx="40" cy="240" r="4" fill="#C89B3C" />
              <circle cx="360" cy="60" r="4" fill="#C89B3C" />
              <text x="20" y="266" fill="#A79A85" fontSize="11" fontFamily="var(--font-body)">Origin port</text>
              <text x="300" y="46" fill="#A79A85" fontSize="11" fontFamily="var(--font-body)">Your door</text>
              <path
                d="M 40 240 C 140 240, 120 90, 220 110 S 340 60, 360 60"
                stroke="#C89B3C"
                strokeWidth="1.5"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                className="animate-route-draw"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Principles — functional, not decorative */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="flex gap-4">
            <PackageSearch className="h-6 w-6 shrink-0 text-gold-500" strokeWidth={1.5} />
            <div>
              <h3 className="font-display text-lg text-ivory-100">Sourced deliberately</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-400">
                Every item is chosen and verified before it ever leaves origin — no dropshipping, no guesswork.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ShieldCheck className="h-6 w-6 shrink-0 text-gold-500" strokeWidth={1.5} />
            <div>
              <h3 className="font-display text-lg text-ivory-100">Customs handled</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-400">
                Duties and clearance are our problem, not yours. Your order arrives ready to use.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Route className="h-6 w-6 shrink-0 text-gold-500" strokeWidth={1.5} />
            <div>
              <h3 className="font-display text-lg text-ivory-100">Trackable by manifest</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-400">
                Each order gets a manifest code the moment it's placed — reference it any time you need us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-y border-espresso-700 bg-espresso-950">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-3 px-5 py-8">
            {categories.map((c) => (
              <Link
                key={c}
                href={`/products?category=${encodeURIComponent(c)}`}
                className="rounded-full border border-espresso-600 px-4 py-1.5 text-sm text-sand-300 transition-colors hover:border-gold-500 hover:text-gold-400"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl text-ivory-100">This month's arrivals</h2>
          <Link href="/products" className="text-sm text-sand-400 hover:text-gold-400">
            View full catalogue
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="py-16 text-center text-sm text-sand-500">
            Nothing on manifest yet — check back shortly.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
