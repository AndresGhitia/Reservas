import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreRubro from '../../components/ExploreMenu/ExploreRubro'
import BusinessList from '../../components/BusinessList/BusinessList'
import RubroDisplay from '../../components/RubroDisplay/RubroDisplay'

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <div>
      <Header />
      <ExploreRubro category={category} setCategory={setCategory} />
      {/* Filtra la lista de negocios según la categoría seleccionada */}
      <BusinessList category={category} />
    </div>
  );
}

export default Home;
