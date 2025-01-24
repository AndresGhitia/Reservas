import React from 'react';
import './Sidebar.css';
import { NavLink, useParams } from 'react-router-dom'; 
import { assets } from '../../assets/assets';
import Swal from 'sweetalert2';

function Sidebar({ spaces }) {
  const { establishmentName } = useParams();

  const handleAddSpace = () => {
    if (spaces.length >= 8) {
      Swal.fire({
        icon: 'error',
        title: 'Límite alcanzado',
        text: 'Has alcanzado el límite de 8 canchas/espacios.',
        confirmButtonText: 'Entendido'
      });
    } else {
      window.location.href = `/dashboard/${establishmentName}/add`;
    }
  };

  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        
        <div className="sidebar-option" onClick={handleAddSpace} style={{ cursor: 'pointer' }}>
          <img src={assets.add_icon_white} alt="" />
          <p>Agregar Espacio</p>
        </div>
        
        <NavLink to={`/dashboard/${establishmentName}/list`} className="sidebar-option">
          <img src={assets.home_icon_white} alt="" />
          <p>Mis Espacios</p>
        </NavLink>
        
        <NavLink to={`/dashboard/${establishmentName}/analytics`} className="sidebar-option"> 
          <img src={assets.booking_icon_white} alt="" />
          <p>Reservas</p>
        </NavLink>

        <NavLink to={`/dashboard/${establishmentName}/store`} className="sidebar-option">
          <img src={assets.booking_icon_white} alt="" />
          <p>Store</p>
        </NavLink>

      </div>
    </div>
  );
}

export default Sidebar;
