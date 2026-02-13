import Image from 'next/image'
import React from 'react'
import ProductButton from './ProductButton'

export async function ProductItem({ product }) {
    return (
        <div className='products__item'>
            <div className="products__item-img">
                <Image src={product.image} alt={product.title} width={400} height={400} />
            </div>
            <p className="products__item-title">{product.title}</p>
            <p className="products__item-subtitle">{product.subtitle}</p>
            <div className="products__item-info">
                <div className="products__item-info-item">
                    <p>{product.protein}g </p>
                     <p className='prod-some'>Bielok</p>
                </div>
                <div className="products__item-info-item">
                    <p>{product.sugar}g</p>
                    <span className='prod-some'>Cukor</span>
                </div>
                <div className="products__item-info-item">
                    <p>{product.calories}g</p> 
                    <span className='prod-some'>kcal</span>
                </div>
            </div>
            <ProductButton product={product} />
        </div>
    )
}


