"use client"
import { useI18n } from '@shared/i18n/use-i18n'
import { scrollToElement } from '@widgets/header/lib/scrollToOrderForm'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

export function Footer() {
    const { t } = useI18n()
    const params = useParams();
    const locale = params.locale;
    return (
        <footer className='footer'>
            <div className="container">
                <div className="footer__content">
                    <div className="footer__social">
                        <Image src="/img/logo.svg" alt="logo" width={237} height={35} />
                        <p>{t('footer.description')}</p>
                        <div className="footer__social-icons">
                            <a
                                href="https://www.instagram.com/powerpro_sk?igsh=MWxucjA1NWtiNzBmdA=="
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer__social-icon"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                    <path d="M12.9965 8.66482C10.6094 8.66482 8.66141 10.6129 8.66141 13C8.66141 15.3871 10.6094 17.3352 12.9965 17.3352C15.3836 17.3352 17.3316 15.3871 17.3316 13C17.3316 10.6129 15.3836 8.66482 12.9965 8.66482ZM25.9985 13C25.9985 11.2048 26.0148 9.42584 25.914 7.63387C25.8132 5.55247 25.3384 3.70522 23.8164 2.18319C22.2911 0.657911 20.4471 0.186343 18.3658 0.0855245C16.5706 -0.0152936 14.7917 0.000967424 12.9998 0.000967436C11.2046 0.000967449 9.42566 -0.0152936 7.63373 0.0855246C5.55236 0.186343 3.70515 0.661163 2.18315 2.18319C0.657899 3.70847 0.186339 5.55247 0.0855229 7.63387C-0.0152933 9.42909 0.000967406 11.208 0.000967418 13C0.00096743 14.792 -0.0152933 16.5742 0.085523 18.3661C0.186339 20.4475 0.661151 22.2948 2.18315 23.8168C3.7084 25.3421 5.55236 25.8137 7.63373 25.9145C9.42891 26.0153 11.2078 25.999 12.9998 25.999C14.7949 25.999 16.5739 26.0153 18.3658 25.9145C20.4472 25.8137 22.2944 25.3388 23.8164 23.8168C25.3416 22.2915 25.8132 20.4475 25.914 18.3661C26.0181 16.5742 25.9985 14.7952 25.9985 13ZM12.9965 19.6703C9.30533 19.6703 6.32637 16.6912 6.32637 13C6.32637 9.30876 9.30533 6.32974 12.9965 6.32974C16.6877 6.32974 19.6666 9.30876 19.6666 13C19.6666 16.6912 16.6877 19.6703 12.9965 19.6703ZM19.9398 7.61436C19.078 7.61436 18.382 6.91839 18.382 6.05656C18.382 5.19473 19.078 4.49876 19.9398 4.49876C20.8016 4.49876 21.4976 5.19473 21.4976 6.05656C21.4978 6.2612 21.4577 6.46389 21.3795 6.65301C21.3013 6.84212 21.1866 7.01396 21.0419 7.15866C20.8972 7.30337 20.7254 7.41811 20.5363 7.4963C20.3471 7.5745 20.1445 7.61462 19.9398 7.61436Z" fill="#000000" />
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com/fitwin_sk?igsh=MWU3YndnbnltZGhjcA%3D%3D&utm_source=qr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer__social-icon"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                    <path d="M12.9965 8.66482C10.6094 8.66482 8.66141 10.6129 8.66141 13C8.66141 15.3871 10.6094 17.3352 12.9965 17.3352C15.3836 17.3352 17.3316 15.3871 17.3316 13C17.3316 10.6129 15.3836 8.66482 12.9965 8.66482ZM25.9985 13C25.9985 11.2048 26.0148 9.42584 25.914 7.63387C25.8132 5.55247 25.3384 3.70522 23.8164 2.18319C22.2911 0.657911 20.4471 0.186343 18.3658 0.0855245C16.5706 -0.0152936 14.7917 0.000967424 12.9998 0.000967436C11.2046 0.000967449 9.42566 -0.0152936 7.63373 0.0855246C5.55236 0.186343 3.70515 0.661163 2.18315 2.18319C0.657899 3.70847 0.186339 5.55247 0.0855229 7.63387C-0.0152933 9.42909 0.000967406 11.208 0.000967418 13C0.00096743 14.792 -0.0152933 16.5742 0.085523 18.3661C0.186339 20.4475 0.661151 22.2948 2.18315 23.8168C3.7084 25.3421 5.55236 25.8137 7.63373 25.9145C9.42891 26.0153 11.2078 25.999 12.9998 25.999C14.7949 25.999 16.5739 26.0153 18.3658 25.9145C20.4472 25.8137 22.2944 25.3388 23.8164 23.8168C25.3416 22.2915 25.8132 20.4475 25.914 18.3661C26.0181 16.5742 25.9985 14.7952 25.9985 13ZM12.9965 19.6703C9.30533 19.6703 6.32637 16.6912 6.32637 13C6.32637 9.30876 9.30533 6.32974 12.9965 6.32974C16.6877 6.32974 19.6666 9.30876 19.6666 13C19.6666 16.6912 16.6877 19.6703 12.9965 19.6703ZM19.9398 7.61436C19.078 7.61436 18.382 6.91839 18.382 6.05656C18.382 5.19473 19.078 4.49876 19.9398 4.49876C20.8016 4.49876 21.4976 5.19473 21.4976 6.05656C21.4978 6.2612 21.4577 6.46389 21.3795 6.65301C21.3013 6.84212 21.1866 7.01396 21.0419 7.15866C20.8972 7.30337 20.7254 7.41811 20.5363 7.4963C20.3471 7.5745 20.1445 7.61462 19.9398 7.61436Z" fill="#000000" />
                                </svg>
                            </a>
                            <a
                                href="https://www.facebook.com/share/17FRfELYoV/?mibextid=wwXIfr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer__social-icon"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                    <g clipPath="url(#clip0_65_884)">
                                        <path d="M14.95 26C21.2043 25.0535 26 19.6268 26 13.0732C26 5.85288 20.1799 0 13 0C5.8201 0 0 5.85288 0 13.0732C0 19.6268 4.7957 25.0548 11.05 26V16.9952H9.1C8.58283 16.9952 8.08684 16.7886 7.72114 16.4208C7.35545 16.0531 7.15 15.5543 7.15 15.0342C7.15 14.5141 7.35545 14.0153 7.72114 13.6476C8.08684 13.2798 8.58283 13.0732 9.1 13.0732H11.05V10.4586C11.05 9.24504 11.5294 8.08121 12.3827 7.22311C13.236 6.36502 14.3933 5.88294 15.6 5.88294H16.25C16.7672 5.88294 17.2632 6.08955 17.6289 6.4573C17.9946 6.82506 18.2 7.32384 18.2 7.84393C18.2 8.36401 17.9946 8.86279 17.6289 9.23055C17.2632 9.5983 16.7672 9.80491 16.25 9.80491H15.6C15.4276 9.80491 15.2623 9.87377 15.1404 9.99636C15.0185 10.1189 14.95 10.2852 14.95 10.4586V13.0732H16.9C17.4172 13.0732 17.9132 13.2798 18.2789 13.6476C18.6446 14.0153 18.85 14.5141 18.85 15.0342C18.85 15.5543 18.6446 16.0531 18.2789 16.4208C17.9132 16.7886 17.4172 16.9952 16.9 16.9952H14.95V26Z" fill="#0D0D0D" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_65_884">
                                            <rect width="26" height="26" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="footer__partners">
                        <Image
                            onClick={() => { window.open("https://powerpro.in.ua", '_blank'); }}
                            src="/img/Fit.svg"
                            alt='PowerPro'
                            width={260}
                            height={64}
                            style={{ cursor: 'pointer' }}
                        />
                        <Image
                            onClick={() => { window.open("https://fit-win.com.ua", '_blank'); }}
                            src="/img/Power.webp"
                            alt='FitWin'
                            width={264}
                            height={118}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                    <div className="footer__list">
                        <p>{t('footer.nav.title')}</p>
                        <ul>
                            <li onClick={() => scrollToElement(locale, "prev")}>{t('footer.nav.about')}</li>
                            <li onClick={() => scrollToElement(locale, "partners")}>{t('footer.nav.partners')}</li>
                            <li onClick={() => scrollToElement(locale, "prods")}>{t('footer.nav.products')}</li>
                            <li onClick={() => scrollToElement(locale, "order-form")}>{t('footer.nav.contact')}</li>
                        </ul>
                    </div>
                    <div className="footer__list">
                        <p>{t('footer.contact.title')}</p>
                        <ul>
                            <li>
                                <a href="mailto:objednavkyfitwinpowerpro@gmail.com">objednavkyfitwinpowerpro@gmail.com</a>
                            </li>
                            <li>
                                <a href="tel:+421917874360">+421 917 874 360</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer__under">
                <div className="footer__under-cont container">
                    <p>© 2026 SportNutrition. {t('footer.bottom.rights')}</p>
                    <ul>
                        <li>
                            <a
                                href="/pdf/1. VŠEOBECNÉ OBCHODNÉ PODMIENKY.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                VŠEOBECNÉ OBCHODNÉ PODMIENKY
                            </a>
                        </li>
                        <li>
                            <a
                                href="/pdf/2. DODACIE A PLATOBNÉ PODMIENKY.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                DODACIE A PLATOBNÉ PODMIENKY
                            </a>
                        </li>
                        <li>
                            <a
                                href="/pdf/3. REKLAMAČNÉ PODMIENKY.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                REKLAMAČNÉ PODMIENKY
                            </a>
                        </li>
                        <li>
                            <a
                                href="/pdf/4. OCHRANA OSOBNÝCH ÚDAJOV.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                OCHRANA OSOBNÝCH ÚDAJOV
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="footer__under-cont center container">
                    <p>
                       <a href="https://www.instagram.com/key_key_ua?igsh=MXNjMjBhZzRqNGJsdg%3D%3D" target="_blank" rel="noopener noreferrer">Vývoj a podpora webových stránok: KeyKey</a>
                    </p>
                </div>
            </div>
        </footer>
    )
}