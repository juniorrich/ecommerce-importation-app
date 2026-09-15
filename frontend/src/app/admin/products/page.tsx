'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts, deleteProduct } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice, manifestCode } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    getProducts({ limit: 50 })
      .then((res) => setProducts(res.data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this product from the catalogue?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product removed');
      fetchProducts();
    } catch {
      toast.error('Could not remove product');
    }
  };

  return (
    <div className="px-6 py-10">
      <AdminPageHeader
        title="Products"
        action={
          <Link href="/admin/products/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add product
            </Button>
          </Link>
        }
      />

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
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-espresso-700 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-espresso-800">
                        {p.images?.[0]?.url && (
                          <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="line-clamp-1 max-w-[220px] text-ivory-200">{p.name}</p>
                        <p className="manifest-code text-xs">{manifestCode(p._id)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sand-400">{p.category}</td>
                  <td className="px-4 py-3 text-ivory-200">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-sand-400">{p.stock}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.stock > 0 ? 'harbor' : 'danger'}>
                      {p.importationStatus.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/${p._id}/edit`}
                        className="text-sand-400 hover:text-gold-400"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-sand-400 hover:text-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="py-12 text-center text-sm text-sand-500">No products on manifest yet</p>
          )}
        </div>
      )}
    </div>
  );
}
