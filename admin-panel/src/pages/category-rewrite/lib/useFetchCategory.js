import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAdminCategoryByFullSlug } from '../../../shared/api/categories.services'; // Укажи правильный путь к API

export const useFetchCategory = (pathIdentifier) => {
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchParams] = useSearchParams();

    // Если передан 'create', значит мы создаем новую категорию
    const isCreateMode = pathIdentifier === 'create';

    const queryParams = useMemo(() => {
        const paramsObj = {};
        for (const [key, value] of searchParams.entries()) {
            paramsObj[key] = value;
        }
        return paramsObj;
    }, [searchParams]);

    useEffect(() => {
        if (isCreateMode || !pathIdentifier) {
            setCategory(null);
            return;
        }

        const fetchCategory = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Если path передается через URL, его может потребоваться декодировать
                const decodedPath = decodeURIComponent(pathIdentifier);
                
                const data = await getAdminCategoryByFullSlug(decodedPath, queryParams); 

                if (data && data.item) {
                    setCategory(data.item);
                } else {
                    setError("Категорію не знайдено");
                }
            } catch (err) {
                console.error("Помилка при завантаженні:", err);
                setError("Сталася помилка при завантаженні даних");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategory();
    }, [pathIdentifier, isCreateMode, queryParams]); 

    return { category, isLoading, error, isCreateMode };
};