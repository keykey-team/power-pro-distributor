import Image from 'next/image'
import React from 'react'
import ProductButton from './ProductButton'
import ClientProductWrapper from './ClientProductWrapper'

// Убираем 'async' если не нужны асинхронные операции
export function ProductItem({ product, locale }) {
    return (
        <ClientProductWrapper productId={product.slug}>
            <div className='products__item'>
                <div className="products__item-img">
                    <Image
                        src={product.gallery[0]}
                        alt={product?.title?.[locale]}
                        width={400}
                        height={400}
                    />
                </div>
                <p className="products__item-title">{product?.title?.[locale]}</p>
                <p className="products__item-subtitle">{product?.subtitle?.[locale]}</p>
                <div className="products__item-info">

                    {product.cardBadges.map((item) => {


                        return (
                            <div className="products__item-info-item" key={item.key}>
                                <p>
                                    {item?.valueNumber} {item?.unit}
                                </p>
                                <p className='prod-some'>{item?.label?.[locale]}</p>
                            </div>
                        )


                    })}


                </div>
                <ProductButton product={product} locale={locale} />
            </div>
        </ClientProductWrapper>
    )
}