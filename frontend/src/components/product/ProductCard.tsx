'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, manifestCode } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/products/${product._id}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded bg-espresso-800">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-sand-500" strokeWidth={1.25} />
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-espresso-950/70">
              <span className="font-display text-sm text-ivory-300">
                Sold out
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base text-ivory-200 group-hover:text-gold-400 transition-colors">
              {product.name}
            </h3>
            <p className="manifest-code mt-0.5 text-xs">
              {manifestCode(product._id)} &middot; {product.originCountry || 'Imported'}
            </p>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm text-ivory-100">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-sand-500 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          {product.importationStatus && product.importationStatus !== 'available' && (
            <Badge tone="harbor" className="ml-auto">
              {product.importationStatus}
            </Badge>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
