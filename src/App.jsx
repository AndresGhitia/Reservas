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
  const hideNavbar = location.pathname.startsWith('/dashboard');

  return (
    <div className="app">
      {!hideNavbar && <Navbar />}
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
