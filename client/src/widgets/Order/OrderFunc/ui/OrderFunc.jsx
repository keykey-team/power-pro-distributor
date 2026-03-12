'use client';

import { useI18n } from '@shared/i18n/use-i18n';
import { useCart } from '@widgets/header/model/useCart';
import Image from 'next/image';
import React from 'react';

const OrderFunc = ({ onSubmit }) => {
  const { t } = useI18n();
  const cart = useCart();

  const total = cart.reduce((acc, item) => {
    const price = item?.product?.price || item?.price || 0;
    const quantity = item.quantity || 1;
    return acc + price * quantity;
  }, 0);

  const handleButtonClick = () => {
    // Диспатчим событие, на которое подписана форма
    window.dispatchEvent(new CustomEvent('submit-order-form'));
    // Если передан проп onSubmit, вызываем его
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <section className="order-func">
      <div className="order-func__title">
        {t("order.func-title")}
      </div>
      <div className="order-func__list">
        {cart.map((item, index) => (
          <div key={index} className='order-func__item'>
            <div className="order-func__item-cont">
              <Image width={71} height={71} alt='404' src={item?.product?.gallery?.[0] || "/img/box.png"} />
              <div className="order-func__item-txt">
                <p className='order-func__item-title'>{item.name}</p>
                <p className='order-func__item-quantity'>{item.quantity} {t("order.quant")}</p>
              </div>
            </div>
            {console.log(item)}
            <div className="order-func__item-price">{item?.product?.price.toFixed(2) * item?.quantity || item?.price.toFixed(2) * item?.quantity} €</div>
          </div>
        ))}
      </div>
      <div className="order-func__promo">
        <input type="text" name="" id="" placeholder={t("order.promo-placeholder")} />
        <button>{t("order.promo")}</button>
      </div>
      <div className="order-func__data">
        <div className='order-func__data-txt'>
          <p>{t("order.total")}</p>
          <p>{total} €</p>
        </div>
        <div className='order-func__data-txt'>
          <p>{t("order.delivery")}</p>
          <p>{t("order.delivery-status")}</p>
        </div>
        <div className='order-func__data-txt bold'>
          <p>{t("order.total2")}</p>
          <p>{total} €</p>
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