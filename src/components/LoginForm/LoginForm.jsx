import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../../firebase';
import './LoginForm.css';
import RegisterForm from '../RegisterForm/RegisterForm';
import AccountTypeModal from '../AccountTypeModal/AccountTypeModal';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { assets } from '../../assets/assets';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import BuySubscription from '../BuySuscription/BuySubscription';
import { handleIntegrationMP } from '../../../MP/preference';
import RecoverForm from '../../pages/RecoverForm/RecoverForm';  // Importamos RecoverForm
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string().email('Email inválido').required('Por favor, introduce una dirección de correo electrónico válida'),
  password: Yup.string().required('Por favor, introduzca una contraseña'),
});

function LoginForm({ onClose, setShowAccountTypeModal }) {
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isDisabledUser, setIsDisabledUser] = useState(false);
  const [showRecoverScreen, setShowRecoverScreen] = useState(false); // Estado para mostrar la pantalla de recuperación

  const navigate = useNavigate();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      // console.log("Iniciando sesión con email:", values.email);

      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Tu correo electrónico no ha sido verificado. Por favor, revisa tu correo y sigue las instrucciones para verificarlo.");
        await signOut(auth);
        setSubmitting(false);
        return;
      }

      setUserEmail(user.email);
      // console.log("Email del usuario:", user.email); 

      // console.log("Buscando usuario en Firestore con UID:", user.uid);

      var userDoc = await getDoc(doc(db, 'owners', user.uid));
      if (!userDoc.exists()) {
        // console.log("Usuario no encontrado en 'owners'. Buscando en 'users'...");
        userDoc = await getDoc(doc(db, 'users', user.uid));
      }

      if (!userDoc.exists()) {
        // console.log("Usuario no encontrado en Firestore.");
        setError("Usuario no encontrado, por favor verifica tus credenciales.");
        await signOut(auth);
        setSubmitting(false);
        return;
      }

      const userData = userDoc.data();
      // console.log("Datos del usuario:", userData);


      if (userData.status === "disabled") {
        setError("Tu cuenta ha sido deshabilitada. Contacta al soporte para más información.");
        setIsDisabledUser(true); // Activar la bandera para mostrar el botón de recuperar cuenta
        await signOut(auth);
        setSubmitting(false);
        return;
      }

      const expdate = userData.expdate?.toDate ? userData.expdate.toDate() : new Date(userData.expdate);
      const today = new Date();

      if (today > expdate) {
        setError("Tu cuenta ha vencido. Por favor, contacta a soporte para renovarla.");
        // console.log("Usuario vencido.");
        setIsSubscriptionModalOpen(true);
        await signOut(auth);
        return;
      }

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

  // Inicio de sesión con Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      console.log('Abriendo popup para autenticación con Google...'); // LOG

      // Crear popup manualmente para verificar si se bloquea
      const popupWindow = window.open('', '_blank', 'width=500,height=600');
      if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined') {
        console.error('El navegador bloqueó el popup.'); // LOG
        setError("El navegador bloqueó el popup. Habilita las ventanas emergentes.");
        return;
      }
      popupWindow.close();

      // Inicia el proceso de autenticación
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Usuario autenticado:', user); // LOG

      // Procesar el inicio de sesión...
    } catch (error) {
      console.error('Error en el inicio de sesión con Google:', error); // LOG
      setError(error.message || "Error al iniciar sesión con Google. Intenta de nuevo.");
    }
  };

  const openRecoverScreen = () => {
    navigate(`/recover?email=${userEmail}`);
    // setShowRecoverScreen(true); // Mostrar la pantalla de recuperación
  };

  const handleAccountRecovery = () => {
    // console.log("Recuperación de cuenta solicitada para:", userEmail);
    alert("Se ha solicitado la recuperación de tu cuenta. Nuestro equipo se pondrá en contacto contigo pronto.");
    setIsDisabledUser(false); // Ocultar el botón tras solicitar recuperación
  };

  const handleModalClose = () => {
    setIsSubscriptionModalOpen(false);

  };

  const handleRenewSubscription = async () => {
    //   console.log('Renovando suscripción...');

    // console.log('enviando a la preference el mail: '+ userEmail)

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
      {showRecoverScreen ? (

        <RecoverForm
          onClose={() => setShowRecoverScreen(false)}
          onRecover={handleAccountRecovery}
        />
      ) : (
        <div className="modal">
          <div className="modal-dialog">
            <div className="modal-content-form">
              <div className='modal-header'>
                <p className="login-header">Bienvenido a Clubweb</p>
                <span className="close"
                  onClick={onClose}>&times;
                </span>
              </div>
              <div className='modal-body'>

                <section className='modal-login'>
                  <h3 onClick={onClose}>LOG IN</h3>
                  <p>No tienes cuenta?
                    <span
                      className="join-now"
                      onClick={() => {
                        onClose();
                        setShowAccountTypeModal(true);

                      }}
                    >
                      CREAR CUENTA
                    </span>
                  </p>

                </section>

                {error && <p className="error">{error}</p>}
                {isDisabledUser && (
                  <button className="recover-account-button" onClick={openRecoverScreen}>
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
                        <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
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

                      <button type="submit"
                        className="login-button"
                        disabled={isSubmitting}>
                        LOG IN TO CLUBWEB
                      </button>

                      <div className='modal-divider'>
                        <hr />
                        <span>OR</span>
                        <hr />
                      </div>
                      <button className="google-login-button" onClick={handleGoogleLogin}>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/150px-Google_%22G%22_logo.svg.png"
                          alt="Google icon"
                          className="google-icon"
                        />
                        Continuar con Google
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      )}

      <BuySubscription
        isOpen={isSubscriptionModalOpen}
        onClose={handleModalClose}
        onRenew={handleRenewSubscription}
        userEmail={userEmail}
      />

      {/* Modal de registro */}
      {showRegister && <RegisterForm onClose={() => setShowRegister(false)} />}
    </>
  );
}

export default LoginForm;
