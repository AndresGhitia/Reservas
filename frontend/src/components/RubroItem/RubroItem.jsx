import React from 'react';
import { Link } from 'react-router-dom';
import './RubroItem.css';

const RubroItem = ({ id, name, image, addres }) => {

    return (
        <div className='rubro-item'>
            <div className='rubro-item-img-container'>
                <img className='rubro-item-image' src={image} alt="" />
            </div>
            <div className='rubro-item-info'>
                <div className='rubro-item-name-rating'>
                    <p>{name}</p>
                </div>
                <p className='rubro-item-desc'>{addres}</p>
                <Link to={`/item/${id}`} className='rubro-item-disponibilidad'>
                    VER DISPONIBILIDAD
                </Link>
            </div>
        </div>
    )
}

export default RubroItem;
