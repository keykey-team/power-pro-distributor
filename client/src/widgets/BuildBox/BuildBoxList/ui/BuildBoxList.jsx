"use client";
import { useModals } from "@shared/index";
import { useSearchParams } from "next/navigation";
import BoxProductItem from "@entities/ProductItem/ui/BoxProductItem";
import React from "react";

const ProductList = () => {
  const { curt, setIsCurt } = useModals();
  const searchParams = useSearchParams();
  const limit = Number(searchParams.get('limit')) || 5;

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

  // Получить количество для конкретного товара и варианта
  const getQuantity = (product, variant) => {
    const key = `${product.name}-${variant.flavor}`;
    const item = curt.find((i) => i.key === key);
    return item ? item.quantity : 0;
  };

  // Получить общее количество товаров
  const totalItems = curt.reduce((sum, item) => sum + item.quantity, 0);

  // Обновить количество (+1 / -1) с проверкой лимита
  const updateQuantity = (product, variant, delta) => {
    const key = `${product.name}-${variant.flavor}`;
    
    setIsCurt((prev) => {
      const existing = prev.find((i) => i.key === key);
      const currentTotal = prev.reduce((sum, item) => sum + item.quantity, 0);
      
      if (existing) {
        const newQty = existing.quantity + delta;
        
        // Проверка на лимит при добавлении
        if (delta > 0 && currentTotal >= limit) {
          alert(`Максимальное количество товаров: ${limit}`);
          return prev;
        }
        
        if (newQty <= 0) {
          return prev.filter((i) => i.key !== key); // удалить, если 0
        } else {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: newQty } : i
          );
        }
      } else {
        // Проверка на лимит при добавлении нового товара
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
              isMaxLimit={totalItems >= limit} // Передаем флаг для дизейбла кнопки +
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProductList;