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

const OrderForm = forwardRef((props, ref) => {
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

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      if (formikRef.current) {
        formikRef.current.submitForm();
      }
    },
  }));

  useEffect(() => {
    if (
      selectedPoint?.id &&
      selectedPoint?.location?.address?.country &&
      selectedPoint?.location?.address?.city &&
      selectedPoint?.location?.address?.street
    ) {
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

    return () => {
      window.removeEventListener('submit-order-form', handleSubmitEvent);
    };
  }, []);

  const handlePhoneChange = (e, setFieldValue) => {
    const raw = e.target.value;
    const formatted = formatPhone(raw);
    setFieldValue('phone', formatted);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (!selectedPoint) {
        alert('Vyberte pobočku');
        return;
      }

      const cleanPhoneNumber = (phone) => phone.replace(/[^\d+]/g, '');
      const cleanedPhone = cleanPhoneNumber(values.phone);

      const payload = {
        name: values.firstName,
        surname: values.lastName,
        phone: cleanedPhone,
        email: values.email,
        payment: {
          method: 'online',
        },
        items: cart.map((el) => {
          if (el?.kind === 'product') {
            return {
              kind: 'product',
              productId: el?.product?._id,
              quantity: el?.quantity,
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
        delivery: {
          country: selectedPoint.location.address.country,
          city: selectedPoint.location.address.city,
          address: selectedPoint.location.address.street,
          psc: selectedPoint.id,
        },
      };

      // 1. Создаём заказ
      const orderResponse = await createOrder(payload);

      const orderId =
        orderResponse?.order?._id ||
        orderResponse?.data?._id ||
        orderResponse?._id;

      if (!orderId) {
        throw new Error('Order ID not found in createOrder response');
      }

      // 2. Создаём оплату
      const paymentResponse = await createOrderPayment(orderId);

      const redirectUrl =
        paymentResponse?.data?.redirectUrl ||
        paymentResponse?.redirectUrl;

      if (!redirectUrl) {
        throw new Error('Comgate redirectUrl not found');
      }

      // 3. Переход на платёжку
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Order/payment error:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Nepodarilo sa vytvoriť objednávku';

      alert(message);

      // если хочешь, можешь вместо alert открыть модалку ошибки
      // setIsModalOpen("order-error");
    } finally {
      setSubmitting(false);
    }
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
                    {t('order.firstNameLabel') || 'Имя'}
                  </label>
                  <Field
                    type="text"
                    name="firstName"
                    id={firstNameId}
                    placeholder={t('order.firstNamePlaceholder') || 'Введите имя'}
                    className="input-field"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="input-wrapper">
                  <label htmlFor={lastNameId} className="input-label">
                    {t('order.lastNameLabel') || 'Фамилия'}
                  </label>
                  <Field
                    type="text"
                    name="lastName"
                    id={lastNameId}
                    placeholder={
                      t('order.lastNamePlaceholder') || 'Введите фамилию'
                    }
                    className="input-field"
                  />
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="error-message"
                  />
                </div>

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
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error-message"
                  />
                </div>

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
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="error-message"
                  />
                </div>
              </div>
            </div>

            <div className="order__container">
              <div className="order__title">
                <div className="order__number">2</div>
                <p>{t('order.subtitle2')}</p>
              </div>

              <DPDWidget
                selectedPoint={selectedPoint}
                setSelectedPoint={setSelectedPoint}
              />

              {!isDeliveryChoose && (
                <div className="order__title">
                  <p className="order__title__error">Vyberte pobočku</p>
                </div>
              )}
            </div>

            <div className="order__container">
              <div className="order__title">
                <div className="order__number">3</div>
                <p>{t('order.subtitle3')}</p>
              </div>

              <div className="order__pay">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="19"
                  viewBox="0 0 24 19"
                  fill="none"
                >
                  <path
                    d="M0 15.9773C0 16.7789 0.31607 17.5478 0.87868 18.1147C1.44129 18.6815 2.20435 19 3 19H21C21.7957 19 22.5587 18.6815 23.1213 18.1147C23.6839 17.5478 24 16.7789 24 15.9773V7.66477H0V15.9773ZM3.53571 11.875C3.53571 11.4455 3.70504 11.0337 4.00644 10.73C4.30783 10.4263 4.71662 10.2557 5.14286 10.2557H7.71429C8.14053 10.2557 8.54931 10.4263 8.85071 10.73C9.15211 11.0337 9.32143 11.4455 9.32143 11.875V12.9545C9.32143 13.384 9.15211 13.7959 8.85071 14.0996C8.54931 14.4033 8.14053 14.5739 7.71429 14.5739H5.14286C4.71662 14.5739 4.30783 14.4033 4.00644 14.0996C3.70504 13.7959 3.53571 13.384 3.53571 12.9545V11.875ZM21 0H3C2.20435 0 1.44129 0.318465 0.87868 0.885337C0.31607 1.45221 0 2.22105 0 3.02273V4.42614H24V3.02273C24 2.22105 23.6839 1.45221 23.1213 0.885337C22.5587 0.318465 21.7957 0 21 0Z"
                    fill="#FFED00"
                  />
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