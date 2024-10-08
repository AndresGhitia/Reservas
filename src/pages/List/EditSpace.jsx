// src/List/EditSpace.js
import React from 'react';

function EditSpace({ editedSpace, setEditedSpace, handleSaveSpace, cancelEdit }) {
  return (
    <div>
      <input
        type="text"
        value={editedSpace.name}
        onChange={(e) => setEditedSpace({ ...editedSpace, name: e.target.value })}
        placeholder="Nombre"
      />

      <select
        value={editedSpace.sport}
        onChange={(e) => setEditedSpace({ ...editedSpace, sport: e.target.value })}
      >
        <option value="">Seleccionar deporte</option>
        <option value="Football">Football</option>
        <option value="Paddle">Paddle</option>
        <option value="Tenis">Tenis</option>
        <option value="Volley">Volley</option>
        <option value="Hockey">Hockey</option>
      </select>

      <select
        value={editedSpace.surface}
        onChange={(e) => setEditedSpace({ ...editedSpace, surface: e.target.value })}
      >
        <option value="">Seleccionar superficie</option>
        <option value="Piso">Piso</option>
        <option value="Césped Natural">Césped Natural</option>
        <option value="Césped Sintético">Césped Sintético</option>
        <option value="Polvo de ladrillo">Polvo de Ladrillo</option>
        <option value="Arena">Arena</option>
      </select>

      <input
        type="number"
        value={editedSpace.players}
        onChange={(e) => setEditedSpace({ ...editedSpace, players: e.target.value })}
        placeholder="Cantidad de jugadores"
      />

      <input
        type="number"
        step="100"
        value={editedSpace.rate}
        onChange={(e) => setEditedSpace({ ...editedSpace, rate: e.target.value })}
        placeholder="Tarifa"
      />

      <button onClick={handleSaveSpace}>Guardar</button>
      <button onClick={cancelEdit}>Cancelar</button>
    </div>
  );
}

export default EditSpace;
