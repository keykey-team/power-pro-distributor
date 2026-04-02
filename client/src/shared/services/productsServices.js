// src/shared/services/productsServices.js
async function getAllProducts() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=1000`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        return data;
    } catch (e) {
        console.error("Error fetching all products:", e);
        throw e;
    }
};

async function getProductBySlug(slug) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch prod");
        }
        const data = await response.json();
        return data;
    } catch (e) {
        console.error("Error fetching prod:", e);
        throw e;
    }
};

// Добавьте эту функцию после существующих функций
async function sendLead(leadData) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/leads/send`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to send lead');
        }

        const data = await response.json();
        return data;
    } catch (e) {
        console.error('Error sending lead:', e);
        throw e;
    }
}


export { getAllProducts, getProductBySlug, sendLead };