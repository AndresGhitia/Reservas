import React from 'react';
// import './SportsFilter.css';

const SportsFilter = ({ selectedSport, setSelectedSport }) => {
  const sports = ['Todos', 'Futbol', 'Básquet', 'Tenis', 'Vóley'];

  return (
    <div className="sports-filter-container">
      <label htmlFor="sports">Deporte:</label>
      <select
        id="sports"
        value={selectedSport}
        onChange={(e) => setSelectedSport(e.target.value)}
      >
        {sports.map((sport) => (
          <option key={sport} value={sport}>
            {sport}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SportsFilter;
