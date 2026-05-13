import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Замени на свою форму для категорий, если она отличается от ProductForm
// import CategoryForm from '../../features/category-form/ui/CategoryForm'; 
import { useFetchCategory } from '../category-rewrite/lib/useFetchCategory'; // Укажи правильный путь
import CategoryForm from '../../features/category-form/ui/CategoryForm';

export default function CategoryRewritePage() {
    const navigate = useNavigate();

    const { id: categoryPath } = useParams();
   
    const { category, isLoading, error, isCreateMode } = useFetchCategory(categoryPath);

    console.log(category, "category data");

    return (
        <>
            <section className="section-admin section-form">
                <div className="section-form__header">
                    <h2>{isCreateMode ? 'Додавання категорії' : 'Редагування категорії'}</h2>
                    <button onClick={() => navigate(-1)}>Повернутися</button>
                </div>

                <div className="section-form__content">
                    {isLoading && <p>Завантаження...</p>}
                    {error && <p className="error-text">{error}</p>}

                    {!isLoading && !error && (
                        <CategoryForm
                            type={categoryPath}
                            initialData={category}
                            isEditMode={!isCreateMode}
                        />
                    )}
                </div>
            </section>

            <button form="category-create-form" className="product-form__submit" type="submit">
                {category ? 'Зберегти' : 'Додати'}
            </button>
        </>
    );
}