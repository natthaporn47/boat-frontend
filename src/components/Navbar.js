import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useSidebar } from "./SidebarContext";
import "./Navbar.css";

const menuItems = [
  { path: "/", label: "หน้าหลัก", icon: "lucide:house" },
  { path: "/mission", label: "ภารกิจ / แผนที่", icon: "gis:map-route" },
  { path: "/history", label: "ประวัติการทำงาน", icon: "lucide:history" },
];

function Navbar({ navigationRef }) {
  const { isDesktop, isSidebarExpanded, isMobileSidebarOpen, closeSidebar } = useSidebar();
  const isExpanded = isDesktop ? isSidebarExpanded : isMobileSidebarOpen;
  const [tooltip, setTooltip] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const hideTooltip = () => setTooltipVisible(false);

  useEffect(() => { setTooltipVisible(false); }, [isExpanded, isDesktop]);

  const showTooltip = (event, label) => {
    if (!isDesktop || isExpanded) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const sidebarBounds = event.currentTarget.closest("nav").getBoundingClientRect();
    setTooltip({ label, top: bounds.top + bounds.height / 2, left: sidebarBounds.right + 12 });
    setTooltipVisible(true);
  };

  return (
    <>
      <nav ref={navigationRef} id="dashboard-navigation" aria-label="เมนูหลัก"
        className={`navbar${isExpanded ? " open" : ""}`}
        inert={!isDesktop && !isMobileSidebarOpen}
        onKeyDown={event => { if (event.key === "Escape") hideTooltip(); }}>
        <div className="navbar-brand" title="Spraying Boat">
          <Icon icon="lucide:ship" aria-hidden="true" />
          <div className="navbar-brand-copy"><strong>Spraying Boat</strong><small>ระบบควบคุมเรือพ่นยา</small></div>
        </div>
        <button className="close-button" type="button" aria-label="ปิดเมนู" onClick={closeSidebar}>
          <Icon icon="lucide:x" aria-hidden="true" />
        </button>
        <div className="navbar-menu">
          {menuItems.map(({ path, label, icon }) => (
            <NavLink key={path} to={path} end={path === "/"} aria-label={label}
              aria-describedby={tooltipVisible && tooltip?.label === label ? "navigation-tooltip" : undefined}
              className={({ isActive }) => `menu-item${isActive ? " active" : ""}`}
              onClick={() => { hideTooltip(); closeSidebar(); }}
              onMouseEnter={event => showTooltip(event, label)} onMouseLeave={hideTooltip}
              onFocus={event => showTooltip(event, label)} onBlur={hideTooltip}>
              <Icon icon={icon} className="menu-icon" aria-hidden="true" />
              <span className="menu-label">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      {tooltip && createPortal(
        <div id="navigation-tooltip" role="tooltip" aria-hidden={!tooltipVisible}
          className={`navigation-tooltip${tooltipVisible ? " visible" : ""}`}
          style={{ top: tooltip.top, left: tooltip.left }}>{tooltip.label}</div>, document.body)}
    </>
  );
}

export default Navbar;
