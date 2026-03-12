'use client';

import { useI18n } from '@shared/i18n/use-i18n';
import { useCart } from '@widgets/header/model/useCart';
import Image from 'next/image';
import React from 'react';

const OrderFunc = ({ onSubmit }) => {
  const { t } = useI18n();
  const cart = useCart();

  const total = cart.reduce((acc, item) => {
    const price = Number(item?.product?.price || item?.price || 0);
    const quantity = Number(item.quantity || 1);
    return acc + price * quantity;
  }, 0);

  const handleButtonClick = () => {
    window.dispatchEvent(new CustomEvent('submit-order-form'));
    if (onSubmit) {
      onSubmit();
    }
  };

  // Функция для безопасного форматирования цены
  const formatPrice = (price) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  return (
    <section className="order-func">
      <div className="order-func__title">
        {t("order.func-title")}
      </div>
      <div className="order-func__list">
        {cart.map((item, index) => {
          const price = Number(item?.product?.price || item?.price || 0);
          const quantity = Number(item.quantity || 1);
          const itemTotal = price * quantity;
          
          return (
            <div key={index} className='order-func__item'>
              <div className="order-func__item-cont">
                <Image 
                  width={71} 
                  height={71} 
                  alt='404' 
                  src={item?.product?.gallery?.[0] || "/img/box.png"} 
                />
                <div className="order-func__item-txt">
                  <p className='order-func__item-title'>{item.name}</p>
                  <p className='order-func__item-quantity'>{quantity} {t("order.quant")}</p>
                </div>
              </div>
              <div className="order-func__item-price">
                {itemTotal.toFixed(2)} €
              </div>
            </div>
          );
        })}
      </div>
      <div className="order-func__promo">
        <input type="text" name="" id="" placeholder={t("order.promo-placeholder")} />
        <button>{t("order.promo")}</button>
      </div>
      <div className="order-func__data">
        <div className='order-func__data-txt'>
          <p>{t("order.total")}</p>
          <p>{total.toFixed(2)} €</p>
        </div>
        <div className='order-func__data-txt'>
          <p>{t("order.delivery")}</p>
          <p>{t("order.delivery-status")}</p>
        </div>
        <div className='order-func__data-txt bold'>
          <p>{t("order.total2")}</p>
          <p>{total.toFixed(2)} €</p>
        </div>
        <button
          className="order-submit-button"
          onClick={handleButtonClick}
        >
          {t('order.btn') || 'Подтвердить заказ'}
        </button>
      </div>
    </section>
  );
};

export default OrderFunc;