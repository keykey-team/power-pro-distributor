import { getMessages } from '@shared/i18n/getMessages';
import { createI18nServer } from '@shared/i18n/server';
import React from 'react'
import PartnerBtn from './common/PartnerBtn';

export async function Partners({ locale }) {
    const messages = await getMessages(locale);
    const { t } = createI18nServer(messages);
    return (
        <div className='partners container' id='partners'>
            <h2>{t("partners.title1")} <b>{t("partners.title2")}</b></h2>
            <div className="partners__list">
                <div className="partners__item">
                    <div className="partners__item-content">
                        <div className="partners__item-info">{t("partners.powerpro.info")}</div>
                        <div className="partners__item-title">{t("partners.powerpro.title")}</div>
                        <div className="partners__item-description">{t("partners.powerpro.description")}</div>
                        <PartnerBtn link={"https://powerpro.in.ua"} title={t("partners.powerpro.btn")} />

                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none">
                        <path d="M60 10L22.5 101.45L26.05 105L60 90L93.95 105L97.5 101.45L60 10Z" fill="#FEFEFE" />
                    </svg>
                </div>
                <div className="partners__item">
                    <div className="partners__item-content">
                        <div className="partners__item-info">{t("partners.fitwin.info")}</div>
                        <div className="partners__item-title">{t("partners.fitwin.title")}</div>
                        <div className="partners__item-description">{t("partners.fitwin.description")}</div>

                        <PartnerBtn link={"https://fit-win.com.ua"} title={t("partners.fitwin.btn")} />
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none">
                        <path d="M65 50V15L20 70H55V105L100 50H65Z" fill="#FEFEFE" />
                    </svg>
                </div>
            </div>
        </div>
    )
}


