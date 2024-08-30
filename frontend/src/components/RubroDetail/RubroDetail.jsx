import React, { useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RubroDetail.css';
import { StoreContext } from '../../context/StoreContext';

const RubroDetail = ({ id, name, image, address, coordinates }) => {
    const mapRef = useRef(null);
    const { addToCart } = useContext(StoreContext); // Añadir el uso del contexto

    useEffect(() => {
        const map = L.map(mapRef.current).setView(coordinates, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        L.marker(coordinates).addTo(map)
            .bindPopup(address)
            .openPopup();

        return () => {
            map.remove();
        };
    }, [coordinates, address]);

    return (
        <article>
            <div className="venueheader">
                <h1 className="Oswald">{name}</h1>
            </div>
            <div className='BoxDetail'>
                <img src={image} alt={name} className="PedalSize" />
                <div ref={mapRef} style={{ height: '480px', width: '480px' }}></div>
                <p className="TextEffect">{address}</p>
                <button aria-label={`Reservar en ${name}`} onClick={() => addToCart(id)}>Reservar</button>
            </div>
            <Link to='/' className='ButtonHome'>Inicio</Link>
        </article>
    );
};

export default RubroDetail;
