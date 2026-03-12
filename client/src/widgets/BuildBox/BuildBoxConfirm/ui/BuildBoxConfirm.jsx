"use client";
import { useModals } from "@shared/index";
import { useI18n } from "@shared/i18n/use-i18n";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { scrollToOrderForm } from "@widgets/header/lib/scrollToOrderForm";

// Ключи для localStorage
const BOX_STORAGE_KEY = 'box-products';
const MAIN_CART_KEY = 'cart';

const BuildBoxConfirm = ({ products }) => {
    console.log(products)
    const router = useRouter();
    const { t } = useI18n();
    const { curt, setIsCurt, setIsModalOpen } = useModals();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);

    const limit = Number(searchParams.get('limit')) || 5;
    const totalPriceForCart = curt.reduce((sum, item) => sum + item.product.price, 0);
    const totalItems = curt.reduce((sum, item) => sum + item.quantity, 0);
    const isLimitReached = totalItems === limit;

    // Функция для вычисления общей стоимости бокса
    const calculateTotalPrice = (boxItems) => {
        return boxItems.reduce((total, item) => {
            const product = products.items.find(p => p.key === item.key);
            const price = product?.price || 0;
            return total + price * item.quantity;
        }, 0);
    };
    console.log(calculateTotalPrice(curt))
    // Функция для добавления товаров в главную корзину
    const addToMainCart = (boxItems) => {
        try {
            const mainCart = JSON.parse(localStorage.getItem(MAIN_CART_KEY) || '[]');
            const totalQuantity = boxItems.reduce((sum, el) => sum + el.quantity, 0);
            const totalPrice = calculateTotalPrice(boxItems);


            const boxProduct = {
                kind: "custom_box",
                productId: Math.random().toString(36).slice(2),
                name: `Tvoj Box ${totalQuantity} tyčinky`,
                size: totalQuantity,
                items: boxItems.map(item => ({
                    productId: item.key,
                    quantity: item.quantity,
                })),
                price: totalPriceForCart.toFixed(2),        // общая стоимость бокса
                quantity: 1,               // бокс считается одним товаром
            };

            const updatedCart = [...mainCart, boxProduct];
            localStorage.setItem(MAIN_CART_KEY, JSON.stringify(updatedCart));



            return true;
        } catch (error) {
            console.error('Ошибка при добавлении в главную корзину:', error);
            return false;
        }
    };

    const handleConfirm = async () => {
        if (!isLimitReached) {
            alert(`Добавьте товары до лимита (${totalItems}/${limit})`);
            return;
        }

        setIsProcessing(true);

        try {
            const added = addToMainCart(curt);
            if (!added) {
                throw new Error('Не удалось добавить товары в корзину');
            }

            setIsCurt([]);
            localStorage.removeItem(BOX_STORAGE_KEY);
            window.location.href = '/';

        } catch (error) {
            console.error("Ошибка:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="box-confirme">
            <button
                className={`btn-box-confirm ${isLimitReached ? 'active' : ''}`}
                onClick={handleConfirm}
                disabled={!isLimitReached || isProcessing}
            >
                {isProcessing ? (
                    <span className="loading-spinner">⏳</span>
                ) : (
                    isLimitReached
                        ? t("build-box.confirm-done")
                        : `${t("build-box.confirm1")} ${limit - totalItems} ${t("build-box.confirm2")}`
                )}
            </button>
        </div>
    );
};

export default BuildBoxConfirm;