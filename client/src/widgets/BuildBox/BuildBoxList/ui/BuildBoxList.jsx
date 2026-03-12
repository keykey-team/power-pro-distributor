// ProductList.tsx
"use client";
import { useModals } from "@shared/index";
import { useSearchParams } from "next/navigation";
import BoxProductItem from "@entities/ProductItem/ui/BoxProductItem";
import React, { useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = 'box-products';

const ProductList = ({ data, locale }) => {
  console.log(data);
  const { curt, setIsCurt } = useModals();
  const searchParams = useSearchParams();
  const limit = Number(searchParams.get('limit')) || 5;
  const isInitialized = useRef(false);

  // Валидация корзины под лимит
  const validateCartByLimit = useCallback((cart, currentLimit) => {
    if (!cart || !Array.isArray(cart)) return [];

    const validCart = cart.filter(item =>
      item &&
      item.key &&
      item.product &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );

    const totalItems = validCart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems > currentLimit) {
      let newTotal = 0;
      return validCart.reduce((acc, item) => {
        if (newTotal >= currentLimit) return acc;

        const availableSlots = currentLimit - newTotal;
        if (item.quantity <= availableSlots) {
          newTotal += item.quantity;
          return [...acc, item];
        } else {
          newTotal += availableSlots;
          return [...acc, { ...item, quantity: availableSlots }];
        }
      }, []);
    }

    return validCart;
  }, []);

  // Загрузка из localStorage при монтировании
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const validatedCart = validateCartByLimit(parsed, limit);
          setIsCurt(validatedCart);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      setIsCurt([]);
    }
    isInitialized.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Валидация при изменении лимита
  useEffect(() => {
    if (isInitialized.current) {
      setIsCurt(prev => validateCartByLimit(prev, limit));
    }
  }, [limit, validateCartByLimit]);

  // Сохранение в localStorage при изменении корзины
  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(curt));
  }, [curt]);

  const getQuantity = (product) => {
    const key = product._id;
    const item = curt.find((i) => i.key === key);
    return item ? item.quantity : 0;
  };

  const totalItems = curt.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (product, delta) => {
    const key = product._id;

    setIsCurt((prev) => {
      const existing = prev.find((i) => i.key === key);
      const currentTotal = prev.reduce((sum, item) => sum + item.quantity, 0);

      if (existing) {
        const newQty = existing.quantity + delta;

        if (delta > 0 && currentTotal >= limit) {
          alert(`Максимальное количество товаров: ${limit}`);
          return prev;
        }

        if (newQty <= 0) {
          return prev.filter((i) => i.key !== key);
        } else {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: newQty } : i
          );
        }
      } else {
        if (delta > 0) {
          if (currentTotal >= limit) {
            alert(`Максимальное количество товаров: ${limit}`);
            return prev;
          }
          return [...prev, { key, product, quantity: 1 }];
        }
        return prev;
      }
    });
  };

  // Фильтруем товары на две группы
  const fitwinItems = data?.items?.filter(product => product.slug && product.slug.includes('fitwin')) || [];
  const otherItems = data?.items?.filter(product => !product.slug || !product.slug.includes('fitwin')) || [];

  return (
    <div className="products__boxes container">
      {fitwinItems.length > 0 && (
        <div className="products__box-list">
          <h2>FitWin</h2>
          {fitwinItems.map((product) => {
            if (product.isBar && product.brand.title.sk === "fitwin")
              return (
                <BoxProductItem
                  key={product._id}
                  product={product}
                  locale={locale}
                  quantity={getQuantity(product)}
                  onIncrement={() => updateQuantity(product, 1)}
                  onDecrement={() => updateQuantity(product, -1)}
                  isMaxLimit={totalItems >= limit}
                />
              )
          })}
        </div>
      )}
      {otherItems.length > 0 && (
        <div className="products__box-list">
          <h2>PowerPro (High Protein)</h2>
          {otherItems.map((product) => {
            if (product.isBar && product.brand.title.sk === "powerpro")
              return (
                <BoxProductItem
                  key={product._id}
                  product={product}
                  locale={locale}
                  quantity={getQuantity(product)}
                  onIncrement={() => updateQuantity(product, 1)}
                  onDecrement={() => updateQuantity(product, -1)}
                  isMaxLimit={totalItems >= limit}
                />
              )
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;