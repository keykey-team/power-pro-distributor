// ================================
// utils/title.js
// ================================
export function toTitleString(title) {
  if (!title) return "";
  if (typeof title === "string") return title;

  // i18n object {ua,ru,en,sk}
  return title.ua || title.ru || title.en || title.sk || "";
}
