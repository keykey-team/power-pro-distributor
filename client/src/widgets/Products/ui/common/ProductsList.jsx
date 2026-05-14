import { ProductItem } from '@entities/ProductItem/ui/ProductItem';
import { ProductModal } from '@widgets/ProductModal/ui/ProductModal';
import React from 'react'

const ProductsList = ({data,locale}) => {
    const visibleProducts = Array.isArray(data?.items)
        ? data.items.filter((product) => product?.isActive !== false)
        : [];

    return (
        <>
            <ProductModal locale={locale} />
            <ul className='products__list'>
                {visibleProducts.map((product,index) => (
                    <ProductItem locale={locale} product={product} key={index} />
                ))}
            </ul>
        </>
    )
}

export default ProductsList
