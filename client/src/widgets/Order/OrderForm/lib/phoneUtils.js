// Форматує словацький номер у вигляді +421 XXX XXX XXX
export const formatPhone = (raw = '') => {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  
  // Видаляємо код країни або ведучий нуль, якщо вони є
  if (digits.startsWith('421')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  // Обмежуємо до 9 цифр (максимальна довжина національного номера)
  digits = digits.slice(0, 9);
  
  // Форматуємо по групах 3-3-3
  let formatted = '';
  for (let i = 0; i < digits.length; i++) {
    if (i === 3 || i === 6) formatted += ' ';
    formatted += digits[i];
  }
  
  return `+421 ${formatted}`.trim();
};

// Очищає номер і приводить до міжнародного формату (починається з 421)
export const cleanPhoneNumber = (value) => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  
  // Якщо номер починається з 0 → замінюємо на 421
  if (numbers.startsWith('0')) {
    return '421' + numbers.slice(1);
  }
  // Якщо вже містить 421 — залишаємо
  if (numbers.startsWith('421')) {
    return numbers;
  }
  // Інакше додаємо 421 (вважаємо, що введено національний номер без коду)
  return '421' + numbers;
};