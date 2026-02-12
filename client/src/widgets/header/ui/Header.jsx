"use client"
import LanguageDropdown from '@features/language-switcher'
import { getMessages } from '@shared/i18n/getMessages';
import { createI18nServer } from '@shared/i18n/server';
import { useModals } from '@shared/index';
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import BurgerMenu from './common/BurgerMenu';
import BurgerMenuButton from './common/BurgerMenuButton';

export async function Header({ locale }) {


    const messages = await getMessages(locale);
    const { t } = createI18nServer(messages);
    return (
        <header className='header'>

            <div className="header__content container"> <BurgerMenu />
                <Image src="/img/logo.svg" alt="logo" className='header__logo' width={237} height={35} />
                <ul className="header__list">
                    <li className='header__item'>
                        <Link href="/">{t('navigation.header.us')}</Link>
                    </li>
                    <li className='header__item'>
                        <Link href="/">{t('navigation.header.partners')}</Link>
                    </li>
                    <li className='header__item'>
                        <Link href="/">{t('navigation.header.prods')}</Link>
                    </li>
                    <li className='header__item'>
                        <Link href="/">{t('navigation.header.contacts')}</Link>
                    </li>
                </ul>
                <div className="header__func">
                    <div className="header__curt">
                        <p>{t('navigation.header.btn')}</p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <path d="M14.4156 5H12.2467L11.7845 2.0875C11.6914 1.64684 11.4868 1.241 11.1926 0.913069C10.8984 0.585143 10.5254 0.347371 10.1134 0.225C9.69922 0.0852238 9.26808 0.00943739 8.83334 0H6.17849C5.74376 0.00943739 5.31261 0.0852238 4.89848 0.225C4.48643 0.347371 4.11348 0.585143 3.81925 0.913069C3.52502 1.241 3.32048 1.64684 3.22734 2.0875L2.76511 5H0.596196C0.502848 4.9994 0.410687 5.02207 0.327222 5.06616C0.243756 5.11025 0.171347 5.17451 0.115893 5.25371C0.0604396 5.33291 0.0235106 5.42481 0.00811501 5.52191C-0.0072806 5.61902 -0.000707254 5.71858 0.0272992 5.8125L2.25548 13.6875C2.36892 14.0679 2.59441 14.4003 2.8992 14.6363C3.20398 14.8724 3.57219 14.9998 3.95031 15H11.0615C11.4376 14.9971 11.8032 14.8685 12.1056 14.6327C12.408 14.3968 12.6317 14.0659 12.7445 13.6875L14.9727 5.8125C15.0004 5.71959 15.0071 5.62113 14.9924 5.52498C14.9776 5.42883 14.9417 5.33765 14.8876 5.25872C14.8335 5.17979 14.7626 5.11529 14.6807 5.07037C14.5988 5.02545 14.508 5.00135 14.4156 5ZM3.97402 5L4.40069 2.2875C4.44746 2.06603 4.55597 1.86437 4.71226 1.70845C4.86855 1.55253 5.06548 1.44946 5.27774 1.4125C5.5693 1.315 5.87271 1.26125 6.17849 1.25H8.83334C9.14387 1.26083 9.44807 1.315 9.74595 1.4125C9.95821 1.44946 10.1551 1.55253 10.3114 1.70845C10.4677 1.86437 10.5762 2.06603 10.623 2.2875L11.0378 5H3.92661H3.97402Z" fill="black" />
                        </svg>
                        <div className="header__curt-count"><p>3</p></div>
                    </div>
                    <div className="language">
                        <div className="language-main">{locale}</div>
                        <LanguageDropdown />

                    </div>
                    <BurgerMenuButton />

                </div>
            </div>
        </header>
    )
}


