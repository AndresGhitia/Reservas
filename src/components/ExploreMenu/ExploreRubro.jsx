///ExploreRubro.jsx
import React from 'react'
import { rubro_list } from '../../assets/assets'
import './ExploreRubro.css'


const ExploreRubro = ({category, setCategory}) => {
  return (
    <div className='explore-rubro' id='explore-rubro'>
      <div className='explore-rubro-list'>
        {rubro_list.map((item, index)=>{
          return (
            <div onClick={()=>setCategory(prev=>prev===item.rubro_name?"All":item.rubro_name)} key={index} className='explore-rubro-list-item'>
                <img className={category===item.rubro_name?"active":""} src={item.rubro_image} alt="" />
                <p>{item.rubro_name}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ExploreRubro