import { useEffect, useState } from 'react';
import { getAdminCatalogGroups, getAdminCatalogGroupVariationById, getAdminCatalogGroupById } from '../../../shared/api/products.services';

// Вспомогательная функция для генерации label
export const getAccessoryOptionLabel = (accessory = {}) => {
    const groupTitle = accessory?.productGroup?.title?.ua
        || accessory?.productGroup?.title?.en
        || accessory?.groupTitle
        || '';
    const sku = accessory?.offer?.sku || accessory?.sku || '';

    if (groupTitle && sku) return `${groupTitle} (${sku})`;
    if (groupTitle) return groupTitle;
    if (sku) return sku;
    return String(accessory?.offerId || accessory?.offer?._id || '').trim();
};

// Хук для загрузки аксессуаров
export function useAccessoryOptions(ACCESSORY_CATEGORY_ID, accessorySearchQuery) {
    const [accessoryOptions, setAccessoryOptions] = useState([{ value: '', label: 'Без аксесуара' }]);
    const [isAccessorySearchLoading, setIsAccessorySearchLoading] = useState(false);

    useEffect(() => {
        let isCancelled = false;
        const loadAccessoryOptions = async (searchQuery) => {
            const nextOptionsMap = new Map();
            nextOptionsMap.set('', 'Без аксесуара');

            const addOption = (value, label) => {
                const normalizedValue = String(value || '').trim();
                if (!normalizedValue) return;
                if (!nextOptionsMap.has(normalizedValue)) {
                    nextOptionsMap.set(normalizedValue, label || normalizedValue);
                }
            };

            setIsAccessorySearchLoading(true);
            try {
                const queryParams = {
                    page: 1,
                    limit: 100,
                    categoryId: ACCESSORY_CATEGORY_ID,
                    q: searchQuery || undefined,
                };
                const result = await getAdminCatalogGroups(queryParams);
                const groups = result?.items || [];
                const normalizedSearchQuery = String(searchQuery || '').trim().toLowerCase();
                await Promise.all(
                    groups.map(async (group) => {
                        const groupId = String(group?.groupId || group?._id || '');
                        if (!groupId) return;
                        let offersResult = await getAdminCatalogGroupVariationById(groupId, {
                            page: 1,
                            limit: 100,
                            q: searchQuery || undefined,
                        });
                        let offerItems = offersResult?.items || offersResult?.item?.offers || [];
                        if (!offerItems.length && !searchQuery) {
                            const groupWithOffers = await getAdminCatalogGroupById(groupId, {
                                includeOffers: true,
                                offersPage: 1,
                                offersLimit: 100,
                            });
                            offerItems = groupWithOffers?.item?.offers || [];
                        }
                        offerItems.forEach((offer) => {
                            const offerId = String(offer?._id || '');
                            if (!offerId) return;
                            const optionLabel = getAccessoryOptionLabel({
                                offer,
                                productGroup: group,
                                offerId,
                            });
                            if (normalizedSearchQuery) {
                                const searchText = `${optionLabel} ${offer?.sku || ''} ${offer?.optionKey || ''}`.toLowerCase();
                                if (!searchText.includes(normalizedSearchQuery)) {
                                    return;
                                }
                            }
                            addOption(offerId, optionLabel);
                        });
                    })
                );
                if (!isCancelled) {
                    setAccessoryOptions(Array.from(nextOptionsMap, ([value, label]) => ({ value, label })));
                }
            } catch (error) {
                if (!isCancelled) {
                    setAccessoryOptions(Array.from(nextOptionsMap, ([value, label]) => ({ value, label })));
                }
            } finally {
                if (!isCancelled) setIsAccessorySearchLoading(false);
            }
        };
        loadAccessoryOptions(accessorySearchQuery.trim());
        return () => {
            isCancelled = true;
        };
    }, [ACCESSORY_CATEGORY_ID, accessorySearchQuery]);

    return { accessoryOptions, isAccessorySearchLoading };
}
