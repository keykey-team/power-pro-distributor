"use client"
import { useI18n } from '@shared/i18n/use-i18n'
import { scrollToElement } from '@widgets/header/lib/scrollToOrderForm'
import { useParams } from 'next/navigation'
import React from 'react'

const PreviewBtn = () => {
    const { t } = useI18n()
    const params = useParams();
    const locale = params.locale;

    return (
        <button className='preview__button' onClick={() => scrollToElement(locale,"prods")}>{t("preview.btn")}</button>
    )
}

export default PreviewBtn
