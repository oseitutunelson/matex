import React from 'react';
import { BrowserRouter,Routes,Route} from 'react-router-dom';
import App from './App'
import { Creator } from './components/Account';
import EditProfile from './components/editProfile';
import { MintNft } from './components/Mint';

 

function AppRoutes() {

  return (
    <>
      <BrowserRouter>
  <Routes>
    <Route path="/" element={<App/>} />
    <Route path="/creator/:walletAddress" element={<Creator/>} />
    <Route path="/editProfile/:walletAddress" element={<EditProfile/>}/>
    <Route path='/createcontent' element={<MintNft/>}/>
  </Routes>
</BrowserRouter>
    </>
  );
}

export default AppRoutes;