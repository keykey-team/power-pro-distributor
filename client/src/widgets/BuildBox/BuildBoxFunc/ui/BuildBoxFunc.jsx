"use client"
import { useI18n } from '@shared/i18n/use-i18n';
import { useRouter } from 'next/navigation';
import React from 'react'

const BuildBoxFunc = () => {
    const router = useRouter()
    const { t } = useI18n();
    return (
        <div className='build-func container'>
            <h1>{t("build-box.title")}<b>{t("build-box.title2")}</b></h1>
            <p className='build-func__subtitle'>{t("build-box.subtitle")}</p>
            <div className="build-func__grid">
                <div className="build-func__item">
                    <p className='build-func__item-title'>{t("build-box.block-txt1.title")}</p>
                    <p className='build-func__item-sub'>{t("build-box.block-txt1.subtitle")}</p>
                    <p className='build-func__item-desc'>{t("build-box.block-txt1.desc")}</p>
                </div>
                <div className="build-func__item">
                    <p className='build-func__item-title'>{t("build-box.block-txt2.title")}</p>
                    <p className='build-func__item-sub'>{t("build-box.block-txt2.subtitle")}</p>
                    <p className='build-func__item-desc'>{t("build-box.block-txt2.desc")}</p>
                </div>
               
            </div>
             <div className="build-func__range">
                    <div className="build-func__range-txt">
                        <p>{t("build-box.range")}</p>
                        <span>{t("build-box.range-btn")}</span>
                    </div>
                    <input type="range" />
                </div>
        </div>
    )
}

export default BuildBoxFunc
