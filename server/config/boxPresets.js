// config/boxPresets.js
// ✅ boxKey — это то, что фронт будет отправлять в заявку
export const BOX_PRESETS = {
  // пример
  fitwin_basic: {
    key: "fitwin_basic",
    title: {
      ua: "Бокс FitWin Basic",
      ru: "Бокс FitWin Basic",
      en: "FitWin Basic Box",
      sk: "FitWin Basic Box",
    },
    items: [
      // можно хранить productSlug или productId; ниже — productSlug (удобно для сидов)
      { productSlug: "jahodovy-mix", qty: 2 },
      { productSlug: "bananovy-sen", qty: 2 },
      { productSlug: "extra-cokolada", qty: 2 },
    ],
  },

  fitwin_pro: {
    key: "fitwin_pro",
    title: {
      ua: "Бокс FitWin Pro",
      ru: "Бокс FitWin Pro",
      en: "FitWin Pro Box",
      sk: "FitWin Pro Box",
    },
    items: [
      { productSlug: "pistacia-a-krem", qty: 4 },
      { productSlug: "extra-cokolada", qty: 4 },
    ],
  },
};

export function getBoxPreset(boxKey) {
  return BOX_PRESETS[String(boxKey || "").trim()] || null;
}
