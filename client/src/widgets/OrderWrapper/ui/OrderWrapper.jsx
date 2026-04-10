'use client';

import React, { useState } from 'react';
import OrderForm from '@widgets/Order/OrderForm/ui/OrderForm';
import OrderFunc from '@widgets/Order/OrderFunc/ui/OrderFunc';

export default function OrderWrapper() {
  // Храним состояние типа доставки: 'pickup' (на отделение) или 'courier' (курьером)
  const [deliveryType, setDeliveryType] = useState('pickup');

  return (
    <div className="order-content container" style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
      <OrderForm 
        deliveryType={deliveryType} 
        setDeliveryType={setDeliveryType} 
      />
      <OrderFunc 
        deliveryType={deliveryType} 
      />
    </div>
  );
}