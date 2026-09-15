'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, createOrder, initializePayment } from '@/lib/api';
import { Cart } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    region: 'Greater Accra',
    country: 'Ghana',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    getCart()
      .then((res) => {
        const c = res.data.data;
        if (!c?.items?.length) {
          toast.error('Your cart is empty');
          router.push('/cart');
          return;
        }
        setCart(c);
        if (user.phone) setAddress((a) => ({ ...a, phone: user.phone || '' }));
        if (user.address) {
          setAddress((a) => ({
            ...a,
            street: user.address?.street || '',
            city: user.address?.city || '',
            region: user.address?.region || 'Greater Accra',
          }));
        }
      })
      .catch(() => router.push('/cart'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const items = cart?.items || [];
  const itemsPrice = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 30;
  const taxPrice = 0;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.phone) {
      toast.error('Fill in every required address field');
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        image: i.product.images?.[0]?.url,
        price: i.product.price,
        quantity: i.quantity,
      }));

      const orderRes = await createOrder({
        orderItems,
        shippingAddress: address,
        paymentMethod: 'paystack',
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      });

      const order = orderRes.data.data;

      // The server recalculates the real charge from the order's own total —
      // the amount below is illustrative only and never trusted by the API.
      const payRes = await initializePayment({
        orderId: order._id,
        email: user!.email,
        amount: totalPrice,
      });

      const { authorization_url } = payRes.data.data;

      if (authorization_url?.includes('mock')) {
        toast.success('Order placed — manifest confirmed');
        await refreshCart();
        router.push('/orders');
        return;
      }

      window.location.href = authorization_url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-3xl text-ivory-100">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg text-ivory-100">Where should this ship?</h2>
            <div className="mt-4 space-y-4">
              <Input
                label="Street address"
                required
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="House number and street"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
                <Select
                  label="Region"
                  value={address.region}
                  onChange={(e) => setAddress({ ...address, region: e.target.value })}
                >
                  <option>Greater Accra</option>
                  <option>Ashanti</option>
                  <option>Western</option>
                  <option>Central</option>
                  <option>Eastern</option>
                  <option>Northern</option>
                  <option>Volta</option>
                  <option>Other</option>
                </Select>
              </div>
              <Input
                label="Phone"
                required
                type="tel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                placeholder="024XXXXXXX"
              />
            </div>
          </div>
        </div>

        <div className="h-fit rounded border border-espresso-700 bg-espresso-800 p-6">
          <h2 className="font-display text-lg text-ivory-100">Order summary</h2>
          <div className="mt-4 space-y-2.5 text-sm text-sand-400">
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between gap-3">
                <span className="truncate">
                  {item.product.name} &times; {item.quantity}
                </span>
                <span className="shrink-0 text-ivory-200">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="hairline mt-4 space-y-2 pb-4 pt-4 text-sm text-sand-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-ivory-200">{formatPrice(itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-ivory-200">
                {shippingPrice === 0 ? 'Free' : formatPrice(shippingPrice)}
              </span>
            </div>
          </div>
          <div className="flex justify-between pt-1 text-base text-ivory-100">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          <Button type="submit" loading={submitting} className="mt-6 w-full" size="lg">
            {submitting ? 'Processing' : 'Pay with Paystack'}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-sand-500">
            <ShieldCheck className="h-3.5 w-3.5" /> Secured by Paystack
          </p>
        </div>
      </form>
    </div>
  );
}
