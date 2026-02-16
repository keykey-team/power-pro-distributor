"use client"
import React from 'react'

const BoxProductItem = ({ product, key }) => {
    return (
        <div key={key} className="product-box">
            
            {product.image && <img src={product.image} alt={product.name} />}
            {product.variants.map((variant, vIndex) => (
                <div key={vIndex} className="variant">
                    <p>{variant.flavor}</p>
                    <p>{variant.weight} • Proteín {variant.protein}</p>
                    {variant.note && <p className="note">{variant.note}</p>}
                </div>
            ))}
        </div>
    )
}

export default BoxProductItem
