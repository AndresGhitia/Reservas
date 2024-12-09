import React from 'react';

const AutoCompleteField = ({ label, value, onChange, predictions, onPredictionClick, placeholder = '' }) => (
  <div>
    <label>{label}</label>
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {predictions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {predictions.map((prediction) => (
            <li key={prediction.place_id} onClick={() => onPredictionClick(prediction)}>
              {prediction.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default AutoCompleteField;
