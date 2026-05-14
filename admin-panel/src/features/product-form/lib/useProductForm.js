"use client"

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { handleProductFormSubmit } from '../model/useProductFormSubmit';

// Stub export kept for backward compatibility with useProductFormUiEffects import
export const buildEffectiveVariationAxes = () => [];

const buildMultiLang = (src, key) => ({
    ua: src?.[key]?.ua || '',
    ru: src?.[key]?.ru || '',
    en: src?.[key]?.en || '',
    sk: src?.[key]?.sk || '',
});

const getNumericValue = (value, fallback = 0) => {
    const normalizedValue = Number(value);
    return Number.isFinite(normalizedValue) ? normalizedValue : fallback;
};

const buildPurchaseOptionKey = (mode, index) => `${mode || 'unit'}_${index + 1}`;

const normalizePurchaseOptionQuantity = (mode, quantity) => {
    if ((mode || 'unit') === 'unit') {
        return 1;
    }

    return getNumericValue(quantity, 1);
};

const buildCardBadgeKey = (badge, index) => {
    const baseLabel = badge?.label?.en || badge?.label?.sk || badge?.unit || `badge_${index + 1}`;
    const slugValue = String(baseLabel)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

    return slugValue || `badge_${index + 1}`;
};

const normalizeCardBadgesForPayload = (badges) => (badges || []).map((badge, index) => ({
    key: buildCardBadgeKey(badge, index),
    label: {
        ua: badge?.label?.ua || '',
        ru: badge?.label?.ru || '',
        en: badge?.label?.en || '',
        sk: badge?.label?.sk || '',
    },
    valueNumber: badge?.valueNumber !== '' && badge?.valueNumber != null ? getNumericValue(badge.valueNumber, 0) : null,
    valueText: '',
    unit: badge?.unit || '',
    display: 'value',
    sort: index,
    isHighlighted: Boolean(badge?.isHighlighted),
}));

const buildNutritionRowKey = (row, index) => {
    const baseLabel = row?.label?.en || row?.label?.sk || `nutrition_row_${index + 1}`;
    const slugValue = String(baseLabel)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

    return slugValue || `nutrition_row_${index + 1}`;
};

const normalizeNutritionTableForPayload = (nutritionTable) => {
    if (!nutritionTable || typeof nutritionTable !== 'object' || Array.isArray(nutritionTable)) {
        return null;
    }

    return {
        title: {
            ua: nutritionTable.title?.ua || '',
            ru: nutritionTable.title?.ru || '',
            en: nutritionTable.title?.en || '',
            sk: nutritionTable.title?.sk || '',
        },
        columns: (nutritionTable.columns || []).map((column, index) => ({
            ...column,
            key: column?.key || `column_${index + 1}`,
            sort: index,
        })),
        rows: (nutritionTable.rows || []).map((row, index) => ({
            ...row,
            key: buildNutritionRowKey(row, index),
            sort: index,
        })),
    };
};

const normalizePurchaseOptionsForPayload = (items) => (items || []).map((item, index) => {
    const stockQuantity = getNumericValue(item?.stockQuantity, 0);
    const mode = item?.mode || 'unit';

    return {
        key: item?.key || buildPurchaseOptionKey(mode, index),
        title: {
            ua: item?.title?.ua || '',
            ru: item?.title?.ru || '',
            en: item?.title?.en || '',
            sk: item?.title?.sk || '',
        },
        enabled: Boolean(item?.enabled),
        price: getNumericValue(item?.price, 0),
        quantity: normalizePurchaseOptionQuantity(mode, item?.quantity),
        mode,
        stockQuantity,
        inStock: stockQuantity > 0,
        sort: index,
        images: item?.images || [],
    };
});

const resolveProductPrice = (values, purchaseOptionItems) => {
    const defaultItem = purchaseOptionItems.find((item) => item.key === values.purchaseOptionsV2DefaultKey);
    const fallbackItem = purchaseOptionItems.find((item) => item.enabled !== false) || purchaseOptionItems[0];
    const sourcePrice = defaultItem?.price ?? fallbackItem?.price ?? values.price;
    return getNumericValue(sourcePrice, 0);
};

