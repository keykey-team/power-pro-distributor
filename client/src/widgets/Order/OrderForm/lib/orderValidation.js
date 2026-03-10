import * as Yup from 'yup';
import { cleanPhoneNumber } from './phoneUtils'; // шлях має відповідати реальному розташуванню

export const orderValidationSchema = Yup.object({
  firstName: Yup.string()
    .required('Meno je povinné')
    .min(2, 'Meno musí obsahovať aspoň 2 znaky'),
  lastName: Yup.string()
    .required('Priezvisko je povinné')
    .min(2, 'Priezvisko musí obsahovať aspoň 2 znaky'),
  email: Yup.string()
    .email('Neplatný formát emailu')
    .required('Email je povinný'),
  phone: Yup.string()
    .required('Telefónne číslo je povinné')
    .test('is-valid-phone', 'Neplatný formát telefónneho čísla', (value) => {
      if (!value) return false;
      const cleaned = cleanPhoneNumber(value);
      // Перевіряємо, що після очищення номер має 12 цифр і починається з 421
      return /^421\d{9}$/.test(cleaned);
    }),
});