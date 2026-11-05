import React from "react";
import { NavLink } from "react-router-dom";
import "../components/Navbar.css";
import { Icon } from "@iconify/react";

function Navbar({isOpen, setIsOpen}) {
  const closeMenu = () => {
    setIsOpen(false);
  };
  return (
      <nav id="dashboard-navigation" aria-label="เมนูหลัก" className={`navbar ${isOpen ? "open" : ""}`} inert={!isOpen}>
        <div className="navbar-brand"><Icon icon="ion:boat" aria-hidden="true" /><div><strong>Spraying Boat</strong><small>ระบบควบคุมเรือพ่นยา</small></div></div>
        <button className="close-button" type="button" title="ปิด" aria-label="ปิดเมนู" onClick={closeMenu}>
          <Icon icon="bitcoin-icons:cross-outline" />  
        </button>
        <NavLink
          to="/"
          end
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
      </nav>

  );
}

export default Navbar;
