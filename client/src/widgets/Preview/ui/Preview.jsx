import { getMessages } from '@shared/i18n/getMessages';
import { createI18nServer } from '@shared/i18n/server';
import { scrollToElement } from '@widgets/header/lib/scrollToOrderForm';
import Link from 'next/link';
import React from 'react'
import PreviewBtn from './PreviewBtn';

export async function Preview({ locale }) {
    const messages = await getMessages(locale);
    const { t } = createI18nServer(messages);
    return (
        <div className='preview' id='prev'>
            <h1 className='preview__title'>{t("preview.title1")}<p> {t("preview.title2")}</p></h1>
            <p className='preview__description'>{t("preview.description")}</p>
           <PreviewBtn/>
        </div>
    )
}

