'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearCart } from '@widgets/header/lib/cart';
import { useI18n } from '@shared/i18n/use-i18n';
import './thank-you.scss';


export default function ThankYouPage() {
    const router = useRouter();
    const { t } = useI18n();

    useEffect(() => {
        clearCart();
    }, []);

    return (
        <div className="thank-you-wrapper">
            <div className="thank-you-card">
                <div className="thank-you-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="32" fill="#E41F25" fillOpacity="0.15" />
                        <path d="M20 33L28 41L44 23" stroke="#E41F25" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1>
                    {t('thank-you.title1')}
                    <b>{t('thank-you.title2')}</b>
                </h1>
                <p>{t('thank-you.subtitle')}</p>
                <button className="preview__button" onClick={() => router.push('/')}>
                    {t('thank-you.btn')}
                </button>
            </div>
        </div>
    );
}
