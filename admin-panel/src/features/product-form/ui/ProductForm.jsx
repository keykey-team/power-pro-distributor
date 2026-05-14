"use client";
import React, { useEffect, useState } from 'react';
import { useProductForm } from '../lib/useProductForm';
import { generateSlug } from '../lib/generateSlug';
import CustomSelect from '../../../shared/ui/select-form/CustomSelect';
import CustomInput from '../../../shared/ui/input-form/CustomInput';
import { uploadAdminGalleryImages, uploadAdminPreviewImage } from '../../../shared/api/products.services';
import toast from '../../../shared/lib/toast';
import { useAutoTranslate } from '../../../shared/lib/useAutoTranslate';
import TranslateButton from '../../../shared/ui/translate-button/TranslateButton';

const PRODUCT_TYPE_OPTIONS = [
    { value: 'unit', label: 'Поштучно' },
    { value: 'box', label: 'Коробкою' },
];

const BRAND_OPTIONS = [
    { value: 'powerpro', label: 'powerpro' },
    { value: 'fitwin', label: 'fitwin' },
];

const buildInfoImageSrc = (fileName) => `${process.env.PUBLIC_URL || ''}/img/${fileName}`;

const TRANSLATION_LANGUAGES = ['en', 'sk'];

const SECTION_LINKS = [
    { id: 'product-overview', label: 'Огляд' },
    { id: 'product-main', label: 'Основне' },
    { id: 'product-content', label: 'Опис і склад' },
    { id: 'product-media', label: 'Фото' },
    // { id: 'product-stock', label: 'Залишки' },
    { id: 'product-nutrition', label: 'Харчова цінність' },
    { id: 'product-badges', label: 'Бейджі' },
    { id: 'product-variants', label: 'Варіанти покупки' },
];

const NUTRITION_COLUMN_TEMPLATES = {
    per_100g: {
        key: 'per_100g',
        label: {
            ua: 'На 100 г',
            ru: 'На 100 г',
            en: 'Per 100g',
            sk: 'Na 100 g',
        },
        meta: {
            grams: 100,
        },
    },
    per_60g: {
        key: 'per_60g',
        label: {
            ua: 'На 60 г',
            ru: 'На 60 г',
            en: 'Per 60g',
            sk: 'Na 60 g',
        },
        meta: {
            grams: 60,
        },
    },
};

const NUTRITION_COLUMN_ORDER = ['per_100g', 'per_60g'];

const getAvailabilityMeta = (quantity) => {
    const normalizedQuantity = Number(quantity) || 0;

    if (normalizedQuantity > 0) {
        return {
            label: 'У наявності',
            hint: 'Статус визначено автоматично за залишком.',
            toneClassName: 'is-in-stock',
        };
    }

    return {
        label: 'Немає в наявності',
        hint: 'Статус визначено автоматично за залишком.',
        toneClassName: 'is-out-of-stock',
    };
};

const getNormalizedPurchaseOptionQuantity = (mode, quantity) => {
    if ((mode || 'unit') === 'unit') {
        return 1;
    }

    const normalizedQuantity = Number(quantity);
    return Number.isFinite(normalizedQuantity) && normalizedQuantity > 0 ? normalizedQuantity : 1;
};

