'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useId,
  useState,
  useEffect,
} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { orderValidationSchema } from '../lib/orderValidation';
import { useI18n } from '@shared/i18n/use-i18n';
import DPDWidget from './DPD';
import { formatPhone } from '../lib/phoneUtils';
import { useCart } from '@widgets/header/model/useCart';
import { useModals } from '@shared/index';
import {
  createOrder,
  createOrderPayment,
} from '@shared/services/orderServices';

// Принимаем deliveryType и setDeliveryType из родительского компонента
const OrderForm = forwardRef(({ deliveryType, setDeliveryType, ...props }, ref) => {
  const { setIsModalOpen } = useModals();
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isDeliveryChoose, setIsDeliveryChoose] = useState(false);
  const { t } = useI18n();
  const formikRef = useRef();
  const cart = useCart();

  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const commentId = useId();

  // ID для полей курьера
  const streetId = useId();
  const cityId = useId();
  const zipId = useId();

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      if (formikRef.current) {
        formikRef.current.submitForm();
      }
    },
  }));

  useEffect(() => {
    if (selectedPoint?.id) {
      setIsDeliveryChoose(true);
    } else {
      setIsDeliveryChoose(false);
    }
  }, [selectedPoint]);

  useEffect(() => {
    const handleSubmitEvent = () => {
      if (formikRef.current) {
        formikRef.current.submitForm();
      }
    };
    window.addEventListener('submit-order-form', handleSubmitEvent);
    return () => window.removeEventListener('submit-order-form', handleSubmitEvent);
  }, []);

  const handlePhoneChange = (e, setFieldValue) => {
    const raw = e.target.value;
    const formatted = formatPhone(raw);
    setFieldValue('phone', formatted);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Валидация перед отправкой
      if (deliveryType === 'pickup' && !selectedPoint) {
        alert(t('order.select-point') || 'Vyberte pobočku');
        setSubmitting(false);
        return;
      }

      if (deliveryType === 'courier' && (!values.street || !values.city || !values.zip)) {
        alert('Vyplňte všetky polia pre doručenie kuriérom (Ulica, Mesto, PSČ)');
        setSubmitting(false);
        return;
      }

      const cleanPhoneNumber = (phone) => phone.replace(/[^\d+]/g, '');
      const cleanedPhone = cleanPhoneNumber(values.phone);

      // --- НОВАЯ ЛОГИКА РАСЧЕТА СТОИМОСТИ ДОСТАВКИ ---
      const totalCartPrice = cart.reduce((acc, item) => {
        const price = Number(item?.price || 0);
        const quantity = Number(item.quantity || 1);
        return acc + price * quantity;
      }, 0);

      const isFreeDelivery = totalCartPrice >= 50;
      let deliveryPrice = 0;

      if (!isFreeDelivery) {
        deliveryPrice = deliveryType === 'courier' ? 4.3 : 3.2;
      }
      // ------------------------------------------------

      // Формируем данные доставки (добавляем price)
      const deliveryPayload = deliveryType === 'pickup'
        ? {
          country: selectedPoint.location.address.country,
          city: selectedPoint.location.address.city,
          address: selectedPoint.location.address.street,
          psc: selectedPoint.id,
          price: deliveryPrice, // Отправляем цену доставки (0 или платную)
        }
        : {
          country: 'SK',
          city: values.city,
          address: values.street,
          psc: values.zip,
          price: deliveryPrice, // Отправляем цену доставки (0 или платную)
        };

      const payload = {
        name: values.firstName,
        surname: values.lastName,
        phone: cleanedPhone,
        email: values.email,
        comment: values.comment,
        payment: { method: 'online' },
        items: cart.map((el) => {
          if (el?.kind === 'product') {
            return {
              kind: 'product',
              productId: el?.product?._id,
              quantity: el?.quantity,
              purchaseMode: el?.purchaseMode
            };
          }
          return {
            kind: 'custom_box',
            size: el?.size,
            quantity: el?.quantity,
            items: el.items.map((elBox) => ({
              _id: elBox.productId,
              quantity: elBox.quantity,
            })),
          };
        }),
        delivery: deliveryPayload,
      };

      const orderResponse = await createOrder(payload);
      const orderId = orderResponse?.order?._id || orderResponse?.data?._id || orderResponse?._id;

      if (!orderId) throw new Error('Order ID not found');

      const paymentResponse = await createOrderPayment(orderId);
      const redirectUrl = paymentResponse?.data?.redirectUrl || paymentResponse?.redirectUrl;

      if (!redirectUrl) throw new Error('Redirect URL not found');

      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Order error:', error);
      alert(error?.message || 'Nepodarilo sa vytvoriť objednávku');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="order-inputs" style={{ flex: '1 1 60%' }}>
      <Formik
        innerRef={formikRef}
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          comment: '',
          street: '',
          city: '',
          zip: '',
        }}
        validationSchema={orderValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form className="order-form">
            <div className="order__container">
              <div className="order__title">
                <div className="order__number">1</div>
                <p>{t('order.subtitle1')}</p>
              </div>

              <div className="order__form__side">
                <div className="input-wrapper">
                  <label htmlFor={firstNameId} className="input-label">
                    {t('order.firstNameLabel')}
                  </label>
                  <Field
                    name="firstName"
                    id={firstNameId}
                    className="input-field"
                    placeholder={t('order.form-placeholder.firstName')}
                  />
                  <ErrorMessage name="firstName" component="div" className="error-message" />
                </div>

                <div className="input-wrapper">
                  <label htmlFor={lastNameId} className="input-label">
                    {t('order.lastNameLabel')}
                  </label>
                  <Field
                    name="lastName"
                    id={lastNameId}
                    className="input-field"
                    placeholder={t('order.form-placeholder.lastName')}
                  />
                  <ErrorMessage name="lastName" component="div" className="error-message" />
                </div>

                <div className="input-wrapper">
                  <label htmlFor={emailId} className="input-label">
                    {t('order.emailLabel')}
                  </label>
                  <Field
                    name="email"
                    id={emailId}
                    type="email"
                    className="input-field"
                    placeholder={t('order.form-placeholder.email')}
                  />
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                <div className="input-wrapper">
                  <label htmlFor={phoneId} className="input-label">
                    {t('order.phoneLabel')}
                  </label>
                  <Field name="phone">
                    {({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        id={phoneId}
                        className="input-field"
                        placeholder={t('order.form-placeholder.phone')}
                        onChange={(e) => handlePhoneChange(e, setFieldValue)}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="phone" component="div" className="error-message" />
                </div>

                <div className="input-wrapper full-width" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor={commentId} className="input-label">
                    {t('order.commentLabel')}
                  </label>
                  <Field
                    as="textarea"
                    name="comment"
                    id={commentId}
                    placeholder={t('order.form-placeholder.comment')}
                    className="input-field textarea-field"
                    style={{
                      minHeight: '120px',
                      padding: '12px',
                      resize: 'none'
                    }}
                  />
                  <ErrorMessage name="comment" component="div" className="error-message" />
                </div>
              </div>
            </div>

            <div className="order__container">
              <div className="order__title">
                <div className="order__number">2</div>
                <p>{t('order.subtitle2')}</p>
              </div>

              {/* Кнопки выбора доставки */}
              <div className="delivery-type-toggles" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  style={{
                    color: "white",
                    padding: '10px 20px',
                    border: deliveryType === 'pickup' ? '2px solid #E41F25' : '2px solid #ccc',
                    background: deliveryType === 'pickup' ? '#E41F25' : 'transparent',
                    cursor: 'pointer',
                    borderRadius: '20px',
                    
                  }}
                >
                  {t('order.delivery-pickup') || 'Na pobočku (DPD)'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('courier')}
                  style={{
                    color: "white",
                    padding: '10px 20px',
                    border: deliveryType === 'courier' ? '2px solid #E41F25' : '2px solid #ccc',
                    background: deliveryType === 'courier' ? '#E41F25' : 'transparent',
                    cursor: 'pointer',
                    borderRadius: '20px',
                    
                  }}
                >
                  {t('order.delivery-courier') || 'Kuriérom'}
                </button>
              </div>

              {deliveryType === 'pickup' ? (
                <>
                  <DPDWidget selectedPoint={selectedPoint} setSelectedPoint={setSelectedPoint} />
                  {!isDeliveryChoose && (
                    <div className="order__title">
                      <p className="order__title__error">{t('order.select-point') || 'Vyberte pobočku'}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="order__form__side">
                  <div className="input-wrapper full-width" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor={streetId} className="input-label">Ulica a číslo domu</label>
                    <Field
                      name="street"
                      id={streetId}
                      className="input-field"
                      placeholder="Napr. Hlavná 123/45"
                    />
                    <ErrorMessage name="street" component="div" className="error-message" />
                  </div>

                  <div className="input-wrapper">
                    <label htmlFor={cityId} className="input-label">Mesto</label>
                    <Field
                      name="city"
                      id={cityId}
                      className="input-field"
                      placeholder="Napr. Bratislava"
                    />
                    <ErrorMessage name="city" component="div" className="error-message" />
                  </div>

                  <div className="input-wrapper">
                    <label htmlFor={zipId} className="input-label">PSČ</label>
                    <Field
                      name="zip"
                      id={zipId}
                      className="input-field"
                      placeholder="Napr. 811 01"
                    />
                    <ErrorMessage name="zip" component="div" className="error-message" />
                  </div>
                </div>
              )}
            </div>

            <div className="order__container">
              <div className="order__title">
                <div className="order__number">3</div>
                <p>{t('order.subtitle3')}</p>
              </div>
              <div className="order__pay">
                <svg width="24" height="19" fill="none">
                  <path d="M0 15.9773C0 16.7789 0.31607 17.5478 0.87868 18.1147C1.44129 18.6815 2.20435 19 3 19H21C21.7957 19 22.5587 18.6815 23.1213 18.1147C23.6839 17.5478 24 16.7789 24 15.9773V7.66477H0V15.9773ZM3.53571 11.875C3.53571 11.4455 3.70504 11.0337 4.00644 10.73C4.30783 10.4263 4.71662 10.2557 5.14286 10.2557H7.71429C8.14053 10.2557 8.54931 10.4263 8.85071 10.73C9.15211 11.0337 9.32143 11.4455 9.32143 11.875V12.9545C9.32143 13.384 9.15211 13.7959 8.85071 14.0996C8.54931 14.4033 8.14053 14.5739 7.71429 14.5739H5.14286C4.71662 14.5739 4.30783 14.4033 4.00644 14.0996C3.70504 13.7959 3.53571 13.384 3.53571 12.9545V11.875ZM21 0H3C2.20435 0 1.44129 0.318465 0.87868 0.885337C0.31607 1.45221 0 2.22105 0 3.02273V4.42614H24V3.02273C24 2.22105 23.6839 1.45221 23.1213 0.885337C22.5587 0.318465 21.7957 0 21 0Z" fill="#FFED00" />
                </svg>
                <p>{t('order.placement')}</p>
              </div>
            </div>

            {isSubmitting && (
              <div className="order__submitting">
                <p>Spracovanie objednávky...</p>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </section>
  );
});

OrderForm.displayName = 'OrderForm';
export default OrderForm;