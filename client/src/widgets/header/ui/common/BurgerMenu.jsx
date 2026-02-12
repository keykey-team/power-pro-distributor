import { useModals } from '@shared/index';
import React from 'react'


const BurgerMenu = () => {
    const { isModalOpen, setIsModalOpen } = useModals();
    return (
        <>

            {(isModalOpen === "burger") && (
                <div
                    onClick={() => setIsModalOpen(null)}
                    className="overlay"
                />
            )}
            <div className={isModalOpen === "burger" ? "burger-menu active" : "burger-menu"}>
            <div className="burger-menu__list">
               
            </div>
            
            </div>

        </>
    )
}

export default BurgerMenu
