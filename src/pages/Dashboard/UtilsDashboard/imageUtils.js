import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { uploadImageToCloudinary } from '../../../utils/cloudinaryUpload';

export const handleUploadBackgroundImage = async (e, setImageUrl) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const url = await uploadImageToCloudinary(file);
    setImageUrl(url);
    await saveBackgroundImageUrl(url);
  } catch (error) {
    console.error("Error al subir la imagen a Cloudinary: ", error);
  }
};

export const saveBackgroundImageUrl = async (url) => {
  try {
    const user = auth.currentUser;
    const docRef = doc(db, 'owners', user.uid);
    await setDoc(docRef, { backgroundImageUrl: url }, { merge: true });
  } catch (error) {
    console.error("Error al guardar la URL de la imagen: ", error);
  }
};