const formatPayload = (values) => {
    const purchaseOptionsItems = normalizePurchaseOptionsForPayload(values.purchaseOptionsV2Items);
    const stockQuantity = getNumericValue(values.stockQuantity, 0);

    return {
        slug: values.slug,
        type: values.type || '',
        isActive: Boolean(values.isActive),
        isBar: Boolean(values.isBar),
        sort: getNumericValue(values.sort, 0),
        brand: {
            title: {
                ua: values.brand_title_ua || '',
                ru: values.brand_title_ru || '',
                en: values.brand_title_en || '',
                sk: values.brand_title_sk || '',
            },
        },
        title: {
            ua: values.title?.ua || '',
            ru: values.title?.ru || '',
            en: values.title?.en || '',
            sk: values.title?.sk || '',
        },
        subtitle: {
            ua: values.subtitle?.ua || '',
            ru: values.subtitle?.ru || '',
            en: values.subtitle?.en || '',
            sk: values.subtitle?.sk || '',
        },
        description: {
            ua: values.description?.ua || '',
            ru: values.description?.ru || '',
            en: values.description?.en || '',
            sk: values.description?.sk || '',
        },
        ingredients: {
            ua: values.ingredients?.ua || '',
            ru: values.ingredients?.ru || '',
            en: values.ingredients?.en || '',
            sk: values.ingredients?.sk || '',
        },
        features: {
            ua: values.features?.ua || [],
            ru: values.features?.ru || [],
            en: values.features?.en || [],
            sk: values.features?.sk || [],
        },
        cover: values.cover || '',
        gallery: values.gallery || [],
        currency: values.currency || 'EUR',
        price: resolveProductPrice(values, purchaseOptionsItems),
        oldPrice: values.oldPrice !== '' && values.oldPrice != null ? getNumericValue(values.oldPrice, 0) : null,
        stockQuantity,
        inStock: stockQuantity > 0,
        weightG: values.weightG !== '' && values.weightG != null ? getNumericValue(values.weightG, 0) : 0,
        proteinG: values.proteinG !== '' && values.proteinG != null ? getNumericValue(values.proteinG, 0) : 0,
        seoTitle: {
            ua: values.seoTitle?.ua || '',
            ru: values.seoTitle?.ru || '',
            en: values.seoTitle?.en || '',
            sk: values.seoTitle?.sk || '',
        },
        seoDescription: {
            ua: values.seoDescription?.ua || '',
            ru: values.seoDescription?.ru || '',
            en: values.seoDescription?.en || '',
            sk: values.seoDescription?.sk || '',
        },
        cardBadges: normalizeCardBadgesForPayload(values.cardBadges),
        nutritionTable: normalizeNutritionTableForPayload(values.nutritionTable),
        purchaseOptionsV2: {
            defaultKey: values.purchaseOptionsV2DefaultKey || purchaseOptionsItems[0]?.key || 'unit',
            items: purchaseOptionsItems,
        },
    };
};

export const useProductForm = (type, initialData) => {
    const navigate = useNavigate();

    const defaultPurchaseOptionsItems = (initialData?.purchaseOptionsV2?.items || []).map((item) => ({
        key: item.key || '',
        title: {
            ua: item.title?.ua || '',
            ru: item.title?.ru || '',
            en: item.title?.en || '',
            sk: item.title?.sk || '',
        },
        enabled: item.enabled ?? true,
        price: item.price ?? '',
        quantity: item.quantity ?? 1,
        mode: item.mode || 'unit',
        stockQuantity: item.stockQuantity ?? 0,
        inStock: item.inStock ?? true,
        sort: item.sort ?? 0,
        images: item.images || [],
    }));

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            slug: initialData?.slug || '',
            type: initialData?.type || '',
            isActive: initialData?.isActive ?? true,
            isBar: initialData?.isBar ?? false,
            sort: initialData?.sort ?? 0,
            brand_title_ua: initialData?.brand?.title?.ua || '',
            brand_title_ru: initialData?.brand?.title?.ru || '',
            brand_title_en: initialData?.brand?.title?.en || '',
            brand_title_sk: initialData?.brand?.title?.sk || '',
            title: buildMultiLang(initialData, 'title'),
            subtitle: buildMultiLang(initialData, 'subtitle'),
            description: buildMultiLang(initialData, 'description'),
            ingredients: buildMultiLang(initialData, 'ingredients'),
            features: {
                ua: initialData?.features?.ua || [],
                ru: initialData?.features?.ru || [],
                en: initialData?.features?.en || [],
                sk: initialData?.features?.sk || [],
            },
            cover: initialData?.cover || '',
            gallery: initialData?.gallery || [],
            currency: initialData?.currency || 'EUR',
            price: initialData?.price ?? '',
            oldPrice: initialData?.oldPrice ?? '',
            stockQuantity: initialData?.stockQuantity ?? 0,
            inStock: initialData?.inStock ?? true,
            weightG: initialData?.weightG ?? '',
            proteinG: initialData?.proteinG ?? '',
            seoTitle: buildMultiLang(initialData, 'seoTitle'),
            seoDescription: buildMultiLang(initialData, 'seoDescription'),
            cardBadges: initialData?.cardBadges || [],
            nutritionTable: initialData?.nutritionTable || null,
            purchaseOptionsV2DefaultKey: initialData?.purchaseOptionsV2?.defaultKey || 'unit',
            purchaseOptionsV2Items: defaultPurchaseOptionsItems,
        },
        validationSchema: Yup.object({
            slug: Yup.string()
                .matches(/^[a-z0-9-]+$/, 'Слаг може містити лише маленькі латинські літери, цифри та дефіс')
                .required("Обов'язкове поле"),
            title: Yup.object({
                en: Yup.string().min(3, 'Мінімум 3 символи').required("Обов'язкове поле (EN)"),
                sk: Yup.string().min(3, 'Мінімум 3 символи').required("Обов'язкове поле (SK)"),
            }),
        }),
        onSubmit: async (values) => {
            await handleProductFormSubmit({
                type,
                values,
                initialData,
                navigate,
                formatPayload,
            });
        },
    });

    return formik;
};
