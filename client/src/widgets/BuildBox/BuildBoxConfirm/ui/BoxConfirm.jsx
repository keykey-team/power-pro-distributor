"use client"
import { useI18n } from '@shared/i18n/use-i18n';
import { useModals } from '@shared/index';
import { useRouter } from 'next/navigation';
import React from 'react'

const BoxConfirm = () => {
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
                        <button onClick={() => router.push("/")}>
                            {t("build-box.go_to_cart")}
                        </button>
                    </div>
                </>)}
        </>

    )
}

export default BoxConfirm
