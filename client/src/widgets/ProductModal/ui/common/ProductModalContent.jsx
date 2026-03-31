'use client'
import { useModals } from '@shared/index';
import { formatProductTitle } from '@widgets/ProductModal/lib/formatProductTitle';
import Image from 'next/image';
import React, { useState, useEffect } from 'react'
import ProductGallerySwiper from './ProductGallerySwiper';
import { useI18n } from '@shared/i18n/use-i18n';

const ProductModalContent = ({ product, locale }) => {
    const { isModalOpen, setIsModalOpen, isProdModalId, setIsProdModalId } = useModals();
    const { firstPart, secondPart } = formatProductTitle(product.title?.[locale])
    const [cart, setCart] = useState([]);
    const { t } = useI18n()

    // Состояние для выбранного варианта покупки. По умолчанию 'unit' (поштучно).
    const [selectedMode, setSelectedMode] = useState('unit');

    console.log(product, "prod-modal")

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

    // Достаем опции и вычисляем текущую цену
    const boxOptions = product?.purchaseOptions?.box;
    const unitOptions = product?.purchaseOptions?.unit;
    const isBoxEnabled = boxOptions?.enabled;
    const boxQuantity = boxOptions?.quantity || 1;
    
    // Определяем цену в зависимости от выбранного мода (с фоллбэком на старую цену, если новых данных нет)
    const currentPrice = selectedMode === 'unit' 
        ? (unitOptions?.price || product.price) 
        : (boxOptions?.price || product.price);

   const handleAddToCart = (e) => {
        e.stopPropagation();
        try {
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            const compositeId = `${product._id}-${selectedMode}`;
            const existingItemIndex = currentCart.findIndex(item => item.productId === compositeId);
            let updatedCart;

            if (existingItemIndex >= 0) {
                // ТОВАР УЖЕ ЕСТЬ: Увеличиваем количество
                updatedCart = [...currentCart];
                updatedCart[existingItemIndex].quantity += 1;
            } else {
                // ТОВАРА НЕТ: Создаем новый объект
                const baseName = product?.title?.[locale];
                const nameWithQuantity = selectedMode === 'box' 
                    ? `${baseName} (Balenie ${boxQuantity} ks)` 
                    : baseName;

                const cartItem = {
                    kind: 'product',
                    name: nameWithQuantity,
                    productId: compositeId, 
                    baseProductId: product._id, 
                    quantity: 1,
                    price: currentPrice, 
                    purchaseMode: selectedMode, 
                    itemsInPackage: selectedMode === 'unit' ? 1 : boxQuantity,
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

    // Проверяем наличие именно выбранной версии товара (штука/коробка)
    const isInCart = () => {
        if (!product?._id) return false;
        return cart.some(item => item.productId === `${product._id}-${selectedMode}`);
    };

    // НОВОЕ: Проверяем, есть ли хотя бы в одной строке данные для 60 грамм
    const has60gData = product?.nutritionTable?.rows?.some(
        (el) => el?.values?.per_60g?.text?.trim()
    );

    return (
        <>
            {(isModalOpen === "prod-modal") && (
                <div
                    onClick={() => setIsModalOpen(null)}
                    className="overlay item"
                />
            )}

            {(isModalOpen === "prod-modal") && (
                <div className='prod-modal'>
                    <div className="prod-modal__content">
                        <div className="prod-modal-mobile">
                            <p className='prod-modal__data-title'>{firstPart}<b> {secondPart}</b></p>
                            <p className='prod-modal__data-description'>{product?.subtitle?.[locale]}</p>
                        </div>

                        <button className="prod-modal__close" onClick={() => setIsModalOpen(null)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12.5209 14.8793L22.1233 24.4818C22.4435 24.791 22.8722 24.9621 23.3173 24.9582C23.7624 24.9543 24.1881 24.7758 24.5028 24.4611C24.8176 24.1464 24.9961 23.7206 24.9999 23.2756C25.0038 22.8305 24.8327 22.4017 24.5235 22.0816L14.921 12.4791L24.5235 2.87668C24.8327 2.55654 25.0038 2.12776 24.9999 1.6827C24.9961 1.23763 24.8176 0.811892 24.5028 0.497171C24.1881 0.182451 23.7624 0.00393166 23.3173 6.4168e-05C22.8722 -0.00380333 22.4435 0.16729 22.1233 0.476493L12.5209 10.079L2.9184 0.476493C2.59682 0.174933 2.17053 0.0103159 1.72973 0.0174737C1.28893 0.0246315 0.868211 0.203003 0.556589 0.514845C0.244967 0.826688 0.0668927 1.24753 0.0600467 1.68834C0.0532008 2.12914 0.21812 2.55531 0.519907 2.87668L10.1207 12.4791L0.51821 22.0816C0.356087 22.2382 0.226772 22.4255 0.13781 22.6326C0.0488489 22.8397 0.00202263 23.0624 6.40906e-05 23.2878C-0.00189445 23.5132 0.0410535 23.7367 0.126403 23.9453C0.211752 24.1539 0.337793 24.3435 0.49717 24.5028C0.656548 24.6622 0.846072 24.7882 1.05468 24.8736C1.26329 24.9589 1.48681 25.0019 1.7122 24.9999C1.93758 24.998 2.16032 24.9512 2.36742 24.8622C2.57451 24.7732 2.76182 24.6439 2.9184 24.4818L12.5209 14.8793Z" fill="#6B7280" />
                            </svg>
                        </button>

                        <div className="prod-modal__preview">
                            <div className="prod-modal__preview-img">
                                <ProductGallerySwiper
                                    images={product.gallery}
                                    productTitle={product.title?.[locale]}
                                />
                            </div>
                            <ul className="prod-modal__preview-stats">
                                {product?.features?.[locale]?.map((prod, index) => (
                                    <li key={index} className="prod-modal__preview-stats-item">
                                        <p>{prod}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="prod-modal__data">
                            <p className='prod-modal__data-title'>{firstPart}<b> {secondPart}</b></p>
                            <p className='prod-modal__data-description'>FitWin tyčinka s náplňou. Obsahuje sladidlo. (60 g)</p>
                            <p className='prod-modal__data-subtitle'>{product?.nutritionTable?.title?.[locale]}</p>
                            
                            <ul className="prod-modal__data-list">
                                {/* Заголовок таблицы */}
                                <li className={`prod-modal__data-item for-title ${!has60gData ? 'two-columns' : ''}`}>
                                    <p>Parameter</p>
                                    {has60gData && <p>NA 60G</p>}
                                    <p>NA 100G</p>
                                </li>
                                
                                {/* Строки таблицы */}
                                {product?.nutritionTable?.rows?.map((el, index) => (
                                    <li key={index} className={`prod-modal__data-item ${!has60gData ? 'two-columns' : ''}`}>
                                        <p>{el?.label?.[locale]}</p>
                                        {has60gData && (
                                            <p>{el?.values?.per_60g?.text?.trim() || "-"}</p>
                                        )}
                                        <p>{el?.values?.per_100g?.text?.trim() || "-"}</p>
                                    </li>
                                ))}
                            </ul>

                            <p className='prod-modal__data-subtitle bottom'>Zloženie</p>
                            <p className='prod-modal__data-description bottom'>{product?.ingredients?.[locale]}</p>
                        </div>
                    </div>
                    
                    <div className="prod-modal__main-quantity">
                        <p className='quantity-title'>{t("quant.title")}</p>
                        <div className="prod-modal__main-quantity-btns">
                            <button 
                                className={`prod-modal__main-quantity-btn ${selectedMode === 'unit' ? 'active' : ''}`}
                                onClick={() => setSelectedMode('unit')}
                            >
                                <p>1</p>
                                <p className='q'>{t("quant.q")}</p>
                            </button>
                            
                            {isBoxEnabled && (
                                <button 
                                    className={`prod-modal__main-quantity-btn ${selectedMode === 'box' ? 'active' : ''}`}
                                    onClick={() => setSelectedMode('box')}
                                >
                                    <p>{boxQuantity}</p>
                                    <p className='q'>{t("quant.q")}</p>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="prod-modal__main-btn">
                        <button
                            className={`products__item-button ${isInCart() ? 'in-cart' : ''}`}
                            onClick={handleAddToCart}
                        >
                            {isInCart() ? `${t("cart1")} ✓` : `${t("cart2")} • € ${currentPrice}`}
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default ProductModalContent;