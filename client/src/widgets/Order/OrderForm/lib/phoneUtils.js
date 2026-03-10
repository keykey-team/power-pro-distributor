
export const formatPhoneUA = (raw = '') => {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('380')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length < 9) digits = digits.padEnd(9, '0');
  const p2 = digits.slice(0, 2);
  const p3 = digits.slice(2, 5);
  const p4 = digits.slice(5, 7);
  const p5 = digits.slice(7, 9);
  return `+380 (${p2}) ${p3}-${p4}-${p5}`;
};


export const cleanPhoneNumber = (value) => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  if (numbers.startsWith('380')) return numbers;
  if (numbers.startsWith('0')) return '38' + numbers;
  return numbers;
};