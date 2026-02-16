"use client"
import { useI18n } from '@shared/i18n/use-i18n';
import { useRouter } from 'next/navigation';
import React from 'react'

const BuildBoxConfirm = () => {
    const router = useRouter()
    const { t } = useI18n();
    return (
        <div className='box-confirme'>
            <button className='btn-box-confirm'>{t("build-box.confirm")}</button>
        </div>
    )
}

export default BuildBoxConfirm
