import { generateSlug } from '../../product-form/lib/generateSlug';

export const generateSku = (...parts) => {
    const normalized = parts
        .flat()
        .map((part) => String(part ?? '').trim())
        .filter(Boolean)
        .map((part) => generateSlug(part).toUpperCase())
        .filter(Boolean)
        .join('-')
        .replace(/-+/g, '-');

    return normalized || 'SKU';
};