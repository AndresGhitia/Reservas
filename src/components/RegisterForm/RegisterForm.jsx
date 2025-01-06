    import React, { useState } from 'react';
    import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
    import { auth, db } from '../../firebase';
    import { doc, setDoc, Timestamp, query, collection, where, getDocs, getDoc } from 'firebase/firestore';
    import OwnerForm from './OwnerForm';
    import UserForm from './UserForm';
    import './RegisterForm.css';

    function RegisterForm({ onClose, isRecoveringAccount, disabledEmail , accountType: initialAccountType, onSwitchToLogin }) {
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
      const [accountType, setAccountType] = useState(initialAccountType || 'user');
      const [whatsapp, setWhatsapp] = useState('');
      const availableBusinessTypes = ['Football', 'Paddle', 'Tenis', 'Hockey', 'Volley', 'Handball'];

      // console.log("Valor de disabledEmail en RegisterForm:", disabledEmail);
      const handleSubmit = async (e) => {
        if (isRecoveringAccount) {
          console.log("Recuperando cuenta para el email:", disabledEmail);
        } else {
          e.preventDefault();
          try {
            // Verificar si el correo está en la colección de usuarios deshabilitados
            const disabledUsersRef = doc(db, 'disabled', 'disabled-users');
            const disabledSnapshot = await getDoc(disabledUsersRef);
      
            if (disabledSnapshot.exists()) {
              const disabledData = disabledSnapshot.data();
              if (disabledData[email]) { // Si el correo está en disabled-users
                setError(`El correo "${email}" está deshabilitado. 
                   Para recuperar tu cuenta, ingresa con tu mail y contraseña y sigue los pasos.`);
                return; // Detener el flujo si el correo está deshabilitado
              }
            }
      
            // Verificar si ya existe un negocio registrado con el mismo nombre
            if (accountType === 'owner') {
              const ownersRef = collection(db, 'owners');
              const q = query(ownersRef, where('establishmentName', '==', establishmentName));
              const querySnapshot = await getDocs(q);
           
              if (!querySnapshot.empty) {
                setError(`Ya existe un negocio registrado con el nombre "${establishmentName}". Por favor, elige otro nombre.`);
                return;
              }

              // Verificar si hay al menos un deporte seleccionado
             if (businessType.length === 0) {
               setError("Debes seleccionar al menos un deporte.");
              return;
                }

            }


      
            // Crear cuenta de usuario
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
      
            // Enviar correo de verificación
            await sendEmailVerification(user);
      
            // Cerrar sesión inmediatamente después de la creación de la cuenta
            await auth.signOut();
      
            // Crear fecha de creación y fecha de expiración para el usuario
            const createdAt = new Date();
            const expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + 3);
      
            const createdAtTimestamp = Timestamp.fromDate(createdAt);
            const expdateTimestamp = Timestamp.fromDate(expirationDate);
      
            // Crear entrada inicial para el historial de estados
            const statusHistoryEntry = {
              enabled: createdAtTimestamp // Representar el cambio de estado como clave-valor
            };
      
            // Registrar el usuario en Firestore según el tipo de cuenta
            if (accountType === 'user') {
              await setDoc(doc(db, 'users', user.uid), {
                firstName,
                lastName,
                email,
                status: "enabled", // Estado inicial por separado
                statusHistory: [statusHistoryEntry] // Historial inicial
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
                status: "enabled", 
                statusHistory: [statusHistoryEntry], 
                amenities:[] // arreglo vacio que contendra las prestaciones del complejo

              });
            }
      
            // Confirmación de éxito
            alert("Usuario registrado con éxito. Por favor, revisa tu correo electrónico para verificar tu cuenta.");
            onClose();
          } catch (error) {
            console.error("Firebase Error:", error);
            setError("Error al registrar el usuario: " + error.message);
          }
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
                <p className="login-header">Bienvenido a Clubweb</p>
                <span className="close" onClick={onClose}>&times;</span>
              </div>
              <div className='modal-body'>
                <section className='modal-login'>
                  <h3>{isRecoveringAccount ? 'RECUPERA TU CUENTA': 'CREAR UNA CUENTA'  }</h3>
                  <p>
  Tienes cuenta? 
  <span className="join-now" onClick={() => {
    onClose(); // Cierra el modal de registro
    onSwitchToLogin(); // Abre el LoginForm
  }}>
    LOG IN
  </span>
</p>

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
                    disabledEmail={disabledEmail}
                    setEmail={setEmail}
                    whatsapp={whatsapp}
                    setWhatsapp={setWhatsapp}
                    address={address}
                    setAddress={setAddress}
                    businessType={businessType}
                    setBusinessType={setBusinessType}
                    availableBusinessTypes={availableBusinessTypes}
                    isRecoveringAccount={isRecoveringAccount}  

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

                <button type="submit" className="login-button">  {isRecoveringAccount ? "RECUPERAR CUENTA" : "REGISTRARSE"}
                </button>
              </form>
              </div>
            </div>
          </div>
        </div>
      );
    }

    export default RegisterForm;
