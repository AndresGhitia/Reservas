import React from 'react';

const SelectField = ({ label, name, options, value, onChange, required = false }) => (
  <div>
    <label>{label}</label>
    <select name={name} value={value} onChange={onChange} required={required}>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
