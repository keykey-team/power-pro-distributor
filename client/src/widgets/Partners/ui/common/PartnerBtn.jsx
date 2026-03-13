"use client"
import React from 'react'

const PartnerBtn = ({ link, title }) => {
    return (
        <div className="partners__item-button" onClick={() => { window.open(link, '_blank'); }}>{title}</div>
    )
}

export default PartnerBtn
