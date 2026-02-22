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
                        src={"/img/test.png"}
                        alt={product?.title?.[locale]}
                        width={400}
                        height={400}
                    />
                </div>
                <p className="products__item-title">{product?.title?.[locale]}</p>
                <p className="products__item-subtitle">{product?.subtitle?.[locale]}</p>
                <div className="products__item-info">

                    {product.nutritionTable.rows.map((item) => {
                        if (item.key === "protein" || item.key === "sugars" || item.key === "energy") {
                           
                            return (
                                <div className="products__item-info-item" key={item.key}>
                                    <p>
                                        {item?.values?.per_100g?.value === "" || item?.values?.per_100g?.value === null || item?.values?.per_100g?.value === undefined
                                            ? "NULL"
                                            : `${item.values.per_100g.value} ${item.values.per_100g.unit || ''}`}
                                    </p>
                                    <p className='prod-some'>{item?.label?.[locale]}</p>
                                </div>
                            )
                        }
                        return null;
                    })}

                  
                </div>
                <ProductButton product={product} locale={locale} />
            </div>
        </ClientProductWrapper>
    )
}