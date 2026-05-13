import {
    createAdminProduct,
    updateAdminProduct,
} from '../../../shared/api/products.services';
import toast from '../../../shared/lib/toast';

export async function handleProductFormSubmit({
    type,
    values,
    initialData,
    navigate,
    formatPayload,
}) {
    try {
        const payload = formatPayload(values);

        if (type === 'create') {
            await createAdminProduct(payload);
            toast.success('Товар успішно створено!');
        } else {
            const productId = initialData?._id;
            await updateAdminProduct(productId, payload);
            toast.success('Товар успішно оновлено!');
        }

        navigate('/products');
    } catch (error) {
        console.error('Помилка при збереженні:', error);
        toast.error(error.message || 'Сталася помилка. Спробуйте ще раз.');
    }
}
