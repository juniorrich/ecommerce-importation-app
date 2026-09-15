'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate, manifestCode } from '@/lib/utils';
import toast from 'react-hot-toast';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      toast.success('Status updated');
    } catch {
      toast.error('Could not update status');
    }
  };

  return (
    <div className="px-6 py-10">
      <AdminPageHeader title="Orders" />

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-espresso-700">
          <table className="w-full text-sm">
            <thead className="border-b border-espresso-700 bg-espresso-950">
              <tr className="text-left text-sand-500">
                <th className="px-4 py-3 font-medium">Manifest</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Paid</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-espresso-700 last:border-0">
                  <td className="manifest-code px-4 py-3 text-xs">{manifestCode(order._id)}</td>
                  <td className="px-4 py-3 text-ivory-200">
                    {typeof order.user === 'object' ? order.user.name : '—'}
                  </td>
                  <td className="px-4 py-3 text-ivory-200">{formatPrice(order.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={order.isPaid ? 'harbor' : 'danger'}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="w-40 py-1.5 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-sand-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="py-12 text-center text-sm text-sand-500">No orders on manifest yet</p>
          )}
        </div>
      )}
    </div>
  );
}
