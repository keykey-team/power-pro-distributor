"use client"


import { useI18n } from "@shared/i18n/use-i18n";
import { useModals } from "@shared/index";
import { useRouter, usePathname, useSearchParams } from "next/navigation";



const LanguageDropdown = () => {
  const { t } = useI18n();
  const LANGS = [
  {
    locale: "ua",
      label: t("language.ukrainian"),
    code: "UA",
      Icon: "",
  },
  {
    locale: "en",
    label: t("language.english"),
    code: "EN",
    Icon: "",
  },
  ];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Получаем query параметры
  const { isModalOpen, setIsModalOpen } = useModals();

  // Получаем локаль из пути
  const getCurrentLocale = () => {
    const segments = pathname.split('/').filter(Boolean);
    return segments[0] || "ua";
  };

  const currentLocale = getCurrentLocale();
  const isOpen = isModalOpen === "language-dropdown";

  const onSelect = (nextLocale) => {
    setIsModalOpen(null);
    if (nextLocale === currentLocale) return;

    // Создаем новый путь с другой локалью
    const newPath = replaceLocaleInPath(pathname, nextLocale);

    // Сохраняем query параметры
    const queryString = searchParams.toString();
    const urlWithQuery = queryString ? `${newPath}?${queryString}` : newPath;

    // Переходим на новый путь
    router.push(urlWithQuery);
  };

  const replaceLocaleInPath = (path, newLocale) => {
    const segments = path.split('/').filter(Boolean);

    if (segments.length > 0) {
      segments[0] = newLocale;
      return '/' + segments.join('/');
    }

    return '/' + newLocale;
  };

  if (!isOpen) return null;

  return (
    <ul className="lang" role="menu">
      {LANGS.map(
        ({ locale: langLocale, label, code, Icon }) => (
          <li key={langLocale} className="lang__item">
            <button
              type="button"
              className="lang__button"
              role="menuitem"
              onClick={() => onSelect(langLocale)}
              aria-current={langLocale === currentLocale ? "true" : "false"}
            >
              {/* <Icon /> */}
              <span className="lang__text">
                {label}
              </span>
              <span className="lang__text">
                {code}
              </span>
            </button>
          </li>
        ),
      )}
    </ul>
  );
};

export default LanguageDropdown;