import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="px-6 py-10">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-sand-400 hover:text-gold-400">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>
      <h1 className="mt-3 font-display text-2xl text-ivory-100">Add a product</h1>
      <div className="mt-8">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
