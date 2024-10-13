import mercadopago from 'mercadopago';

// Configura el Access Token
//mercadopago.configurations.setAccessToken(process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN);

export async function createPreference() {
  const preference = {
    items: [
      {
        title: 'Producto de ejemplo',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: 2000.00
      }
    ],
    back_urls: {
      success: `${process.env.VITE_BOOKIT_URL}/success`,
      failure: `${process.env.VITE_BOOKIT_URL}/failure`,
      pending: `${process.env.VITE_BOOKIT_URL}/pending`
    },
    auto_return: 'approved',
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    return response.body;
  } catch (error) {
    console.error('Error creando la preferencia de pago:', error);
  }
}
