'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProductModalContent from './common/ProductModalContent'
import { useModals } from '@shared/index';
import { getProductBySlugAction } from '@shared/actions/getProductBySlug';

export function ProductModal({ locale }) {
  const { isProdModalId, setIsProdModalId } = useModals();
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isProdModalId) {
      setProduct(null);
      return;
    }

    // Очищаємо старий продукт і показуємо завантаження
    setProduct(null);
    setLoading(true);

    getProductBySlugAction(isProdModalId)
      .then(result => {
        if (result.success) {
          setProduct(result.data);
        } else {
          console.error(result.error);
        }
      })
      .finally(() => setLoading(false));
  }, [isProdModalId]);

  // Якщо модалка закрита – нічого не рендеримо
  if (!isProdModalId) return null;

  // Поки завантажується – не показуємо старий контент
  if (loading) return null; // або просто null

  // Якщо продукт не завантажився – теж нічого
  if (!product) return null;

  return <ProductModalContent locale={locale} product={product} />
}