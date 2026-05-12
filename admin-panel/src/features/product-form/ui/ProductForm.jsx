"use client";
import React, { useMemo, useState } from 'react';
import { useProductForm } from '../lib/useProductForm';
import { useAccessoryOptions } from '../lib/useAccessoryOptions';
import { useOfferImageSync } from '../lib/useOfferImageSync';
import { useAccessoryBindings, useCategoryOptions, useProductFormUiEffects } from '../lib/useProductFormUiEffects';
import CustomSelect from '../../../shared/ui/select-form/CustomSelect';
import CustomInput from '../../../shared/ui/input-form/CustomInput';
import CatalogPagination from '../../pagination/ui/Pagination'; 
import { uploadAdminImages } from '../../../shared/api/products.services'; 
import toast from '../../../shared/lib/toast';
import { useAutoTranslate } from '../../../shared/lib/useAutoTranslate';
import TranslateButton from '../../../shared/ui/translate-button/TranslateButton';
import { BulkOffersModal, getAxisPresetLabel, getAxisPresetValue } from '../../bulk-offers-modal';
import { getStatusOptions } from '../../../shared/lib/statuses';

const STATUS_OPTIONS = getStatusOptions(['active', 'hidden', 'draft'], { labelType: 'form' });
const ACCESSORY_CATEGORY_ID = '69fdaa7d5c7946d45d6d9e2d';

