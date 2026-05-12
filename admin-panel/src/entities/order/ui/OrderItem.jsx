import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { putchClick, cancelOrderClick } from '../lib/orderClick';
import { getStatusLabel } from '../../../shared/lib/statuses';

const OrderItem = ({ order }) => {
  console.log(order, "order data in OrderItem.jsx");
  const navigate = useNavigate();
  // console.log(order, "Asd");

  const [currentStatus, setCurrentStatus] = useState(order?.status || "new");
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || "pending");

  // Если статус canceled, можно как-то стилизовать карточку (например, сделать полупрозрачной)
  const isCanceled = currentStatus === 'canceled';

  if (!order) return null;

  // --- Маппинг реальных данных из объекта заказа ---
  const orderId = order.orderNumber || "---";

  // Форматируем дату
  const dateObj = new Date(order.createdAt);
  const time = {
    time: dateObj.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    date: dateObj.toLocaleDateString('uk-UA')
  };

  // Сумма заказа
  const price = `${order.totals?.totalToPay || 0} ${order.totals?.currency || 'UAH'}`;

  // Данные покупателя
  const bayer = {
    name: order.customer?.fullName || "Невідомо",
    phone: order.customer?.phone || "—",
    email: order.customer?.email || "—"
  };

  // Данные доставки
  const delivery = {
    type: order.delivery?.method || "Нова пошта",
    address: order.delivery?.postOffice || "Не вказано"
  };

  const handleCancel = () => {
    cancelOrderClick(order._id, () => {
      setCurrentStatus('canceled');
    });
  };

  return (
    <div className={`category-item orders-grid ${isCanceled ? 'opacity-50' : ''}`}>
      <div className="order-item__info-txt order-id" onClick={() => putchClick(order.orderNumber, navigate)}>
        <p>№{orderId}</p>
      </div>

      <div className="order-item__info with-list">
        <p>{time.time}</p>
        <p>{time.date}</p>
      </div>

      <div className="order-item__price">
        <p>{price}</p>
      </div>

    
      {/* <div className="order-item__prods">
        {order.itemsPreview && order.itemsPreview.length > 0 ? (
          order.itemsPreview.map((item, index) => {
            // Пытаемся достать название на укр, иначе берем артикул, иначе заглушку
            const itemTitle = item.titleSnapshot?.ua || item.title || item.sku || "Без назви";

            return (
              <div key={item._id || index} className="order-item__prods-item">
                <div className="order-item__prods-item-q">
                  <p>{item.qty || 1}</p>
                </div>
                <p>{itemTitle}</p>
              </div>
            );
          })
        ) : (
          <div className="order-item__prods-item">
            <p>Немає товарів</p>
          </div>
        )}
      </div> */}

      <div className="order-item__bayer">
        <p>{bayer.name}</p>
        <span>{bayer.phone}</span>
        <span>{bayer.email}</span>
      </div>

      <div className="order-item__delivery">
        <p>{delivery.type} -</p>
        <span>{delivery.address}</span>
      </div>

      <div className="order-item__status">
        <p>{getStatusLabel(currentStatus)}</p>
      </div>
      <div className="order-item__status">
        <p>{getStatusLabel(paymentStatus)}</p>
      </div>

      <div className="order-item__func">
        {/* Кнопка "Удалить/Скасувати" (Красная) */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={isCanceled}
          style={{ opacity: isCanceled ? 0.5 : 1, cursor: isCanceled ? 'not-allowed' : 'pointer', color: 'var(--color-danger)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M13.3332 0.833333H10.4165L9.58317 0H5.4165L4.58317 0.833333H1.6665V2.5H13.3332M2.49984 13.3333C2.49984 13.7754 2.67543 14.1993 2.98799 14.5118C3.30055 14.8244 3.72448 15 4.1665 15H10.8332C11.2752 15 11.6991 14.8244 12.0117 14.5118C12.3242 14.1993 12.4998 13.7754 12.4998 13.3333V3.33333H2.49984V13.3333Z" fill="currentColor" />
          </svg>
        </button>

        {/* Кнопка "Редактировать" (Зеленая) */}
        <button
          type="button"
          onClick={() => putchClick(order.orderNumber, navigate)}
          style={{ color: 'var(--color-success-text)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.05049 12.1201L12.5973 6.57331C11.6642 6.18349 10.8167 5.61424 10.1029 4.89786C9.38616 4.18393 8.81665 3.33616 8.42669 2.4027L2.87989 7.94951C2.44716 8.38224 2.23042 8.59898 2.04442 8.83747C1.82498 9.11907 1.63664 9.42358 1.48269 9.74569C1.35295 10.0187 1.2562 10.3097 1.06271 10.8902L0.0412452 13.9523C-0.00576786 14.0925 -0.0127429 14.243 0.0211037 14.387C0.0549504 14.5309 0.128277 14.6626 0.232842 14.7672C0.337407 14.8717 0.469064 14.9451 0.613015 14.9789C0.756966 15.0127 0.907505 15.0058 1.04771 14.9588L4.10985 13.9373C4.69108 13.7438 4.98132 13.6471 5.25431 13.5173C5.5778 13.3633 5.88054 13.1761 6.16253 12.9556C6.40102 12.7696 6.61776 12.5528 7.05049 12.1201ZM14.1362 5.03436C14.6893 4.4813 15 3.7312 15 2.94906C15 2.16692 14.6893 1.41682 14.1362 0.86376C13.5832 0.310704 12.8331 5.82739e-09 12.0509 0C11.2688 -5.82739e-09 10.5187 0.310704 9.96564 0.86376L9.30041 1.52899L9.32891 1.61223C9.65664 2.55028 10.1931 3.40166 10.8979 4.10214C11.6193 4.82798 12.5005 5.37503 13.471 5.69959L14.1362 5.03436Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default OrderItem;