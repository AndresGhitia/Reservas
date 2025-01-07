import React from "react";
import "./PrivacyPolicy.css"; // Estilos opcionales para la página

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <h1>Política de Privacidad</h1>
      <p>
        Tu privacidad es importante para nosotros. Esta política describe cómo
        recopilamos, usamos y protegemos tu información en nuestra plataforma,
        orientada a complejos deportivos y usuarios jugadores.
      </p>
      
      <h2>1. Información que recopilamos</h2>
      <p>
        Recopilamos los siguientes tipos de información según el tipo de usuario:
      </p>
      <ul>
        <li>
          <strong>Usuario jugador:</strong> Nombre, correo electrónico, 
          preferencias deportivas (opcional), y cualquier información necesaria 
          para ofrecerte la mejor experiencia de búsqueda.
        </li>
        <li>
          <strong>Usuario dueño del complejo:</strong> Nombre, correo electrónico, 
          nombre del complejo, dirección, WhatsApp, tipos de deportes disponibles, 
          y datos relacionados con el establecimiento.
        </li>
        <li>
          <strong>Datos adicionales:</strong> Información de pago para transacciones 
          realizadas a través de Mercado Pago, cookies para personalizar la experiencia 
          y mejorar el rendimiento del sitio.
        </li>
      </ul>

      <h2>2. Uso de la información</h2>
      <p>Utilizamos tu información para los siguientes propósitos:</p>
      <ul>
        <li>Proporcionar acceso a tu cuenta y personalizar tu experiencia en la plataforma.</li>
        <li>Facilitar la búsqueda de complejos deportivos y gestionar reservas.</li>
        <li>Permitir a los dueños de complejos registrar y administrar sus establecimientos.</li>
        <li>Procesar pagos de manera segura mediante Mercado Pago.</li>
        <li>Enviar notificaciones relacionadas con tu cuenta o servicios.</li>
      </ul>

      <h2>3. Compartición de información</h2>
      <p>
        No compartimos tu información con terceros, excepto cuando sea necesario
        para los siguientes propósitos:
      </p>
      <ul>
        <li>Procesamiento de pagos a través de Mercado Pago.</li>
        <li>Cumplimiento de obligaciones legales o regulatorias.</li>
      </ul>

      <h2>4. Conservación de datos</h2>
      <p>
        Si decides eliminar tu cuenta, conservaremos únicamente tu correo electrónico 
        como parte de un registro histórico. El resto de tu información será eliminada 
        de nuestra base de datos.
      </p>

      <h2>5. Seguridad</h2>
      <p>
        Implementamos medidas de seguridad avanzadas para proteger tus datos, incluyendo 
        el uso de Firebase para el almacenamiento y autenticación. Sin embargo, no podemos 
        garantizar una seguridad absoluta en internet.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Como usuario, tienes derecho a:
      </p>
      <ul>
        <li>Acceder, actualizar o corregir tu información personal.</li>
        <li>Solicitar la eliminación de tu cuenta y tus datos (excepto el correo electrónico).</li>
        <li>Retirar tu consentimiento para el uso de tus datos en cualquier momento.</li>
      </ul>

      <h2>7. Uso de cookies</h2>
      <p>
        Usamos cookies para mejorar la funcionalidad de nuestra plataforma y 
        personalizar tu experiencia. Puedes gestionar las cookies desde la 
        configuración de tu navegador.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Si tienes alguna duda sobre nuestra política de privacidad o el manejo 
        de tus datos, contáctanos en <strong>soporte@clubweb.com</strong>.
      </p>

      <p>Última actualización: Enero 2025.</p>
    </div>
  );
};

export default PrivacyPolicy;
