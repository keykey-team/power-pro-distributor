import React from 'react';

const WarehouseItem = ({ product, isEditMode, drafts, onDraftChange }) => {
    const img = product?.imageURL || "/img/test.png";
    const title = product?.title?.ua || "Назва товару";
    const sku = product?.sku || "SKU";
    const offerId = product?.offerId;

    // Допоміжна функція для відображення значення (з чернетки або з бази)
    const renderQtyField = (warehouse) => {
        if (!warehouse) return <p>0</p>;
        
        const key = `${offerId}_${warehouse.warehouseId}`;
        const currentValue = drafts[key] !== undefined ? drafts[key].factQty : warehouse.onHand;

        if (isEditMode) {
            return (
                <input
                    type="number"
                    min="0"
                    className="warehouse-edit-input" // Додайте стилі в CSS
                    value={currentValue}
                    onChange={(e) => onDraftChange(offerId, warehouse.warehouseId, e.target.value)}
                    style={{
                        width: '50px',
                        padding: '2px 4px',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: '4px'
                    }}
                />
            );
        }
        return <p>{currentValue}</p>;
    };

    return (
        <div className="warehouse-item warehouse-grid">
            <div className="warehouse-item__data">
                <img src={img} alt='' />
                <div className="warehouse-item__data-txt">
                    <p>{title}</p>
                    <span>SKU: {sku}</span>
                </div>
            </div>

            {/* Рендеримо дані для кожного складу динамічно */}
            {product?.warehouses?.map((wh, idx) => (
                <div className="warehouse-item__store" key={idx}>
                    <div className="warehouse-item__store-item">
                        {renderQtyField(wh)}
                    </div>
                    <div className="warehouse-item__store-item">
                        <p>{wh.reserved || 0}</p>
                    </div>
                    <div className="warehouse-item__store-item">
                        <p>{wh.available || 0}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WarehouseItem;