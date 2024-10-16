import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import './OwnerForm.css';

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
  availableBusinessTypes,
}) => {
  const [predictions, setPredictions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [highlightedPrediction, setHighlightedPrediction] = useState('');
  const autocompleteServiceRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyBWI5EoMzcJk-y6Mtdy0whcUwFQRvqc7po',
    libraries: ['places'],
  });

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions({ input: value }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions);
          if (predictions[0]) {
            setHighlightedPrediction(predictions[0].description);
          }
        }
      });
    } else {
      setPredictions([]);
      setHighlightedPrediction('');
    }
  };

  const handlePredictionClick = (prediction) => {
    setInputValue(prediction.description);
    setAddress(prediction.description);
    setPredictions([]);
  };

  const renderPrediction = () => {
    if (highlightedPrediction && inputValue) {
      return (
        <span style={{ color: '#ccc' }}>
          {highlightedPrediction.slice(inputValue.length)}
        </span>
      );
    }
    return null;
  };

  const handleBusinessTypeChange = (e) => {
    const selectedType = e.target.value;
    if (selectedType && !businessType.includes(selectedType)) {
      setBusinessType([...businessType, selectedType]);
    }
  };

  const removeBusinessType = (type) => {
    setBusinessType(businessType.filter((item) => item !== type));
  };

  const handleWhatsAppChange = (e) => {
    const value = e.target.value;

    // Evitar que el usuario elimine el prefijo
    if (!value.startsWith('+54 11')) {
      setWhatsapp('+54 11' + value.replace('+54 11', '')); // Asegúrate de que el prefijo esté siempre presente
    } else {
      setWhatsapp(value);
    }
  };

  return (
    <div className="owner-form">
      <div className="left-column">
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
      </div>

      <div className="right-column">
        <div className="form-group">
          <label>WhatsApp del Negocio <span className="required">*</span></label>
          <input
            type="text"
            placeholder="Número de WhatsApp"
            value={whatsapp}
            onChange={handleWhatsAppChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Dirección del Establecimiento <span className="required">*</span></label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar dirección..."
              value={inputValue}
              onChange={handleInputChange}
              required
              style={{ width: '100%' }}
            />
            <div style={{ position: 'absolute', top: '0', left: '0', pointerEvents: 'none' }}>
              {renderPrediction()}
            </div>
          </div>
          {predictions.length > 0 && (
            <ul className="autocomplete-suggestions">
              {predictions.map((prediction) => (
                <li key={prediction.place_id} onClick={() => handlePredictionClick(prediction)}>
                  {prediction.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label>Rubro <span className="required">*</span></label>
          <select onChange={handleBusinessTypeChange}>
            <option value="">Selecciona un rubro</option>
            {availableBusinessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
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
      </div>
    </div>
  );
};

export default OwnerForm;
