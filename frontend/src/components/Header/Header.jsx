import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Header.css';

const Header = () => {
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedLocalidad, setSelectedLocalidad] = useState('');
  const [selectedRubro, setSelectedRubro] = useState('');

  useEffect(() => {
    // Obtener provincias al cargar el componente
    axios.get('https://apis.datos.gob.ar/georef/api/provincias')
      .then(response => {
        setProvincias(response.data.provincias.map(provincia => provincia.nombre));
      })
      .catch(error => {
        console.error('Error al obtener provincias:', error);
      });
  }, []);

  useEffect(() => {
    // Obtener localidades al seleccionar una provincia
    if (selectedProvincia) {
      axios.get(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${selectedProvincia}`)
        .then(response => {
          setLocalidades(response.data.localidades.map(localidad => localidad.nombre));
        })
        .catch(error => {
          console.error('Error al obtener localidades:', error);
        });
    }
  }, [selectedProvincia]);

  const handleProvinciaChange = (event) => {
    setSelectedProvincia(event.target.value);
    setSelectedLocalidad('');
  };

  const handleLocalidadChange = (event) => {
    setSelectedLocalidad(event.target.value);
  };

  const handleRubroChange = (event) => {
    setSelectedRubro(event.target.value);
  };

  const handleBuscarClick = () => {
    // Aquí puedes implementar la lógica para buscar canchas
    console.log('Buscar:', selectedProvincia, selectedLocalidad, selectedRubro);
  };

  return (
    <div className='header'>
      <div className="header-contents">
        <h2>Reservar un lugar</h2>
        <div>
          <label htmlFor="provincia">Provincia:</label>
          <select id="provincia" value={selectedProvincia} onChange={handleProvinciaChange}>
            <option value="">Selecciona una provincia</option>
            {provincias.map((provincia, index) => (
              <option key={index} value={provincia}>{provincia}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="localidad">Localidad:</label>
          <select id="localidad" value={selectedLocalidad} onChange={handleLocalidadChange}>
            <option value="">Selecciona una localidad</option>
            {localidades.map((localidad, index) => (
              <option key={index} value={localidad}>{localidad}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rubro">Rubro:</label>
          <select id="rubro" value={selectedRubro} onChange={handleRubroChange}>
            <option value="">Selecciona un rubro</option>
            <option value="Fútbol">Fútbol</option>
            <option value="Tenis">Tenis</option>
            <option value="Paddle">Paddle</option>
          </select>
        </div>
        <button className='button_ver' onClick={handleBuscarClick}>Buscar</button>
      </div>
    </div>
  );
};

export default Header;
