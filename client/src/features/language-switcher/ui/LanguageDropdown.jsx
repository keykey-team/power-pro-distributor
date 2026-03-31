"use client";

import { useI18n } from "@shared/i18n/use-i18n";
import { useModals } from "@shared/index";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react"; // 👈 додали useRef та useEffect

const LanguageDropdown = () => {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isModalOpen, setIsModalOpen } = useModals();
  
  const dropdownRef = useRef(null); // 👈 створюємо реф для списку

  const LANGS = [
    { locale: "en", code: "EN" },
    { locale: "sk", code: "SK" },
  ];

  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0] || "en";
  const isOpen = isModalOpen === "language-dropdown";

  // 👇 Логіка закриття при кліку поза межами
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      // Перевіряємо, чи клік був НЕ по нашому списку
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsModalOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsModalOpen]);

  const onSelect = (nextLocale) => {
    setIsModalOpen(null);
    if (nextLocale === currentLocale) return;

    const newPath = replaceLocaleInPath(pathname, nextLocale);
    const queryString = searchParams.toString();
    const urlWithQuery = queryString ? `${newPath}?${queryString}` : newPath;

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

  const filteredLangs = LANGS.filter(lang => lang.locale !== currentLocale);

  return (
    <ul 
      className="lang" 
      role="menu" 
      ref={dropdownRef} // 👈 вішаємо реф на контейнер
    >
      {filteredLangs.map(({ locale: langLocale, code }) => (
        <li key={langLocale} className="lang__item" onClick={() => onSelect(langLocale)}>
          <button type="button" className="lang__button" >
            <span className="lang__text">{code}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default LanguageDropdown;