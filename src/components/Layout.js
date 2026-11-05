import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../components/Layout.css";

function Layout({ children, isOpen, setIsOpen }) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const media = window.matchMedia("(max-width: 1279px)");
    const previousOverflow = document.body.style.overflow;
    const updateScroll = () => { document.body.style.overflow = media.matches ? "hidden" : previousOverflow; };
    const closeOnEscape = event => { if (event.key === "Escape") setIsOpen(false); };
    updateScroll();
    media.addEventListener("change", updateScroll);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      media.removeEventListener("change", updateScroll);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, setIsOpen]);
  return (
    <div className={`app-layout${isOpen ? " navigation-open" : ""}`}>

      {/* เมนูด้านซ้าย */}
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && <button className="navigation-backdrop" type="button" aria-label="ปิดเมนูด้านหลัง" onClick={() => setIsOpen(false)} />}

      {/* พื้นที่สำหรับแสดงหน้าเว็บ */}
      <main className="page-area">
        {children}
      </main>

    </div>
  );
}

export default Layout;
