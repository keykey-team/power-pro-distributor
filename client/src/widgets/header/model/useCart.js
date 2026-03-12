// hooks/useCart.js
import { useState, useEffect } from 'react';
import { getCart, subscribe } from '../lib/cart';

export const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Начальная загрузка
    setCart(getCart());

    // Подписка на изменения
    const unsubscribe = subscribe(() => {
      setCart(getCart());
    });

    return unsubscribe;
  }, []);

  return cart;
};