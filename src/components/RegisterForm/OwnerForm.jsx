// OwnerForm.jsx
import React, { useState } from 'react';

const OwnerForm = ({ 
  establishmentName, 
  setEstablishmentName, 
  ownerName, 
  setOwnerName, 
  email, 
  setEmail, 
  whatsapp, 
  setWhatsapp, 
  address, 
  setAddress, 
  businessType, 
  setBusinessType, 
  availableBusinessTypes 
}) => {
  const handleBusinessTypeChange = (e) => {
    const selectedType = e.target.value;
    if (!businessType.includes(selectedType)) {
      setBusinessType([...businessType, selectedType]);
    }
  };

  const removeBusinessType = (type) => {
    setBusinessType(businessType.filter((item) => item !== type));
  };

  return (
    <>
      <div className="form-group">
        <label>Nombre del Establecimiento <span className="required">*</span></label>
        <input
          type="text"
          placeholder="Nombre del Establecimiento"
          value={establishmentName}
          onChange={(e) => setEstablishmentName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Nombre del Propietario <span className="required">*</span></label>
        <input
          type="text"
          placeholder="Nombre del Propietario"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Correo Electrónico del Establecimiento <span className="required">*</span></label>
        <input
          type="email"
          placeholder="Correo Electrónico del Establecimiento"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>WhatsApp del Negocio <span className="required">*</span></label>
        <input
          type="text"
          placeholder="Número de WhatsApp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Dirección del Establecimiento <span className="required">*</span></label>
        <input
          type="text"
          placeholder="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Rubro <span className="required">*</span></label>
        <select onChange={handleBusinessTypeChange}>
          <option value="">Selecciona un rubro</option>
          {availableBusinessTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <div className="selected-business-types">
          {businessType.map((type) => (
            <span key={type} className="business-type">
              {type} <button type="button" onClick={() => removeBusinessType(type)}>✖</button>
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default OwnerForm;
