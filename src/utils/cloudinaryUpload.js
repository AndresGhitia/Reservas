// src/utils/cloudinaryUpload.js

export const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Wallpaper'); // Debes configurar un "upload preset" en Cloudinary
  
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dbrz9aqlt/image/upload', {
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
  