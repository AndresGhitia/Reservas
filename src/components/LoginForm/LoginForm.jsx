import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import './LoginForm.css';
import RegisterForm from '../RegisterForm/RegisterForm';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { assets } from '../../assets/assets';
import { Formik, Form, Field, ErrorMessage } from 'formik';
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
  const navigate = useNavigate();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Tu correo electrónico no ha sido verificado. Por favor, revisa tu correo y sigue las instrucciones para verificarlo.");
        await auth.signOut();
        setSubmitting(false);
        return;
      }

      var ownerDoc = await getDoc(doc(db, 'owners', user.uid));

      if (!ownerDoc.exists()) {
        ownerDoc = await getDoc(doc(db, 'users', user.uid));
      }

      if (ownerDoc.exists()) {
        const ownerData = ownerDoc.data();
        const expdate = ownerData.expdate && ownerData.expdate.toDate ? ownerData.expdate.toDate() : new Date(ownerData.expdate);
        const today = new Date();

        if (today > expdate) {
          setError("Tu cuenta ha vencido. Por favor, contacta a soporte para renovarla.");
          setSubmitting(false);
          return;
        }

        onClose();
        setTimeout(() => {
          const dashboardUrl = `/dashboard/${encodeURIComponent(ownerData.establishmentName.replace(/\s+/g, '-'))}`;
          navigate(dashboardUrl + '/list');
        }, 100);
      } else {
        setError("Usuario no encontrado, por favor verifica tus credenciales.");
      }
    } catch (error) {
      setError("Usuario o contraseña incorrectos, revísalos y vuelve a ingresarlos por favor");
    }
    setSubmitting(false);
  };

  const openRegisterModal = () => {
    setShowRegister(true);
  };

  const closeRegisterModal = () => {
    setShowRegister(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                <h3>LOG IN</h3>
                <p>No tienes cuenta? <span className="join-now" onClick={openRegisterModal}>CREAR CUENTA</span></p>
              </section>

              {error && <p className="error">{error}</p>}

              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    {/* Email Field */}
                    <div className={`form-group ${errors.email && touched.email ? 'has-error' : ''}`}>
                      <Field
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        className="form-control"
                      />
                      <ErrorMessage name="email" component="div" className="error" />
                    </div>

                    {/* Password Field */}
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
      </div>
      {showRegister && <RegisterForm onClose={closeRegisterModal} />}
    </>
  );
}

export default LoginForm;
