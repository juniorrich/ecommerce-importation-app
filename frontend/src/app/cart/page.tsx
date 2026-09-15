'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { getCart, updateCartItem, removeFromCart } from '@/lib/api';
import { Cart } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const res = await getCart();
      setCart(res.data.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUpdateQty = async (productId: string, quantity: number) => {
    try {
      const res = await updateCartItem(productId, quantity);
      setCart(res.data.data);
      refreshCart();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update quantity');
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const res = await removeFromCart(productId);
      setCart(res.data.data);
      refreshCart();
      toast.success('Item removed');
    } catch {
      toast.error('Could not remove item');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <Skeleton className="h-8 w-1/4" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-3xl text-ivory-100">Your cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Nothing's on manifest for you yet — the catalogue is full of things worth shipping."
          actionLabel="Browse the catalogue"
          actionHref="/products"
        />
      ) : (
        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.product._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hairline flex gap-4 pb-6"
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-espresso-800">
                    {item.product.images?.[0]?.url && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product._id}`}
                      className="font-display text-base text-ivory-200 hover:text-gold-400"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-sand-400">{formatPrice(item.product.price)}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded border border-espresso-600">
                        <button
                          onClick={() =>
                            item.quantity > 1 &&
                            handleUpdateQty(item.product._id, item.quantity - 1)
                          }
                          className="p-1.5 text-sand-400 hover:text-ivory-200"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm text-ivory-200">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.product._id, item.quantity + 1)}
                          className="p-1.5 text-sand-400 hover:text-ivory-200"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.product._id)}
                        className="p-1.5 text-sand-500 hover:text-red-400"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-ivory-100">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="h-fit rounded border border-espresso-700 bg-espresso-800 p-6">
            <h2 className="font-display text-lg text-ivory-100">Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-sand-400">
                <span>Subtotal</span>
                <span className="text-ivory-200">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sand-400">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="hairline flex justify-between pb-3 pt-2 text-base text-ivory-100">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            <Link href="/checkout" className="mt-5 block">
              <Button className="w-full" size="lg">Proceed to checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
