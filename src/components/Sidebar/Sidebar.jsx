import React from 'react';
import './Sidebar.css';
import { NavLink, useParams } from 'react-router-dom'; 
import { assets } from '../../assets/assets';

function Sidebar() {
  const { establishmentName } = useParams(); 

  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to={`/dashboard/${establishmentName}/add`} className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Agregar Espacio</p>
        </NavLink>
        <NavLink to={`/dashboard/${establishmentName}/list`} className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Mis Espacios</p>
        </NavLink>
        <NavLink to={`/dashboard/${establishmentName}/booking`} className="sidebar-option"> 
          <img src={assets.booking_icon} alt="" />
          <p>Reservas</p>
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
