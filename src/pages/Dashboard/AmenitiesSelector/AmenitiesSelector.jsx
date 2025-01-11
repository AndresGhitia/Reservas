import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { FaCheck } from 'react-icons/fa';
import Swal from "sweetalert2";
import "./AmenitiesSelector.css";

const AmenitiesSelector = ({ db, userDocId, onUpdateAmenities }) => {
  const [amenities] = useState(['wifi', 'duchas', 'vestuarios', 'parrilla', 'pileta', 'gimnasio', 'juegos', 'eventos', 'clases', 'estacionamiento']);
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

      Swal.fire({
        title: 'Prestaciones actualizadas correctamente.',
        text: '',
        icon: 'success',
        confirmButtonText: 'Entendido',
        // target: document.querySelector('.modal'), 
        customClass: {
          popup: 'swal2-zindex' 
        }
      });
      // alert("Prestaciones actualizadas correctamente.");
      setError("");
      if (onUpdateAmenities) {
        onUpdateAmenities(updatedAmenities);
      }
    } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al actualizar las prestaciones.',
          icon: 'error',
          confirmButtonText: 'Entendido',
        });
      // console.error("Error al actualizar las prestaciones:", err);
      setError("Hubo un error al actualizar las prestaciones.");
      setLoading(false);
    }
  };

  return (
    <div className="amenities-selector-container">
      <div className="amenities-selector-header">
        <h1>Instalaciones del complejo</h1>
      </div>
      <div className="selected-amenities">
        {selectedAmenities.length === 0 ? (
          <p>No se han seleccionado prestaciones.</p>
        ) : (
          <ul className="selected-amenities-list">
            {selectedAmenities.map((amenity, index) => (
              <li key={index} className="selected-amenity-item">
                <FaCheck className="check-icon" />{amenity}
                <button className="delete-amenities-button" onClick={() => handleRemoveAmenity(amenity)}> X </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}
      <div className="amenities-selector-buttons">
        <select className="amenity-dropdown" onChange={(e) => handleSelectAmenity(e.target.value)} value="" >
          <option value="" disabled> AGREGAR INSTALACION</option>
          {amenities.map((amenity, index) => (
            <option key={index} value={amenity} disabled={selectedAmenities.includes(amenity)}>
              {amenity}
            </option>
          ))}
        </select>
        <button className="update-button" onClick={handleUpdateAmenities} disabled={loading} >
          {loading ? "ACTUALIZANDO..." : "ACTUALIZAR INSTALCIONES"}
        </button>
      </div>
    </div>
  );
};

export default AmenitiesSelector;