const ProductForm = ({
    type,
    initialData,
}) => {
    const formik = useProductForm(type, initialData);
    const { translateFields, isTranslating } = useAutoTranslate(formik);
    const [activeTooltipId, setActiveTooltipId] = useState(null);
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        const generatedSlug = generateSlug(formik.values.title?.en || '');
        if ((formik.values.slug || '') !== generatedSlug) {
            formik.setFieldValue('slug', generatedSlug, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.title?.en]);

        useEffect(() => {
        const currentItems = formik.values.purchaseOptionsV2Items || [];
        const normalizedItems = normalizePurchaseOptions(currentItems);
        const currentDefaultKey = formik.values.purchaseOptionsV2DefaultKey || '';
        const nextDefaultKey = resolveDefaultPurchaseOptionKey(normalizedItems, currentDefaultKey);

        const keysOrModesChanged = normalizedItems.length !== currentItems.length || normalizedItems.some((item, index) => {
            const current = currentItems[index] || {};
            return item.key !== current.key || item.mode !== current.mode;
        });

        if (keysOrModesChanged || nextDefaultKey !== currentDefaultKey) {
            formik.setFieldValue('purchaseOptionsV2Items', normalizedItems, false);
            formik.setFieldValue('purchaseOptionsV2DefaultKey', nextDefaultKey, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.purchaseOptionsV2Items, formik.values.purchaseOptionsV2DefaultKey]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (event.target.closest('.product-form__info-tooltip')) {
                return;
            }

            setActiveTooltipId(null);
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setActiveTooltipId(null);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const renderCheckbox = (name, checked, onChange, labelText) => (
        <label className="bulk-offers-modal__checkbox product-form__checkbox">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="bulk-offers-modal__checkbox-input"
            />
            <span className="bulk-offers-modal__checkbox-box" />
            <span className="bulk-offers-modal__checkbox-text">{labelText}</span>
        </label>
    );

    const renderInfoTooltip = (tooltipId, imageFileName, altText) => {
        const isOpen = activeTooltipId === tooltipId;

        return (
            <div className={`product-form__info-tooltip ${isOpen ? 'is-open' : ''}`}>
                <button
                    type="button"
                    className="product-form__info-button"
                    aria-label="Показати підказку"
                    aria-expanded={isOpen}
                    onClick={() => setActiveTooltipId((currentId) => currentId === tooltipId ? null : tooltipId)}
                >
                    i
                </button>
                {isOpen && (
                    <div className="product-form__info-popup" role="tooltip">
                        <img
                            src={buildInfoImageSrc(imageFileName)}
                            alt={altText}
                            className="product-form__info-image"
                        />
                    </div>
                )}
            </div>
        );
    };

    // Guard: ensure formik values are initialized properly
    if (!formik.values ) {
        return <div>Loading form...</div>;
    }

    // === IMAGE UPLOAD HANDLER ===
    const handleImageUpload = async (e, fieldName) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const localPreviewUrls = files.map((file) => URL.createObjectURL(file));
        const previousCover = formik.values.cover || '';
        const previousGallery = formik.values.gallery || [];

        // Always show previews instantly
        if (fieldName === 'cover') {
            formik.setFieldValue('cover', localPreviewUrls[0] || '');
        } else if (fieldName === 'gallery') {
            formik.setFieldValue('gallery', [...previousGallery, ...localPreviewUrls]);
        }

        setUploadingImages(true);
        try {
            if (fieldName === 'cover') {
                const uploadedPreview = await uploadAdminPreviewImage(files[0]);
                const finalCoverUrl = uploadedPreview?.url || uploadedPreview?.dataUrl || '';

                if (!finalCoverUrl) {
                    throw new Error('Сервер не вернул URL загруженного изображения');
                }

                formik.setFieldValue('cover', finalCoverUrl);

                if (localPreviewUrls[0]) {
                    URL.revokeObjectURL(localPreviewUrls[0]);
                }
            } else if (fieldName === 'gallery') {
                const uploadedGallery = await uploadAdminGalleryImages(files);
                const uploadedUrls = uploadedGallery?.urls || uploadedGallery?.dataUrls || [];
                // Remove local previews and add uploaded URLs
                const currentGallery = formik.values.gallery || [];
                const galleryWithoutLocalPreviews = currentGallery.filter((url) => !localPreviewUrls.includes(url));

                if (uploadedUrls.length) {
                    formik.setFieldValue('gallery', [...galleryWithoutLocalPreviews, ...uploadedUrls]);
                    localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
                } else {
                    formik.setFieldValue('gallery', previousGallery);
                    localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
                    throw new Error('Сервер не вернул URL загруженных изображений');
                }
            }

            toast.success('Зображення завантажено успішно');
        } catch (error) {
            console.error('Error uploading images:', error);
            if (fieldName === 'cover') {
                formik.setFieldValue('cover', previousCover);
                if (localPreviewUrls[0]) {
                    URL.revokeObjectURL(localPreviewUrls[0]);
                }
            } else if (fieldName === 'gallery') {
                // On error, keep previews so user sees what was selected
                // Optionally, show error toast
            }
            toast.error(error?.message || 'Помилка завантаження зображень');
        } finally {
            setUploadingImages(false);
            e.target.value = '';
        }
    };

    const handleRemoveGalleryImage = (index) => {
        const updated = (formik.values.gallery || []).filter((_, i) => i !== index);
        formik.setFieldValue('gallery', updated);
    };

    // === PURCHASE OPTIONS MANAGEMENT ===
    const addPurchaseOption = () => {
        const newItem = {
            key: '',
            title: { ua: '', ru: '', en: '', sk: '' },
            enabled: true,
            price: 0,
            quantity: 1,
            mode: 'unit',
            stockQuantity: 0,
            inStock: true,
            sort: 0,
            images: [],
        };
        formik.setFieldValue('purchaseOptionsV2Items', [
            ...(formik.values.purchaseOptionsV2Items || []),
            newItem,
        ]);
    };

    const removePurchaseOption = (index) => {
        const updated = (formik.values.purchaseOptionsV2Items || []).filter((_, i) => i !== index);
        formik.setFieldValue('purchaseOptionsV2Items', updated);
    };

    const updatePurchaseOption = (index, field, value) => {
        const items = [...(formik.values.purchaseOptionsV2Items || [])];
        const currentItem = items[index] || {};
        const nextMode = field === 'mode' ? value : (currentItem.mode || 'unit');
        const nextQuantity = field === 'quantity'
            ? getNormalizedPurchaseOptionQuantity(nextMode, value)
            : getNormalizedPurchaseOptionQuantity(nextMode, currentItem.quantity);

        items[index] = {
            ...currentItem,
            [field]: value,
            mode: nextMode,
            quantity: nextQuantity,
        };
        formik.setFieldValue('purchaseOptionsV2Items', items);
    };

    const updatePurchaseOptionLang = (index, lang, value) => {
        const items = [...(formik.values.purchaseOptionsV2Items || [])];
        items[index] = {
            ...items[index],
            title: { ...(items[index].title || {}), [lang]: value },
        };
        formik.setFieldValue('purchaseOptionsV2Items', items);
    };

    const handleOptionImageUpload = async (e, optionIndex) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const localPreviewUrls = files.map((file) => URL.createObjectURL(file));
        const items = [...(formik.values.purchaseOptionsV2Items || [])];
        const currentImages = items[optionIndex]?.images || [];
        const previousImages = [...currentImages];
        // Show instant previews
        items[optionIndex] = {
            ...items[optionIndex],
            images: [...currentImages, ...localPreviewUrls.map((url, i) => ({ url, sort: currentImages.length + i }))],
        };
        formik.setFieldValue('purchaseOptionsV2Items', items);

        setUploadingImages(true);
        try {
            const uploaded = await uploadAdminGalleryImages(files);
            const uploadedUrls = uploaded?.urls || uploaded?.dataUrls || [];

            if (!uploadedUrls.length) {
                throw new Error('Сервер не вернул URL загруженных изображений варианта');
            }

            const latestItems = [...(formik.values.purchaseOptionsV2Items || [])];
            const latestImages = latestItems[optionIndex]?.images || [];
            const withoutPreviews = latestImages.filter((img) => !localPreviewUrls.includes(img.url));
            const newImages = uploadedUrls.map((url, i) => ({ url, sort: withoutPreviews.length + i }));

            latestItems[optionIndex] = {
                ...latestItems[optionIndex],
                images: [...withoutPreviews, ...newImages],
            };
            formik.setFieldValue('purchaseOptionsV2Items', latestItems);
            localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
            toast.success('Зображення варіанту завантажено');
        } catch (error) {
            const rollbackItems = [...(formik.values.purchaseOptionsV2Items || [])];
            rollbackItems[optionIndex] = {
                ...rollbackItems[optionIndex],
                images: previousImages,
            };
            formik.setFieldValue('purchaseOptionsV2Items', rollbackItems);
            localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
            console.error('Error uploading option image:', error);
            toast.error(error?.message || 'Помилка завантаження зображення варіанту');
        } finally {
            setUploadingImages(false);
            e.target.value = '';
        }
    };

    const removeOptionImage = (optionIndex, imageIndex) => {
        const items = [...(formik.values.purchaseOptionsV2Items || [])];
        const updated = (items[optionIndex]?.images || []).filter((_, i) => i !== imageIndex);
        items[optionIndex] = { ...items[optionIndex], images: updated };
        formik.setFieldValue('purchaseOptionsV2Items', items);
    };

    const buildPurchaseOptionKey = (mode, index) => `${mode || 'unit'}_${index + 1}`;

    const normalizePurchaseOptions = (items) => (items || []).map((item, index) => {
        const mode = item?.mode || 'unit';
        return {
            ...item,
            mode,
            quantity: getNormalizedPurchaseOptionQuantity(mode, item?.quantity),
            key: buildPurchaseOptionKey(mode, index),
        };
    });

    const resolveDefaultPurchaseOptionKey = (items, currentDefault) => {
        if ((items || []).some((item) => item.key === currentDefault)) {
            return currentDefault;
        }
        return items?.[0]?.key || '';
    };



    const addCardBadge = () => {
        const newBadge = {
            label: {
                ua: '',
                ru: '',
                en: '',
                sk: '',
            },
            valueNumber: 0,
            unit: '',
            isHighlighted: false,
        };

        formik.setFieldValue('cardBadges', [...(formik.values.cardBadges || []), newBadge]);
    };

    const removeCardBadge = (index) => {
        const updated = (formik.values.cardBadges || []).filter((_, i) => i !== index);
        formik.setFieldValue('cardBadges', updated);
    };

    const updateCardBadge = (index, field, value) => {
        const badges = [...(formik.values.cardBadges || [])];
        badges[index] = {
            ...badges[index],
            [field]: value,
        };
        formik.setFieldValue('cardBadges', badges);
    };

    const updateCardBadgeLabel = (index, lang, value) => {
        const badges = [...(formik.values.cardBadges || [])];
        badges[index] = {
            ...badges[index],
            label: {
                ...(badges[index].label || {}),
                [lang]: value,
            },
        };
        formik.setFieldValue('cardBadges', badges);
    };

    const buildDefaultNutritionTable = () => ({
        title: {
            ua: 'Поживна цінність',
            ru: 'Пищевая ценность',
            en: 'Nutrition facts',
            sk: 'Vyzivove udaje',
        },
        columns: NUTRITION_COLUMN_ORDER.map((key, index) => ({
            ...NUTRITION_COLUMN_TEMPLATES[key],
            sort: index,
        })),
        rows: [],
    });

    const getNormalizedNutritionTable = () => {
        const current = formik.values.nutritionTable;
        const fallback = buildDefaultNutritionTable();

        if (!current || typeof current !== 'object' || Array.isArray(current)) {
            return fallback;
        }

        return {
            ...fallback,
            ...current,
            title: {
                ...fallback.title,
                ...(current.title || {}),
            },
            columns: Array.isArray(current.columns) && current.columns.length
                ? current.columns
                : fallback.columns,
            rows: Array.isArray(current.rows)
                ? current.rows
                : fallback.rows,
        };
    };

    const nutritionTable = getNormalizedNutritionTable();
    const nutritionColumns = [...(nutritionTable.columns || [])]
        .sort((a, b) => (Number(a?.sort) || 0) - (Number(b?.sort) || 0));

    const isNutritionColumnEnabled = (columnKey) =>
        nutritionColumns.some((column) => column.key === columnKey);

    const toggleNutritionColumn = (columnKey) => {
        const currentlyEnabled = isNutritionColumnEnabled(columnKey);
        if (currentlyEnabled && nutritionColumns.length <= 1) {
            return;
        }

        const currentColumns = Array.isArray(nutritionTable.columns) ? nutritionTable.columns : [];
        const currentRows = Array.isArray(nutritionTable.rows) ? nutritionTable.rows : [];

        if (currentlyEnabled) {
            const nextColumns = currentColumns
                .filter((column) => column?.key !== columnKey)
                .map((column, index) => ({ ...column, sort: index }));

            const nextRows = currentRows.map((row) => {
                const nextValues = { ...(row?.values || {}) };
                delete nextValues[columnKey];
                return {
                    ...row,
                    values: nextValues,
                };
            });

            setNutritionTable({
                ...nutritionTable,
                columns: nextColumns,
                rows: nextRows,
            });

            return;
        }

        const template = NUTRITION_COLUMN_TEMPLATES[columnKey];
        if (!template) {
            return;
        }

        const nextColumns = [...currentColumns, { ...template }]
            .sort((a, b) => {
                const left = NUTRITION_COLUMN_ORDER.indexOf(a?.key);
                const right = NUTRITION_COLUMN_ORDER.indexOf(b?.key);
                return left - right;
            })
            .map((column, index) => ({ ...column, sort: index }));

        const nextRows = currentRows.map((row) => {
            const nextValues = { ...(row?.values || {}) };
            if (!nextValues[columnKey]) {
                const fallbackUnit = Object.values(nextValues).find((cell) => cell?.unit)?.unit || '';
                nextValues[columnKey] = {
                    value: null,
                    text: '',
                    unit: fallbackUnit,
                };
            }

            return {
                ...row,
                values: nextValues,
            };
        });

        setNutritionTable({
            ...nutritionTable,
            columns: nextColumns,
            rows: nextRows,
        });
    };

    const setNutritionTable = (nextTable) => {
        formik.setFieldValue('nutritionTable', nextTable);
    };

    const addNutritionRow = () => {
        const values = {};
        nutritionColumns.forEach((column) => {
            values[column.key] = {
                value: null,
                text: '',
                unit: '',
            };
        });

        const newRow = {
            key: '',
            label: {
                ua: '',
                ru: '',
                en: '',
                sk: '',
            },
            values,
            sort: (nutritionTable.rows || []).length,
        };

        setNutritionTable({
            ...nutritionTable,
            rows: [...(nutritionTable.rows || []), newRow],
        });
    };

    const removeNutritionRow = (index) => {
        const rows = (nutritionTable.rows || []).filter((_, i) => i !== index);
        setNutritionTable({
            ...nutritionTable,
            rows,
        });
    };

    const updateNutritionRowLabel = (index, lang, value) => {
        const rows = [...(nutritionTable.rows || [])];
        rows[index] = {
            ...rows[index],
            label: {
                ...(rows[index]?.label || {}),
                [lang]: value,
            },
        };
        setNutritionTable({
            ...nutritionTable,
            rows,
        });
    };

    const updateNutritionRowCell = (index, columnKey, rawValue) => {
        const rows = [...(nutritionTable.rows || [])];
        const currentCell = rows[index]?.values?.[columnKey] || {};
        const normalized = String(rawValue || '').trim();
        const isNumeric = /^-?\d+(?:[.,]\d+)?$/.test(normalized);

        const nextCell = isNumeric
            ? {
                value: Number(normalized.replace(',', '.')),
                text: '',
                unit: currentCell.unit || '',
            }
            : {
                value: null,
                text: normalized,
                unit: currentCell.unit || '',
            };

        rows[index] = {
            ...rows[index],
            values: {
                ...(rows[index]?.values || {}),
                [columnKey]: nextCell,
            },
        };

        setNutritionTable({
            ...nutritionTable,
            rows,
        });
    };

    const updateNutritionRowUnit = (index, unit) => {
        const rows = [...(nutritionTable.rows || [])];
        const row = rows[index] || {};
        const nextValues = { ...(row.values || {}) };

        nutritionColumns.forEach((column) => {
            nextValues[column.key] = {
                ...(nextValues[column.key] || {}),
                unit,
            };
        });

        rows[index] = {
            ...row,
            values: nextValues,
        };

        setNutritionTable({
            ...nutritionTable,
            rows,
        });
    };

    const productAvailability = getAvailabilityMeta(formik.values.stockQuantity);
    const totalVariantsCount = (formik.values.purchaseOptionsV2Items || []).length;
    const activeVariantsCount = (formik.values.purchaseOptionsV2Items || []).filter((item) => item.enabled !== false).length;
    const selectedBrand = formik.values.brand_title_en || formik.values.brand_title_sk || formik.values.brand_title_ua || formik.values.brand_title_ru || '';

    const handleBrandChange = (value) => {
        formik.setFieldValue('brand_title_ua', value, false);
        formik.setFieldValue('brand_title_ru', value, false);
        formik.setFieldValue('brand_title_en', value, false);
        formik.setFieldValue('brand_title_sk', value, false);
    };

    return (
        <>
        <form id="product-create-form" onSubmit={formik.handleSubmit} className="product-form">
            <div className="product-form__layout">
                <aside className="product-form__sidebar">
                    

                    <div className="product-form__sidebar-nav-shell">
                        <nav className="product-form__sidebar-card product-form__sidebar-nav" aria-label="Навігація по формі">
                            {SECTION_LINKS.map((section) => (
                                <a key={section.id} href={`#${section.id}`} className="product-form__sidebar-link">
                                    {section.label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div className="product-form__sidebar-card product-form__summary-list">
                        <div className="product-form__summary-item">
                            <span>Slug</span>
                            <strong>{formik.values.slug || 'Згенерується з англійської назви'}</strong>
                        </div>
                        <div className="product-form__summary-item">
                            <span>Наявність</span>
                            <strong>{productAvailability.label}</strong>
                        </div>
                        <div className="product-form__summary-item">
                            <span>Варіанти</span>
                            <strong>{activeVariantsCount} з {totalVariantsCount} активні</strong>
                        </div>
                        <div className="product-form__summary-item">
                            <span>Основний варіант</span>
                            <strong>{formik.values.purchaseOptionsV2DefaultKey || 'Не задано'}</strong>
                        </div>
                    </div>
                </aside>

                <div className="product-form__main">
                    <section id="product-main" className="product-form__section-card product-form__section-card--accent">
                        <div className="product-form__section-head">
                            <div>
                                <h2 className="product-form__section-title-lg">Основна інформація</h2>
                                <p className="product-form__section-note">
                                    Тут залишилися тільки керовані поля. Slug, ціни, валюта і службові параметри рахуються автоматично.
                                </p>
                            </div>
                            <div className="form-translate-bar">
                                <TranslateButton
                                    isLoading={isTranslating}
                                    onClick={() => {
                                        translateFields([
                                            { from: 'title.en', to: 'title.sk' },
                                            { from: 'subtitle.en', to: 'subtitle.sk' },
                                            { from: 'description.en', to: 'description.sk' },
                                        ]);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-wrapper-2-column">
                            <CustomInput
                                id="title.en"
                                label="Назва товару (EN)"
                                value={String(formik.values.title?.en || '')}
                                onChange={(e) => formik.setFieldValue('title.en', e.target.value)}
                                onBlur={() => formik.setFieldTouched('title.en', true)}
                                placeholder="Enter title in English"
                                error={String(formik.errors.title?.en || '')}
                                touched={Boolean(formik.touched.title?.en)}
                            />
                            <CustomInput
                                id="title.sk"
                                label="Назва товару (SK)"
                                value={String(formik.values.title?.sk || '')}
                                onChange={(e) => formik.setFieldValue('title.sk', e.target.value)}
                                onBlur={() => formik.setFieldTouched('title.sk', true)}
                                placeholder="Zadajte názov po slovensky"
                                error={String(formik.errors.title?.sk || '')}
                                touched={Boolean(formik.touched.title?.sk)}
                            />
                        </div>

                        <div className="form-wrapper-2-column">
                            <CustomInput
                                id="subtitle.en"
                                label="Короткий підзаголовок (EN)"
                                value={String(formik.values.subtitle?.en || '')}
                                onChange={(e) => formik.setFieldValue('subtitle.en', e.target.value)}
                                onBlur={() => formik.setFieldTouched('subtitle.en', true)}
                                placeholder="Short subtitle in English"
                            />
                            <CustomInput
                                id="subtitle.sk"
                                label="Короткий підзаголовок (SK)"
                                value={String(formik.values.subtitle?.sk || '')}
                                onChange={(e) => formik.setFieldValue('subtitle.sk', e.target.value)}
                                onBlur={() => formik.setFieldTouched('subtitle.sk', true)}
                                placeholder="Krátky popis v slovenčine"
                            />
                        </div>

                        <div className="form-wrapper-2-column">
                            <div className="form-group">
                                <label htmlFor="type">Тип продажу</label>
                                <CustomSelect
                                    id="type"
                                    name="type"
                                    options={PRODUCT_TYPE_OPTIONS}
                                    value={formik.values.type || 'unit'}
                                    onChange={(value) => formik.setFieldValue('type', value)}
                                />
                                {Boolean(formik.touched.type) && Boolean(formik.errors.type) && (
                                    <div className="error-text">{String(formik.errors.type || '')}</div>
                                )}
                            </div>
                            <div className="product-form__toggle-group">
                                <div className="form-group">
                                    {renderCheckbox('isActive', Boolean(formik.values.isActive), formik.handleChange, 'Товар активний і показується на сайті')}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="brand_title">Назва бренду</label>
                            <CustomSelect
                                id="brand_title"
                                name="brand_title"
                                options={BRAND_OPTIONS}
                                value={selectedBrand}
                                onChange={handleBrandChange}
                            />
                        </div>

                    </section>

                    <section id="product-content" className="product-form__section-card">
                        <div className="product-form__section-head">
                            <div>
                                <h2 className="product-form__section-title-lg">Опис, інгредієнти та особливості</h2>
                                <p className="product-form__section-note">
                                    Кожен тип контенту заповнюється в одному горизонтальному рядку: англійська і словацька версії поруч.
                                </p>
                            </div>
                        </div>

                        <div className="product-form__content-rows">
                            <div className="product-form__content-row">
                                <div className="product-form__content-row-meta">
                                    <div className="product-form__title-with-info">
                                        <h3 className="product-form__subsection-title">Опис товару</h3>
                                        {renderInfoTooltip('description-info', 'description.jpg', 'Підказка для блоку опису товару')}
                                    </div>
                                    <p className="product-form__section-note">Головний опис на сторінці товару.</p>
                                </div>
                                <div className="product-form__content-row-fields">
                                    {TRANSLATION_LANGUAGES.map((lang) => (
                                        <div key={lang} className="form-group">
                                            <label htmlFor={`description.${lang}`}>Опис ({lang.toUpperCase()})</label>
                                            <textarea
                                                id={`description.${lang}`}
                                                className={`custom-textarea ${Boolean(formik.touched.description?.[lang]) && Boolean(formik.errors.description?.[lang]) ? 'error' : ''}`}
                                                value={String(formik.values.description?.[lang] || '')}
                                                onChange={(e) => formik.setFieldValue(`description.${lang}`, e.target.value)}
                                                onBlur={() => formik.setFieldTouched(`description.${lang}`, true)}
                                                placeholder={lang === 'en' ? 'Detailed product description in English' : 'Podrobný popis produktu v slovenčine'}
                                                rows="3"
                                            />
                                            {Boolean(formik.touched.description?.[lang]) && Boolean(formik.errors.description?.[lang]) && (
                                                <div className="error-text">{String(formik.errors.description?.[lang] || '')}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="product-form__content-row">
                                <div className="product-form__content-row-meta">
                                    <div className="product-form__title-with-info">
                                        <h3 className="product-form__subsection-title">Інгредієнти</h3>
                                        {renderInfoTooltip('ingredients-info', 'ingridients.jpg', 'Підказка для блоку інгредієнтів')}
                                    </div>
                                    <p className="product-form__section-note">Склад продукту для двох мов.</p>
                                </div>
                                <div className="product-form__content-row-fields">
                                    {TRANSLATION_LANGUAGES.map((lang) => (
                                        <div key={lang} className="form-group">
                                            <label htmlFor={`ingredients.${lang}`}>Інгредієнти ({lang.toUpperCase()})</label>
                                            <textarea
                                                id={`ingredients.${lang}`}
                                                className="custom-textarea"
                                                value={String(formik.values.ingredients?.[lang] || '')}
                                                onChange={(e) => formik.setFieldValue(`ingredients.${lang}`, e.target.value)}
                                                onBlur={() => formik.setFieldTouched(`ingredients.${lang}`, true)}
                                                placeholder={lang === 'en' ? 'Ingredients list in English' : 'Zoznam ingrediencií po slovensky'}
                                                rows="3"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="product-form__content-row">
                                <div className="product-form__content-row-meta">
                                    <div className="product-form__title-with-info">
                                        <h3 className="product-form__subsection-title">Ключові особливості</h3>
                                        {renderInfoTooltip('main-features-info', 'main_features.jpg', 'Підказка для блоку ключових особливостей')}
                                    </div>
                                    <p className="product-form__section-note">По одному пункту з нового рядка.</p>
                                </div>
                                <div className="product-form__content-row-fields">
                                    {TRANSLATION_LANGUAGES.map((lang) => (
                                        <div key={lang} className="form-group">
                                            <label htmlFor={`features.${lang}`}>Особливості ({lang.toUpperCase()})</label>
                                            <textarea
                                                id={`features.${lang}`}
                                                name={`features.${lang}`}
                                                className="custom-textarea"
                                                value={(formik.values.features?.[lang] || []).join('\n')}
                                                onChange={(e) => {
                                                    const features = e.target.value.split('\n');
                                                    formik.setFieldValue(`features.${lang}`, features);
                                                }}
                                                onBlur={formik.handleBlur}
                                                placeholder={lang === 'en' ? 'One feature per line' : 'Jeden benefit na každý riadok'}
                                                rows="3"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="product-media" className="product-form__section-card">
                        <div className="product-form__section-head">
                            <div>
                                <h2 className="product-form__section-title-lg">Фото товару</h2>
                                <p className="product-form__section-note">
                                    Спочатку завантажте головне фото, потім галерею. Попередній перегляд показується одразу.
                                </p>
                            </div>
                        </div>

                        <div className="form-group product-form__media-block">
                            <div className="product-form__media-head">
                                <label className="product-form__media-label" htmlFor="cover">
                                    Головне фото
                                </label>
                                <label
                                    htmlFor="cover"
                                    className={`product-form__upload-button ${uploadingImages ? 'is-loading' : ''}`}
                                    aria-disabled={uploadingImages}
                                >
                                    {uploadingImages ? 'Завантаження...' : 'Завантажити фото'}
                                </label>
                            </div>
                            <input
                                type="file"
                                id="cover"
                                className="product-form__upload-input"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'cover')}
                                disabled={uploadingImages}
                            />
                            {formik.values.cover && (
                                <div className="product-form__upload-preview-grid">
                                    <div className="product-form__upload-preview-card">
                                        <img className="product-form__upload-preview-image" src={formik.values.cover} alt="Cover" />
                                        <div className="product-form__upload-preview-actions">
                                            <span className="product-form__upload-preview-title">Головне фото</span>
                                            <button
                                                type="button"
                                                onClick={() => formik.setFieldValue('cover', '')}
                                                className="btn-remove"
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group product-form__media-block">
                            <div className="product-form__media-head">
                                <label className="product-form__media-label" htmlFor="gallery">
                                    Галерея фото
                                </label>
                                <label
                                    htmlFor="gallery"
                                    className={`product-form__upload-button ${uploadingImages ? 'is-loading' : ''}`}
                                    aria-disabled={uploadingImages}
                                >
                                    {uploadingImages ? 'Завантаження...' : 'Додати фото'}
                                </label>
                            </div>
                            <input
                                type="file"
                                id="gallery"
                                className="product-form__upload-input"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'gallery')}
                                disabled={uploadingImages}
                            />
                            <div className="product-form__upload-preview-grid">
                                {(formik.values.gallery || []).map((url, index) => (
                                    <div key={index} className="product-form__upload-preview-card">
                                        <img className="product-form__upload-preview-image" src={url} alt={`Gallery ${index}`} />
                                        <div className="product-form__upload-preview-actions">
                                            <span className="product-form__upload-preview-title">Фото {index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGalleryImage(index)}
                                                className="btn-remove"
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="product-stock" className="product-form__section-card" style={{ display: 'none' }}>
                        <div className="product-form__section-head">
                            <div>
                                <h2 className="product-form__section-title-lg">Залишки та доступність</h2>
                                <p className="product-form__section-note">
                                    Доступність визначається автоматично за кількістю на складі. Ручний чекбокс для наявності більше не потрібен.
                                </p>
                            </div>
                        </div>

                        <div className="form-wrapper-2-column">
                            <CustomInput
                                id="stockQuantity"
                                name="stockQuantity"
                                label="Кількість на складі"
                                type="number"
                                value={formik.values.stockQuantity || 0}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="0"
                            />
                            <div className="product-form__status-panel">
                                <span className={`product-form__status-badge ${productAvailability.toneClassName}`}>
                                    {productAvailability.label}
                                </span>
                                <p className="product-form__status-hint">{productAvailability.hint}</p>
                            </div>
                        </div>
                    </section>

                    <section id="product-nutrition" className="product-form__section-card">
                        <div className="product-form__section-head">
                            <div>
                                <div className="product-form__title-with-info">
                                    <h2 className="product-form__section-title-lg">Харчова цінність</h2>
                                    {renderInfoTooltip('nutrition-info', 'information.jpg', 'Підказка для блоку харчової цінності')}
                                </div>
                                <p className="product-form__section-note">
                                    Увесь блок зібрано в компактну таблицю, щоб значення легко звіряти по рядках.
                                </p>
                                <div className="product-form__nutrition-column-switches">
                                    <div className="product-form__nutrition-column-switch">
                                        {renderCheckbox(
                                            'nutrition-column-per-100g',
                                            isNutritionColumnEnabled('per_100g'),
                                            () => toggleNutritionColumn('per_100g'),
                                            'На 100 г'
                                        )}
                                    </div>
                                    <div className="product-form__nutrition-column-switch">
                                        {renderCheckbox(
                                            'nutrition-column-per-60g',
                                            isNutritionColumnEnabled('per_60g'),
                                            () => toggleNutritionColumn('per_60g'),
                                            'На 60 г'
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addNutritionRow}
                                className="btn btn-primary"
                            >
                                Додати рядок
                            </button>
                        </div>

                        <div className="form-wrapper-2-column" style={{ display: 'none' }}>
                            <CustomInput
                                id="weightG"
                                name="weightG"
                                label="Вага (г)"
                                type="number"
                                step="0.1"
                                value={formik.values.weightG || ''}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="0"
                            />
                            <CustomInput
                                id="proteinG"
                                name="proteinG"
                                label="Білки (г)"
                                type="number"
                                step="0.1"
                                value={formik.values.proteinG || ''}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="0"
                            />
                        </div>

                        <div className="nutrition-table-editor" >
                            <div className="nutrition-table-editor__toolbar" style={{ display: 'none' }}>
                                <CustomInput
                                    id="nutritionTable.title.en"
                                    label="Таблиця (EN)"
                                    value={nutritionTable.title?.en || 'Nutritional information'}
                                    onChange={(e) => {
                                        setNutritionTable({
                                            ...nutritionTable,
                                            title: {
                                                ...(nutritionTable.title || {}),
                                                en: e.target.value,
                                            },
                                        });
                                    }}
                                    placeholder="Nutrition facts"
                                />
                                <CustomInput
                                    id="nutritionTable.title.sk"
                                    label="Таблиця (SK)"
                                    value={nutritionTable.title?.sk || 'Vyzivove udaje'}
                                    onChange={(e) => {
                                        setNutritionTable({
                                            ...nutritionTable,
                                            title: {
                                                ...(nutritionTable.title || {}),
                                                sk: e.target.value,
                                            },
                                        });
                                    }}
                                    placeholder="Vyzivove udaje"
                                />
                            </div>

                            <div className="nutrition-table-editor__table-wrap">
                                <table className="nutrition-table-editor__table">
                                    <thead>
                                        <tr>
                                            <th>EN</th>
                                            <th>SK</th>
                                            {nutritionColumns.map((column) => (
                                                <th key={column.key}>{column.label?.ua || column.label?.en || column.key}</th>
                                            ))}
                                            <th>Одиниця</th>
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(nutritionTable.rows || []).map((row, index) => (
                                            <tr key={`${row.key || 'row'}-${index}`}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control nutrition-table-editor__input"
                                                        value={row.label?.en || ''}
                                                        onChange={(e) => updateNutritionRowLabel(index, 'en', e.target.value)}
                                                        placeholder="Protein"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control nutrition-table-editor__input"
                                                        value={row.label?.sk || ''}
                                                        onChange={(e) => updateNutritionRowLabel(index, 'sk', e.target.value)}
                                                        placeholder="Bielkoviny"
                                                    />
                                                </td>
                                                {nutritionColumns.map((column) => {
                                                    const cell = row.values?.[column.key] || {};
                                                    const displayValue = cell.text || (cell.value ?? '');

                                                    return (
                                                        <td key={`${column.key}-${index}`}>
                                                            <input
                                                                type="text"
                                                                className="form-control nutrition-table-editor__input"
                                                                value={String(displayValue)}
                                                                onChange={(e) => updateNutritionRowCell(index, column.key, e.target.value)}
                                                                placeholder="33.3 або 1436 kJ / 364 kcal"
                                                            />
                                                        </td>
                                                    );
                                                })}
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control nutrition-table-editor__input"
                                                        value={row.values?.[nutritionColumns[0]?.key]?.unit || ''}
                                                        onChange={(e) => updateNutritionRowUnit(index, e.target.value)}
                                                        placeholder="g / kcal"
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNutritionRow(index)}
                                                        className="btn btn-danger"
                                                    >
                                                        Видалити
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <section id="product-badges" className="product-form__section-card">
                        <div className="product-form__section-head">
                            <div>
                                <div className="product-form__title-with-info">
                                    <h2 className="product-form__section-title-lg">Бейджі картки</h2>
                                    {renderInfoTooltip('badges-info', 'bages.jpg', 'Підказка для блоку бейджів картки')}
                                </div>
                                <p className="product-form__section-note">
                                    Короткі характеристики, які показуються на картці товару: білки, kcal, high protein тощо.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addCardBadge}
                                className="btn btn-primary"
                            >
                                Додати бейдж
                            </button>
                        </div>

                        <div className="card-badges-list product-form__badge-list">
                            {(formik.values.cardBadges || []).map((badge, index) => (
                                <div key={index} className="purchase-option-item product-form__badge-item">
                                    <div className="product-form__badge-index">{index + 1}</div>
                                    <CustomInput
                                        label="Підпис (EN)"
                                        value={badge.label?.en || ''}
                                        onChange={(e) => updateCardBadgeLabel(index, 'en', e.target.value)}
                                        placeholder="Protein"
                                    />
                                    <CustomInput
                                        label="Підпис (SK)"
                                        value={badge.label?.sk || ''}
                                        onChange={(e) => updateCardBadgeLabel(index, 'sk', e.target.value)}
                                        placeholder="Bielkoviny"
                                    />
                                    <CustomInput
                                        label="Значення"
                                        type="number"
                                        value={badge.valueNumber ?? 0}
                                        onChange={(e) => updateCardBadge(index, 'valueNumber', Number(e.target.value || 0))}
                                    />
                                    <CustomInput
                                        label="Одиниця"
                                        value={badge.unit || ''}
                                        onChange={(e) => updateCardBadge(index, 'unit', e.target.value)}
                                        placeholder="g, kcal"
                                    />
                                    <div className="form-group product-form__badge-toggle" style={{ display: 'none'}}>
                                        {renderCheckbox(
                                            `cardBadges.${index}.isHighlighted`,
                                            Boolean(badge.isHighlighted),
                                            (e) => updateCardBadge(index, 'isHighlighted', e.target.checked),
                                            'Підсвітити'
                                        )}
                                    </div>
                                    <div className="product-form__badge-actions">
                                        <button
                                            type="button"
                                            onClick={() => removeCardBadge(index)}
                                            className="btn btn-danger"
                                        >
                                            Видалити бейдж
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="product-variants" className="product-form__section-card">
                        <div className="product-form__section-head">
                            <div>
                                <h2 className="product-form__section-title-lg">Варіанти покупки</h2>
                                <p className="product-form__section-note">
                                    Для кожного варіанта задайте тип продажу, ціну, кількість, залишок і окремі фото. Наявність також рахується автоматично від залишку.
                                </p>
                            </div>
                        </div>

                        <div className="form-group" style={{ display: 'none' }}>
                            <label htmlFor="purchaseOptionsV2DefaultKey">Основний варіант</label>
                            <CustomInput
                                id="purchaseOptionsV2DefaultKey"
                                name="purchaseOptionsV2DefaultKey"
                                label=""
                                value={formik.values.purchaseOptionsV2DefaultKey || 'unit'}
                                readOnly
                                placeholder="Автогенерація"
                            />
                        </div>

                        <div className="purchase-options-list product-form__stack-lg">
                            {(formik.values.purchaseOptionsV2Items || []).map((item, index) => {
                                const optionAvailability = getAvailabilityMeta(item.stockQuantity);
                                const resolvedVariantKey = item.key || buildPurchaseOptionKey(item.mode, index);
                                const isDefaultVariant = resolvedVariantKey === (formik.values.purchaseOptionsV2DefaultKey || '');
                                const modeLabel = PRODUCT_TYPE_OPTIONS.find((option) => option.value === (item.mode || 'unit'))?.label || 'Поштучно';

                                return (
                                    <div key={index} className="purchase-option-item product-form__nested-card">
                                        <div className="product-form__item-header">
                                            <div>
                                                <h3 className="product-form__item-title">Варіант {index + 1}</h3>
                                                <p className="product-form__section-note">Окремо заповнюються назва для клієнта, параметри продажу, склад і фото.</p>
                                                <div className="product-form__variant-meta">
                                                    {isDefaultVariant && (
                                                        <span className="product-form__variant-pill product-form__variant-pill--accent">Основний варіант</span>
                                                    )}
                                                    <span className="product-form__variant-pill">{modeLabel}</span>
                                                    <span className={`product-form__variant-pill ${optionAvailability.toneClassName}`}>
                                                        {optionAvailability.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removePurchaseOption(index)}
                                                className="btn btn-danger"
                                            >
                                                Видалити варіант
                                            </button>
                                        </div>

                                        <div className="product-form__variant-grid">
                                            <div className="product-form__variant-section">
                                                <div className="product-form__variant-section-head">
                                                    <div>
                                                        <div className="product-form__title-with-info">
                                                            <h4 className="product-form__subsection-title">Назва та фото</h4>
                                                            {renderInfoTooltip(`variant-title-info-${index}`, 'var_title.png', 'Підказка для блоку назви та фото варіанта')}
                                                        </div>
                                                        <p className="product-form__section-note">Це побачить клієнт у виборі варіанта на сайті.</p>
                                                    </div>
                                                </div>

                                                <div className="product-form__variant-top-row">
                                                    <div className="product-form__variant-top-fields">
                                                        <div className="form-wrapper-2-column">
                                                            {TRANSLATION_LANGUAGES.map((lang) => (
                                                                <CustomInput
                                                                    key={lang}
                                                                    label={`Назва (${lang.toUpperCase()})`}
                                                                    value={item.title?.[lang] || ''}
                                                                    onChange={(e) => updatePurchaseOptionLang(index, lang, e.target.value)}
                                                                    placeholder={lang === 'en' ? 'Variant title in English' : 'Názov variantu po slovensky'}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="form-group product-form__media-block product-form__media-block--nested product-form__variant-media">
                                                        <div className="product-form__media-head">
                                                            <label className="product-form__media-label" htmlFor={`option-image-${index}`}>
                                                                Фото варіанта
                                                            </label>
                                                            <label
                                                                htmlFor={`option-image-${index}`}
                                                                className={`product-form__upload-button ${uploadingImages ? 'is-loading' : ''}`}
                                                                aria-disabled={uploadingImages}
                                                            >
                                                                {uploadingImages ? 'Завантаження...' : 'Додати фото'}
                                                            </label>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            id={`option-image-${index}`}
                                                            className="product-form__upload-input"
                                                            multiple
                                                            accept="image/*"
                                                            onChange={(e) => handleOptionImageUpload(e, index)}
                                                            disabled={uploadingImages}
                                                        />
                                                        <div className="product-form__upload-preview-grid">
                                                            {(item.images || []).map((img, imgIndex) => (
                                                                <div key={imgIndex} className="product-form__upload-preview-card">
                                                                    <img className="product-form__upload-preview-image" src={img.url} alt={`Option ${index} img ${imgIndex}`} />
                                                                    <div className="product-form__upload-preview-actions">
                                                                        <span className="product-form__upload-preview-title">Фото {imgIndex + 1}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeOptionImage(index, imgIndex)}
                                                                            className="btn-remove"
                                                                        >
                                                                            Видалити
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="product-form__variant-detail-grid">
                                                <div className="product-form__variant-section">
                                                    <div className="product-form__variant-section-head">
                                                        <div>
                                                            <h4 className="product-form__subsection-title">Параметри продажу</h4>
                                                            <p className="product-form__section-note">Тип продажу, ціна і кількість у варіанті.</p>
                                                        </div>
                                                    </div>

                                                    <div className="form-wrapper-3-column">
                                                        <div className="form-group">
                                                            <label htmlFor={`purchaseOptionsV2Items.${index}.mode`}>Тип продажу</label>
                                                            <CustomSelect
                                                                id={`purchaseOptionsV2Items.${index}.mode`}
                                                                name={`purchaseOptionsV2Items.${index}.mode`}
                                                                options={PRODUCT_TYPE_OPTIONS}
                                                                value={item.mode || 'unit'}
                                                                onChange={(value) => updatePurchaseOption(index, 'mode', value)}
                                                            />
                                                        </div>
                                                        <CustomInput
                                                            label="Ціна"
                                                            type="number"
                                                            step="0.01"
                                                            value={item.price || 0}
                                                            onChange={(e) => updatePurchaseOption(index, 'price', Number(e.target.value))}
                                                        />
                                                        <CustomInput
                                                            label="Кількість у варіанті"
                                                            type="number"
                                                            value={item.quantity || 1}
                                                            disabled={(item.mode || 'unit') !== 'box'}
                                                            onChange={(e) => updatePurchaseOption(index, 'quantity', Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="product-form__variant-section">
                                                    <div className="product-form__variant-section-head">
                                                        <div>
                                                            <h4 className="product-form__subsection-title">Склад та видимість</h4>
                                                            <p className="product-form__section-note">Активність перемикається вручну, наявність рахується від залишку.</p>
                                                        </div>
                                                    </div>

                                                    <div className="form-wrapper-2-column">
                                                        <CustomInput
                                                            label="Залишок на складі"
                                                            type="number"
                                                            value={item.stockQuantity || 0}
                                                            onChange={(e) => updatePurchaseOption(index, 'stockQuantity', Number(e.target.value))}
                                                        />
                                                        <div className="product-form__toggle-group product-form__toggle-group--aligned">
                                                            <div className="product-form__status-panel product-form__status-panel--compact">
                                                                <span className={`product-form__status-badge ${optionAvailability.toneClassName}`}>
                                                                    {optionAvailability.label}
                                                                </span>
                                                                <p className="product-form__status-hint">{optionAvailability.hint}</p>
                                                            </div>
                                                            <div className="form-group">
                                                                {renderCheckbox(
                                                                    `purchaseOptionsV2Items.${index}.enabled`,
                                                                    Boolean(item.enabled),
                                                                    (e) => updatePurchaseOption(index, 'enabled', e.target.checked),
                                                                    'Варіант активний'
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={addPurchaseOption}
                            className="btn btn-primary"
                        >
                            Додати варіант покупки
                        </button>
                    </section>
                </div>
            </div>
        </form>
        </>
    );
};

export default ProductForm;
