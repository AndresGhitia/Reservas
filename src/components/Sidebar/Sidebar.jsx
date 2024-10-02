import React from 'react';
import './Sidebar.css';
import { NavLink, useParams } from 'react-router-dom'; // Asegúrate de importar useParams
import { assets } from '../../assets/assets';

function Sidebar() {
  const { establishmentName } = useParams(); // Obtén el nombre del establecimiento desde los parámetros

  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to={`/dashboard/${establishmentName}/add`} className="sidebar-option"> {/* Incluye el nombre del establecimiento */}
          <img src={assets.add_icon} alt="" />
          <p>Añadir Cancha</p>
        </NavLink>
        <NavLink to={`/dashboard/${establishmentName}/list`} className="sidebar-option"> {/* Incluye el nombre del establecimiento */}
          <img src={assets.order_icon} alt="" />
          <p>Mis Canchas</p>
        </NavLink>
        {/* <NavLink to={`/dashboard/${establishmentName}/orders`} className="sidebar-option"> 
          <img src={assets.booking_icon} alt="" />
          <p>Reservas</p>
        </NavLink> */}
      </div>
    </div>
  );
}

export default Sidebar;
