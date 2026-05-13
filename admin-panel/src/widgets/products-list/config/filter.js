import { useState } from 'react';

export const useProductFilters = () => {
    // Filters for the new flat products API
    // isActive: boolean filter
    // inStock: boolean filter  
    // minPrice/maxPrice: price range filters
    const [filters] = useState([
        { 
            key: 'isActive', 
            type: 'select', 
            label: 'Статус', 
            options: [
                { value: 'true', label: 'Активний' },
                { value: 'false', label: 'Неактивний' },
            ] 
        },
        { 
            key: 'inStock', 
            type: 'select', 
            label: 'Наявність', 
            options: [
                { value: 'true', label: 'В наявності' },
                { value: 'false', label: 'Немає' },
            ] 
        },
        { key: 'minPrice', type: 'input', label: 'Мін. ціна', placeholder: 'Від' },
        { key: 'maxPrice', type: 'input', label: 'Макс. ціна', placeholder: 'До' }
    ]);

    return filters;
};