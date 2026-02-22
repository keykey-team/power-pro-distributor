"use client"
import { useI18n } from '@shared/i18n/use-i18n'
import { scrollToElement } from '@widgets/header/lib/scrollToOrderForm'
import React from 'react'

const PreviewBtn = () => {
    const {t} = useI18n()
    return (
        <button className='preview__button' onClick={() => scrollToElement("prods")}>{t("preview.btn")}</button>
    )
}

export default PreviewBtn
