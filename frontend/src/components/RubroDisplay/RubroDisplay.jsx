import React, { useContext } from 'react'
import './RubroDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import RubroItem from '../RubroItem/RubroItem'

const RubroDisplay = ({category}) => {

    const {rubro_card} = useContext(StoreContext)

  return (
    <div className='rubro-display' id='rubro-display'>
        <h2>LUGARES DESTACADOS</h2>
        <div className='rubro-display-list'>
            {rubro_card.map((item,index)=>{
                if (category==="All" || category===item.category) {
                  return <RubroItem key={index} id={item.id} name={item.name} image={item.image} addres={item.addres} category={item.category} />
                }
            })}
        </div>
    </div>
  )
}

export default RubroDisplay