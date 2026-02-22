import { Inter, Unbounded } from "next/font/google";

// Для замены plusJakartaSans
export const inter = Inter({
  subsets: ["latin", "cyrillic-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta-sans", // оставляем старое имя переменной если нужно
});

// Для замены sofiaSansCondensed
export const unbounded = Unbounded({
  subsets: ["latin", "cyrillic-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-sofia-sans-condensed", // оставляем старое имя переменной
});

// Удаляем manrope если он не нужен, или заменяем:
// export const manrope = Inter({
//   subsets: ["latin", "cyrillic"],
//   weight: ["300", "400", "500", "600", "700", "800"],
//   display: "swap",
//   variable: "--font-main",
// });