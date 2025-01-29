import React, { useState, useCallback } from 'react';
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../../firebase';
import './LoginForm.css';
import RegisterForm from '../RegisterForm/RegisterForm';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { assets } from '../../assets/assets';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import BuySubscription from '../BuySuscription/BuySubscription';
import { handleIntegrationMP } from '../../../MP/preference';
import RecoverForm from '../../pages/RecoverForm/RecoverForm';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

const validationSchema = Yup.object({
  email: Yup.string().email('Email inválido').required('Por favor, introduce una dirección de correo electrónico válida'),
  password: Yup.string().required('Por favor, introduzca una contraseña'),
});

const showErrorAlert = (title, text) => {
  Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'Entendido',
    target: document.querySelector('.modal'),
    customClass: {
      popup: 'swal2-zindex'
    }
  });
};

const fetchUserDoc = async (uid) => {
  let userDoc = await getDoc(doc(db, 'owners', uid));
  if (!userDoc.exists()) {
    userDoc = await getDoc(doc(db, 'users', uid));
  }
  return userDoc;
};

const navigateToDashboard = (navigate, establishmentName) => {
  const dashboardUrl = `/dashboard/${encodeURIComponent(establishmentName.replace(/\s+/g, '-'))}`;
  navigate(dashboardUrl + '/list');
};

const GoogleLoginButton = ({ onClick }) => (
  <button className="google-login-button" onClick={onClick}>
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/150px-Google_%22G%22_logo.svg.png"
      alt="Google icon"
      className="google-icon"
    />
    Continuar con Google
  </button>
);

function LoginForm({ onClose, setShowAccountTypeModal, setShowLogin, show }) {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modalStates, setModalStates] = useState({
    showRegister: false,
    showRecoverScreen: false,
    isSubscriptionModalOpen: false,
  });
  const [userEmail, setUserEmail] = useState('');
  const [isDisabledUser, setIsDisabledUser] = useState(false);

  const navigate = useNavigate();

  const handleLogin = useCallback(async (values, { setSubmitting }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        showErrorAlert('Verifica tu correo!', 'Tu correo electrónico no ha sido verificado. Por favor, revisa tu correo y sigue las instrucciones para verificarlo.');
        await signOut(auth);
        setSubmitting(false);
        return;
      }

      setUserEmail(user.email);
      const userDoc = await fetchUserDoc(user.uid);

      if (!userDoc.exists()) {
        showErrorAlert('Usuario no encontrado', 'Usuario no encontrado, por favor verifica el mail ingresado.');
        await signOut(auth);
        setSubmitting(false);
        return;
      }

      const userData = userDoc.data();
      setUserEmail(user.email);

      if (userData.status === "disabled") {
        Swal.fire({
          title: 'Cuenta deshabilitada',
          text: 'Tu cuenta se encuentra deshabilitada. Contacta al soporte para más información.',
          icon: 'info',
          confirmButtonText: 'Recuperar cuenta',
          target: document.querySelector('.modal'),
          customClass: {
            popup: 'swal2-zindex',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            setUserEmail(user.email);
            setTimeout(() => {
              setModalStates(prev => ({ ...prev, showRecoverScreen: true }));
            }, 0);
          }
        });

        await signOut(auth);
        setSubmitting(false);
        return;
      }

      const expdate = userData.expdate?.toDate ? userData.expdate.toDate() : new Date(userData.expdate);
      const today = new Date();

      if (today > expdate) {
        setError("Tu cuenta ha vencido. Por favor, contacta a soporte para renovarla.");
        setModalStates(prev => ({ ...prev, isSubscriptionModalOpen: true }));
        await signOut(auth);
        return;
      }

      onClose();
      setTimeout(() => {
        navigateToDashboard(navigate, userData.establishmentName);
      }, 100);
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      showErrorAlert('Usuario o contraseña incorrectos', 'Revísalos y vuelve a ingresarlos por favor.');
      setSubmitting(false);
    }
  }, [navigate, onClose]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      setUserEmail(user.email);

      if (!user.emailVerified) {
        showErrorAlert("Verifica tu correo!", "Tu correo electrónico no ha sido verificado. Por favor, revisa tu correo y sigue las instrucciones para verificarlo.");
        await signOut(auth);
        return;
      }

      const userDoc = await fetchUserDoc(user.uid);
      if (!userDoc.exists()) {
        showErrorAlert("Usuario no encontrado", "Parece que no tienes una cuenta registrada. Por favor, contacta a soporte.");
        await signOut(auth);
        return;
      }

      const userData = userDoc.data();

      if (userData.status === "disabled") {
        Swal.fire({
          title: "Cuenta deshabilitada",
          text: "Tu cuenta se encuentra deshabilitada. Contacta al soporte para más información.",
          icon: "info",
          confirmButtonText: "Recuperar cuenta",
        }).then((result) => {
          if (result.isConfirmed) {
            setTimeout(() => {
              setModalStates(prev => ({ ...prev, showRecoverScreen: true }));
            }, 0);
          }
        });

        await signOut(auth);
        return;
      }

      const expdate = userData.expdate?.toDate ? userData.expdate.toDate() : new Date(userData.expdate);
      const today = new Date();

      if (today > expdate) {
        setModalStates(prev => ({ ...prev, isSubscriptionModalOpen: true }));
        await signOut(auth);
        return;
      }

      navigateToDashboard(navigate, userData.establishmentName);
    } catch (error) {
      console.error("Error durante el inicio de sesión con Google:", error);
      showErrorAlert("Error", "Hubo un problema al iniciar sesión. Por favor, inténtalo de nuevo.");
    }
  }, [navigate]);

  const handleModalClose = useCallback(() => {
    setModalStates(prev => ({ ...prev, isSubscriptionModalOpen: false }));
  }, []);

  const handleRenewSubscription = useCallback(async () => {
    const preference = await handleIntegrationMP(userEmail);
    if (preference) {
      window.location.href = preference.init_point;
    } else {
      alert("Error al crear la preferencia de pago.");
    }
    setModalStates(prev => ({ ...prev, isSubscriptionModalOpen: false }));
  }, [userEmail]);

  if (!show) return null;

  return (
    <>
      {modalStates.showRecoverScreen ? (
        <RecoverForm
          onClose={() => setModalStates(prev => ({ ...prev, showRecoverScreen: false }))}
          userEmail={userEmail}
        />
      ) : (
        <div className="modal">
          <div className="modal-dialog">
            <div className="modal-content-form">
              <div className='modal-header'>
                <p className="login-header">Bienvenido a Clubweb</p>
                <span className="close" onClick={onClose}>&times;</span>
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
                  <button className="recover-account-button" onClick={() => setModalStates(prev => ({ ...prev, showRecoverScreen: true }))}>
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

                      <button type="submit" className="login-button" disabled={isSubmitting}>
                        LOG IN TO CLUBWEB
                      </button>

                      <div className='modal-divider'>
                        <hr />
                        <span>OR</span>
                        <hr />
                      </div>
                      <GoogleLoginButton onClick={handleGoogleLogin} />
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      )}

      <BuySubscription
        isOpen={modalStates.isSubscriptionModalOpen}
        onClose={handleModalClose}
        onRenew={handleRenewSubscription}
        userEmail={userEmail}
        setShowLogin={setShowLogin}
      />

      {modalStates.showRegister && <RegisterForm onClose={() => setModalStates(prev => ({ ...prev, showRegister: false }))} />}
    </>
  );
}

export default LoginForm;