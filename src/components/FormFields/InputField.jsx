import React from 'react';

const InputField = ({ label, type = 'text', name, value, onChange, placeholder = '', required = false }) => (
  <div>
    <label>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export default InputField;
