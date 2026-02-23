// components/ProductGallerySwiper/ProductGallerySwiper.jsx
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'


const ProductGallerySwiper = ({ images = [], productTitle = 'product' }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null)

    // Если изображения не переданы, используем заглушку
    const galleryImages = images.length > 0 ? images : ['/img/test.png', '/img/test.png', '/img/test.png', '/img/test.png']

    return (
        <div className="product-gallery">
            {/* Основной свайпер */}
            <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                spaceBetween={10}
                navigation
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper }}
                className="product-gallery__main"
                loop={true}
            >
                {galleryImages.map((src, index) => (
                    <SwiperSlide key={index} className="product-gallery__slide">
                        <div className="product-gallery__image-container">
                            <Image
                                src={src}
                                alt={`${productTitle} - ${index + 1}`}
                                width={480}
                                height={480}
                                className="product-gallery__image"
                                priority={index === 0}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

        </div>
    )
}

export default ProductGallerySwiper