'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { api } from '@/lib/api';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .getProduct(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading product...</div>;
  if (!product)
    return <div style={{ padding: '40px', color: 'var(--danger)' }}>Product not found.</div>;

  return <ProductForm existingProduct={product} />;
}
