import { getMessages } from '@shared/i18n/getMessages';
import { createI18nServer } from '@shared/i18n/server';
import React from 'react'

export async function Preview({ locale }) {
    const messages = await getMessages(locale);
    const { t } = createI18nServer(messages);
    return (
        <div className='preview'>
            <h1 className='preview__title'>{t("preview.title1")}<p>{t("preview.title2")}</p></h1>
            <p className='preview__description'>{t("preview.description")}</p>
            <button className='preview__button'>{t("preview.btn")}</button>
        </div>
    )
}

