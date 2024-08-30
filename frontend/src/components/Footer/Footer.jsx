import React from 'react'
import { assets } from '../../assets/assets'
import './Footer.css'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo_header} alt="" className='logo' />
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni possimus quisquam eaque adipisci ab. Nulla laborum officiis dolor eos ipsa nobis consequuntur, quibusdam, inventore, sint at natus molestias id tempora?</p>
        </div>
        <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul>
                <li>Home</li>
                <li>About Us</li>
                <li>Reservas</li>
                <li>Privacy policy</li>
            </ul>
        </div>
        <div className="footer-content-right">
            <h2>CONTACTO</h2>
            <ul>
                <li>+54 11-1234-4567</li>
                <li>contact@bookit.com.ar</li>
            </ul>
        </div>
      </div>
      <hr />
      <p className='footer-copyright'>Copyright 2024 © Bookit.com - Todos Los Derechos Reservados</p>
    </div>
  )
}

export default Footer
