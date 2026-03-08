// lib/cart.js

const CART_STORAGE_KEY = 'cart';

// Получить корзину из localStorage
export const getCart = () => {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const updateQuantity = (id, delta) => {
  const cart = getCart();
  const index = cart.findIndex(item => item.id === id);
  if (index === -1) return;

  const currentQuantity = cart[index].quantity || 1;
  const newQuantity = currentQuantity + delta;

  if (newQuantity <= 0) {
    // удаляем товар
    cart.splice(index, 1);
  } else {
    cart[index].quantity = newQuantity;
  }

  setCart(cart);
};

// Сохранить корзину и уведомить об изменении
export const setCart = (cart) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

// Добавить товар (если уже есть – увеличить quantity)
export const addItem = (item) => {
  const cart = getCart();
  const existingIndex = cart.findIndex(i => i.id === item.id);
  if (existingIndex !== -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  setCart(cart);
};

// Удалить товар по индексу
export const removeItemByIndex = (index) => {
  const cart = getCart();
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    setCart(cart);
  }
};

// Удалить товар по id
export const removeItemById = (id) => {
  const cart = getCart().filter(item => item.id !== id);
  setCart(cart);
};

// Очистить корзину
export const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
};

// Подписка на изменения (для хука)
export const subscribe = (callback) => {
  window.addEventListener('cartUpdated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('cartUpdated', callback);
    window.removeEventListener('storage', callback);
  };
};