  import { auth, db } from "../src/firebase"; 
  import { handleDeleteSpaces } from "./handleDeleteSpaces";

  const onDeleteAccount = async () => {
    try {
      console.log("Iniciando el proceso de eliminación de cuenta...");

      const user = auth.currentUser;

      if (user) {
        const userId = user.uid; 
        console.log("Usuario autenticado encontrado. UID del usuario:", userId);

        // Obtener el ID Token del usuario
        const idToken = await user.getIdToken();
        console.log("ID Token generado con éxito:", idToken);

        // Deshabilitar la cuenta en el backend
        console.log("Enviando solicitud para deshabilitar la cuenta al backend...");
        
        const response = await fetch("https://deleteuseraccount-q3ajc6y2yq-uc.a.run.app", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: idToken,
          }),
        });

        console.log("Respuesta del servidor recibida. Analizando...");
        const responseData = await response.json(); 
        console.log("Datos de la respuesta del backend:", responseData);

        // Verificar si la solicitud fue exitosa
        if (!response.ok) {
          console.error("El backend retornó un error:", response.status, response.statusText);
          throw new Error("Error al deshabilitar la cuenta en el backend.");
        }

        console.log("Cuenta deshabilitada en el backend con éxito.");
        // alert("La cuenta ha sido deshabilitada con éxito.");

        // Validar si el usuario pertenece a la colección 'owners'
        console.log("Verificando si el usuario pertenece a la colección 'owners'...");
        const ownerDoc = await db.collection("owners").doc(userId).get();

        if (ownerDoc.exists) {
          console.log("Usuario encontrado en la colección 'owners'. Procediendo a borrar espacios...");

          try {
            handleDeleteSpaces(); // Solo se ejecuta si el usuario es un 'owner'
            console.log("handleDeleteSpaces ejecutado correctamente.");
          } catch (handleError) {
            console.error("Error al ejecutar handleDeleteSpaces:", handleError);
          }
        } else {
          console.log("El usuario no pertenece a la colección 'owners'. Saltando la eliminación de espacios.");
        }
      } else {
        console.warn("No se encontró un usuario autenticado.");
        alert("No hay un usuario autenticado.");
      }
    } catch (error) {
      console.error("Error al procesar la solicitud completa:", error);
      // alert("Hubo un error al intentar deshabilitar la cuenta. Por favor, inténtalo de nuevo.");
    }
  };

  export default onDeleteAccount;
