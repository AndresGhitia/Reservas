import React from 'react';
import Select from 'react-select';
import { rubro_list } from '../../assets/assets';
import './SportFilter.css';

const SportFilter = ({ category, setCategory }) => {
  const options = [
    { value: 'All', label: 'Todos' },
    ...rubro_list.map((item) => ({
      value: item.rubro_name,
      label: (
        <div className="rubro-option">
          <img src={item.rubro_image} alt={item.rubro_name} className="rubro-option-image" />
          <span>{item.rubro_name}</span>
        </div>
      ),
    })),
  ];

  const handleChange = (selectedOption) => {
    setCategory(selectedOption.value);
  };

  return (
    <div className="rubro-select-container">
      <h3>Selecciona deporte</h3>
      <Select
        options={options}
        value={options.find((option) => option.value === category)}
        onChange={handleChange}
        classNamePrefix="rubro-select"
      />
    </div>
  );
};

export default SportFilter;
