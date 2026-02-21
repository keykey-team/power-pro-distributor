"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useI18n } from "@shared/i18n/use-i18n";
import { sendLead } from "@shared/services/productsServices";
import { useModals } from "@shared/index";
import OrderConfirm from "../OrderConfirm";

const OrderForm = () => {
  const { t } = useI18n();
  const ALLOWED_COUNTRY_CODES = t("phoneCodes");
  const [cartItems, setCartItems] = useState([]);
  const { isModalOpen, setIsModalOpen } = useModals();

  // Функция для загрузки корзины из localStorage и обновления состояния
  const updateCartFromStorage = () => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Failed to parse cart:", error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  };

  useEffect(() => {
    // Первоначальная загрузка
    updateCartFromStorage();

    // Слушаем кастомное событие 'cartUpdated' (для обновлений в той же вкладке)
    window.addEventListener('cartUpdated', updateCartFromStorage);
    // Слушаем событие storage (для обновлений в других вкладках)
    window.addEventListener('storage', updateCartFromStorage);

    return () => {
      window.removeEventListener('cartUpdated', updateCartFromStorage);
      window.removeEventListener('storage', updateCartFromStorage);
    };
  }, []);

  // Удаление товара из корзины
  const handleRemoveItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    // Диспатчим событие, чтобы другие компоненты (если есть) тоже обновились
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      promoCode: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(t("validation.nameRequired"))
        .min(2, t("validation.nameMin")),
      phone: Yup.string()
        .required(t("validation.phoneRequired")),


    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          ...values,
          items: cartItems,
        };
        console.log("Odosielam dopyt:", payload);
        const data = await sendLead(payload);


        localStorage.setItem('cart', JSON.stringify([]));
        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));
        setIsModalOpen("order-confirm")
        resetForm();
      } catch (error) {
        console.error("Chyba pri odosielaní:", error);
        alert(t("form.error"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const formatPhone = (input) => {
    const digits = input.replace(/\D/g, "");
    return `+421${digits}`;
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    if (!raw.startsWith("+")) {
      const formatted = formatPhone(raw);
      formik.setFieldValue("phone", formatted);
    } else {
      formik.setFieldValue("phone", raw);
    }
  };

  const handlePhoneFocus = (e) => {
    if (!formik.values.phone) {
      formik.setFieldValue("phone", "+421");
    }
  };

  return (
    <>
      <OrderConfirm />

      <div id="order-form" className="form container">
        <Image
          className="form-bg"
          src="/img/probar.png"
          alt="Probar"
          width={1740}
          height={270}
        />

        <div className="form-content">
          <p className="form-title">
            {t("form.title")}<span>{t("form.titleSpan")}</span>
          </p>

          <p className="form-prods">{t("form.products")}</p>

          {/* Список товаров из корзины */}
          <div className="form-prods-list">
            {cartItems.length === 0 ? (
              <p>{t("form.noProducts")}</p>
            ) : (
              <ul className="cart-items">
                {cartItems.map((item, index) => (
                  <li key={index} className="cart-item">
                    <span>{item.name}</span>
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => handleRemoveItem(index)}
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={formik.handleSubmit} className="order-form">
            <div className="form-group">
              <label htmlFor="name">{t("form.nameLabel")}</label>
              <input
                placeholder={t("form.namePlaceholder")}
                id="name"
                type="text"
                {...formik.getFieldProps("name")}
                className={formik.touched.name && formik.errors.name ? "error" : ""}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="error-message">{formik.errors.name}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t("form.phoneLabel")}</label>
              <input
                id="phone"
                type="tel"
                placeholder={t("form.phonePlaceholder")}
                value={formik.values.phone}
                onChange={handlePhoneChange}
                onFocus={handlePhoneFocus}
                className={formik.touched.phone && formik.errors.phone ? "error" : ""}
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className="error-message">{formik.errors.phone}</div>
              )}
            </div>

            {/* Поле для промокода */}
            <div className="form-group">
              <label htmlFor="promoCode">{t("form.promoCodeLabel") || "Promo kód"}</label>
              <input
                id="promoCode"
                type="text"
                placeholder={t("form.promoCodePlaceholder") || "Zadajte promo kód"}
                {...formik.getFieldProps("promoCode")}
              />
            </div>

            <button
              className="form-submit"
              type="submit"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? t("form.submitting") : t("form.submit")}
            </button>
          </form>
        </div>

      </div> </>
  );
};

export default OrderForm;