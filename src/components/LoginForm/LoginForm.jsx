import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import './LoginForm.css';
import RegisterForm from '../RegisterForm/RegisterForm';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { assets } from '../../assets/assets';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import BuySubscription from '../BuySuscription/BuySubscription'; 
import { handleIntegrationMP } from '../../../MP/preference';
import RecoverAccountModal from '../RecoverAccount/RecoverAccountModal';
import * as Yup from 'yup';

// Esquema de validación con Yup
const validationSchema = Yup.object({
  email: Yup.string().email('Email inválido').required('Por favor, introduce una dirección de correo electrónico válida'),
  password: Yup.string().required('Por favor, introduzca una contraseña'),
});

function LoginForm({ onClose }) {
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false); 
  const [userEmail, setUserEmail] = useState('');
  const [isDisabledUser, setIsDisabledUser] = useState(false); 
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [isRecoveringAccount, setIsRecoveringAccount] = useState(false);
  const [disabledEmail, setDisabledEmail] = useState(''); 

  const navigate = useNavigate();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      console.log("Iniciando sesión con email:", values.email);
  
      // Intentar autenticar al usuario
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
  
      // Verificar si el correo electrónico está verificado
      if (!user.emailVerified) {
        setError("Tu correo electrónico no ha sido verificado. Por favor, revisa tu correo y sigue las instrucciones para verificarlo.");
        await signOut(auth);
        setSubmitting(false);
        return;
      }
  
      // Usar el UID del usuario para buscar en las colecciones
      console.log("Buscando usuario en Firestore con UID:", user.uid);
  
      let userDoc = await getDoc(doc(db, 'owners', user.uid));
      if (!userDoc.exists()) {
        console.log("Usuario no encontrado en 'owners'. Buscando en 'users'...");
        userDoc = await getDoc(doc(db, 'users', user.uid));
      }
  
      if (!userDoc.exists()) {
        console.log("Usuario no encontrado en Firestore.");
        setError("Usuario no encontrado, por favor verifica tus credenciales.");
        await signOut(auth);
        setSubmitting(false);
        return;
      }
  
      // Extraer los datos del documento
      const userData = userDoc.data();
      console.log("Datos del usuario:", userData);
  
      // Verificar el estado del usuario en el campo 'status'
      if (userData.status === "disabled") {
        setError("Tu cuenta ha sido deshabilitada. Contacta al soporte para más información.");
        await signOut(auth);
        setSubmitting(false);
        return;
      }
  
      // Validar fecha de expiración
      const expdate = userData.expdate?.toDate ? userData.expdate.toDate() : new Date(userData.expdate);
      const today = new Date();
  
      if (today > expdate) {
        setError("Tu cuenta ha vencido. Por favor, contacta a soporte para renovarla.");
        console.log("Usuario vencido.");
        setIsSubscriptionModalOpen(true); // Abrir modal de suscripción
        await signOut(auth);
        return;
      }
  
      // Si todo está bien, redirigir al dashboard
      onClose();
      setTimeout(() => {
        const dashboardUrl = `/dashboard/${encodeURIComponent(userData.establishmentName.replace(/\s+/g, '-'))}`;
        navigate(dashboardUrl + '/list');
      }, 100);
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      setError("Usuario o contraseña incorrectos, revísalos y vuelve a ingresarlos por favor.");
      setSubmitting(false);
    }
  };
  


  // useEffect para monitorear los cambios en disabledEmail
  useEffect(() => {
    console.log('disabledEmail actualizado: ', disabledEmail);
  }, [disabledEmail]);

  const handleAccountRecovery = () => {
    console.log("Recuperación de cuenta solicitada para:", userEmail);
    alert("Se ha solicitado la recuperación de tu cuenta. Nuestro equipo se pondrá en contacto contigo pronto.");
    setIsDisabledUser(false); // Ocultar el botón tras solicitar recuperación
  };

  const openRegisterModal = (recovering = false) => {
    setIsRecoveringAccount(recovering); 
    setShowRegister(true);
  };

  const closeRegisterModal = () => {
    setShowRegister(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleModalClose = () => {
    setIsSubscriptionModalOpen(false);
  };

  const handleRenewSubscription = async () => { 
 //   console.log('Renovando suscripción...');
    const preference = await handleIntegrationMP(userEmail);

    if (preference) {
      window.location.href = preference.init_point;
    } else {
      alert("Error al crear la preferencia de pago.");
    }
    setIsSubscriptionModalOpen(false);
  };

  return (
    <>
      <div className="modal">
        <div className="modal-dialog">
          <div className="modal-content-form">
            <div className='modal-header'>
              <p className="login-header">Bienvenido a Book-It</p>
              <span className="close" onClick={onClose}>&times;</span>
            </div>
            <div className='modal-body'>
              <section className='modal-login'>
                <h3 onClick={onClose} >LOG IN</h3>
                <p>No tienes cuenta? <span className="join-now"  onClick={() => openRegisterModal(false)}>CREAR CUENTA</span></p>
              </section>

              {error && <p className="error">{error}</p>}
              {isDisabledUser && (
                <button className="recover-account-button" onClick={() => openRegisterModal(true)}>
                Recuperar cuenta
              </button>
              )}

              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <div className={`form-group ${errors.email && touched.email ? 'has-error' : ''}`}>
                      <Field
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        className="form-control"
                      />
                      <ErrorMessage name="email" component="div" className="error" />
                    </div>

                    <div className={`form-group ${errors.password && touched.password ? 'has-error' : ''}`}>
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        className="form-control"
                      />
                      <span className="toggle-password" onClick={togglePasswordVisibility}>
                        {showPassword ? (
                          <img src={assets.eyeopen_icon} alt="Hide password" />
                        ) : (
                          <img src={assets.eyeclose_icon} alt="Show password" />
                        )}
                      </span>
                      <ErrorMessage name="password" component="div" className="error" />
                    </div>
                    <p className="forgot-password">
                      <span onClick={() => navigate("/password-reset")}>¿Olvidaste tu contraseña?</span>
                    </p>

                    <button type="submit" className="login-button" disabled={isSubmitting}>
                      LOG IN TO BOOK-IT
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>

        <BuySubscription 
          isOpen={isSubscriptionModalOpen} 
          onClose={handleModalClose} 
          onRenew={handleRenewSubscription} 
        />
      </div>
      {showRegister &&
       <RegisterForm 
       onClose={closeRegisterModal}
       isRecoveringAccount={isRecoveringAccount} 
       disabledEmail={disabledEmail} 
       />}
    {/* Modal de recuperación */}
    {showRecoverModal && (
      <RecoverAccountModal
        onClose={() => setShowRecoverModal(false)}
        onRecover={handleAccountRecovery}
      />
    )}
    </>
  );
}

export default LoginForm;
