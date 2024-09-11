import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import RubroDetailContainer from "./components/RubroDetailContainer/RubroDetailContainer";
import Dashboard from './components/Dashboard/Dashboard'; 
import BusinessPage from "./components/Dashboard/BusinessPage";

const App = () => {
  const location = useLocation();
  
  // Verificar si la ruta es exactamente alguna de las rutas que deben mostrar el Navbar
  const showNavbarRoutes = ['/', '/cart', '/order'];
  
  // Mostrar el Navbar solo si estamos en una ruta exacta de las permitidas o comienza con "/item"
  const showNavbar = showNavbarRoutes.includes(location.pathname) || location.pathname.startsWith('/item');


  // Rutas exactas donde debe aparecer el Navbar
  const routesWithNavbar = ['/', '/item', '/cart', '/order'];

  // Verificamos si la ruta actual es exactamente alguna de las rutas donde se muestra el Navbar
  const hideNavbar = !routesWithNavbar.includes(location.pathname);

  return (
    <div className="app">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/item/:itemId' element={<RubroDetailContainer />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/order' element={<PlaceOrder />} />
        <Route path="/dashboard/:establishmentName" element={<Dashboard />} />
        <Route path="/:establishmentName" element={<BusinessPage />} />
      </Routes>
    </div>
  );
}

export default App;
