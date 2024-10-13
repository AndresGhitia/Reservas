// handleIntegrationMP.js

export const handleIntegrationMP = async () => {
    const ACCESS_TOKEN = import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN;
  
    const preferencia = {
      binary_mode: true, // Corregido desde "binart_mode"
      items: [
        {
          title: "Book It",
          description: "Acceso mensual",
          picture_url: "https://example.com/image.jpg", // Usa una URL válida
          category_id: "Suscripcion",
          quantity: 1,
          currency_id: "ARS", // Ejemplo con pesos argentinos
          unit_price: 0.10,
        },
      ],
    //  notification_url: "https://stormy-taiga-82317-47575a2d66a9.herokuapp.com/webhook-mercadopago", // Fuera de los items
    };
  
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
  