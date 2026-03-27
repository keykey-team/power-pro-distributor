"use client"
import { useI18n } from '@shared/i18n/use-i18n';
import { useModals } from '@shared/index';
import { useParams, useRouter } from 'next/navigation';
import React from 'react'

const BoxConfirm = () => {
    const params = useParams();
const locale = params.locale;
    const { isModalOpen } = useModals();
    const router = useRouter()
    const { t } = useI18n();
    return (
        <>
            {(isModalOpen === "box-confirm") && (
                <>
                    <div
                        onClick={() => setIsModalOpen(null)}
                        className="overlay confirm"
                    />

                    <div className='box-confirm-modal'>
                        <h1>{t("build-box.successfully_added")}<b>{t("build-box.successfully_added2")}</b></h1>
                        <button onClick={() => router.push(`/${locale}/`)}>
                            {t("build-box.go_to_cart")}
                        </button>
                    </div>
                </>)}
        </>

    )
}

export default BoxConfirm
