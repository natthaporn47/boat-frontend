import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../components/Navbar.css";
import { Icon } from "@iconify/react";

function Navbar({isOpen, setIsOpen}) {
  const closeMenu = () => {
    setIsOpen(false);
  };
  return (
      <div className={`navbar ${isOpen ? "open" : ""}`}>
        <button class="close-button " onClick={() => setIsOpen(false)}>
          <Icon icon="bitcoin-icons:cross-outline" />
        </button>
        <br />
        <br />
        <br />
        <NavLink
          to="/"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <Icon icon="garden:home-stroke-12" className="menu-icon" />
          หน้าหลัก
        </NavLink>
        <NavLink
          to="/mission"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <Icon icon="gis:map-route" className="menu-icon" />ภารกิจ / แผนที่
        </NavLink>
        <NavLink
          to="/history"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <Icon icon="akar-icons:history" className="menu-icon" />{" "}
          ประวัติการทำงาน
        </NavLink>
      </div>

  );
}

export default Navbar;
