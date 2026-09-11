import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';


import Navbar from './components/Navbar';
import Home from './pages/Home';
import Mission from './pages/Mission';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mission" element={<Mission />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;