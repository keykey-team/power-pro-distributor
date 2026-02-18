"use client";
import { useModals } from '@shared/index';
import React from 'react';

const ProductButton = ({ product, locale }) => {
    const { isModalOpen, setIsModalOpen, isProdModalId, setIsProdModalId } = useModals();

    const handleAddToCart = (e) => {
        e.stopPropagation(); // предотвращаем всплытие к родительской карточке
        try {
            // Получаем текущую корзину
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');

            // Формируем объект товара
            const cartItem = {
                kind: 'product',
                name: product?.title?.[locale],
                size: 1,
                products: [
                    {
                        productId: product.slug,
                        quantity: 1,
                    },
                ],
            };

            // Добавляем в корзину
            const updatedCart = [...cart, cartItem];
            localStorage.setItem('cart', JSON.stringify(updatedCart));

            // Сообщаем другим компонентам (например, OrderForm) об изменении корзины
            window.dispatchEvent(new Event('cartUpdated'));

            // Можно оставить небольшое уведомление (alert или что‑то более красивое)
            // alert('Товар добавлен в корзину');
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);
            alert('Не удалось добавить товар');
        }
    };

    return (
        <button
            type="button"
            className="products__item-button"
            onClick={handleAddToCart}
        >
            Pridať do výberu • {product.price}€
        </button>
    );
};

export default ProductButton;