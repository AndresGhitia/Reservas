import React from 'react';
import { rubro_list } from '../../assets/assets';
import './RubroIconsGrid.css';

const RubroIconsGrid = ({ category, setCategory }) => {
  return (
    <div className="rubro-icons-grid">
      <h3>Selecciona deporte</h3>
      <div className="rubro-icons-grid-container">
        {rubro_list.map((item, index) => (
         <div 
         key={index} 
         className="rubro-icons-grid-item"
         onClick={() => {
           console.log("Seleccionado:", item.rubro_name);
           setCategory(prev => prev === item.rubro_name ? "All" : item.rubro_name);
         }}
       >
         <img 
           className={category === item.rubro_name ? "active" : ""} 
           src={item.rubro_image} 
           alt={item.rubro_name} 
         />
         <p>{item.rubro_name}</p>
       </div>
       
        ))}
      </div>
    </div>
  );
};

export default RubroIconsGrid;
