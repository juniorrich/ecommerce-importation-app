'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProduct } from '@/lib/api';
import { Product } from '@/types';
import ProductForm from '@/components/admin/ProductForm';
import Skeleton from '@/components/ui/Skeleton';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProduct(id as string)
        .then((res) => setProduct(res.data.data))
        .catch(() => setProduct(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="px-6 py-10">
        <Skeleton className="h-96 w-full max-w-3xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-sm text-sand-400">That product isn't on the manifest</p>
        <Link href="/admin/products" className="mt-2 inline-block text-sm text-gold-400 hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-sand-400 hover:text-gold-400">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>
      <h1 className="mt-3 font-display text-2xl text-ivory-100">Edit product</h1>
      <p className="mt-1 text-sm text-sand-400">{product.name}</p>
      <div className="mt-8">
        <ProductForm mode="edit" product={product} />
      </div>
    </div>
  );
}
