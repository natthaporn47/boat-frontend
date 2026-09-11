import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../components/Navbar.css';
import { Icon } from '@iconify/react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false) // ☰ ปิดอยู่
  const closeMenu = () => {
    setIsOpen(false)
  }
  return (
    <>
      <button className="menu-button" 
      onClick={() => setIsOpen(!isOpen)}>☰</button> 
      <div className={`navbar ${isOpen ? 'open' : ''}`}> <br/><br/><br/>
        <NavLink to="/" onClick={closeMenu}
        className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
          <Icon icon="garden:home-stroke-12" /> 
          หน้าหลัก
        </NavLink>
        <NavLink to="/mission" onClick={closeMenu}
        className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
          <Icon icon="gis:map-route" /> สร้างภารกิจ
        </NavLink>
        <NavLink to="/history" onClick={closeMenu}
        className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
          <Icon icon="akar-icons:history" /> ประวัติการทำงาน
        </NavLink>
      </div>
    </>
  );
}

export default Navbar;