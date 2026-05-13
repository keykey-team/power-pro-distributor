// Вспомогательные функции для ProductForm

export const normalizeAccessoryOfferId = (offer = {}) => {
    if (offer?.accessoryOfferId !== undefined) {
        return String(offer.accessoryOfferId || '').trim();
    }
    const firstAccessory = Array.isArray(offer?.accessories) ? offer.accessories[0] : null;
    return String(firstAccessory?.offerId || '').trim();
};

export const buildOfferAccessoriesPayload = (offer = {}) => {
    const accessoryOfferId = normalizeAccessoryOfferId(offer);
    if (!accessoryOfferId) {
        return { accessories: [] };
    }

    return {
        accessories: [
            {
                offerId: accessoryOfferId,
                selectedByDefault: true,
            },
        ],
    };
};

export const areOfferAccessoriesEqual = (leftOffer = {}, rightOffer = {}) => (
    normalizeAccessoryOfferId(leftOffer) === normalizeAccessoryOfferId(rightOffer)
);

export const buildOfferOptionKey = (offer = {}) => JSON.stringify(
    Object.entries(offer?.optionMap || offer?.options || {})
        .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
        .sort(([left], [right]) => left.localeCompare(right))
);
