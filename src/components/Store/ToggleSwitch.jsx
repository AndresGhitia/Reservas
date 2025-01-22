import React from "react";
import "./ToggleSwitch.css"; // Archivo de estilos para el toggle

const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <div className="toggle-switch">
      <span>{label}</span>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider"></span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
