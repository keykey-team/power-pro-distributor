"use client";
import { useI18n } from '@shared/i18n/use-i18n';
import { useModals } from '@shared/index';
import { removeItemById, updateQuantity } from '@widgets/header/lib/cart'; // добавлен импорт
import { useCart } from '@widgets/header/model/useCart';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

const Curt = () => {
    const { isModalOpen, setIsProdModalId, setIsModalOpen } = useModals();
    const router = useRouter()
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
        router.push("/order")
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

                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.02 14.2842L21.2384 23.5025C21.5457 23.7994 21.9573 23.9636 22.3846 23.9599C22.8119 23.9562 23.2206 23.7848 23.5227 23.4827C23.8249 23.1805 23.9962 22.7718 23.9999 22.3446C24.0037 21.9173 23.8394 21.5057 23.5426 21.1983L14.3242 11.98L23.5426 2.76162C23.8394 2.45428 24.0037 2.04265 23.9999 1.61539C23.9962 1.18813 23.8249 0.779416 23.5227 0.477284C23.2206 0.175153 22.8119 0.0037744 22.3846 6.16013e-05C21.9573 -0.00365119 21.5457 0.160598 21.2384 0.457434L12.02 9.67579L2.80166 0.457434C2.49295 0.167936 2.08371 0.00990326 1.66054 0.0167747C1.23737 0.0236462 0.833482 0.194883 0.534325 0.494252C0.235168 0.79362 0.064217 1.19763 0.0576449 1.6208C0.0510728 2.04397 0.209395 2.4531 0.499111 2.76162L9.71584 11.98L0.497482 21.1983C0.341843 21.3487 0.217701 21.5285 0.132298 21.7273C0.0468949 21.9261 0.00194173 22.1399 6.1527e-05 22.3563C-0.00181867 22.5727 0.0394114 22.7872 0.121347 22.9875C0.203282 23.1878 0.324281 23.3697 0.477284 23.5227C0.630286 23.6757 0.812229 23.7967 1.01249 23.8787C1.21276 23.9606 1.42734 24.0018 1.64371 23.9999C1.86008 23.9981 2.07391 23.9531 2.27272 23.8677C2.47153 23.7823 2.65134 23.6582 2.80166 23.5025L12.02 14.2842Z" fill="#FEFEFE" />
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
                                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1) }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="3" viewBox="0 0 9 3" fill="none">
                                                <path d="M7.875 0H1.125C0.826631 0 0.540483 0.158036 0.329505 0.43934C0.118526 0.720645 0 1.10218 0 1.5C0 1.89782 0.118526 2.27936 0.329505 2.56066C0.540483 2.84196 0.826631 3 1.125 3H7.875C8.17337 3 8.45952 2.84196 8.6705 2.56066C8.88147 2.27936 9 1.89782 9 1.5C9 1.10218 8.88147 0.720645 8.6705 0.43934C8.45952 0.158036 8.17337 0 7.875 0Z" fill="#FEFEFE" />
                                            </svg>
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button

                                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1) }}
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
                    {console.log(cart.length === 0)}
                    <div className={cart.length === 0 ? "curt__func-button disable" : "curt__func-button"} onClick={handleCheckout}>
                        {t('cart.btn')}
                    </div>
                </div>
            </div >
        </>
    );
};

export default Curt;