// ================================
// utils/pricing.js
// ================================
export function calcDiscountedTotal(total, discount = 0) {
  const t = Number(total || 0);
  const d = Number(discount || 0);

  if (!d) return +t.toFixed(2);

  // discount can be 10 (10%) or 0.1 (10%)
  const percent = d > 1 ? d / 100 : d;
  const out = t * (1 - percent);

  return +out.toFixed(2);
}
