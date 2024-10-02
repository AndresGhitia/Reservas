import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../src/assets/assets'; // Importa el objeto assets que contiene las imágenes

function UserProfileDropdown({ userData, user, handleSignOut }) {
  const navigate = useNavigate();

  const handleOwnerDashboardClick = () => {
    if (userData?.establishmentName) {
      const establishmentName = userData.establishmentName.replace(/\s+/g, '-');
      navigate(`/dashboard/${establishmentName}`);
    } else {
      navigate('/owner-dashboard');
    }
  };

  return (
    <div className='navbar-profile'>
      <div className='navbar-profile-user'>
        <span>{`Hola, ${userData?.firstName || userData?.ownerName || user.email}`}</span>
        <img src={assets.profile_icon} alt="profile icon" /> {/* Aquí uso assets.profile_icon */}
      </div>
      <ul className="nav-profile-dropdown">
        <li><img src={assets.booking_icon} alt="Reservas icon" />Reservas</li>
        <hr />
        <li onClick={() => handleSignOut(false)}><img src={assets.logout_icon} alt="Logout icon" />Logout</li>
        <hr />
        {userData?.establishmentName && (
          <li onClick={handleOwnerDashboardClick}><img src={assets.profile_icon} alt="Dashboard icon" />Dashboard</li>
        )}
      </ul>
    </div>
  );
}

export default UserProfileDropdown;
