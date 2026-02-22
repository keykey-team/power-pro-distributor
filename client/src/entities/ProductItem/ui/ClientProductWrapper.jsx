'use client'

import { useModals } from '@shared/index';
import React from 'react'

export default function ClientProductWrapper({ children, productId }) {
    const { isProdModalId, setIsProdModalId,setIsModalOpen } = useModals();

    const handleClick = () => {
        setIsModalOpen("prod-modal");
        setIsProdModalId(productId);
        
    };

    return (
        <div onClick={handleClick} style={{ cursor: 'pointer' }}>
            {children}
        </div>
    )
}