import React, { useState } from "react";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Mission from "./pages/Mission";
import History from "./pages/History";

import Navbar from "./components/Navbar";
import PageHeader from "./components/PageHeader";
import Layout from "./components/Layout";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BrowserRouter>
    <Layout>
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />

      <Routes>
        <Route path="/" element={<Home onMenuClick={() => setIsOpen(true)} />} />
        <Route path="/mission" element={<Mission onMenuClick={() => setIsOpen(true)} />} />
        <Route path="/history" element={<History onMenuClick={() => setIsOpen(true)} />} />
      </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
