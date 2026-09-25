import React, { useState } from "react";
import "./App.css";

import { HashRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Mission from "./pages/Mission";
import History from "./pages/History";

import Navbar from "./components/Navbar";
import Layout from "./components/Layout";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HashRouter>
      <Layout>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />

        <Routes>
          <Route
            path="/"
            element={<Home onMenuClick={() => setIsOpen((currentState) => !currentState)} />}
          />

          <Route
            path="/mission"
            element={<Mission onMenuClick={() => setIsOpen((currentState) => !currentState)} />}
          />

          <Route
            path="/history"
            element={<History onMenuClick={() => setIsOpen((currentState) => !currentState)} />}
          />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;