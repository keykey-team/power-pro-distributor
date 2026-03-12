"use client";

import { useI18n } from "@shared/i18n/use-i18n";
import { useModals } from "@shared/index";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";


const BuildBoxFunc = () => {
    const router = useRouter()
    const { t } = useI18n();
    const { curt, setIsCurt } = useModals();
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const totalItems = curt.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = curt.reduce((sum, item) => sum + item.product.price, 0);
    const limit = Number(searchParams.get('limit')) || 5
    const progressPercent = Math.min((totalItems / limit) * 100, 100);


    const onClick = (limit) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('limit', limit)

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
        setIsCurt([])
    }

    return (
        <div className="build-func container">
            <h1>
                {t("build-box.title")}
                <b> {t("build-box.title2")}</b>
            </h1>
            <p className="build-func__subtitle">{t("build-box.subtitle")}</p>

            <div className={`build-func__grid`}>
                <div className={`build-func__item ${limit === 5 ? "active" : ""}`} onClick={() => {
                    onClick(5)
                }}>
                    <p className="build-func__item-title">{t("build-box.block-txt1.title")}</p>
                    <p className="build-func__item-sub">{t("build-box.block-txt1.subtitle")}</p>
                    <p className="build-func__item-desc">{t("build-box.block-txt1.desc")}</p>
                </div>
                <div className={`build-func__item ${limit === 10 ? "active" : ""}`} onClick={() => {
                    onClick(10)
                }}>
                    <p className="build-func__item-title">{t("build-box.block-txt2.title")}</p>
                    <p className="build-func__item-sub">{t("build-box.block-txt2.subtitle")}</p>
                    <p className="build-func__item-desc">{t("build-box.block-txt2.desc")}</p>
                </div>
            </div>

            <div className="build-func__range">
                <div className="build-func__range-txt">
                    <p>{t("build-box.range")} {totalItems} / {limit}</p>
                    <span>{totalPrice}</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{
                            width: `${progressPercent}%`,
                            transition: "width 0.3s ease",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BuildBoxFunc;