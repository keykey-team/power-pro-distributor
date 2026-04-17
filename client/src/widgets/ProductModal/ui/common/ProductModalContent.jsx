'use client'
import { useModals } from '@shared/index';
import Image from 'next/image';
import React, { useState, useEffect, useRef, useMemo } from 'react'
import ProductGallerySwiper from './ProductGallerySwiper';
import { useI18n } from '@shared/i18n/use-i18n';

const splitTitleByFlavor = (title) => {
    if (!title) return { firstPart: '', secondPart: '' };
    const regex = /(.*?)(?:^|\s)(s|with)(?:\s)(.*)/i;
    const match = title.match(regex);
    if (match) {
        return {
            firstPart: `${match[1]} ${match[2]} `.trimStart(),
            secondPart: match[3]
        };
    }
    return { firstPart: title, secondPart: '' };
};

const ProductModalContent = ({ product, locale }) => {
    const { isModalOpen, setIsModalOpen } = useModals();
    const { t } = useI18n();
    
    const rawTitle = product?.title?.[locale] || product?.subtitle?.[locale] || 'Product';
    const { firstPart, secondPart } = splitTitleByFlavor(rawTitle);
    
    const [cart, setCart] = useState([]);
    const [selectedMode, setSelectedMode] = useState('unit');
    const [selectedV2Key, setSelectedV2Key] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false); 
    const selectRef = useRef(null);

    const v2Data = product?.purchaseOptionsV2;
    const v2Items = useMemo(() => 
        Array.isArray(v2Data?.items) ? v2Data.items.filter(item => item?.enabled) : [], 
    [v2Data]);
    
    const hasV2Options = v2Items.length > 0;
    const currentV2Option = v2Items.find(item => item.key === selectedV2Key) || v2Items[0];

    // === ЛОГИКА ПОДГОТОВКИ ГАЛЕРЕИ ===
    const activeGallery = useMemo(() => {
        // 1. Пытаемся взять картинки из выбранной вариации
        const variantImages = currentV2Option?.images;

        if (variantImages && variantImages.length > 0) {
            // Если в массиве объекты { url: '...' }, преобразуем их в массив строк (если Swiper ждет строки)
            // Если Swiper сам умеет работать с .url, можно оставить просто variantImages
            return variantImages.map(img => typeof img === 'string' ? img : img.url);
        }

        // 2. Если у вариации нет фото, берем общую галерею продукта
        // Тоже приводим к единообразному виду (массив строк URL)
        return product?.gallery?.map(img => typeof img === 'string' ? img : img.url) || [];
    }, [currentV2Option, product?.gallery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsSelectOpen(false);
            }
        };
        if (isSelectOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSelectOpen]);

    useEffect(() => {
        if (hasV2Options && v2Items.length > 0) {
            const defaultKey = v2Data?.defaultKey;
            const isValidDefault = v2Items.some(item => item.key === defaultKey);
            if (!selectedV2Key || !v2Items.some(item => item.key === selectedV2Key)) {
                setSelectedV2Key(isValidDefault ? defaultKey : v2Items[0].key);
            }
        }
    }, [product?._id, hasV2Options, v2Items, v2Data?.defaultKey]);

    useEffect(() => {
        const loadCart = () => {
            try {
                const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
                setCart(storedCart);
            } catch (e) { setCart([]); }
        };
        loadCart();
        window.addEventListener('cartUpdated', loadCart);
        return () => window.removeEventListener('cartUpdated', loadCart);
    }, []);

    const boxOptions = product?.purchaseOptions?.box;
    const unitOptions = product?.purchaseOptions?.unit;
    const isBoxEnabled = boxOptions?.enabled;
    const boxQuantity = boxOptions?.quantity || 1;

    const currentPrice = hasV2Options
        ? currentV2Option?.price
        : (selectedMode === 'unit' ? (unitOptions?.price || product.price) : (boxOptions?.price || product.price));

    const handleAddToCart = (e) => {
        e.stopPropagation();
        try {
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const compositeId = hasV2Options ? `${product._id}-${currentV2Option.key}` : `${product._id}-${selectedMode}`;
            const existingItemIndex = currentCart.findIndex(item => item.productId === compositeId);
            
            if (existingItemIndex >= 0) {
                currentCart[existingItemIndex].quantity += 1;
            } else {
                const baseName = product?.title?.[locale];
                let nameWithQuantity = hasV2Options 
                    ? `${baseName} (${currentV2Option?.title?.[locale] || currentV2Option.key})`
                    : (selectedMode === 'box' ? `${baseName} (Balenie ${boxQuantity} ks)` : baseName);

                currentCart.push({
                    kind: 'product',
                    name: nameWithQuantity,
                    productId: compositeId,
                    baseProductId: product._id,
                    quantity: 1,
                    price: currentPrice,
                    purchaseMode: hasV2Options ? currentV2Option.mode : selectedMode,
                    itemsInPackage: hasV2Options ? (currentV2Option.quantity || 1) : (selectedMode === 'unit' ? 1 : boxQuantity),
                    product: product
                });
            }
            localStorage.setItem('cart', JSON.stringify(currentCart));
            setCart([...currentCart]);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) { console.error(error); }
    };

    const isInCart = () => {
        const checkId = hasV2Options ? `${product?._id}-${currentV2Option?.key}` : `${product?._id}-${selectedMode}`;
        return cart.some(item => item.productId === checkId);
    };

    const renderV2Select = () => {
        if (!hasV2Options) return null;
        const selectedTitle = currentV2Option?.title?.[locale] || currentV2Option?.key || 'Vyberte';
        return (
            <div className="prod-modal__custom-select" ref={selectRef}>
                <div className="prod-modal__custom-select-trigger" onClick={() => setIsSelectOpen(!isSelectOpen)}>
                    <span>{selectedTitle} — € {currentV2Option?.price}</span>
                    <svg className={`prod-modal__custom-select-arrow ${isSelectOpen ? 'is-open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                {isSelectOpen && (
                    <ul className="prod-modal__custom-select-list">
                        {v2Items.map((item) => (
                            <li key={item.key} className={`prod-modal__custom-select-item ${item.key === selectedV2Key ? 'is-selected' : ''}`}
                                onClick={() => { setSelectedV2Key(item.key); setIsSelectOpen(false); }}>
                                {item.title?.[locale] || item.key} — € {item.price}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <>
            {isModalOpen === "prod-modal" && <div onClick={() => setIsModalOpen(null)} className="overlay item" />}
            {isModalOpen === "prod-modal" && (
                <div className='prod-modal'>
                    <div className="prod-modal__content">
                        <div className="prod-modal-mobile">
                            <p className='prod-modal__data-title'>{firstPart} {secondPart && <b style={{ color: "red" }}>{secondPart}</b>}</p>
                            <p className='prod-modal__data-description'>{product?.subtitle?.[locale]}</p>
                            {renderV2Select()}
                        </div>

                        <button className="prod-modal__close" onClick={() => setIsModalOpen(null)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none"><path d="M12.5209 14.8793L22.1233 24.4818C22.4435 24.791 22.8722 24.9621 23.3173 24.9582C23.7624 24.9543 24.1881 24.7758 24.5028 24.4611C24.8176 24.1464 24.9961 23.7206 24.9999 23.2756C25.0038 22.8305 24.8327 22.4017 24.5235 22.0816L14.921 12.4791L24.5235 2.87668C24.8327 2.55654 25.0038 2.12776 24.9999 1.6827C24.9961 1.23763 24.8176 0.811892 24.5028 0.497171C24.1881 0.182451 23.7624 0.00393166 23.3173 6.4168e-05C22.8722 -0.00380333 22.4435 0.16729 22.1233 0.476493L12.5209 10.079L2.9184 0.476493C2.59682 0.174933 2.17053 0.0103159 1.72973 0.0174737C1.28893 0.0246315 0.868211 0.203003 0.556589 0.514845C0.244967 0.826688 0.0668927 1.24753 0.0600467 1.68834C0.0532008 2.12914 0.21812 2.55531 0.519907 2.87668L10.1207 12.4791L0.51821 22.0816C0.356087 22.2382 0.226772 22.4255 0.13781 22.6326C0.0488489 22.8397 0.00202263 23.0624 6.40906e-05 23.2878C-0.00189445 23.5132 0.0410535 23.7367 0.126403 23.9453C0.211752 24.1539 0.337793 24.3435 0.49717 24.5028C0.656548 24.6622 0.846072 24.7882 1.05468 24.8736C1.26329 24.9589 1.48681 25.0019 1.7122 24.9999C1.93758 24.998 2.16032 24.9512 2.36742 24.8622C2.57451 24.7732 2.76182 24.6439 2.9184 24.4818L12.5209 14.8793Z" fill="#6B7280" /></svg>
                        </button>

                        <div className="prod-modal__preview">
                            <div className="prod-modal__preview-img">
                                <ProductGallerySwiper
                                    key={selectedV2Key || 'default'} 
                                    images={activeGallery}
                                    productTitle={product?.title?.[locale]}
                                />
                            </div>
                            <ul className="prod-modal__preview-stats">
                                {product?.features?.[locale]?.map((prod, index) => (
                                    <li key={index} className="prod-modal__preview-stats-item"><p>{prod}</p></li>
                                ))}
                            </ul>
                        </div>

                        <div className="prod-modal__data">
                            <p className='prod-modal__data-title'>{firstPart} {secondPart && <b style={{ color: "red" }}>{secondPart}</b>}</p>
                            <p className='prod-modal__data-subtitle'>{product?.nutritionTable?.title?.[locale]}</p>
                            {renderV2Select()}

                            {product?.type !== "box" && (
                                <ul className="prod-modal__data-list">
                                    <li className="prod-modal__data-item for-title">
                                        <p>Parameter</p>
                                        {product?.nutritionTable?.rows?.some(r => r?.values?.per_60g?.text) && <p>NA 60G</p>}
                                        <p>NA 100G</p>
                                    </li>
                                    {product?.nutritionTable?.rows?.map((el, index) => (
                                        <li key={index} className="prod-modal__data-item">
                                            <p>{el?.label?.[locale]}</p>
                                            {product?.nutritionTable?.rows?.some(r => r?.values?.per_60g?.text) && (
                                                <p>{el?.values?.per_60g?.text?.trim() || "-"}</p>
                                            )}
                                            <p>{el?.values?.per_100g?.text?.trim() || "-"}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className='prod-modal__data-subtitle bottom'>Zloženie</p>
                            <p className='prod-modal__data-description bottom' style={{ whiteSpace: "pre-line" }}>
                                {product?.type === "box" ? product?.description?.[locale] : product?.ingredients?.[locale]}
                            </p>
                        </div>
                    </div>

                    {!hasV2Options && product?.type !== "box" && isBoxEnabled && (
                        <div className="prod-modal__main-quantity">
                            <p className='quantity-title'>{t("quant.title")}</p>
                            <div className="prod-modal__main-quantity-btns">
                                <button className={`prod-modal__main-quantity-btn ${selectedMode === 'unit' ? 'active' : ''}`} onClick={() => setSelectedMode('unit')}><p>1</p><p className='q'>{t("quant.q")}</p></button>
                                <button className={`prod-modal__main-quantity-btn ${selectedMode === 'box' ? 'active' : ''}`} onClick={() => setSelectedMode('box')}><p>{boxQuantity}</p><p className='q'>{t("quant.q")}</p></button>
                            </div>
                        </div>
                    )}

                    <div className="prod-modal__main-btn">
                        <button className={`products__item-button ${isInCart() ? 'in-cart' : ''}`} onClick={handleAddToCart}>
                            {isInCart() ? `${t("cart1")} ✓` : `${t("cart2")} • € ${currentPrice}`}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductModalContent;