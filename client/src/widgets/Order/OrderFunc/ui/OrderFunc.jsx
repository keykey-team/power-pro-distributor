'use client';

import { useI18n } from '@shared/i18n/use-i18n';
import { useCart } from '@widgets/header/model/useCart';
import Image from 'next/image';
import React from 'react';

const OrderFunc = ({ onSubmit, deliveryType = 'pickup' }) => {
  const { t } = useI18n();
  const cart = useCart();

  // Считаем стоимость товаров
  const total = cart.reduce((acc, item) => {
    const price = Number(item?.price || item?.price || 0);
    const quantity = Number(item.quantity || 1);
    return acc + price * quantity;
  }, 0);

  // Логика расчета доставки: бесплатно от 50 евро
  const isFreeDelivery = total >= 50;
  let deliveryPrice = 0;

  if (!isFreeDelivery) {
    deliveryPrice = deliveryType === 'courier' ? 4.3 : 3.2;
  }

  // Итоговая сумма (товары + доставка)
  const finalTotal = total + deliveryPrice;

  const handleButtonClick = () => {
    window.dispatchEvent(new CustomEvent('submit-order-form'));
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <section className="order-func" style={{ flex: '1 1 35%' }}>
      <div className="order-func__title">
        {t("order.func-title")}
      </div>
      
      <div className="order-func__list">
        {cart.map((item, index) => {
          const price = Number(item?.price || item?.price || 0);
          const quantity = Number(item.quantity || 1);
          const itemTotal = price * quantity;
          
          return (
            <div key={index} className='order-func__item'>
              <div className="order-func__item-cont">
                <Image 
                  width={71} 
                  height={71} 
                  alt='product' 
                  src={item?.product?.gallery?.[0] || "/img/box.png"} 
                />
                <div className="order-func__item-txt">
                  <p className='order-func__item-title'>{item.name || item?.product?.name}</p>
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
        {/* Место для промокода */}
      </div>

      <div className="order-func__data">
        <div className='order-func__data-txt'>
          <p>{t("order.total")}</p>
          <p>{total.toFixed(2)} €</p>
        </div>
        
        {/* Строка с доставкой */}
        <div className='order-func__data-txt'>
          <p>{t("order.delivery")}</p>
          <p>{isFreeDelivery ? 'Zadarmo' : `${deliveryPrice.toFixed(2)} €`}</p>
        </div>
        
        {/* Итоговая сумма с учетом доставки */}
        <div className='order-func__data-txt bold'>
          <p>{t("order.total2")}</p>
          <p>{finalTotal.toFixed(2)} €</p>
        </div>
        
        <button
          className="order-submit-button"
          onClick={handleButtonClick}
        >
          {t('order.btn') || 'Potvrdiť objednávku'}
        </button>
      </div>
    </section>
  );
};

export default OrderFunc;