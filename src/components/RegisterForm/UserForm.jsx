// UserForm.jsx
import React from 'react';

const UserForm = ({ firstName, setFirstName, lastName, setLastName, email, setEmail }) => {
  return (
    <>
      <div className="form-group">
        <label>Nombre <span className="required">*</span></label>
        <input
          type="text"
          placeholder="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Apellido <span className="required">*</span></label>
        <input
          type="text"
          placeholder="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Email <span className="required">*</span></label>
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
    </>
  );
};

export default UserForm;
