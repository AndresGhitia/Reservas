import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {auth} from '../../firebase';

function RecoverAccountModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecover = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const authInstance = getAuth(); // Obtener instancia de auth
      const firestore = getFirestore(); // Obtener instancia de Firestore

      // Buscar si el correo está en la colección 'disabled' dentro de 'disabled-users'
      const docRef = doc(firestore, 'disabled/disabled-users'); // Ruta del documento que contiene los usuarios deshabilitados
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const disabledUsers = docSnap.data().emails || []; // Suponiendo que la colección tiene un campo 'emails' con los correos deshabilitados

        if (disabledUsers.includes(email)) {
          setError('Este correo está deshabilitado. No puedes recuperar la cuenta.');
          setLoading(false);
          return;
        }
      }

      // Si no está deshabilitado, procedemos con la recuperación
      await sendPasswordResetEmail(auth, email)
      .then(() => {
        // Éxito: el correo se envió correctamente
        setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      })
      .catch((error) => {
        // Error: algo salió mal
        setError('Hubo un error al enviar el enlace de recuperación. Verifica el correo o intenta nuevamente más tarde.');
      });

      setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    } catch (error) {
      console.error("Error de recuperación:", error);
      setError('Hubo un error al enviar el enlace de recuperación. Intenta nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-dialog">
        <div className="modal-content-form">
          <div className='modal-header'>
            <p className="login-header">Recuperar Cuenta</p>
            <span className="close" onClick={onClose}>&times;</span>
          </div>
          <div className='modal-body'>
            <section className='modal-login'>
              <h3>Ingresa tu correo electrónico</h3>
              <p>Te enviaremos un enlace para restablecer tu cuenta.</p>
            </section>

            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}

            <form onSubmit={handleRecover}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Enviando...' : 'Recuperar Cuenta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecoverAccountModal;

