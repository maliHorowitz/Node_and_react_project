 import React, { createContext, useContext, useRef, useState } from 'react'
 import Login from './Login'
 import SignUp from './SignUp'
 import ManagerDashboard from './ManagerDashboard';
import SupplierDashboard from './SupplierDashboard';
import NotFound from './NotFound';
 import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
 const UserContext = createContext(null);

 const ClientPage=()=>{
  const currentUser = useRef();


return(
  <UserContext.Provider value={currentUser}>
  <Router>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route path="*" element={<NotFound />} />

      </Routes>
  </Router>
</UserContext.Provider>
    
)
}
export default ClientPage
export const useUser = () => useContext(UserContext);  
