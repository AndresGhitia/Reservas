export const handleCopy = (bookItUrl, decodedName) => {
    const textToCopy = `${bookItUrl}/${encodeURIComponent(decodedName.replace(/ /g, '-'))}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => alert("Dirección de tu negocio copiada en el portapeles"))
        .catch(err => console.error('Error al copiar el enlace: ', err));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert("Dirección de tu negocio copiada en el portapeles");
      } catch (err) {
        console.error('Error al copiar el enlace: ', err);
      }
      document.body.removeChild(textArea);
    }
  };