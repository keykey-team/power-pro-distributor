"use client";
import { useModals } from "@shared/index";
import { useI18n } from "@shared/i18n/use-i18n";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";

const BuildBoxConfirm = () => {
    const router = useRouter();
    const { t } = useI18n();
    const { curt } = useModals();
    const searchParams = useSearchParams();
    const limit = Number(searchParams.get('limit')) || 5;

    const totalItems = curt.reduce((sum, item) => sum + item.quantity, 0);
    const isLimitReached = totalItems === limit;

    const handleConfirm = () => {
        if (!isLimitReached) {
            alert(`Добавьте товары до лимита (${totalItems}/${limit})`);
            return;
        }
        console.log("Подтверждение бокса:", curt);
        // router.push("/next-step");
    };

    return (
        <div className="box-confirme">
            <button
                className={`btn-box-confirm ${isLimitReached ? 'active' : ''}`}
                onClick={handleConfirm}
            >
                {isLimitReached ? t("build-box.confirm-done") : `${t("build-box.confirm1")} ${limit - totalItems} ${t("build-box.confirm2")}`}
            </button>
        </div>
    );
};

export default BuildBoxConfirm;