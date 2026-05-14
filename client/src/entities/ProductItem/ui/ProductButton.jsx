"use client";
import { useI18n } from '@shared';
import React, { useEffect, useState } from 'react';

const getTrackedStockQuantity = (value) => {
    const normalizedValue = Number(value);
    return Number.isFinite(normalizedValue) ? Math.trunc(normalizedValue) : null;
};

const getIsOutOfStock = (stockSource) => {
    const trackedStockQuantity = getTrackedStockQuantity(stockSource?.stockQuantity);

    if (trackedStockQuantity !== null) {
        return trackedStockQuantity <= 0;
    }

    return stockSource?.inStock === false;
};

const ProductButton = ({ product, locale }) => {
    const [cart, setCart] = useState([]);
    const { t } = useI18n();

    const v2Items = Array.isArray(product?.purchaseOptionsV2?.items)
        ? product.purchaseOptionsV2.items.filter((item) => item?.enabled !== false)
        : [];
    const defaultV2Option = v2Items.find((item) => item.key === product?.purchaseOptionsV2?.defaultKey) || v2Items[0] || null;

    const purchaseMode = defaultV2Option?.mode || product?.type || 'unit';
    const isBox = purchaseMode === 'box';
    const boxQuantity = defaultV2Option?.quantity || product?.purchaseOptions?.box?.quantity || 1;
    const currentPrice = defaultV2Option?.price ?? product?.price;
    const isOutOfStock = getIsOutOfStock(defaultV2Option || product);

    const compositeId = `${product._id}-${defaultV2Option?.key || purchaseMode}`;

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
        if (isOutOfStock) {
            return;
        }

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
                const nameWithQuantity = defaultV2Option
                    ? `${baseName} (${defaultV2Option?.title?.[locale] || defaultV2Option?.key})`
                    : (isBox ? `${baseName} (Balenie ${boxQuantity} ks)` : baseName);

                const cartItem = {
                    kind: 'product',
                    name: nameWithQuantity,
                    productId: compositeId,
                    baseProductId: product._id, // Для связи с общим товаром
                    quantity: 1,
                    price: currentPrice,
                    purchaseMode,
                    itemsInPackage: defaultV2Option?.quantity || (isBox ? boxQuantity : 1),
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
            className={`products__item-button ${isInCart() ? 'in-cart' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
        >
            {isOutOfStock
                ? t("cart3")
                : isInCart()
                    ? `${t("cart1")} ✓`
                    : `${t("cart2")} • ${currentPrice}€`}
        </button>
    );
};

export default ProductButton;