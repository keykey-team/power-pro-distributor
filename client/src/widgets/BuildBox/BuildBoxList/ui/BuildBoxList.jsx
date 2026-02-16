import BoxProductItem from '@entities/ProductItem/ui/BoxProductItem';
import React from 'react';

const ProductList = () => {
    const products = [
        {
            name: "FITWIN (BEZ CUKRU)",
            image: "photo_2026-01-28_21-05-31 2",
            variants: [
                {
                    flavor: "PISTÁCIA A KRÉM",
                    weight: "60G",
                    protein: "20G"
                }
            ]
        },
        {
            name: "POWERPRO (HIGH PROTEÍN)",
            variants: [
                {
                    flavor: "ČOKOLÁDOVÝ BROWNIE",
                    weight: "60G",
                    protein: "20G",
                    note: "10+"
                }
            ]
        }
    ];

    return (
        <div className="products__boxes container">
            <div className="products__box-list">
                <h2>FitWin (Bez cukru)</h2>
                {products.map((product, index) => (
                    <BoxProductItem product={product} key={index} />
                ))}
            </div>
            <div className="products__box-list">
                <h2>PowerPro (High Protein)
                </h2>
                {products.map((product, index) => (
                    <BoxProductItem product={product} key={index} />
                ))}
            </div>
        </div>
    );
};

export default ProductList;