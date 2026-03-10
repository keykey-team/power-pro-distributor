// @widgets/Order/OrderForm/ui/OrderForm.jsx
'use client';

import React, { forwardRef, useImperativeHandle, useRef, useId, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { cleanPhoneNumber, formatPhoneUA } from '../lib/phoneUtils';
import { orderValidationSchema } from '../lib/orderValidation';
import { useI18n } from '@shared/i18n/use-i18n';
import DPDWidget from './DPD';

const OrderForm = forwardRef((props, ref) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const { t } = useI18n();
  const formikRef = useRef();

  // Генеруємо унікальні ID для полів
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const phoneId = useId();

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      if (formikRef.current) {
        formikRef.current.submitForm();
      }
    }
  }));

  const handleSubmit = (values, { setSubmitting }) => {
    const cleanedPhone = cleanPhoneNumber(values.phone);
    const payload = {
      ...values,
      phone: cleanedPhone,
    };
    console.log('Форма відправлена:', payload);
    alert('Замовлення оформлено! (демо)');
    setSubmitting(false);
  };

  const handlePhoneChange = (e, setFieldValue) => {
    const raw = e.target.value;
    const formatted = formatPhoneUA(raw);
    setFieldValue('phone', formatted);
  };

  return (
    <section className="order-inputs">
      <Formik
        innerRef={formikRef}
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        }}
        validationSchema={orderValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="order-form">
            {/* Блок 1: Персональні дані */}
            <div className="order__container">
              <div className="order__title">
                <div className="order__number">1</div>
                <p>{t('order.subtitle1')}</p>
              </div>
              <div className="order__form__side">
                {/* Поле Ім'я */}
                <div className="input-wrapper">
                  <label htmlFor={firstNameId} className="input-label">
                    {t('order.firstNameLabel') || "Ім'я"}
                  </label>
                  <Field
                    type="text"
                    name="firstName"
                    id={firstNameId}
                    placeholder={t('order.firstNamePlaceholder') || "Введіть ім'я"}
                    className="input-field"
                  />
                  <ErrorMessage name="firstName" component="div" className="error-message" />
                </div>

                {/* Поле Прізвище */}
                <div className="input-wrapper">
                  <label htmlFor={lastNameId} className="input-label">
                    {t('order.lastNameLabel') || 'Прізвище'}
                  </label>
                  <Field
                    type="text"
                    name="lastName"
                    id={lastNameId}
                    placeholder={t('order.lastNamePlaceholder') || 'Введіть прізвище'}
                    className="input-field"
                  />
                  <ErrorMessage name="lastName" component="div" className="error-message" />
                </div>

                {/* Поле Email */}
                <div className="input-wrapper">
                  <label htmlFor={emailId} className="input-label">
                    {t('order.emailLabel') || 'Email'}
                  </label>
                  <Field
                    type="email"
                    name="email"
                    id={emailId}
                    placeholder="example@mail.com"
                    className="input-field"
                  />
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                {/* Поле Телефон */}
                <div className="input-wrapper">
                  <label htmlFor={phoneId} className="input-label">
                    {t('order.phoneLabel') || 'Телефон'}
                  </label>
                  <Field name="phone">
                    {({ field }) => (
                      <input
                        type="tel"
                        id={phoneId}
                        {...field}
                        placeholder="+380 (__) ___-__-__"
                        className="input-field"
                        onChange={(e) => handlePhoneChange(e, setFieldValue)}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="phone" component="div" className="error-message" />
                </div>
              </div>
            </div>

            {/* Блок 2: Доставка */}
            <div className="order__container">
              <div className="order__title">
                <div className="order__number">2</div>
                <p>{t('order.subtitle2')}</p>
              </div>
              <DPDWidget selectedPoint={selectedPoint} setSelectedPoint={setSelectedPoint} />
              
            </div>

            {/* Блок 3: Оплата */}
            <div className="order__container">
              <div className="order__title">
                <div className="order__number">3</div>
                <p>{t('order.subtitle3')}</p>
              </div>
              <div className="order__pay">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="19" viewBox="0 0 24 19" fill="none">
                  <path d="M0 15.9773C0 16.7789 0.31607 17.5478 0.87868 18.1147C1.44129 18.6815 2.20435 19 3 19H21C21.7957 19 22.5587 18.6815 23.1213 18.1147C23.6839 17.5478 24 16.7789 24 15.9773V7.66477H0V15.9773ZM3.53571 11.875C3.53571 11.4455 3.70504 11.0337 4.00644 10.73C4.30783 10.4263 4.71662 10.2557 5.14286 10.2557H7.71429C8.14053 10.2557 8.54931 10.4263 8.85071 10.73C9.15211 11.0337 9.32143 11.4455 9.32143 11.875V12.9545C9.32143 13.384 9.15211 13.7959 8.85071 14.0996C8.54931 14.4033 8.14053 14.5739 7.71429 14.5739H5.14286C4.71662 14.5739 4.30783 14.4033 4.00644 14.0996C3.70504 13.7959 3.53571 13.384 3.53571 12.9545V11.875ZM21 0H3C2.20435 0 1.44129 0.318465 0.87868 0.885337C0.31607 1.45221 0 2.22105 0 3.02273V4.42614H24V3.02273C24 2.22105 23.6839 1.45221 23.1213 0.885337C22.5587 0.318465 21.7957 0 21 0Z" fill="#FFED00" />
                </svg>
                <p>{t("order.placement")}</p>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
});

OrderForm.displayName = 'OrderForm';

export default OrderForm;