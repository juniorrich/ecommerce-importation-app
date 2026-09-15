'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct, addToCart } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice, manifestCode } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import { ShoppingBag, Minus, Plus, ArrowLeft, ShieldCheck, Globe2 } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getProduct(id as string)
        .then((res) => setProduct(res.data.data))
        .catch(() => setProduct(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Sign in to add items to your cart');
      router.push('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product!._id, quantity);
      await refreshCart();
      toast.success('Added to your cart');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-24 text-center">
        <p className="font-display text-xl text-ivory-200">
          This item isn't on the manifest
        </p>
        <Link href="/products" className="mt-3 inline-block text-sm text-gold-400 hover:underline">
          Back to the catalogue
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: '', public_id: '' }];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-sand-400 hover:text-gold-400">
        <ArrowLeft className="h-4 w-4" /> Back to the catalogue
      </Link>

      <div className="mt-6 grid gap-12 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square overflow-hidden rounded bg-espresso-800">
            {images[activeImage]?.url ? (
              <img
                src={images[activeImage].url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sand-500">
                No image on file
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded border transition-colors ${
                    i === activeImage ? 'border-gold-500' : 'border-espresso-600'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="manifest-code text-xs">
            {manifestCode(product._id)} &middot; {product.category}
          </p>
          <h1 className="mt-2 font-display text-3xl text-ivory-100">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl text-ivory-100">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-sand-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-sand-400">
            {product.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {product.originCountry && (
              <Badge tone="harbor">
                <Globe2 className="mr-1 h-3 w-3" /> {product.originCountry}
              </Badge>
            )}
            <Badge tone="gold">
              <ShieldCheck className="mr-1 h-3 w-3" /> {product.importationStatus.replace('_', ' ')}
            </Badge>
            <Badge tone={product.stock > 0 ? 'neutral' : 'danger'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Badge>
          </div>

          {product.stock > 0 && (
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded border border-espresso-600">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-sand-400 hover:text-ivory-200"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-sm text-ivory-200">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-3 text-sand-400 hover:text-ivory-200"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button onClick={handleAddToCart} loading={adding} className="flex-1" size="lg">
                <ShoppingBag className="h-4 w-4" />
                {adding ? 'Adding…' : 'Add to cart'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
