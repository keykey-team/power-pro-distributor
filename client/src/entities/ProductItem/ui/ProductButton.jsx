"use client"
import { useModals } from '@shared/index';
import React from 'react'

const ProductButton = ({ product }) => {
    const { isModalOpen, setIsModalOpen, isProdModalId, setIsProdModalId } = useModals();
    return (
        <button className="products__item-button"
            onClick={() => { setIsModalOpen("prod-modal"), setIsProdModalId(product.id) }}>
            Pridať do výberu • {product.price}€
        </button>
    )
}

export default ProductButton
