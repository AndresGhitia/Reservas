import { useState, useRef, useEffect } from 'react';

const AddressAutocomplete = ({ address, setAddress, apiKey }) => {
  const [predictions, setPredictions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const autocompleteServiceRef = useRef(null);

  useEffect(() => {
    if (!autocompleteServiceRef.current && window.google) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions({ input: value }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions);
        }
      });
    } else {
      setPredictions([]);
    }
  };

  const handlePredictionClick = (prediction) => {
    setInputValue(prediction.description);
    setAddress(prediction.description);
    setPredictions([]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Buscar dirección..."
        value={inputValue}
        onChange={handleInputChange}
        required
      />
      {predictions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {predictions.map((prediction) => (
            <li key={prediction.place_id} onClick={() => handlePredictionClick(prediction)}>
              {prediction.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
