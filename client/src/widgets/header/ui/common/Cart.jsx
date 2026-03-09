"use client";
import { useI18n } from '@shared/i18n/use-i18n';
import { useModals } from '@shared/index';
import { removeItemById, updateQuantity } from '@widgets/header/lib/cart'; // добавлен импорт
import { useCart } from '@widgets/header/model/useCart';
import Image from 'next/image';
import React from 'react';

const Curt = () => {
    const { isModalOpen, setIsProdModalId, setIsModalOpen } = useModals();

    const { t } = useI18n();
    const cart = useCart();

    const total = cart.reduce((acc, item) => {
        const price = item?.product?.price || item?.price || 0;
        const quantity = item.quantity || 1;
        return acc + price * quantity;
    }, 0);

    const handleCheckout = () => {
        setIsModalOpen(null);
        const formElement = document.getElementById('order-form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {isModalOpen === 'curt' && (
                <div onClick={() => setIsModalOpen(null)} className="overlay" />
            )}
            <div className={isModalOpen === 'curt' ? 'curt active' : 'curt'}>
                <div className="curt__header">
                    <p>{t('cart.title')}</p>
                    <svg
                        onClick={() => setIsModalOpen(null)}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        {/* иконка закрытия */}
                    </svg>
                </div>

                <div className="curt__list">
                    {cart.length === 0 ? (
                        <p className='curt__empty'>{t('cart.empty') || 'Корзина пуста'}</p>
                    ) : (
                        <ul>
                            {cart.map((item) => (
                                <li key={item.id} className="curt__item" onClick={() => {
                                    setIsModalOpen("prod-modal");
                                    setIsProdModalId(item.product._id)
                                }}>
                                    <div className="curt__item-content">
                                        <Image
                                            src={item?.product?.gallery[0] || "/img/box.png"}
                                            alt={item.name}
                                            width={70}
                                            height={70}
                                        />
                                        <div className="curt__item-content-text">
                                            <span className='curt__item-name'>{item.name}</span>

                                            {/* Блок управления количеством */}
                                            {item.size ? (<span className='curt__item-price'>
                                                {item.price * (item.quantity || 1)} {t('cart.currency') || 'грн'}
                                            </span>) : (<span className='curt__item-price'>
                                                {item.product.price * (item.quantity || 1)} {t('cart.currency') || 'грн'}
                                            </span>)}

                                        </div>
                                    </div>
                                    <div className="curt__item-quantity">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="3" viewBox="0 0 9 3" fill="none">
                                                <path d="M7.875 0H1.125C0.826631 0 0.540483 0.158036 0.329505 0.43934C0.118526 0.720645 0 1.10218 0 1.5C0 1.89782 0.118526 2.27936 0.329505 2.56066C0.540483 2.84196 0.826631 3 1.125 3H7.875C8.17337 3 8.45952 2.84196 8.6705 2.56066C8.88147 2.27936 9 1.89782 9 1.5C9 1.10218 8.88147 0.720645 8.6705 0.43934C8.45952 0.158036 8.17337 0 7.875 0Z" fill="#FEFEFE" />
                                            </svg>
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none">
                                                <path d="M7.875 3.375H5.625V1.125C5.625 0.826631 5.50647 0.540483 5.2955 0.329505C5.08452 0.118526 4.79837 0 4.5 0C4.20163 0 3.91548 0.118526 3.7045 0.329505C3.49353 0.540483 3.375 0.826631 3.375 1.125L3.41494 3.375H1.125C0.826631 3.375 0.540483 3.49353 0.329505 3.7045C0.118526 3.91548 0 4.20163 0 4.5C0 4.79837 0.118526 5.08452 0.329505 5.2955C0.540483 5.50647 0.826631 5.625 1.125 5.625L3.41494 5.58506L3.375 7.875C3.375 8.17337 3.49353 8.45952 3.7045 8.6705C3.91548 8.88147 4.20163 9 4.5 9C4.79837 9 5.08452 8.88147 5.2955 8.6705C5.50647 8.45952 5.625 8.17337 5.625 7.875V5.58506L7.875 5.625C8.17337 5.625 8.45952 5.50647 8.6705 5.2955C8.88147 5.08452 9 4.79837 9 4.5C9 4.20163 8.88147 3.91548 8.6705 3.7045C8.45952 3.49353 8.17337 3.375 7.875 3.375Z" fill="#FEFEFE" />
                                            </svg>
                                        </button>
                                    </div>

                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="curt__func">
                    <div className="curt__func-data">
                        <p>{t('cart.cost')}</p>
                        <p>
                            {total} {t('cart.currency') || 'грн'}
                        </p>
                    </div>
                    <div className="curt__func-button" onClick={handleCheckout}>
                        {t('cart.btn')}
                    </div>
                </div>
            </div >
        </>
    );
};

export default Curt;