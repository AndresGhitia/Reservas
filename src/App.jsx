// src/App.js

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
import Booking from "./pages/Booking/Booking";
import Success from "./pages/PaymentStates/Succes"; 
import Failure from "./pages/PaymentStates/Failure";

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
  
        <Route path="/dashboard/:establishmentName" element={<Dashboard />}>
          <Route path="add" element={<Add />} />  
          <Route path="list" element={<List />} /> 
          <Route path="booking" element={<Booking />} />
        </Route>
  
        <Route path="/:establishmentName" element={<BusinessPage />} />

        {/* Ruta para la pantalla de éxito de pago */}
        <Route path="/success" element={<Success />} /> 
        <Route path="/failure" element={<Failure />} />  {/* Ruta para "failure" */}
    
        </Routes>
    </div>
  );
};

export default App;
