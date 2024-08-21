import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreRubro from '../../components/ExploreMenu/ExploreRubro'
import RubroDisplay from '../../components/RubroDisplay/RubroDisplay'

const Home = () => {

  const [category, setCategory] = useState("All")

  return (
    <div>
        <Header/>
        <ExploreRubro category={category} setCategory={setCategory}/>
        <RubroDisplay category={category} />
        
    </div>
  )
}

export default Home