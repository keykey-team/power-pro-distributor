// app/sk/ProductModal.jsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProductModalContent from './common/ProductModalContent'
import { useModals } from '@shared/index';
import { getProductBySlugAction } from '@shared/actions/getProductBySlug'; // новый импорт

export function ProductModal({ locale }) {
  const { isProdModalId, setIsProdModalId } = useModals();
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isProdModalId) {
      setProduct(null);
      return;
    }

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

  if (!product) return null; // можно добавить состояние загрузки

  return <ProductModalContent locale={locale} product={product} />
}