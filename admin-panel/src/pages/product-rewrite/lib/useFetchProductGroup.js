import { useState, useEffect } from 'react';
import { getAdminProductById } from '../../../shared/api/products.services';

export const useFetchProductGroup = (id) => {
    const [productGroup, setProductGroup] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const isCreateMode = id === 'create';

    useEffect(() => {
        if (isCreateMode || !id) {
            setProductGroup(null);
            return;
        }

        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getAdminProductById(id);

                if (data) {
                    setProductGroup(data);
                } else {
                    setError('Товар не знайдено');
                }
            } catch (err) {
                console.error('Помилка при завантаженні:', err);
                setError('Сталася помилка при завантаженні даних');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id, isCreateMode]);

    return { productGroup, isLoading, error, isCreateMode };
};