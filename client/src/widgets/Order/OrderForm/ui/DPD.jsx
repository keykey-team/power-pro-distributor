'use client';

import { useEffect, useRef, useState } from 'react';

export default function DPDWidget({ selectedPoint, setSelectedPoint }) {
    const iframeRef = useRef(null);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.dpdWidget) {
                const data = event.data.dpdWidget;

                if (data.message === 'widgetClose') {
                    console.log('Виджет закрыт');
                    return;
                }

                console.log('Выбран пункт выдачи:', data);
                setSelectedPoint(data);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div>
            <input id="DPDPickupPointResult" type="hidden" />

            {selectedPoint && (
                <div className='delivery-choose'>
                    <p><strong>Vybrali ste:</strong> {selectedPoint.name} #{selectedPoint.id}</p>
                    <p><strong>Adresa:</strong> {selectedPoint.location.address.country} {selectedPoint.location.address.city} {selectedPoint.location.address.street}</p>
                    <p><strong>ID:</strong> {selectedPoint.id}</p>
                </div>
            )}

            <iframe
                ref={iframeRef}
                src="https://api.dpd.cz/widget/latest/index.html?lang=ru&countries=SK&center=48.669,19.699&zoom=7" // добавлен параметр country=SK
                width="100%"
                height="600px"
                style={{ border: '1px solid #ff0000', borderRadius: "30px" }}
                title="DPD Pickup widget"
            />
        </div>
    );
}