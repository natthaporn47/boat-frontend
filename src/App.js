import React from "react";

import { HashRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Mission from "./pages/Mission";
import History from "./pages/History";

import Layout from "./components/Layout";
import { SidebarProvider } from "./components/SidebarContext";

function AppRoutes() {
  return (
      <Layout>

        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/mission"
            element={<Mission />}
          />

          <Route
            path="/history"
            element={<History />}
          />
        </Routes>
      </Layout>
  );
}

function App() {
  return <HashRouter><SidebarProvider><AppRoutes /></SidebarProvider></HashRouter>;
}

export default App;
