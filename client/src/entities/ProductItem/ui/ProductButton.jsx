"use client";
import { useI18n } from '@shared/i18n/use-i18n';
import { useModals } from '@shared/index';
import React, { useState, useEffect } from 'react';

const ProductButton = ({ product, locale }) => {
    const { isModalOpen, setIsModalOpen, isProdModalId, setIsProdModalId } = useModals();
    const [cart, setCart] = useState([]);
    const { t } = useI18n()

    // Определяем режим по умолчанию (unit или box) и цену
    const defaultMode = product?.purchaseOptions?.defaultMode || 'unit';
    const isBox = defaultMode === 'box';
    const boxQuantity = product?.purchaseOptions?.box?.quantity || 1;
    const currentPrice = product?.purchaseOptions?.[defaultMode]?.price || product.price;

    // Составной ID для синхронизации с модалкой
    const compositeId = `${product._id}-${defaultMode}`;

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

            // Ищем, есть ли уже ТОЧНО такой же товар в корзине
            const existingItemIndex = currentCart.findIndex(item => item.productId === compositeId);
            let updatedCart;

            if (existingItemIndex >= 0) {
                // ТОВАР ЕСТЬ: Увеличиваем quantity
                updatedCart = [...currentCart];
                updatedCart[existingItemIndex].quantity += 1;
            } else {
                // ТОВАРА НЕТ: Добавляем новый
                const baseName = product?.title?.[locale];
                const nameWithQuantity = isBox ? `${baseName} (Balenie ${boxQuantity} ks)` : baseName;

                const cartItem = {
                    kind: 'product',
                    name: nameWithQuantity,
                    productId: compositeId,
                    baseProductId: product._id, // Для связи с общим товаром
                    quantity: 1,
                    price: currentPrice,
                    purchaseMode: defaultMode,
                    itemsInPackage: isBox ? boxQuantity : 1,
                    product: product
                };
                updatedCart = [...currentCart, cartItem];
            }

            localStorage.setItem('cart', JSON.stringify(updatedCart));
            setCart(updatedCart);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);
            alert('Не удалось добавить товар');
        }
    };

    const isInCart = () => {
        if (!product?._id) return false;
        // Ищем по baseProductId, чтобы кнопка горела "В корзине", 
        // даже если юзер добавил из модалки коробку, а не штуку.
        return cart.some(item =>
            item.baseProductId === product._id ||
            item.productId === product._id // Оставил для обратной совместимости со старыми записями
        );
    };

    return (
        <button
            type="button"
            className={`products__item-button ${isInCart() ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
        >
            {isInCart() ? `${t("cart1")} ✓` : `${t("cart2")} •`} {currentPrice}€
        </button>
    );
};

export default ProductButton;