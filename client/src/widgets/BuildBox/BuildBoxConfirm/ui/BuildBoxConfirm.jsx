"use client";
import { useModals } from "@shared/index";
import { useI18n } from "@shared/i18n/use-i18n";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { products } from "@widgets/Products/ui/common/ProductsList";

// Ключи для localStorage
const BOX_STORAGE_KEY = 'box-products';
const MAIN_CART_KEY = 'cart'; // Уточните название ключа главной корзины

const BuildBoxConfirm = () => {
    const router = useRouter();
    const { t } = useI18n();
    const { curt, setIsCurt } = useModals();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);

    const limit = Number(searchParams.get('limit')) || 5;

    const totalItems = curt.reduce((sum, item) => sum + item.quantity, 0);
    const isLimitReached = totalItems === limit;

    // Функция для добавления товаров в главную корзину
const addToMainCart = (boxItems) => {
    try {
        // Получаем текущую главную корзину
        const mainCart = JSON.parse(localStorage.getItem(MAIN_CART_KEY) || '[]');

        // Создаем объект бокса для главной корзины
        const boxProduct = {
            type: "box",
            products: boxItems.map(item => ({
                id: item.key,
                name: item.product.name,
                variant: item.variant.flavor,
                quantity: item.quantity,
                weight: item.variant.weight,
                protein: item.variant.protein,
                image: item.product.image,
            }))
        };

        // Добавляем бокс как один элемент в корзину (НЕ через ...)
        const updatedCart = [...mainCart, boxProduct];

        // Сохраняем в главную корзину
        localStorage.setItem(MAIN_CART_KEY, JSON.stringify(updatedCart));
        
        console.log('Добавлено в корзину:', boxProduct);
        console.log('Обновленная корзина:', updatedCart);

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