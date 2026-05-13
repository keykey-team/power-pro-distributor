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

const formatPayload = (values) => ({
    slug: values.slug,
    type: values.type || '',
    isActive: Boolean(values.isActive),
    isBar: Boolean(values.isBar),
    sort: Number(values.sort) || 0,
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
    price: Number(values.price) || 0,
    oldPrice: values.oldPrice !== '' && values.oldPrice != null ? Number(values.oldPrice) : null,
    stockQuantity: Number(values.stockQuantity) || 0,
    inStock: Boolean(values.inStock),
    weightG: values.weightG !== '' && values.weightG != null ? Number(values.weightG) : 0,
    proteinG: values.proteinG !== '' && values.proteinG != null ? Number(values.proteinG) : 0,
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
    cardBadges: values.cardBadges || [],
    nutritionTable: values.nutritionTable || null,
    purchaseOptionsV2: {
        defaultKey: values.purchaseOptionsV2DefaultKey || 'unit',
        items: (values.purchaseOptionsV2Items || []).map((item) => ({
            key: item.key || '',
            title: {
                ua: item.title?.ua || '',
                ru: item.title?.ru || '',
                en: item.title?.en || '',
                sk: item.title?.sk || '',
            },
            enabled: Boolean(item.enabled),
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            mode: item.mode || 'unit',
            stockQuantity: Number(item.stockQuantity) || 0,
            inStock: Boolean(item.inStock),
            sort: Number(item.sort) || 0,
            images: item.images || [],
        })),
    },
});

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
            price: Yup.number()
                .typeError('Ціна має бути числом')
                .min(0, "Ціна не може бути від'ємною")
                .required("Обов'язкове поле"),
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
