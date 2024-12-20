import { auth } from "../src/firebase";
import { handleDeleteSpaces } from "./handleDeleteSpaces";

const onDeleteAccount = async () => {
  try {
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid; // Obtener el ID del usuario actual
      console.log("Procesando actualización para el usuario:", userId);

      // Deshabilitar la cuenta en el backend
      console.log("Deshabilitando la cuenta en el backend...");

      const response = await fetch("https://deleteuseraccount-a6vhaqpb7a-uc.a.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: await user.getIdToken(),
        }),
      });


const responseData = await response.json(); // Parsear la respuesta
console.log("Respuesta del backend:", responseData);

      if (!response.ok) {
        throw new Error("Error al deshabilitar la cuenta en el backend.");
      }

      alert("La cuenta ha sido deshabilitada con éxito.");

      handleDeleteSpaces();
      console.log('ejecutando handleDeleteSpaces')

    } else {
      alert("No hay un usuario autenticado.");
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    alert("Hubo un error al intentar deshabilitar la cuenta. Por favor, inténtalo de nuevo.");
  }
};

export default onDeleteAccount;

