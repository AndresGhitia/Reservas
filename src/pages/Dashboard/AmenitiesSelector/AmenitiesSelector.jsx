import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import "./AmenitiesSelector.css";

const AmenitiesSelector = ({ db, userDocId, onUpdateAmenities }) => {
  const [amenities] = useState(["wifi", "vestuarios", "duchas", "parrilla", "gimnasio"]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar las prestaciones existentes del usuario al iniciar
  useEffect(() => {
    const fetchAmenities = async () => {
      if (!userDocId) return;

      const userDocRef = doc(db, "owners", userDocId);
      try {
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.amenities) {
            setSelectedAmenities(data.amenities);
          }
        }
      } catch (err) {
        console.error("Error al cargar las prestaciones:", err);
        setError("No se pudieron cargar las prestaciones.");
      }
    };

    fetchAmenities();
  }, [db, userDocId]);

  // Manejar selección desde el dropdown
  const handleSelectAmenity = (amenity) => {
    if (amenity && !selectedAmenities.includes(amenity)) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Remover prestaciones seleccionadas
  const handleRemoveAmenity = (amenity) => {
    setSelectedAmenities(selectedAmenities.filter((item) => item !== amenity));
  };

  // Actualizar prestaciones en Firestore
  const handleUpdateAmenities = async () => {
    if (!userDocId) {
      setError("No se encontró el ID del documento del usuario.");
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, "owners", userDocId);

      // Combinar las prestaciones previas y seleccionadas (sin duplicados)
      const docSnapshot = await getDoc(userDocRef);
      const previousAmenities = docSnapshot.exists() && docSnapshot.data().amenities
        ? docSnapshot.data().amenities
        : [];

        const updatedAmenities = selectedAmenities; // Sobrescribe estrictamente con las seleccionadas

      await updateDoc(userDocRef, {
        amenities: updatedAmenities,
      });

      setLoading(false);
      alert("Prestaciones actualizadas correctamente.");
      setError("");
      if (onUpdateAmenities) {
        onUpdateAmenities(updatedAmenities);
      }
    } catch (err) {
      console.error("Error al actualizar las prestaciones:", err);
      setError("Hubo un error al actualizar las prestaciones.");
      setLoading(false);
    }
  };

  return (
    <div className="amenities-selector">
      <h2>Seleccionar prestaciones</h2>

      {/* Dropdown para seleccionar prestaciones */}
      <div className="dropdown-container">
        <select
          onChange={(e) => handleSelectAmenity(e.target.value)}
          className="amenity-dropdown"
          value=""
        >
          <option value="" disabled>
            Seleccione una prestación
          </option>
          {amenities.map((amenity, index) => (
            <option key={index} value={amenity} disabled={selectedAmenities.includes(amenity)}>
              {amenity}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de todas las prestaciones */}
      {/* <div className="all-amenities">
        <h3>Todas las prestaciones</h3>
        <ul className="amenities-list">
          {amenities.map((amenity, index) => (
            <li key={index} className="amenity-item">
              <span>{amenity}</span>
              {selectedAmenities.includes(amenity) && (
                <button
                  className="remove-button"
                  onClick={() => handleRemoveAmenity(amenity)}
                >
                  ✖
                </button>
              )}
            </li>
          ))}
        </ul>
      </div> */}

      {/* Lista de prestaciones seleccionadas */}
      <div className="selected-amenities">
        <h3>Prestaciones de tu complejo</h3>
        {selectedAmenities.length === 0 ? (
          <p>No se han seleccionado prestaciones.</p>
        ) : (
          <ul className="selected-amenities-list">
            {selectedAmenities.map((amenity, index) => (
              <li key={index} className="selected-amenity-item">
                {amenity}
                <button
                  className="remove-button"
                  onClick={() => handleRemoveAmenity(amenity)}
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}
      <button
        className="update-button"
        onClick={handleUpdateAmenities}
        disabled={loading}
      >
        {loading ? "Actualizando..." : "Actualizar prestaciones"}
      </button>
    </div>
  );
};

export default AmenitiesSelector;
