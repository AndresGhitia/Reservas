import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import RubroDetailContainer from "./components/RubroDetailContainer/RubroDetailContainer";
import BusinessPage from "./components/BusinnesPage/BusinessPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";

const App = () => {
  const location = useLocation();
  
  const showNavbarRoutes = ['/', '/cart', '/order'];
  const showNavbar = showNavbarRoutes.includes(location.pathname) || location.pathname.startsWith('/item');

  return (
    <div className="app">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/item/:itemId' element={<RubroDetailContainer />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/order' element={<PlaceOrder />} />
        <Route path="/dashboard/:establishmentName" element={<Dashboard />} />
        <Route path="/dashboard/:establishmentName/add" element={<Add />} /> {/* Ruta para añadir cancha */}
        <Route path="/dashboard/:establishmentName/list" element={<List />} /> {/* Ruta para listar canchas */}
        <Route path="/:establishmentName" element={<BusinessPage />} />
      </Routes>
    </div>
  );
}

export default App;
