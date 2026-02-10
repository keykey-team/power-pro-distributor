import { ProductItem } from '@entities/ProductItem/ui/ProductItem';
import React from 'react'

export const products = [
    {
        id: 1,
        image: "/img/test.png",
        title: "Protein Bar Chocolate",
        subtitle: "Шоколадный протеиновый батончик",
        protein: 20,
        sugar: 2,
        calories: 180,
        price: 59,
    },
    {
        id: 2,
        image: "/img/test.png",
        title: "Protein Bar Vanilla",
        subtitle: "Ванильный протеиновый батончик",
        protein: 18,
        sugar: 3,
        calories: 170,
        price: 55,
    },
    {
        id: 3,
        image: "/img/test.png",
        title: "Protein Bar Coconut",
        subtitle: "Кокосовый протеиновый батончик",
        protein: 21,
        sugar: 1,
        calories: 165,
        price: 62,
    },
    {
        id: 4,
        image: "/img/test.png",
        title: "Protein Bar Peanut",
        subtitle: "Арахисовый протеиновый батончик",
        protein: 22,
        sugar: 2,
        calories: 190,
        price: 65,
    },
    {
        id: 5,
        image: "/img/test.png",
        title: "Protein Bar Caramel",
        subtitle: "Карамельный протеиновый батончик",
        protein: 19,
        sugar: 4,
        calories: 175,
        price: 58,
    },
    {
        id: 6,
        image: "/img/test.png",
        title: "Protein Bar Cookies",
        subtitle: "Печенье со сливками",
        protein: 20,
        sugar: 3,
        calories: 185,
        price: 60,
    },
    {
        id: 7,
        image: "/img/test.png",
        title: "Protein Bar Strawberry",
        subtitle: "Клубничный протеиновый батончик",
        protein: 17,
        sugar: 5,
        calories: 160,
        price: 54,
    },
    {
        id: 8,
        image: "/img/test.png",
        title: "Protein Bar Banana",
        subtitle: "Банановый протеиновый батончик",
        protein: 18,
        sugar: 4,
        calories: 168,
        price: 56,
    },
    {
        id: 9,
        image: "/img/test.png",
        title: "Protein Bar Almond",
        subtitle: "Миндальный протеиновый батончик",
        protein: 23,
        sugar: 2,
        calories: 195,
        price: 68,
    },
    {
        id: 10,
        image: "/img/test.png",
        title: "Protein Bar Hazelnut",
        subtitle: "Фундучный протеиновый батончик",
        protein: 21,
        sugar: 3,
        calories: 185,
        price: 63,
    },
    {
        id: 11,
        image: "/img/test.png",
        title: "Protein Bar Dark Chocolate",
        subtitle: "Темный шоколад",
        protein: 24,
        sugar: 1,
        calories: 200,
        price: 70,
    },
    {
        id: 12,
        image: "/img/test.png",
        title: "Protein Bar Berry Mix",
        subtitle: "Ягодный микс",
        protein: 19,
        sugar: 4,
        calories: 172,
        price: 57,
    },
];


const ProductsList = () => {
    return (
        <ul className='products__list'>
            {products.map((product) => (
                <ProductItem product={product} key={product.id} />
            ))}
        </ul>
    )
}

export default ProductsList
