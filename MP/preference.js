export const handleIntegrationMP = async () => {
    const ACCESS_TOKEN = import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN;
  
    const preferencia = {
      binary_mode: true, 
      items: [
        {
          title: "Book It",
          description: "Acceso mensual",
          picture_url: "https://example.com/image.jpg", 
          category_id: "Suscripcion",
          quantity: 1,
          currency_id: "ARS", // pesos argentinos
          unit_price: 0.10,
          sandbox: true
        },
      ],
      

      back_urls: {
        success: `${import.meta.env.VITE_BOOKIT_URL}/success`,
        failure: `${import.meta.env.VITE_BOOKIT_URL}/failure`,
        pending: `${import.meta.env.VITE_BOOKIT_URL}/pending`
      },
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
