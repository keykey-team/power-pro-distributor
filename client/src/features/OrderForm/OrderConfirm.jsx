"use client"
import { useModals } from '@shared/index';
import { clearCart } from '@widgets/header/lib/cart';
import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'; // 1. Импортируем хук для работы с параметрами URL

const OrderConfirm = ({ locale, title1, title2, subtitle }) => {
    const { isModalOpen, setIsModalOpen } = useModals();
    const searchParams = useSearchParams(); // 2. Инициализируем хук

    // 3. Добавляем useEffect для проверки параметров при загрузке компонента
    useEffect(() => {
        const comgateStatus = searchParams.get('comgate'); // получаем значение ?comgate=...

        if (comgateStatus === 'paid') {
            setIsModalOpen("order-confirm");
        }
    }, [searchParams, setIsModalOpen]);

    const handleClose = () => {
        setIsModalOpen(null);
        clearCart();
        window.location.href = '/';

    };

    return (
        <>
            {(isModalOpen === "order-confirm") && (
                <div
                    onClick={handleClose}
                    className="overlay item"
                />
            )}
            {isModalOpen === "order-confirm" &&
                (
                    <div className='order-confirm-modal'>
                        <div className="order-confirm-modal__content">
                            {/* Крестик закрытия вынесен на уровень выше, чтобы не перекрывать текст (оставил твою структуру) */}
                            <svg
                                onClick={handleClose}
                                xmlns="http://www.w3.org/2000/svg"
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                                style={{ cursor: 'pointer', position: 'absolute', right: '15px', top: '15px' }} // Добавил базовые стили для крестика, чтобы по нему было легко попасть
                            >
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.00834 5.95173L8.84933 9.79272C8.97738 9.9164 9.1489 9.98483 9.32692 9.98329C9.50495 9.98174 9.67524 9.91033 9.80113 9.78444C9.92702 9.65856 9.99843 9.48826 9.99997 9.31023C10.0015 9.13221 9.93308 8.9607 9.8094 8.83264L5.96842 4.99166L9.8094 1.15067C9.93308 1.02262 10.0015 0.851105 9.99997 0.673079C9.99843 0.495053 9.92702 0.324757 9.80113 0.198868C9.67524 0.0729803 9.50495 0.00157267 9.32692 2.56672e-05C9.1489 -0.00152133 8.97738 0.0669159 8.84933 0.190597L5.00834 4.03158L1.16736 0.190597C1.03873 0.0699732 0.868211 0.00412636 0.691892 0.00698947C0.515573 0.00985258 0.347284 0.0812012 0.222636 0.205938C0.0979868 0.330675 0.0267571 0.499014 0.0240187 0.675335C0.0212803 0.851656 0.0872479 1.02213 0.207963 1.15067L4.04827 4.99166L0.207284 8.83264C0.142435 8.89527 0.0907088 8.9702 0.0551242 9.05303C0.0195396 9.13587 0.000809053 9.22497 2.56362e-05 9.31512C-0.000757781 9.40528 0.0164214 9.49468 0.0505611 9.57813C0.0847007 9.66157 0.135117 9.73738 0.198868 9.80113C0.262619 9.86488 0.338429 9.9153 0.421873 9.94944C0.505317 9.98358 0.594724 10.0008 0.684879 9.99998C0.775033 9.99919 0.864129 9.98046 0.946967 9.94488C1.0298 9.90929 1.10473 9.85756 1.16736 9.79272L5.00834 5.95173Z" fill="#FEFEFE" />
                            </svg>
                            <h5>{title1} <b>{title2}</b></h5>
                            <p>{subtitle}</p>
                        </div>
                    </div>
                )}
        </>
    )
}

export default OrderConfirm;