const ProductForm = ({
    type,
    initialData,
    variationsData,
    isBulkOffersModalOpen = false,
    onCloseBulkOffersModal = () => {},
}) => {
    const formik = useProductForm(type, initialData, variationsData);
    const { translateFields, isTranslating } = useAutoTranslate(formik);

    const isEditMode = type !== 'create';
    const [localOfferFilters, setLocalOfferFilters] = useState({});

    // === БАЗОВИЙ URL ДЛЯ КАРТИНОК ===
    const API_BASE_URL = process.env.REACT_APP_API_URL_IMG?.trim() || process.env.REACT_APP_API_URL_IMG?.trim() || '';

    // Функція, яка підклеює домен до відносного шляху (якщо це ще не зроблено)
    const getFullImageUrl = (imgUrl) => {
        if (!imgUrl) return '';
        if (imgUrl.startsWith('http')) return imgUrl;
        return `${API_BASE_URL}${imgUrl}`;
    };

    // === СТЕЙТ ДЛЯ КАТЕГОРІЙ ===
    const { categoryOptions, categoryMetaById } = useCategoryOptions();
    const [accessorySearchQuery, setAccessorySearchQuery] = useState('');
    const { accessoryOptions: loadedAccessoryOptions, isAccessorySearchLoading } = useAccessoryOptions(
        ACCESSORY_CATEGORY_ID,
        accessorySearchQuery
    );

const axes = formik.values.variationAxes || [];
const offers = formik.values.offers || [];

useProductFormUiEffects({
    formik,
    categoryMetaById,
    initialData,
    variationsData,
    offers,
});

useOfferImageSync({
    axes,
    offers,
    setFieldValue: formik.setFieldValue,
});

const { accessoryOptions, applyAccessoryToAllOffers } = useAccessoryBindings({
    loadedAccessoryOptions,
    offers,
    setFieldValue: formik.setFieldValue,
});

const selectableAxes = useMemo(
    () => axes.filter((axis) => Array.isArray(axis.valuesPreset) && axis.valuesPreset.length > 0),
    [axes]
);

const currentOpt = localOfferFilters;

const filteredOffers = useMemo(() => {
    const activeFilters = Object.entries(currentOpt).filter(([, value]) => String(value || '').trim() !== '');

    if (!activeFilters.length) {
        return offers.map((item, originalIndex) => ({ item, originalIndex }));
    }

    return offers
        .map((item, originalIndex) => ({ item, originalIndex }))
        .filter(({ item }) => activeFilters.every(([axisId, filterValue]) => {
            const offerValue = item?.options?.[axisId];
            return String(offerValue ?? '') === String(filterValue ?? '');
        }));
}, [offers, currentOpt]);

    // === ЛОГІКА ОНОВЛЕННЯ ФІЛЬТРІВ ===
    const handleFilterChange = (axisId, value) => {
        const newOpt = { ...currentOpt };

        if (value) {
            newOpt[axisId] = value;
        } else {
            delete newOpt[axisId]; 
        }

        setLocalOfferFilters(newOpt);
    };

    const handleAddOffer = () => {
        const newOffer = {
            title: '',
            price: '',
            sku: '',
            options: {},
            image: null,
            accessoryOfferId: String(formik.values.groupAccessoryOfferId || '').trim(),
        };
        formik.setFieldValue('offers', [...offers, newOffer]);
    };

    const handleRemoveOffer = (indexToRemove) => {
        const newOffers = offers.filter((_, i) => i !== indexToRemove);
        formik.setFieldValue('offers', newOffers);
    };

    return (
        <>
        <form id="product-create-form" onSubmit={formik.handleSubmit} className="product-form">
             <div className="product__variations-header">
                 <h1>Дані товару</h1>
                  <div className="form-translate-bar">
                <TranslateButton
                    isLoading={isTranslating}
                    onClick={() => {
                        translateFields([
                            { from: 'title.ua',       to: 'title.en' },
                            { from: 'subtitle.ua',    to: 'subtitle.en' },
                            { from: 'description.ua', to: 'description.en' },
                        ]);
                    }}
                />
            </div>
            </div>
           

           
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="title.ua" name="title.ua" label="Назва товару (UA)"
                    value={formik.values.title?.ua || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Введіть назву українською" error={formik.errors.title?.ua} touched={formik.touched.title?.ua}
                />
                <CustomInput
                    id="title.en" name="title.en" label="Назва товару (EN)"
                    value={formik.values.title?.en || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Enter title in English" error={formik.errors.title?.en} touched={formik.touched.title?.en}
                />
            </div>

            <div className="form-wrapper-2-1-column">
                <CustomInput
                    id="slug" name="slug" label="Slug (URL товару)"
                    value={formik.values.slug || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="generyetsya-avtomatichno" error={formik.errors.slug} touched={formik.touched.slug}
                />
                <div className="form-group">
                    <label htmlFor="category">Категорія</label>
                    <div className="input-wrapper">
                        <CustomSelect
                            options={categoryOptions} 
                            value={formik.values.categoryIds || []}
                            onChange={(value) => formik.setFieldValue('categoryIds', value)} 
                            onBlur={formik.handleBlur}
                            name="categoryIds"
                            id="category"
                            error={formik.errors.categoryIds}
                            touched={formik.touched.categoryIds}
                            placeholder={categoryOptions.length > 0 ? "Виберіть категорію" : "Завантаження..."}
                            isMulti
                        />
                    </div>
                    {formik.touched.categoryIds && formik.errors.categoryIds ? (
                        <div className="error-text">{formik.errors.categoryIds}</div>
                    ) : null}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="status">Статус</label>
                <div className="input-wrapper">
                    <CustomSelect
                        options={STATUS_OPTIONS}
                        value={formik.values.status}
                        onChange={(value) => formik.setFieldValue('status', value)}
                        onBlur={formik.handleBlur}
                        name="status"
                        id="status"
                        error={formik.errors.status}
                        touched={formik.touched.status}
                        placeholder="Виберіть статус"
                    />
                </div>
            </div>

            <div className="form-wrapper-2-column">
                <div />
                <div className="form-group">
                    <label htmlFor="groupAccessoryOfferId">Аксесуар для всіх офферів</label>
                    <div className="input-wrapper">
                        <CustomSelect
                            options={accessoryOptions}
                            value={formik.values.groupAccessoryOfferId || ''}
                            onChange={applyAccessoryToAllOffers}
                            onInputChange={setAccessorySearchQuery}
                            name="groupAccessoryOfferId"
                            id="groupAccessoryOfferId"
                            placeholder={isAccessorySearchLoading ? 'Пошук аксесуарів...' : 'Оберіть аксесуар'}
                        />
                    </div>
                </div>
            </div>

            {/* === ОСНОВНА ІНФОРМАЦІЯ ПРО ТОВАР === */}
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="subtitle.ua" name="subtitle.ua" label="Підпис до товару (UA)"
                    value={formik.values.subtitle?.ua || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Короткий підпис українською..." error={formik.errors.subtitle?.ua} touched={formik.touched.subtitle?.ua}
                />
                <CustomInput
                    id="subtitle.en" name="subtitle.en" label="Підпис до товару (EN)"
                    value={formik.values.subtitle?.en || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Short subtitle in English..." error={formik.errors.subtitle?.en} touched={formik.touched.subtitle?.en}
                />
            </div>

            {/* === ОПИС ТОВАРУ === */}
            <div className="form-group">
                <label htmlFor="description.ua">Опис товару (UA)</label>
                <textarea
                    id="description.ua"
                    name="description.ua"
                    className={`custom-textarea ${formik.touched.description?.ua && formik.errors.description?.ua ? 'error' : ''}`}
                    value={formik.values.description?.ua || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Детальний опис українською..."
                />
                {formik.touched.description?.ua && formik.errors.description?.ua && (
                    <div className="error-text">{formik.errors.description.ua}</div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="description.en">Опис товару (EN)</label>
                <textarea
                    id="description.en"
                    name="description.en"
                    className={`custom-textarea ${formik.touched.description?.en && formik.errors.description?.en ? 'error' : ''}`}
                    value={formik.values.description?.en || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Detailed description in English..."
                />
                {formik.touched.description?.en && formik.errors.description?.en && (
                    <div className="error-text">{formik.errors.description.en}</div>
                )}
            </div>

            {/* === РОЗМІРНА СІТКА === */}
            <div className="form-group">
                <label className="form-label">Розмірна сітка</label>
                <div 
                    className="size-chart-upload__box" 
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        position: 'relative',
                        padding: '15px',
                        textAlign: 'center',
                        border: '1px dashed #ccc',
                        borderRadius: '8px'
                    }}
                >
                    {formik.values.sizeChart?.imageUrl ? (
                        <>
                            <img 
                                src={getFullImageUrl(formik.values.sizeChart.imageUrl)} 
                                alt="Size Chart Preview" 
                                style={{ 
                                    width: '100%', 
                                    maxHeight: '200px', 
                                    objectFit: 'contain', 
                                    borderRadius: '4px', 
                                    marginBottom: '8px' 
                                }} 
                            />
                            <span style={{ color: '#7864F5', fontWeight: '500' }}>
                                Змінити картинку
                            </span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ marginBottom: '8px' }}>
                                <path d="M39.1111 4.88889V39.1111H4.88889V4.88889H39.1111ZM39.1111 0H4.88889C2.2 0 0 2.2 0 4.88889V39.1111C0 41.8 2.2 44 4.88889 44H39.1111C41.8 44 44 41.8 44 39.1111V4.88889C44 2.2 41.8 0 39.1111 0ZM27.2311 21.6578L19.8978 31.1178L14.6667 24.7867L7.33333 34.2222H36.6667L27.2311 21.6578Z" fill="#7864F5"/>
                            </svg>
                            <span style={{ color: '#7864F5', fontWeight: '500' }}>
                                Завантажити розмірну сітку
                            </span>
                        </>
                    )}
                    
                    <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml, image/avif, image/tiff, image/bmp"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                        }}
                        onChange={async (e) => {
                            const file = e.currentTarget.files[0];
                            if (!file) return;

                            try {
                                const response = await uploadAdminImages(file);

                                if (response?.ok && response?.data?.length > 0) {
                                    const imageUrl = response.data[0].url; 
                                    const fullImageUrl = getFullImageUrl(imageUrl);
                                    formik.setFieldValue('sizeChart.imageUrl', fullImageUrl);
                                }
                            } catch (error) {
                                console.error("Upload error:", error);
                                toast.error("Помилка при завантаженні картинки розмірної сітки");
                            }
                        }}
                    />
                </div>
                <input
                    type="text"
                    placeholder="Або вставте URL..."
                    value={formik.values.sizeChart?.imageUrl || ''}
                    onChange={(e) => formik.setFieldValue('sizeChart.imageUrl', e.target.value)}
                    style={{
                        marginTop: '8px',
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        color: '#475569',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* === ВАРІАЦІЇ ТОВАРУ (ОФФЕРИ) === */}
            <div className="product__variations-header">
                <h1>Варіації товару (Оффери)</h1>
            </div>

            {/* === БЛОК ФІЛЬТРАЦІЇ ОФФЕРІВ ПО ОСЯМ === */}
            {axes.length > 0 && (
                <div className="offers-filters" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {axes.map((axis) => {
                        const filterOptions = [
                            { value: '', label: 'Всі' },
                            ...(axis.valuesPreset?.map(val => ({
                                value: getAxisPresetValue(val),
                                label: getAxisPresetLabel(val)
                            })) || [])
                        ];

                        return (
                            <div key={`filter-${axis.axisId}`} className="form-group" style={{ minWidth: '200px' }}>
                                <label>Фільтр: {axis.title?.ua || axis.axisId}</label>
                                <CustomSelect
                                    options={filterOptions}
                                    value={currentOpt[axis.axisId] || ''}
                                    onChange={(val) => handleFilterChange(axis.axisId, val)}
                                    placeholder="Оберіть значення"
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="product__variations">
                {filteredOffers.map(({ item, originalIndex }) => (
                    <div className="product__variation" key={originalIndex}>

                        <div className="product__variation__header">
                            <div className="product__variation__title-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M1.02745 0.0858936C1.37383 0.0388511 1.87187 0 2.57447 0C3.27706 0 3.77511 0.0388511 4.12149 0.0858936C4.70426 0.165468 5.07755 0.62934 5.11266 1.18168C5.13279 1.49694 5.14894 1.94536 5.14894 2.57447C5.14894 3.20357 5.13279 3.652 5.11266 3.96726C5.07755 4.5196 4.70426 4.98347 4.12126 5.06304C3.77511 5.11009 3.2773 5.14894 2.57447 5.14894C1.87164 5.14894 1.37383 5.11009 1.02745 5.06304C0.444681 4.98347 0.071617 4.51936 0.0365106 3.96702C0.0161489 3.652 0 3.20357 0 2.57447C0 1.94536 0.0161489 1.49694 0.0362766 1.18168C0.071383 0.62934 0.444681 0.165468 1.02745 0.0858936ZM1.02745 10.9141C1.37383 10.9611 1.87164 11 2.57447 11C3.2773 11 3.77511 10.9611 4.12149 10.9141C4.70426 10.8345 5.07755 10.3707 5.11266 9.81832C5.13279 9.50306 5.14894 9.05464 5.14894 8.42553C5.14894 7.79643 5.13279 7.348 5.11266 7.03274C5.07755 6.4804 4.70426 6.01653 4.12126 5.93696C3.77511 5.88991 3.2773 5.85106 2.57447 5.85106C1.87164 5.85106 1.37383 5.88991 1.02745 5.93696C0.444681 6.01653 0.071617 6.48064 0.0365106 7.03298C0.0161489 7.348 0 7.79643 0 8.42553C0 9.05464 0.0161489 9.50306 0.0362766 9.81832C0.071383 10.3707 0.444681 10.8345 1.02745 10.9141ZM11 8.42553C11 9.12836 10.9611 9.62617 10.9141 9.97255C10.8345 10.5553 10.3707 10.9286 9.81832 10.9637C9.50306 10.9839 9.05464 11 8.42553 11C7.79643 11 7.348 10.9839 7.03274 10.9637C6.4804 10.9286 6.01653 10.5551 5.93696 9.97232C5.88991 9.62617 5.85106 9.12836 5.85106 8.42553C5.85106 7.7227 5.88991 7.22489 5.93696 6.87851C6.01653 6.29574 6.4804 5.92245 7.03274 5.88734C7.348 5.86721 7.79643 5.85106 8.42553 5.85106C9.05464 5.85106 9.50306 5.86721 9.81832 5.88734C10.3707 5.92245 10.8345 6.29574 10.9141 6.87875C10.9611 7.22489 11 7.7227 11 8.42553ZM7.91228 0.323915C8.13415 -0.0816809 8.71692 -0.0816809 8.93879 0.323915L9.405 1.1763C9.50165 1.35303 9.64697 1.49835 9.8237 1.595L10.6761 2.06121C11.0817 2.28309 11.0817 2.86585 10.6761 3.08772L9.8237 3.55394C9.64697 3.65059 9.50165 3.7959 9.405 3.97264L8.93879 4.82502C8.71692 5.23062 8.13415 5.23062 7.91228 4.82502L7.44606 3.97264C7.34941 3.7959 7.2041 3.65059 7.02736 3.55394L6.17498 3.08772C5.76938 2.86585 5.76938 2.28309 6.17498 2.06121L7.02736 1.595C7.2041 1.49835 7.34941 1.35303 7.44606 1.1763L7.91228 0.323915Z" fill="#0F172A" />
                                </svg>
                                <h3>{item.title || `Нова варіація ${originalIndex + 1}`}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveOffer(originalIndex)}
                                className="btn-remove"
                            >
                                - Видалити оффер
                            </button>
                        </div>

                        <div className="product__variation__content">
                          <div className="variation-image-upload">
                            <label className="variation-image-upload__label">Зображення</label>
                            <div 
                                className="variation-image-upload__box" 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    position: 'relative',
                                    padding: '15px',
                                    textAlign: 'center',
                                    border: '1px dashed #ccc',
                                    borderRadius: '8px'
                                }}
                            >
                                {formik.values.offers?.[originalIndex]?.image && typeof formik.values.offers[originalIndex].image === 'string' ? (
                                    <>
                                        <img 
                                            src={getFullImageUrl(formik.values.offers[originalIndex].image)} 
                                            alt="Preview" 
                                            style={{ 
                                                width: '100%', 
                                                maxHeight: '120px', 
                                                objectFit: 'contain', 
                                                borderRadius: '4px', 
                                                marginBottom: '8px' 
                                            }} 
                                        />
                                        <span className="variation-image-upload__text" style={{ color: '#7864F5', fontWeight: '500' }}>
                                            Змінити
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ marginBottom: '8px' }}>
                                            <path d="M39.1111 4.88889V39.1111H4.88889V4.88889H39.1111ZM39.1111 0H4.88889C2.2 0 0 2.2 0 4.88889V39.1111C0 41.8 2.2 44 4.88889 44H39.1111C41.8 44 44 41.8 44 39.1111V4.88889C44 2.2 41.8 0 39.1111 0ZM27.2311 21.6578L19.8978 31.1178L14.6667 24.7867L7.33333 34.2222H36.6667L27.2311 21.6578Z" fill="#7864F5"/>
                                        </svg>
                                        <span className="variation-image-upload__text" style={{ color: '#7864F5', fontWeight: '500' }}>
                                            Завантажити
                                        </span>
                                    </>
                                )}
                                
                                <input
                                    type="file"
                                    accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml, image/avif, image/tiff, image/bmp"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                    onChange={async (e) => {
                                        const file = e.currentTarget.files[0];
                                        if (!file) return;

                                        try {
                                            const response = await uploadAdminImages(file);

                                            if (response?.ok && response?.data?.length > 0) {
                                                const imageUrl = response.data[0].url; 
                                                const fullImageUrl = getFullImageUrl(imageUrl);
                                                formik.setFieldValue(`offers[${originalIndex}].image`, fullImageUrl);
                                            }
                                        } catch (error) {
                                            console.error("Upload error:", error);
                                            toast.error("Помилка при завантаженні зображення");
                                        }
                                    }}
                                    className="variation-image-upload__input"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Або вставте URL..."
                                value={typeof formik.values.offers?.[originalIndex]?.image === 'string' ? formik.values.offers[originalIndex].image : ''}
                                onChange={(e) => formik.setFieldValue(`offers[${originalIndex}].image`, e.target.value)}
                                style={{
                                    marginTop: '8px',
                                    width: '100%',
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '6px',
                                    color: '#475569',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                            <div className="variation-details">
                                <div className="form-wrapper-3-column">
                                    <CustomInput
                                        id={`offers-${originalIndex}-price`} name={`offers[${originalIndex}].price`}
                                        label="Ціна" type="number"
                                        value={formik.values.offers?.[originalIndex]?.price || ''} onChange={formik.handleChange}
                                        placeholder="0.00"
                                    />
                                    <CustomInput
                                        id={`offers-${originalIndex}-sku`} name={`offers[${originalIndex}].sku`}
                                        label="Артикул (SKU)"
                                        value={formik.values.offers?.[originalIndex]?.sku || ''} onChange={formik.handleChange}
                                        placeholder="Генерується автоматично"
                                        readOnly
                                    />
                                    <div className="form-group">
                                        <label htmlFor={`offers-${originalIndex}-accessory`}>Аксесуар</label>
                                        <CustomSelect
                                            options={accessoryOptions}
                                            value={String(formik.values.offers?.[originalIndex]?.accessoryOfferId || '')}
                                            onChange={(val) => formik.setFieldValue(`offers[${originalIndex}].accessoryOfferId`, val)}
                                            onInputChange={setAccessorySearchQuery}
                                            name={`offers[${originalIndex}].accessoryOfferId`}
                                            id={`offers-${originalIndex}-accessory`}
                                            placeholder={isAccessorySearchLoading ? 'Пошук аксесуарів...' : 'Оберіть аксесуар'}
                                        />
                                    </div>
                                </div>

                                <div className="form-wrapper-2-column">
                                    {axes.map((axis) => {
                                        const selectOptions = axis.valuesPreset?.map(val => ({
                                            value: getAxisPresetValue(val),
                                            label: getAxisPresetLabel(val)
                                        })) || [];

                                        return (
                                            <div className="form-group" key={axis.axisId}>
                                                <label>{axis.title?.ua || axis.axisId}</label>
                                                <CustomSelect
                                                    options={selectOptions}
                                                    value={String(formik.values.offers?.[originalIndex]?.options?.[axis.axisId] || '')}
                                                    onChange={(val) => formik.setFieldValue(`offers[${originalIndex}].options.${axis.axisId}`, val)}
                                                    placeholder="Оберіть опцію"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button type="button" onClick={handleAddOffer} className="btn-add-primary">
                    + Додати варіацію
                </button>
            </div>

            {/* === ПАГІНАЦІЯ ОФФЕРІВ === */}
            {isEditMode && variationsData?.meta && variationsData.meta.total > 0 && (
                <CatalogPagination data={variationsData.meta} />
            )}

            {/* === ДЕБАГ: ПОМИЛКИ ФОРМИ === */}
            {Object.keys(formik.errors).length > 0 && (
                <div style={{ marginTop: '24px', padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px' }}>
                    <strong style={{ color: '#DC2626', fontSize: '13px' }}>Помилки форми (чому не зберігається):</strong>
                    <pre style={{ marginTop: '8px', fontSize: '12px', color: '#7F1D1D', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {JSON.stringify(formik.errors, null, 2)}
                    </pre>
                </div>
            )}

        </form>
        <BulkOffersModal
            isOpen={isBulkOffersModalOpen}
            onClose={onCloseBulkOffersModal}
            selectableAxes={selectableAxes}
            offers={offers}
            setFieldValue={formik.setFieldValue}
        />
        </>
    );
};

export default ProductForm;