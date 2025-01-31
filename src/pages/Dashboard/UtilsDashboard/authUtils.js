import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';

export const setupAuthListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user); // Llama al callback con el usuario autenticado
  });
};