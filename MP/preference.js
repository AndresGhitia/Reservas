export const handleIntegrationMP = async (email) => {
    const ACCESS_TOKEN = import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN;

    // Verificar que el email se recibe correctamente
    console.log("Email recibido:", email);

    // Preparar la preferencia con external_reference
    const preferencia = {
        binary_mode: true,
        payer: {
            email: email,
        },
        items: [
            {
                title: "ClubWeb",
                description: "Acceso mensual",
                picture_url: "https://example.com/image.jpg",
                category_id: "Suscripcion",
                quantity: 1,
                currency_id: "ARS", // pesos argentinos
                unit_price: 0.10,
                sandbox: true
            },
        ],
        // Log para verificar la creación de external_reference
        external_reference: encodeURIComponent(email),
        back_urls: {
            success: `${import.meta.env.VITE_BOOKIT_URL}/success`,
            failure: `${import.meta.env.VITE_BOOKIT_URL}/failure`,
            pending: `${import.meta.env.VITE_BOOKIT_URL}/pending`
        },
    };

    // Verificar preferencia antes de enviarla
    console.log("Preferencia antes de enviarla:", preferencia);

    try {
        const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(preferencia),
        });

        const data = await response.json();

        if (response.ok) {
            // Log para verificar el response de MercadoPago
            console.log("Respuesta de MercadoPago:", data);
            return { init_point: data.init_point, preference_id: data.id };
        } else {
            console.error('Error al crear la preferencia:', data);
            return null;
        }
    } catch (error) {
        console.error('Error al hacer la solicitud:', error);
        return null;
    }
};
