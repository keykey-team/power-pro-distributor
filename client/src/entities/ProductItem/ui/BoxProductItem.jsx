"use client"
import Image from 'next/image'
import React from 'react'

const BoxProductItem = ({ product, key }) => {
    return (
        <div key={key} className="product-box">
            <div className="product-box__content">
                <Image src={"/img/test.png"} alt={product.name} width={125} height={125} />

                <div className="variant">
                    <p>Pistácia a Krém</p>
                    <span>60g • Proteín 20g</span>
                </div>

            </div>
            <div className="product-box__counter">
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="4" viewBox="0 0 13 4" fill="none">
                        <path d="M11.375 0H1.625C1.19402 0 0.780698 0.210714 0.475951 0.585787C0.171205 0.96086 0 1.46957 0 2C0 2.53043 0.171205 3.03914 0.475951 3.41421C0.780698 3.78929 1.19402 4 1.625 4H11.375C11.806 4 12.2193 3.78929 12.524 3.41421C12.8288 3.03914 13 2.53043 13 2C13 1.46957 12.8288 0.96086 12.524 0.585787C12.2193 0.210714 11.806 0 11.375 0Z" fill="#FEFEFE" />
                    </svg>
                </button>
                <p>0</p>
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M11.375 4.875H8.125V1.625C8.125 1.19402 7.95379 0.780698 7.64905 0.475951C7.3443 0.171205 6.93098 0 6.5 0C6.06902 0 5.6557 0.171205 5.35095 0.475951C5.04621 0.780698 4.875 1.19402 4.875 1.625L4.93269 4.875H1.625C1.19402 4.875 0.780698 5.04621 0.475951 5.35095C0.171205 5.6557 0 6.06902 0 6.5C0 6.93098 0.171205 7.3443 0.475951 7.64905C0.780698 7.95379 1.19402 8.125 1.625 8.125L4.93269 8.06731L4.875 11.375C4.875 11.806 5.04621 12.2193 5.35095 12.524C5.6557 12.8288 6.06902 13 6.5 13C6.93098 13 7.3443 12.8288 7.64905 12.524C7.95379 12.2193 8.125 11.806 8.125 11.375V8.06731L11.375 8.125C11.806 8.125 12.2193 7.95379 12.524 7.64905C12.8288 7.3443 13 6.93098 13 6.5C13 6.06902 12.8288 5.6557 12.524 5.35095C12.2193 5.04621 11.806 4.875 11.375 4.875Z" fill="#FEFEFE" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default BoxProductItem
