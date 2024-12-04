const BusinessTypeSelector = ({ availableTypes, selectedTypes, setSelectedTypes }) => {
    const handleSelect = (e) => {
      const type = e.target.value;
      if (type && !selectedTypes.includes(type)) {
        setSelectedTypes([...selectedTypes, type]);
      }
    };
  
    const removeType = (type) => {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    };
  
    return (
      <div>
        <select onChange={handleSelect}>
          <option value="">Selecciona un rubro</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <div>
          {selectedTypes.map((type) => (
            <span key={type}>
              {type} <button onClick={() => removeType(type)}>✖</button>
            </span>
          ))}
        </div>
      </div>
    );
  };
  
  export default BusinessTypeSelector;
  