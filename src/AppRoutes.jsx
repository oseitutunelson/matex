import React from 'react';
import { BrowserRouter,Routes,Route} from 'react-router-dom';
import App from './App'
import { Creator } from './components/creator';
import EditProfile from './components/editProfile';


 

function AppRoutes() {

  return (
    <>
      <BrowserRouter>
  <Routes>
    <Route path="/" element={<App/>} />
    <Route path="/creator/:walletAddress" element={<Creator/>} />
    <Route path="/editProfile/:walletAddress" element={<EditProfile/>}/>
  </Routes>
</BrowserRouter>
    </>
  );
}

export default AppRoutes;