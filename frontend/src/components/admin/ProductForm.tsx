'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/lib/api';
import { Product } from '@/types';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ProductFormProps {
  product?: Product;
  mode: 'create' | 'edit';
}

const IMPORTATION_STATUSES = [
  'sourcing',
  'purchased',
  'in_transit',
  'customs',
  'arrived',
  'in_warehouse',
  'available',
];

const CUSTOMS_STATUSES = ['pending', 'cleared', 'held'];

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compareAtPrice: product?.compareAtPrice?.toString() || '',
    category: product?.category || '',
    stock: product?.stock?.toString() || '0',
    sku: product?.sku || '',
    originCountry: product?.originCountry || '',
    importationStatus: product?.importationStatus || 'available',
    customsStatus: product?.customsStatus || 'cleared',
    warehouseLocation: (product as any)?.warehouseLocation || '',
    isFeatured: product?.isFeatured || false,
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages] = useState(product?.images || []);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length + existingImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.category) {
      toast.error('Fill in every required field');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      if (form.compareAtPrice) formData.append('compareAtPrice', form.compareAtPrice);
      formData.append('category', form.category);
      formData.append('stock', form.stock);
      if (form.sku) formData.append('sku', form.sku);
      if (form.originCountry) formData.append('originCountry', form.originCountry);
      formData.append('importationStatus', form.importationStatus);
      formData.append('customsStatus', form.customsStatus);
      if (form.warehouseLocation) formData.append('warehouseLocation', form.warehouseLocation);
      formData.append('isFeatured', String(form.isFeatured));

      images.forEach((file) => formData.append('images', file));

      if (mode === 'create') {
        await createProduct(formData);
        toast.success('Product added to the catalogue');
      } else if (product) {
        await updateProduct(product._id, formData);
        toast.success('Product updated');
      }

      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not save product');
    } finally {
      setLoading(false);
    }
  };

  const sectionClass = 'rounded border border-espresso-700 bg-espresso-800 p-6 space-y-4';

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className={sectionClass}>
        <h2 className="font-display text-lg text-ivory-100">Basic information</h2>
        <Input
          label="Product name"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Samsung Galaxy A55"
        />
        <Textarea
          label="Description"
          name="description"
          required
          rows={4}
          value={form.description}
          onChange={handleChange}
          placeholder="Detailed product description"
          className="resize-none"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Category"
            name="category"
            required
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Electronics"
          />
          <Input
            label="SKU"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="font-display text-lg text-ivory-100">Pricing &amp; stock</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Price (GHS)"
            name="price"
            type="number"
            required
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
          />
          <Input
            label="Compare-at price"
            name="compareAtPrice"
            type="number"
            min="0"
            step="0.01"
            value={form.compareAtPrice}
            onChange={handleChange}
          />
          <Input
            label="Stock"
            name="stock"
            type="number"
            required
            min="0"
            value={form.stock}
            onChange={handleChange}
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-sand-400">
          <input
            type="checkbox"
            name="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
            className="rounded border-espresso-600 bg-espresso-700 text-gold-500 focus:ring-gold-500"
          />
          Feature on the homepage
        </label>
      </div>

      <div className={sectionClass}>
        <h2 className="font-display text-lg text-ivory-100">Importation details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Origin country"
            name="originCountry"
            value={form.originCountry}
            onChange={handleChange}
            placeholder="e.g. China, South Korea"
          />
          <Input
            label="Warehouse location"
            name="warehouseLocation"
            value={form.warehouseLocation}
            onChange={handleChange}
            placeholder="e.g. Accra Warehouse A"
          />
          <Select
            label="Importation status"
            name="importationStatus"
            value={form.importationStatus}
            onChange={handleChange}
          >
            {IMPORTATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </Select>
          <Select
            label="Customs status"
            name="customsStatus"
            value={form.customsStatus}
            onChange={handleChange}
          >
            {CUSTOMS_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="font-display text-lg text-ivory-100">Images (max 5)</h2>

        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img, i) => (
              <div key={i} className="h-24 w-24 overflow-hidden rounded border border-espresso-600">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded border border-espresso-600">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute right-1 top-1 rounded-full bg-red-900/80 p-0.5 text-ivory-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded border border-dashed border-espresso-600 px-4 py-2.5 text-sm text-sand-400 hover:border-gold-500 hover:text-gold-400"
        >
          <Upload className="h-4 w-4" /> Upload images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <p className="text-xs text-sand-500">JPEG, PNG, WebP or GIF. Max 5MB each.</p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading} size="lg">
          {mode === 'create' ? 'Add to catalogue' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => router.push('/admin/products')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
