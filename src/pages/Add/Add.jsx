import React, { useState } from 'react';
import { handleAddSpace } from '../../utils/handleAddSpace';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData';
import './Add.css';

function Add({ setSpaces, setError, setLoading }) {
  const [newSpace, setNewSpace] = useState({
    name: '',
    sport: '',
    surface: '',
    players: '',
    rate: '',
    openTime: '',  // Hora de apertura
    closeTime: '', // Hora de cierre
  });
  const [uniqueError, setUniqueError] = useState(null);
  const [inputError, setInputError] = useState(false);

  const handleAddSpaceClick = async () => {
    if (newSpace.name.trim() === "") {
      setUniqueError("Debes ingresar un nombre para el espacio nuevo");
      return;
    }
    await handleAddSpace(newSpace, setNewSpace, setUniqueError);
    fetchOwnerDataAndSpaces(null, setSpaces, setError, setLoading); // Recargar los espacios
  };

  return (
    <div className='add-container'>
      <input
        type="text"
        value={newSpace.name}
        onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
        placeholder="Nombre del nuevo espacio"
        className={inputError ? 'error' : ''}
      />
      
      <select
        value={newSpace.sport}
        onChange={(e) => setNewSpace({ ...newSpace, sport: e.target.value })}
      >
        <option value="">Seleccionar deporte</option>
        <option value="Football">Football</option>
        <option value="Paddle">Paddle</option>
        <option value="Tenis">Tenis</option>
        <option value="Volley">Volley</option>
        <option value="Hockey">Hockey</option>
      </select>
      
      <select
        value={newSpace.surface}
        onChange={(e) => setNewSpace({ ...newSpace, surface: e.target.value })}
      >
        <option value="">Seleccionar superficie</option>
        <option value="Piso">Piso</option>
        <option value="Césped Natural">Césped Natural</option>
        <option value="Césped Sintético">Césped Sintético</option>
      </select>

      <input
        type="number"
        value={newSpace.players}
        onChange={(e) => setNewSpace({ ...newSpace, players: e.target.value })}
        placeholder="Cantidad de jugadores"
      />
      <input
        type="number"
        step="100"
        value={newSpace.rate}
        onChange={(e) => setNewSpace({ ...newSpace, rate: e.target.value })}
        placeholder="Tarifa"
      />

      {/* Selectores de hora de apertura y cierre */}
      <label>Hora de Apertura</label>
      <input
        type="time"
        value={newSpace.openTime}
        onChange={(e) => setNewSpace({ ...newSpace, openTime: e.target.value })}
      />

      <label>Hora de Cierre</label>
      <input
        type="time"
        value={newSpace.closeTime}
        onChange={(e) => setNewSpace({ ...newSpace, closeTime: e.target.value })}
      />

      <div className='add-button'>
        <button onClick={handleAddSpaceClick}>Agregar</button>
      </div>

      {uniqueError && <p className="error-message">{uniqueError}</p>}
    </div>
  );
}

export default Add;
