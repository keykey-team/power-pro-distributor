async function createOrder(orderData) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
           
            const errorText = await response.text();
            throw new Error(`Failed to create order: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (e) {
        console.error('Error creating order:', e);
        throw e; 
    }
} 

export { createOrder };