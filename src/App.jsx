import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import RubroDetailContainer from "./components/RubroDetailContainer/RubroDetailContainer";
import BusinessPage from "./components/BusinnesPage/BusinessPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Success from "./pages/PaymentStates/Succes"; 
import Failure from "./pages/PaymentStates/Failure";
import PasswordReset from "./components/PasswordReset/PasswordReset";
import RecoverForm from "./pages/RecoverForm/RecoverForm";   
import EditData from './pages/EditData/EditData';

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

        <Route path="/dashboard/:establishmentName" element={<Dashboard />}>
          <Route path="add" element={<Add />} />  
          <Route path="list" element={<List />} /> 
        </Route>

        <Route path="/:establishmentName" element={<BusinessPage />} />

        {/* Nuevas rutas */}
        <Route path="/password-reset" element={<PasswordReset />} />
        
        <Route path="/recover" element={<RecoverForm />} />
        <Route path="/edit-data" element={<EditData />} />

        <Route path="/success" element={<Success />} /> 
        <Route path="/failure" element={<Failure />} /> 
      </Routes>
    </div>
  );
};

export default App;
