import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from '../../firebase';
import { doc, setDoc, Timestamp, query, collection, where, getDocs } from 'firebase/firestore';
import OwnerForm from './OwnerForm';
import UserForm from './UserForm';
import './RegisterForm.css';

function RegisterForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessType, setBusinessType] = useState([]);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState('user');
  const [whatsapp, setWhatsapp] = useState('');
  const availableBusinessTypes = ['Football', 'Paddle', 'Tenis', 'Hockey', 'Volley', 'Handball'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (accountType === 'owner') {
        const ownersRef = collection(db, 'owners');
        const q = query(ownersRef, where('establishmentName', '==', establishmentName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setError(`Ya existe un negocio registrado con el nombre "${establishmentName}". Por favor, elige otro nombre.`);
          return;
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Enviar correo de verificación
      await sendEmailVerification(user);

      // Cerrar sesión inmediatamente
      await auth.signOut();

      const createdAt = new Date();
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 3);

      const createdAtTimestamp = Timestamp.fromDate(createdAt);
      const expdateTimestamp = Timestamp.fromDate(expirationDate);

      if (accountType === 'user') {
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          email,
        });
      } else if (accountType === 'owner') {
        await setDoc(doc(db, 'owners', user.uid), {
          establishmentName,
          ownerName,
          establishmentEmail: email,
          whatsapp,
          businessType,
          address,
          createdAt: createdAtTimestamp,
          expdate: expdateTimestamp,
        });
      }

      alert("Usuario registrado con éxito. Por favor, revisa tu correo electrónico para verificar tu cuenta.");
      onClose();
    } catch (error) {
      console.error("Firebase Error:", error);
      setError("Error al registrar el usuario: " + error.message);
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="modal">
      <div className="modal-dialog">
        <div className="modal-content-form">
          <div className='modal-header'>
            <p className="login-header">Bienvenido a Book-It</p>
            <span className="close" onClick={onClose}>&times;</span>
          </div>
          <div className='modal-body'>
            <section className='modal-login'>
              <h3>CREAR UNA CUENTA</h3>
              <p>Tienes cuenta? <span className="join-now" onClick={onClose}>LOG IN</span></p>
            </section>
          <div className="tabs">
            <button className={`tab ${accountType === 'user' ? 'active' : ''}`} onClick={() => setAccountType('user')}> CUENTA USUARIO</button>
            <button className={`tab ${accountType === 'owner' ? 'active' : ''}`} onClick={() => setAccountType('owner')}>  CUENTA NEGOCIO</button>
          </div>

          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit}>
            {accountType === 'user' && (
              <UserForm
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                email={email}
                setEmail={setEmail}
              />
            )}

            {accountType === 'owner' && (
              <OwnerForm
                establishmentName={establishmentName}
                setEstablishmentName={setEstablishmentName}
                ownerName={ownerName}
                setOwnerName={setOwnerName}
                email={email}
                setEmail={setEmail}
                whatsapp={whatsapp}
                setWhatsapp={setWhatsapp}
                address={address}
                setAddress={setAddress}
                businessType={businessType}
                setBusinessType={setBusinessType}
                availableBusinessTypes={availableBusinessTypes}
              />
            )}

            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={togglePasswordVisibility}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <button type="submit" className="login-button">REGISTRARSE</button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
