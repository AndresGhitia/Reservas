// src/utils/cloudinaryUpload.js

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); // Usa el preset desde el .env

  try {
    const response = await fetch(import.meta.env.VITE_CLOUDINARY_URL, { // Usa la URL desde el .env
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Imagen subida exitosamente: ', data.secure_url);
      return data.secure_url; // Retornamos la URL de la imagen
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error al subir la imagen a Cloudinary: ', error);
    throw error; // Lanza el error para manejarlo en el componente
  }
};
