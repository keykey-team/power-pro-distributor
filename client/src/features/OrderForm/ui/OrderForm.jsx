"use client";
import Image from "next/image";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useI18n } from "@shared/i18n/use-i18n";

const OrderForm = () => {
  const { t } = useI18n();
  const ALLOWED_COUNTRY_CODES = t("phoneCodes");
  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(t("validation.nameRequired"))
        .min(2, t("validation.nameMin")),
      phone: Yup.string()
        .required(t("validation.phoneRequired"))
        .test("phone-format", t("validation.phoneFormat"), (value) => {
          if (!value) return false;
          const phoneRegex = /^\+\d{1,4}[-\s]?\d{6,14}$/;
          if (!phoneRegex.test(value)) return false;
          const countryCode = value.split(/[-\s]/)[0];
          return ALLOWED_COUNTRY_CODES.includes(countryCode);
        }),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        console.log("Odosielam dopyt:", values);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert(t("form.success"));
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
    <div className="form container">
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
        <p className="form-prods-list">{t("form.noProducts")}</p>

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

          <button
            className="form-submit"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? t("form.submitting") : t("form.submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;