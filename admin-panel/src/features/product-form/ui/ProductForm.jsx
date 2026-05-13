"use client";
import React, { useEffect, useState } from 'react';
import { useProductForm } from '../lib/useProductForm';
import { generateSlug } from '../lib/generateSlug';
import CustomSelect from '../../../shared/ui/select-form/CustomSelect';
import CustomInput from '../../../shared/ui/input-form/CustomInput';
import { uploadAdminImages } from '../../../shared/api/products.services'; 
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

        setUploadingImages(true);
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('images', file);
            });

            const uploadedUrls = await uploadAdminImages(formData);
            const urls = Array.isArray(uploadedUrls) ? uploadedUrls : uploadedUrls?.urls || [];

            if (fieldName === 'cover') {
                // Set first uploaded image as cover
                formik.setFieldValue('cover', urls[0] || '');
            } else if (fieldName === 'gallery') {
                // Append to gallery
                const currentGallery = formik.values.gallery || [];
                formik.setFieldValue('gallery', [...currentGallery, ...urls]);
            }

            toast.success('Зображення завантажено успішно');
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Помилка завантаження зображень');
        } finally {
            setUploadingImages(false);
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
                <CustomInput
                    id="type" name="type" label="Тип товару"
                    value={formik.values.type || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Тип товару" error={formik.errors.type} touched={formik.touched.type}
                />
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
                    multiple
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
            <div className="form-group">
                <label htmlFor="nutritionTable">Таблиця поживної цінності (JSON)</label>
                <textarea
                    id="nutritionTable"
                    name="nutritionTable"
                    className="custom-textarea"
                    value={formik.values.nutritionTable ? JSON.stringify(formik.values.nutritionTable, null, 2) : ''}
                    onChange={(e) => {
                        try {
                            const val = e.target.value.trim();
                            formik.setFieldValue('nutritionTable', val ? JSON.parse(val) : null);
                        } catch {
                            // Invalid JSON, just set as string (will fail validation on submit)
                        }
                    }}
                    placeholder="{}"
                    rows="3"
                />
            </div>

            {/* === SEO === */}
            <h1>SEO</h1>
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
            ))}

            {/* === CARD BADGES === */}
            <h1>Бейджи карточки</h1>
            <div className="form-group">
                <label htmlFor="cardBadges">Бейджи (через кому)</label>
                <CustomInput
                    id="cardBadges" name="cardBadges" label=""
                    value={(formik.values.cardBadges || []).join(', ')}
                    onChange={(e) => {
                        const badges = e.target.value.split(',').map(b => b.trim()).filter(Boolean);
                        formik.setFieldValue('cardBadges', badges);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Новинка, Хіт, Знижка"
                />
            </div>

            {/* === PURCHASE OPTIONS V2 === */}
            <h1>Варіанти покупки (версія 2)</h1>
            <div className="form-group">
                <label htmlFor="purchaseOptionsV2DefaultKey">Ключ за замовчуванням</label>
                <CustomInput
                    id="purchaseOptionsV2DefaultKey" name="purchaseOptionsV2DefaultKey" label=""
                    value={formik.values.purchaseOptionsV2DefaultKey || 'unit'}
                    onChange={formik.handleChange}
                    placeholder="unit"
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
                                onChange={(e) => updatePurchaseOption(index, 'key', e.target.value)}
                                placeholder="unit, pack, box..."
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
                            <CustomInput
                                label="Режим"
                                value={item.mode || 'unit'}
                                onChange={(e) => updatePurchaseOption(index, 'mode', e.target.value)}
                                placeholder="unit, weight..."
                            />
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
