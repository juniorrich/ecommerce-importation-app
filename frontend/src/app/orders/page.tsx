'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyOrders } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate, manifestCode, STATUS_LABEL } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Package } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    getMyOrders()
      .then((res) => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-3xl text-ivory-100">Your orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Once you place one, it'll show up here with its own manifest code."
          actionLabel="Browse the catalogue"
          actionHref="/products"
        />
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded border border-espresso-700 bg-espresso-800 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="manifest-code text-xs">{manifestCode(order._id)}</p>
                  <p className="mt-0.5 text-sm text-sand-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="gold">{STATUS_LABEL[order.status] || order.status}</Badge>
                  <Badge tone={order.isPaid ? 'harbor' : 'danger'}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {order.orderItems.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-sand-300">
                    {item.image && (
                      <img src={item.image} alt="" className="h-9 w-9 rounded object-cover" />
                    )}
                    <span>
                      {item.name} &times; {item.quantity}
                    </span>
                  </div>
                ))}
                {order.orderItems.length > 3 && (
                  <span className="text-sm text-sand-500">
                    +{order.orderItems.length - 3} more
                  </span>
                )}
              </div>

              <div className="hairline mt-4 flex items-center justify-between pt-4">
                <span className="text-base text-ivory-100">{formatPrice(order.totalPrice)}</span>
                {order.trackingNumber && (
                  <span className="text-xs text-sand-500">
                    Tracking &middot; {order.trackingNumber}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
