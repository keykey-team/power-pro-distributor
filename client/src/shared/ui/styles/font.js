import {
  Plus_Jakarta_Sans,
  Sofia_Sans_Condensed,
} from "next/font/google";

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "cyrillic-ext"],
  weight: [
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
  ],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const sofiaSansCondensed =
  Sofia_Sans_Condensed({
    subsets: ["latin", "cyrillic-ext"],
    weight: [
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
    ],
    display: "swap",
    variable: "--font-sofia-sans-condensed",
  });

import { Manrope } from "next/font/google";

export const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
  ],
  display: "swap",
  variable: "--font-main",
});
