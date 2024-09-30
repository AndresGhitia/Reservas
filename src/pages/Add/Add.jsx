import React, { useState } from 'react';
import { handleAddSpace } from '../../utils/handleAddSpace';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData';

function Add({ setSpaces, setError, setLoading }) {
  const [newSpace, setNewSpace] = useState({
    name: '',
    surface: '',
    players: '',
    rate: '',
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
    <div>
      <input
        type="text"
        value={newSpace.name}
        onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
        placeholder="Nombre del nuevo espacio"
        className={inputError ? 'error' : ''}
      />

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
        step="0.01"
        value={newSpace.rate}
        onChange={(e) => setNewSpace({ ...newSpace, rate: e.target.value })}
        placeholder="Tarifa"
      />

      <button onClick={handleAddSpaceClick}>+ Agregar Espacio</button>
      {uniqueError && <p className="error-message">{uniqueError}</p>}
    </div>
  );
}

export default Add;
