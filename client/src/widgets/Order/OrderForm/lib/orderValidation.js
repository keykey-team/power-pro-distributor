// @features/Order/validation/orderValidation.js

import * as Yup from 'yup';
import { cleanPhoneNumber } from './phoneUtils';


export const orderValidationSchema = Yup.object({
  firstName: Yup.string()
    .required("Ім'я обов'язкове")
    .min(2, "Ім'я має містити щонайменше 2 символи"),
  lastName: Yup.string()
    .required('Прізвище обов’язкове')
    .min(2, 'Прізвище має містити щонайменше 2 символи'),
  email: Yup.string()
    .email('Невірний формат email')
    .required('Email обов’язковий'),
  phone: Yup.string()
    .required('Телефон обов’язковий')
    .test('is-valid-phone', 'Невірний формат телефону', (value) => {
      if (!value) return false;
      const cleaned = cleanPhoneNumber(value);
      return /^380\d{9}$/.test(cleaned);
    }),
});