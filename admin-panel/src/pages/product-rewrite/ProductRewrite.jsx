import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../features/product-form/ui/ProductForm';
import { useFetchProductGroup } from '../../pages/product-rewrite/lib/useFetchProductGroup';

export default function ProductRewritePage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { productGroup, isLoading, error, isCreateMode } = useFetchProductGroup(id);

    const formType = isCreateMode ? 'create' : id;

    return (
        <>
            <section className="section-admin section-form">
                <div className="section-form__header">
                    <h2>{isCreateMode ? 'Додавання товару' : 'Редагування товару'}</h2>
                    <div className="section-form__header-btns">
                        <button onClick={() => navigate(-1)}>Повернутися</button>
                       
                    </div>
                </div>

                <div className="section-form__content prod">




                    {!isLoading && !error && (
                        <ProductForm
                            type={formType}
                            initialData={productGroup}
                        />
                    )}

                </div>
            </section>
            <button form="product-create-form" className="product-form__submit" type="submit">
                {isCreateMode ? 'Додати' : 'Зберегти'}
            </button></>

    );
}