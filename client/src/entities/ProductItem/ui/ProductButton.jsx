"use client";
import { useModals } from '@shared/index';
import React, { useState, useEffect } from 'react';

const ProductButton = ({ product, locale }) => {
    const { isModalOpen, setIsModalOpen, isProdModalId, setIsProdModalId } = useModals();
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const loadCart = () => {
            try {
                const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
                setCart(storedCart);
            } catch (error) {
                console.error('Ошибка загрузки корзины:', error);
                setCart([]);
            }
        };

        loadCart();
        window.addEventListener('cartUpdated', loadCart);
        return () => window.removeEventListener('cartUpdated', loadCart);
    }, []);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        try {
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const cartItem = {
                kind: 'product',
                name: product?.title?.[locale],
                productId: product._id,
                quantity: 1,
                product:product
            };
            const updatedCart = [...currentCart, cartItem];
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            setCart(updatedCart); // 👈 обновляем локальное состояние сразу
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);
            alert('Не удалось добавить товар');
        }
    };

    const isInCart = () => {
        if (!product?._id) return false;
        return cart.some(item => item.productId === product._id); // 👈 правильная проверка
    };

    return (
        <button
            type="button"
            className={`products__item-button ${isInCart() ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
        >
             {isInCart() ? 'V zozname ✓' : 'Pridať do výberu •'} {product.price}€
        </button>
    );
};

export default ProductButton;