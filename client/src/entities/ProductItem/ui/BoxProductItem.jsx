// BoxProductItem.tsx
"use client";
import Image from "next/image";
import React from "react";

const BoxProductItem = ({ product, locale, quantity, onIncrement, onDecrement, isMaxLimit }) => {
  // Локализованные поля
  const title = product.title?.[locale] || product.title?.en || 'Без названия';
  const subtitle = product.subtitle?.[locale] || product.subtitle?.en || '';

  // Числовые поля
  const weight = product.weightG ? `${product.weightG} г` : null;
  const protein = product.proteinG ? `Протеин ${product.proteinG} г` : null;
  const price = product.price ? `${product.price} ${product.currency || ''}` : null;

  return (
    <div className="product-box">
      <div className="product-box__content">
        <Image
          src={product?.gallery?.[0] || "/img/test.png"} // заглушка, если cover отсутствует
          alt={title}
          width={125}
          height={125}
        />
        <div className="variant">
          <p>{title}</p>
          <span>
            {weight && `${weight} • `}{protein}
          </span>
          {price && <span className="price">{price}</span>}
          {/* Мобильный счётчик */}
          <div className="product-box__counter mobile">
            <button
              onClick={onDecrement}
              disabled={quantity === 0}
              className={quantity === 0 ? 'disabled' : ''}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="4"
                viewBox="0 0 13 4"
                fill="none"
              >
                <path
                  d="M11.375 0H1.625C1.19402 0 0.780698 0.210714 0.475951 0.585787C0.171205 0.96086 0 1.46957 0 2C0 2.53043 0.171205 3.03914 0.475951 3.41421C0.780698 3.78929 1.19402 4 1.625 4H11.375C11.806 4 12.2193 3.78929 12.524 3.41421C12.8288 3.03914 13 2.53043 13 2C13 1.46957 12.8288 0.96086 12.524 0.585787C12.2193 0.210714 11.806 0 11.375 0Z"
                  fill="#FEFEFE"
                />
              </svg>
            </button>
            <p>{quantity}</p>
            <button
              onClick={onIncrement}
              disabled={isMaxLimit}
              className={isMaxLimit ? 'disabled' : ''}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
              >
                <path
                  d="M11.375 4.875H8.125V1.625C8.125 1.19402 7.95379 0.780698 7.64905 0.475951C7.3443 0.171205 6.93098 0 6.5 0C6.06902 0 5.6557 0.171205 5.35095 0.475951C5.04621 0.780698 4.875 1.19402 4.875 1.625L4.93269 4.875H1.625C1.19402 4.875 0.780698 5.04621 0.475951 5.35095C0.171205 5.6557 0 6.06902 0 6.5C0 6.93098 0.171205 7.3443 0.475951 7.64905C0.780698 7.95379 1.19402 8.125 1.625 8.125L4.93269 8.06731L4.875 11.375C4.875 11.806 5.04621 12.2193 5.35095 12.524C5.6557 12.8288 6.06902 13 6.5 13C6.93098 13 7.3443 12.8288 7.64905 12.524C7.95379 12.2193 8.125 11.806 8.125 11.375V8.06731L11.375 8.125C11.806 8.125 12.2193 7.95379 12.524 7.64905C12.8288 7.3443 13 6.93098 13 6.5C13 6.06902 12.8288 5.6557 12.524 5.35095C12.2193 5.04621 11.806 4.875 11.375 4.875Z"
                  fill="#FEFEFE"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Десктопный счётчик */}
      <div className="product-box__counter">
        <button
          onClick={onDecrement}
          disabled={quantity === 0}
          className={quantity === 0 ? 'disabled' : ''}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="4"
            viewBox="0 0 13 4"
            fill="none"
          >
            <path
              d="M11.375 0H1.625C1.19402 0 0.780698 0.210714 0.475951 0.585787C0.171205 0.96086 0 1.46957 0 2C0 2.53043 0.171205 3.03914 0.475951 3.41421C0.780698 3.78929 1.19402 4 1.625 4H11.375C11.806 4 12.2193 3.78929 12.524 3.41421C12.8288 3.03914 13 2.53043 13 2C13 1.46957 12.8288 0.96086 12.524 0.585787C12.2193 0.210714 11.806 0 11.375 0Z"
              fill="#FEFEFE"
            />
          </svg>
        </button>
        <p>{quantity}</p>
        <button
          onClick={onIncrement}
          disabled={isMaxLimit}
          className={isMaxLimit ? 'disabled' : ''}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
          >
            <path
              d="M11.375 4.875H8.125V1.625C8.125 1.19402 7.95379 0.780698 7.64905 0.475951C7.3443 0.171205 6.93098 0 6.5 0C6.06902 0 5.6557 0.171205 5.35095 0.475951C5.04621 0.780698 4.875 1.19402 4.875 1.625L4.93269 4.875H1.625C1.19402 4.875 0.780698 5.04621 0.475951 5.35095C0.171205 5.6557 0 6.06902 0 6.5C0 6.93098 0.171205 7.3443 0.475951 7.64905C0.780698 7.95379 1.19402 8.125 1.625 8.125L4.93269 8.06731L4.875 11.375C4.875 11.806 5.04621 12.2193 5.35095 12.524C5.6557 12.8288 6.06902 13 6.5 13C6.93098 13 7.3443 12.8288 7.64905 12.524C7.95379 12.2193 8.125 11.806 8.125 11.375V8.06731L11.375 8.125C11.806 8.125 12.2193 7.95379 12.524 7.64905C12.8288 7.3443 13 6.93098 13 6.5C13 6.06902 12.8288 5.6557 12.524 5.35095C12.2193 5.04621 11.806 4.875 11.375 4.875Z"
              fill="#FEFEFE"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BoxProductItem;