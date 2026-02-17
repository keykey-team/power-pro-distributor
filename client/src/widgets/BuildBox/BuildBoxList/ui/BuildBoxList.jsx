"use client";
import { useModals } from "@shared/index";
import { useSearchParams } from "next/navigation";
import BoxProductItem from "@entities/ProductItem/ui/BoxProductItem";
import React, { useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = 'box-products';

const ProductList = () => {
  const { curt, setIsCurt } = useModals();
  const searchParams = useSearchParams();
  const limit = Number(searchParams.get('limit')) || 5;
  const isInitialized = useRef(false);

  // Функция валидации корзины под лимит
  const validateCartByLimit = useCallback((cart, currentLimit) => {
    if (!cart || !Array.isArray(cart)) return [];
    
    const validCart = cart.filter(item => 
      item && 
      item.key && 
      item.product && 
      item.variant && 
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
  }, []); // Только при монтировании

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

  const products = [
    {
      name: "FITWIN (BEZ CUKRU)",
      image: "photo_2026-01-28_21-05-31 2",
      variants: [
        {
          flavor: "PISTÁCIA A KRÉM",
          weight: "60G",
          protein: "20G",
        },
      ],
    },
    {
      name: "POWERPRO (HIGH PROTEÍN)",
      variants: [
        {
          flavor: "ČOKOLÁDOVÝ BROWNIE",
          weight: "60G",
          protein: "20G",
          note: "10+",
        },
      ],
    },
  ];

  const getQuantity = (product, variant) => {
    const key = `${product.name}-${variant.flavor}`;
    const item = curt.find((i) => i.key === key);
    return item ? item.quantity : 0;
  };

  const totalItems = curt.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (product, variant, delta) => {
    const key = `${product.name}-${variant.flavor}`;
    
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
          return [...prev, { key, product, variant, quantity: 1 }];
        }
        return prev;
      }
    });
  };

  return (
    <div className="products__boxes container">
      {products.map((product, idx) => (
        <div key={idx} className="products__box-list">
          <h2>{product.name}</h2>
          {product.variants.map((variant, vidx) => (
            <BoxProductItem
              key={vidx}
              product={product}
              variant={variant}
              quantity={getQuantity(product, variant)}
              onIncrement={() => updateQuantity(product, variant, 1)}
              onDecrement={() => updateQuantity(product, variant, -1)}
              isMaxLimit={totalItems >= limit}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProductList;