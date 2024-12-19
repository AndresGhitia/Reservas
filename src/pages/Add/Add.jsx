import React, { useState } from 'react';
import { handleAddSpace } from '../../utils/handleAddSpace';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData';
import './Add.css';
import { ToastContainer } from 'react-toastify';
import ClosedDays from './ClosedDays';
import TimeSelection from './TimeSelection';
import 'react-toastify/dist/ReactToastify.css';

function Add({ setSpaces, setError, setLoading }) {

  const [newSpace, setNewSpace] = useState({
    name: '',
    sport: '',
    surface: '',
    players: '',
    rate: '',
    techo: '',
    openTime: '',
    closeTime: '',
    walls: '',
    closedDays: [], 
  });

  const [uniqueError, setUniqueError] = useState(null);

  const handleAddSpaceClick = async () => {
    try {
      await handleAddSpace(newSpace, setNewSpace, setUniqueError);
      fetchOwnerDataAndSpaces(null, setSpaces, setError, setLoading);
    } catch (error) {
      console.error("Error al agregar espacio: ", error);
    }
  };

  const handleClosedDayToggle = (day) => {
    setNewSpace((prevState) => ({
      ...prevState,
      closedDays: Array.isArray(prevState.closedDays)
        ? prevState.closedDays.includes(day)
          ? prevState.closedDays.filter((d) => d !== day)
          : [...prevState.closedDays, day]
        : [day], // Si `closedDays` no es un array, inicializa con el día seleccionado
    }));
  };
 
  const handleOpenTimeChange = (e) => {
    setNewSpace((prevState) => ({
      ...prevState,
      openTime: e.target.value,
      closeTime: "" // resetear la hora de cierre cuando cambia la de apertura
    }));
  };

  const handleCloseTimeChange = (e) => {
    setNewSpace((prevState) => ({
      ...prevState,
      closeTime: e.target.value
    }));
  };

  return (
    <div className='add-container'>
      <input
        type="text"
        value={newSpace.name}
        onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
        placeholder="Nombre del nuevo espacio"
        maxLength={18} // Limita a 18 caracteres
      />

      <select
        value={newSpace.sport}
        onChange={(e) => setNewSpace({ ...newSpace, sport: e.target.value })}
        disabled={!newSpace.name}
      >
        <option value="">Seleccionar deporte</option>
        <option value="Football">Football</option>
        <option value="Paddle">Paddle</option>
        <option value="Tenis">Tenis</option>
        <option value="Volley">Volley</option>
        <option value="Hockey">Hockey</option>
      </select>

      {newSpace.sport === 'Paddle' && (
        <select
          value={newSpace.walls}
          onChange={(e) => setNewSpace({ ...newSpace, walls: e.target.value })}
        >
          <option value="">Seleccionar tipo de paredes</option>
          <option value="Pared">Pared</option>
          <option value="Blindex">Blindex</option>
        </select>
      )}

      <select
        value={newSpace.surface}
        onChange={(e) => setNewSpace({ ...newSpace, surface: e.target.value })}
        disabled={!newSpace.sport} 
      >
        <option value="">Seleccionar superficie</option>
        <option value="Piso">Piso</option>
        <option value="Césped Natural">Césped Natural</option>
        <option value="Césped Sintético">Césped Sintético</option>
        <option value="Polvo de ladrillo">Polvo de Ladrillo</option>
        <option value="Arena">Arena</option>
      </select>

      <select
        value={newSpace.techo}
        onChange={(e) => setNewSpace({ ...newSpace, techo: e.target.value })}
        disabled={!newSpace.surface}
      >
        <option value="">Tipo de espacio</option>
        <option value="Techada">Techada</option>
        <option value="Aire libre">Aire libre</option>
      </select>

      <input
        type="number"
        value={newSpace.players}
        onChange={(e) => setNewSpace({ ...newSpace, players: e.target.value })}
        placeholder="Cantidad de jugadores"
        disabled={!newSpace.techo}
      />

      <input
        type="number"
        step="100"
        value={newSpace.rate}
        onChange={(e) => setNewSpace({ ...newSpace, rate: e.target.value })}
        placeholder="Tarifa"
        disabled={!newSpace.players} 
      />

<TimeSelection
        openTime={newSpace.openTime}
        closeTime={newSpace.closeTime}
        onOpenTimeChange={handleOpenTimeChange}
        onCloseTimeChange={handleCloseTimeChange}
      />


      <ClosedDays closedDays={newSpace.closedDays} onToggleDay={handleClosedDayToggle} />




      <div className='add-button'>
        <button onClick={handleAddSpaceClick}> Agregar (+) </button>
      </div>

      {uniqueError && <p className="error-message">{uniqueError}</p>}

      <ToastContainer />
    </div>
  );
}

export default Add;
