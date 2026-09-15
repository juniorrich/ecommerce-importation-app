'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded border border-espresso-700 bg-espresso-800 p-5">
      <div className="mb-2 flex items-center gap-2.5 text-sand-400">
        <Icon className="h-4 w-4 text-gold-500" strokeWidth={1.5} />
        <span className="text-sm">{label}</span>
      </div>
      <p className="font-display text-2xl text-ivory-100">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-6 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="px-6 py-20 text-center text-sm text-sand-500">
        Couldn't load the dashboard
      </div>
    );
  }

  const { overview, orderStatus, today, thisMonth, lowStockProducts, recentOrders, topProducts } = stats;

  return (
    <div className="px-6 py-10">
      <AdminPageHeader title="Overview" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Customers" value={overview.totalCustomers} />
        <StatCard icon={Package} label="Active products" value={overview.activeProducts} />
        <StatCard icon={ShoppingCart} label="Total orders" value={overview.totalOrders} />
        <StatCard icon={TrendingUp} label="Revenue" value={formatPrice(overview.totalRevenue)} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded border border-espresso-700 bg-espresso-800 p-5">
          <h3 className="font-display text-base text-ivory-100">Today</h3>
          <div className="mt-3 flex gap-10">
            <div>
              <p className="text-sm text-sand-500">Orders</p>
              <p className="text-lg text-ivory-100">{today.orders}</p>
            </div>
            <div>
              <p className="text-sm text-sand-500">Revenue</p>
              <p className="text-lg text-ivory-100">{formatPrice(today.revenue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded border border-espresso-700 bg-espresso-800 p-5">
          <h3 className="font-display text-base text-ivory-100">This month</h3>
          <div className="mt-3 flex gap-10">
            <div>
              <p className="text-sm text-sand-500">Orders</p>
              <p className="text-lg text-ivory-100">{thisMonth.orders}</p>
            </div>
            <div>
              <p className="text-sm text-sand-500">Revenue</p>
              <p className="text-lg text-ivory-100">{formatPrice(thisMonth.revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded border border-espresso-700 bg-espresso-800 p-5">
          <h3 className="font-display text-base text-ivory-100">Order status</h3>
          <div className="mt-3 space-y-2 text-sm">
            {Object.entries(orderStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sand-400">
                <span className="capitalize">{status}</span>
                <span className="text-ivory-200">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded border border-espresso-700 bg-espresso-800 p-5">
          <h3 className="flex items-center gap-2 font-display text-base text-ivory-100">
            <AlertTriangle className="h-4 w-4 text-gold-500" /> Low stock
          </h3>
          {lowStockProducts?.length === 0 ? (
            <p className="mt-3 text-sm text-sand-500">Everything's well stocked</p>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              {lowStockProducts?.slice(0, 5).map((p: any) => (
                <div key={p._id} className="flex justify-between text-sand-400">
                  <span className="max-w-[140px] truncate">{p.name}</span>
                  <span className="text-red-400">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded border border-espresso-700 bg-espresso-800 p-5">
          <h3 className="font-display text-base text-ivory-100">Top selling</h3>
          {topProducts?.length === 0 ? (
            <p className="mt-3 text-sm text-sand-500">No sales data yet</p>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              {topProducts?.map((p: any, i: number) => (
                <div key={i} className="flex justify-between text-sand-400">
                  <span className="max-w-[140px] truncate">{p.name || 'Product'}</span>
                  <span className="text-ivory-200">{p.totalSold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded border border-espresso-700 bg-espresso-800 p-5">
        <h3 className="font-display text-base text-ivory-100">Recent orders</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-espresso-700 text-left text-sand-500">
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((o: any) => (
                <tr key={o._id} className="border-b border-espresso-700 last:border-0">
                  <td className="py-3 text-ivory-200">{o.user?.name || '—'}</td>
                  <td className="py-3 text-ivory-200">{formatPrice(o.totalPrice)}</td>
                  <td className="py-3 capitalize text-sand-400">{o.status}</td>
                  <td className="py-3 text-sand-500">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
