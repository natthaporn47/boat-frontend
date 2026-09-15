import React from "react";
import Navbar from "../components/Navbar";
import "../components/Layout.css";

function Layout({ children }) {
  return (
    <div className="app-layout">

      {/* เมนูด้านซ้าย */}
      <Navbar />

      {/* พื้นที่สำหรับแสดงหน้าเว็บ */}
      <main className="page-area">
        {children}
      </main>

    </div>
  );
}

export default Layout;