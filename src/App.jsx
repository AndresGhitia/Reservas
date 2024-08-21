import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar/Navbar"
import Home from "./pages/Home/Home"
import Cart from "./pages/Cart/Cart"
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder"
import RubroDetailContainer from "./components/RubroDetailContainer/RubroDetailContainer"


const App = () =>{
  return (
    <div className="app">
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/item/:itemId' element={<RubroDetailContainer/>}/>
        <Route path='/cart' element={<Cart/>} />
        <Route path='/order' element={<PlaceOrder/>} />
      </Routes>
    </div>
  )
}


export default App
