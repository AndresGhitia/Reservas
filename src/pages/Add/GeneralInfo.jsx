// src/components/GeneralInfo.jsx
import React from 'react';

const GeneralInfo = ({ newSpace, setNewSpace }) => {
  return (
    <div className="general-info">
      <input
        type="text"
        value={newSpace.name}
        onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
        placeholder="Nombre del nuevo espacio"
      />

      <select
        value={newSpace.techo}
        onChange={(e) => setNewSpace({ ...newSpace, techo: e.target.value })}
        disabled={!newSpace.name}
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
    </div>
  );
};

export default GeneralInfo;
