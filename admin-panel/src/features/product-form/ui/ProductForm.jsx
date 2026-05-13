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

const ProductForm = ({
    type,
    initialData,
}) => {
    const formik = useProductForm(type, initialData);
    const { translateFields, isTranslating } = useAutoTranslate(formik);
    const isEditMode = type !== 'create';
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        if (initialData) {
            console.log('Product:', initialData);
        }
    }, [initialData]);

    useEffect(() => {
        const generatedSlug = generateSlug(formik.values.title?.en || '');
        if ((formik.values.slug || '') !== generatedSlug) {
            formik.setFieldValue('slug', generatedSlug, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.title?.en]);

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
                const finalCoverUrl = uploadedPreview?.dataUrl || localPreviewUrls[0] || '';
                formik.setFieldValue('cover', finalCoverUrl);

                if (uploadedPreview?.dataUrl && localPreviewUrls[0]) {
                    URL.revokeObjectURL(localPreviewUrls[0]);
                }
            } else if (fieldName === 'gallery') {
                const uploadedGallery = await uploadAdminGalleryImages(files);
                const uploadedUrls = uploadedGallery?.dataUrls || [];
                // Remove local previews and add uploaded URLs
                const currentGallery = formik.values.gallery || [];
                const galleryWithoutLocalPreviews = currentGallery.filter((url) => !localPreviewUrls.includes(url));

                if (uploadedUrls.length) {
                    formik.setFieldValue('gallery', [...galleryWithoutLocalPreviews, ...uploadedUrls]);
                    localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
                } else {
                    // If upload failed, keep previews (user can remove manually)
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
        items[index] = { ...items[index], [field]: value };
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
        // Show instant previews
        items[optionIndex] = {
            ...items[optionIndex],
            images: [...currentImages, ...localPreviewUrls.map((url, i) => ({ url, sort: currentImages.length + i }))],
        };
        formik.setFieldValue('purchaseOptionsV2Items', items);

        setUploadingImages(true);
        try {
            const uploaded = await uploadAdminGalleryImages(files);
            const uploadedUrls = uploaded?.dataUrls || [];

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
            key: buildPurchaseOptionKey(mode, index),
        };
    });

    const resolveDefaultPurchaseOptionKey = (items, currentDefault) => {
        if ((items || []).some((item) => item.key === currentDefault)) {
            return currentDefault;
        }
        return items?.[0]?.key || '';
    };

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

    const addCardBadge = () => {
        const newBadge = {
            key: '',
            label: {
                ua: '',
                ru: '',
                en: '',
                sk: '',
            },
            valueNumber: 0,
            valueText: '',
            unit: '',
            display: 'value',
            sort: 0,
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
        columns: [
            {
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
                sort: 0,
            },
            {
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
                sort: 1,
            },
        ],
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
        const isNumeric = /^-?\d+(?:[\.,]\d+)?$/.test(normalized);

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

    return (
        <>
        <form id="product-create-form" onSubmit={formik.handleSubmit} className="product-form">
            {/* === HEADER === */}
            <div className="product__variations-header">
                <h1>Переклад</h1>
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

            {/* === TITLE === */}
            <h1>Назва товару</h1>
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="title.en" label="Назва товару (EN)"
                    value={String(formik.values.title?.en || '')} onChange={(e) => formik.setFieldValue('title.en', e.target.value)} onBlur={() => formik.setFieldTouched('title.en', true)}
                    placeholder="Enter title in English" error={String(formik.errors.title?.en || '')} touched={Boolean(formik.touched.title?.en)}
                />
                <CustomInput
                    id="title.sk" label="Назва товару (SK)"
                    value={String(formik.values.title?.sk || '')} onChange={(e) => formik.setFieldValue('title.sk', e.target.value)} onBlur={() => formik.setFieldTouched('title.sk', true)}
                    placeholder="Zadajte názov po slovensky" error={String(formik.errors.title?.sk || '')} touched={Boolean(formik.touched.title?.sk)}
                />
            </div>
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="slug" name="slug" label="Slug (URL)"
                    value={formik.values.slug || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="product-slug" error={formik.errors.slug} touched={formik.touched.slug}
                />
            </div>

            {/* === SUBTITLE === */}
            <h1>Підпис до товару</h1>
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="subtitle.en" label="Підпис (EN)"
                    value={String(formik.values.subtitle?.en || '')} onChange={(e) => formik.setFieldValue('subtitle.en', e.target.value)} onBlur={() => formik.setFieldTouched('subtitle.en', true)}
                    placeholder="Short subtitle in English..."
                />
                <CustomInput
                    id="subtitle.sk" label="Підпис (SK)"
                    value={String(formik.values.subtitle?.sk || '')} onChange={(e) => formik.setFieldValue('subtitle.sk', e.target.value)} onBlur={() => formik.setFieldTouched('subtitle.sk', true)}
                    placeholder="Krátky popis v slovenčine..."
                />
            </div>

            {/* === DESCRIPTION === */}
            <h1>Опис товару</h1>
            {['en', 'sk'].map((lang) => (
                <div key={lang} className="form-group">
                    <label htmlFor={`description.${lang}`}>Опис ({lang.toUpperCase()})</label>
                    <textarea
                        id={`description.${lang}`}
                        className={`custom-textarea ${Boolean(formik.touched.description?.[lang]) && Boolean(formik.errors.description?.[lang]) ? 'error' : ''}`}
                        value={String(formik.values.description?.[lang] || '')}
                        onChange={(e) => formik.setFieldValue(`description.${lang}`, e.target.value)}
                        onBlur={() => formik.setFieldTouched(`description.${lang}`, true)}
                        placeholder={`Опис товару ${lang === 'ua' ? 'українською' : lang === 'en' ? 'англійською' : lang === 'ru' ? 'російською' : 'словацькою'}...`}
                        rows="3"
                    />
                    {Boolean(formik.touched.description?.[lang]) && Boolean(formik.errors.description?.[lang]) && (
                        <div className="error-text">{String(formik.errors.description?.[lang] || '')}</div>
                    )}
                </div>
            ))}

            {/* === DATA === */}
            <h1>Дані товару</h1>
            <div className="form-wrapper-2-column">
                <div className="form-group">
                    <label htmlFor="type">Тип товару</label>
                    <CustomSelect
                        id="type"
                        name="type"
                        options={[
                            { value: 'unit', label: 'unit' },
                            { value: 'box', label: 'box' },
                        ]}
                        value={formik.values.type || 'unit'}
                        onChange={(value) => formik.setFieldValue('type', value)}
                    />
                    {Boolean(formik.touched.type) && Boolean(formik.errors.type) && (
                        <div className="error-text">{String(formik.errors.type || '')}</div>
                    )}
                </div>
                <CustomInput
                    id="sort" name="sort" label="Порядок сортування" type="number"
                    value={formik.values.sort || 0} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="0" error={formik.errors.sort} touched={formik.touched.sort}
                />
            </div>
            <div className="form-wrapper-2-column">
                <div className="form-group">
                    {renderCheckbox('isActive', Boolean(formik.values.isActive), formik.handleChange, 'Активний')}
                </div>
                <div className="form-group">
                    {renderCheckbox('isBar', Boolean(formik.values.isBar), formik.handleChange, 'Это батончик (значок)')}
                </div>
            </div>

            {/* === BRAND INFO === */}
            <h1>Бренд</h1>
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="brand_title_en" name="brand_title_en" label="Назва бренду (EN)"
                    value={formik.values.brand_title_en || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Brand name in English"
                />
                <CustomInput
                    id="brand_title_sk" name="brand_title_sk" label="Назва бренду (SK)"
                    value={formik.values.brand_title_sk || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Názov značky v slovenčine"
                />
            </div>

            {/* === PRICING === */}
            <h1>Ціна і валюта</h1>
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="price" name="price" label="Ціна" type="number" step="0.01"
                    value={formik.values.price || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="0.00" error={formik.errors.price} touched={formik.touched.price}
                />
                <CustomInput
                    id="oldPrice" name="oldPrice" label="Стара ціна" type="number" step="0.01"
                    value={formik.values.oldPrice || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="0.00"
                />
            </div>
            <div className="form-group">
                <label htmlFor="currency">Валюта</label>
                <CustomSelect
                    options={[
                        { value: 'EUR', label: 'EUR (€)' },
                        { value: 'USD', label: 'USD ($)' },
                        { value: 'CZK', label: 'CZK (Kč)' },
                        { value: 'PLN', label: 'PLN (zł)' },
                        { value: 'UAH', label: 'UAH (₴)' },
                    ]}
                    value={formik.values.currency || 'EUR'}
                    onChange={(value) => formik.setFieldValue('currency', value)}
                    name="currency"
                    id="currency"
                />
            </div>

            {/* === INGREDIENTS === */}
            <h1>Компоненти / Інгредієнти</h1>
            {['en', 'sk'].map((lang) => (
                <div key={lang} className="form-group">
                    <label htmlFor={`ingredients.${lang}`}>Інгредієнти ({lang.toUpperCase()})</label>
                    <textarea
                        id={`ingredients.${lang}`}
                        className="custom-textarea"
                        value={String(formik.values.ingredients?.[lang] || '')}
                        onChange={(e) => formik.setFieldValue(`ingredients.${lang}`, e.target.value)}
                        onBlur={() => formik.setFieldTouched(`ingredients.${lang}`, true)}
                        placeholder={`Список інгредієнтів ${lang === 'ua' ? 'українською' : lang === 'en' ? 'англійською' : lang === 'ru' ? 'російською' : 'словацькою'}...`}
                        rows="3"
                    />
                </div>
            ))}

            {/* === FEATURES === */}
            <h1>Особливості</h1>
            {['en', 'sk'].map((lang) => (
                <div key={lang} className="form-group">
                    <label htmlFor={`features.${lang}`}>Особливості ({lang.toUpperCase()})</label>
                    <textarea
                        id={`features.${lang}`}
                        name={`features.${lang}`}
                        className="custom-textarea"
                        value={(formik.values.features?.[lang] || []).join('\n')}
                        onChange={(e) => {
                            const features = e.target.value.split('\n').filter(Boolean);
                            formik.setFieldValue(`features.${lang}`, features);
                        }}
                        onBlur={formik.handleBlur}
                        placeholder={`Особливості по одній на рядок ${lang === 'ua' ? 'українською' : lang === 'en' ? 'англійською' : lang === 'ru' ? 'російською' : 'словацькою'}...`}
                        rows="3"
                    />
                </div>
            ))}

            {/* === IMAGES === */}
            <h1>Зображення</h1>
            <div className="form-group product-form__media-block">
                <div className="product-form__media-head">
                    <label className="product-form__media-label" htmlFor="cover">
                        Основне зображення (обкладинка)
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
                                <span className="product-form__upload-preview-title">Обкладинка</span>
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
                        Галерея зображень
                    </label>
                    <label
                        htmlFor="gallery"
                        className={`product-form__upload-button ${uploadingImages ? 'is-loading' : ''}`}
                        aria-disabled={uploadingImages}
                    >
                        {uploadingImages ? 'Завантаження...' : 'Додати фото в галерею'}
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

            {/* === STOCK === */}
            <h1>Наявність на складі</h1>
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="stockQuantity" name="stockQuantity" label="Кількість на складі" type="number"
                    value={formik.values.stockQuantity || 0} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="0"
                />
                <div className="form-group">
                    {renderCheckbox('inStock', Boolean(formik.values.inStock), formik.handleChange, 'Є в наявності')}
                </div>
            </div>

            {/* === NUTRITION INFO === */}
            <h1>Информация про нутрієнти</h1>
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="weightG" name="weightG" label="Вага (г)" type="number" step="0.1"
                    value={formik.values.weightG || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="0"
                />
                <CustomInput
                    id="proteinG" name="proteinG" label="Білки (г)" type="number" step="0.1"
                    value={formik.values.proteinG || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="0"
                />
            </div>
            <div className="nutrition-table-editor">
                <div className="form-wrapper-2-column">
                    <CustomInput
                        id="nutritionTable.title.en"
                        label="Назва таблиці (EN)"
                        value={nutritionTable.title?.en || ''}
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
                        label="Назва таблиці (SK)"
                        value={nutritionTable.title?.sk || ''}
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
                                <th>Назва (EN / SK)</th>
                                {nutritionColumns.map((column) => (
                                    <th key={column.key}>{column.label?.ua || column.label?.en || column.key}</th>
                                ))}
                                <th>Unit</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {(nutritionTable.rows || []).map((row, index) => (
                                <tr key={`${row.key || 'row'}-${index}`}>
                                    <td>
                                        <div className="nutrition-table-editor__name-cell">
                                            <CustomInput
                                                label=""
                                                value={row.label?.en || ''}
                                                onChange={(e) => updateNutritionRowLabel(index, 'en', e.target.value)}
                                                placeholder="Protein"
                                            />
                                            <CustomInput
                                                label=""
                                                value={row.label?.sk || ''}
                                                onChange={(e) => updateNutritionRowLabel(index, 'sk', e.target.value)}
                                                placeholder="Bielkoviny"
                                            />
                                        </div>
                                    </td>
                                    {nutritionColumns.map((column) => {
                                        const cell = row.values?.[column.key] || {};
                                        const displayValue = cell.text || (cell.value ?? '');

                                        return (
                                            <td key={`${column.key}-${index}`}>
                                                <CustomInput
                                                    label=""
                                                    value={String(displayValue)}
                                                    onChange={(e) => updateNutritionRowCell(index, column.key, e.target.value)}
                                                    placeholder="33.3 або 1436 kJ / 364 kcal"
                                                />
                                            </td>
                                        );
                                    })}
                                    <td>
                                        <CustomInput
                                            label=""
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

                <button
                    type="button"
                    onClick={addNutritionRow}
                    className="btn btn-primary"
                >
                    Додати рядок
                </button>
            </div>

            {/* === SEO === */}
            {/* <h1>SEO</h1>
            {['en', 'sk'].map((lang) => (
                <div key={lang} className="form-group">
                    <label htmlFor={`seoTitle.${lang}`}>SEO Title ({lang.toUpperCase()})</label>
                    <CustomInput
                        id={`seoTitle.${lang}`} label=""
                        value={String(formik.values.seoTitle?.[lang] || '')} 
                        onChange={(e) => formik.setFieldValue(`seoTitle.${lang}`, e.target.value)} 
                        onBlur={() => formik.setFieldTouched(`seoTitle.${lang}`, true)}
                        placeholder={`SEO title ${lang === 'ua' ? 'українською' : lang === 'en' ? 'англійською' : lang === 'ru' ? 'російською' : 'словацькою'}...`}
                    />
                </div>
            ))}
            {['en', 'sk'].map((lang) => (
                <div key={lang} className="form-group">
                    <label htmlFor={`seoDescription.${lang}`}>SEO Description ({lang.toUpperCase()})</label>
                    <textarea
                        id={`seoDescription.${lang}`}
                        className="custom-textarea"
                        value={String(formik.values.seoDescription?.[lang] || '')}
                        onChange={(e) => formik.setFieldValue(`seoDescription.${lang}`, e.target.value)}
                        onBlur={() => formik.setFieldTouched(`seoDescription.${lang}`, true)}
                        placeholder={`SEO description ${lang === 'ua' ? 'українською' : lang === 'en' ? 'англійською' : lang === 'ru' ? 'російською' : 'словацькою'}...`}
                        rows="2"
                    />
                </div>
            ))} */}

            {/* === CARD BADGES === */}
            <h1>Бейджи карточки</h1>
            <div className="card-badges-list">
                {(formik.values.cardBadges || []).map((badge, index) => (
                    <div key={index} className="purchase-option-item">
                        <h4>Бейдж {index + 1}</h4>

                        <div className="form-wrapper-2-column">
                            <CustomInput
                                label="Ключ"
                                value={badge.key || ''}
                                onChange={(e) => updateCardBadge(index, 'key', e.target.value)}
                                placeholder="protein, kcal..."
                            />
                            <CustomInput
                                label="Одиниця"
                                value={badge.unit || ''}
                                onChange={(e) => updateCardBadge(index, 'unit', e.target.value)}
                                placeholder="g, kcal..."
                            />
                        </div>

                        <div className="form-wrapper-2-column">
                            <CustomInput
                                label="Числове значення"
                                type="number"
                                value={badge.valueNumber ?? 0}
                                onChange={(e) => updateCardBadge(index, 'valueNumber', Number(e.target.value || 0))}
                            />
                            <CustomInput
                                label="Текстове значення"
                                value={badge.valueText || ''}
                                onChange={(e) => updateCardBadge(index, 'valueText', e.target.value)}
                                placeholder="High, Low..."
                            />
                        </div>

                        <div className="form-wrapper-2-column">
                            <div className="form-group">
                                <label htmlFor={`cardBadges.${index}.display`}>Display</label>
                                <CustomSelect
                                    id={`cardBadges.${index}.display`}
                                    name={`cardBadges.${index}.display`}
                                    options={[
                                        { value: 'value', label: 'value' },
                                        { value: 'text', label: 'text' },
                                    ]}
                                    value={badge.display || 'value'}
                                    onChange={(value) => updateCardBadge(index, 'display', value)}
                                />
                            </div>
                            <CustomInput
                                label="Сортування"
                                type="number"
                                value={badge.sort ?? 0}
                                onChange={(e) => updateCardBadge(index, 'sort', Number(e.target.value || 0))}
                            />
                        </div>

                        <div className="form-group">
                            {renderCheckbox(
                                `cardBadges.${index}.isHighlighted`,
                                Boolean(badge.isHighlighted),
                                (e) => updateCardBadge(index, 'isHighlighted', e.target.checked),
                                'Підсвічений бейдж'
                            )}
                        </div>

                        <h4>Label (2 мови)</h4>
                        <div className="form-wrapper-2-column">
                            <CustomInput
                                label="Label (EN)"
                                value={badge.label?.en || ''}
                                onChange={(e) => updateCardBadgeLabel(index, 'en', e.target.value)}
                                placeholder="Protein"
                            />
                            <CustomInput
                                label="Label (SK)"
                                value={badge.label?.sk || ''}
                                onChange={(e) => updateCardBadgeLabel(index, 'sk', e.target.value)}
                                placeholder="Bielkoviny"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => removeCardBadge(index)}
                            className="btn btn-danger"
                            style={{ marginTop: '10px' }}
                        >
                            Видалити бейдж
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addCardBadge}
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
            >
                Додати бейдж
            </button>

            {/* === PURCHASE OPTIONS V2 === */}
            <h1>Варіанти покупки (версія 2)</h1>
            <div className="form-group">
                <label htmlFor="purchaseOptionsV2DefaultKey">Ключ за замовчуванням</label>
                <CustomInput
                    id="purchaseOptionsV2DefaultKey" name="purchaseOptionsV2DefaultKey" label=""
                    value={formik.values.purchaseOptionsV2DefaultKey || 'unit'}
                    readOnly
                    placeholder="Автогенерація"
                />
            </div>

            <div className="purchase-options-list">
                {(formik.values.purchaseOptionsV2Items || []).map((item, index) => (
                    <div key={index} className="purchase-option-item">
                        <h4>Варіант {index + 1}</h4>
                        <div className="form-wrapper-2-column">
                            <CustomInput
                                label="Ключ"
                                value={item.key || ''}
                                readOnly
                                placeholder="Генерується автоматично"
                            />
                            <CustomInput
                                label="Кількість"
                                type="number"
                                value={item.quantity || 1}
                                onChange={(e) => updatePurchaseOption(index, 'quantity', Number(e.target.value))}
                            />
                        </div>

                        <div className="form-wrapper-2-column">
                            <CustomInput
                                label="Ціна"
                                type="number"
                                step="0.01"
                                value={item.price || 0}
                                onChange={(e) => updatePurchaseOption(index, 'price', Number(e.target.value))}
                            />
                            <div className="form-group">
                                <label htmlFor={`purchaseOptionsV2Items.${index}.mode`}>Режим</label>
                                <CustomSelect
                                    id={`purchaseOptionsV2Items.${index}.mode`}
                                    name={`purchaseOptionsV2Items.${index}.mode`}
                                    options={[
                                        { value: 'unit', label: 'unit' },
                                        { value: 'box', label: 'box' },
                                    ]}
                                    value={item.mode || 'unit'}
                                    onChange={(value) => updatePurchaseOption(index, 'mode', value)}
                                />
                            </div>
                        </div>

                        <div className="form-wrapper-2-column">
                            <CustomInput
                                label="Кількість на складі"
                                type="number"
                                value={item.stockQuantity || 0}
                                onChange={(e) => updatePurchaseOption(index, 'stockQuantity', Number(e.target.value))}
                            />
                            {renderCheckbox(
                                `purchaseOptionsV2Items.${index}.inStock`,
                                Boolean(item.inStock),
                                (e) => updatePurchaseOption(index, 'inStock', e.target.checked),
                                'Є в наявності'
                            )}
                        </div>

                        <div className="form-wrapper-2-column">
                            <CustomInput
                                label="Сортування"
                                type="number"
                                value={item.sort || 0}
                                onChange={(e) => updatePurchaseOption(index, 'sort', Number(e.target.value))}
                            />
                            {renderCheckbox(
                                `purchaseOptionsV2Items.${index}.enabled`,
                                Boolean(item.enabled),
                                (e) => updatePurchaseOption(index, 'enabled', e.target.checked),
                                'Ввімкнено'
                            )}
                        </div>

                        <h1>Назва варіанту (4 мови)</h1>
                        {['en', 'sk'].map((lang) => (
                            <CustomInput
                                key={lang}
                                label={`Назва (${lang.toUpperCase()})`}
                                value={item.title?.[lang] || ''}
                                onChange={(e) => updatePurchaseOptionLang(index, lang, e.target.value)}
                                placeholder={`Назва варіанту ${lang === 'ua' ? 'українською' : lang === 'en' ? 'англійською' : lang === 'ru' ? 'російською' : 'словацькою'}...`}
                            />
                        ))}

                        <div className="form-group product-form__media-block" style={{ marginTop: '12px' }}>
                            <div className="product-form__media-head">
                                <label className="product-form__media-label">Фото варіанту</label>
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

                        <button
                            type="button"
                            onClick={() => removePurchaseOption(index)}
                            className="btn btn-danger"
                            style={{ marginTop: '10px' }}
                        >
                            Видалити варіант
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addPurchaseOption}
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
            >
                Додати варіант покупки
            </button>

        </form>
        </>
    );
};

export default ProductForm;
