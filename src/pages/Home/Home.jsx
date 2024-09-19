import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreRubro from '../../components/ExploreMenu/ExploreRubro'
import BusinessList from '../../components/BusinessList/BusinessList'
import RubroDisplay from '../../components/RubroDisplay/RubroDisplay'

const Home = () => {

  const [category, setCategory] = useState("All")

  return (
    <div>
        <Header/>
        <ExploreRubro category={category} setCategory={setCategory}/>
     {/*  <RubroDisplay category={category} /> */}  
       <BusinessList /> 

    
    </div>
  )
}

export default Home