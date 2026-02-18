// src/shared/services/productsServices.js
async function getAllProducts() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products`
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

// Используйте ES6 export вместо module.exports
export { getAllProducts, getProductBySlug };