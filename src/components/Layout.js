import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../components/Layout.css";
import { useSidebar } from "./SidebarContext";
import PageHeader from "./PageHeader";

const pageTitles = {
  "/": { title: "หน้าหลัก", subtitle: "ระบบควบคุมเรือพ่นยาอัตโนมัติ" },
  "/mission": { title: "ภารกิจ / แผนที่" },
  "/history": { title: "ประวัติการทำงาน" },
};

function Layout({ children }) {
  const { isDesktop, isSidebarExpanded, isMobileSidebarOpen, isNavigationOpen, closeSidebar } = useSidebar();
  const navigationRef = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); closeSidebar(); }, [pathname, closeSidebar]);

  useEffect(() => {
    if (!isNavigationOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const closeOnEscape = event => { if (!isDesktop && event.key === "Escape") closeSidebar(); };
    if (!isDesktop) {
      document.body.style.overflow = "hidden";
      navigationRef.current?.querySelector(".close-button")?.focus();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      if (!isDesktop && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isDesktop, isNavigationOpen, closeSidebar]);

  const trapDrawerFocus = event => {
    if (isDesktop || !isMobileSidebarOpen || event.key !== "Tab") return;
    const controls = navigationRef.current?.querySelectorAll("a[href], button:not([disabled])");
    if (!controls?.length) return;
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  return (
    <div className={`app-layout${isSidebarExpanded ? " sidebar-expanded" : ""}${isMobileSidebarOpen ? " mobile-sidebar-open" : ""}`} onKeyDown={trapDrawerFocus}>

      {/* เมนูด้านซ้าย */}
      <Navbar navigationRef={navigationRef} />
      {!isDesktop && isMobileSidebarOpen && <button className="navigation-backdrop" type="button" tabIndex={-1} aria-label="ปิดเมนูด้านหลัง" onClick={closeSidebar} />}

      {/* พื้นที่สำหรับแสดงหน้าเว็บ */}
      <main className="page-area" inert={!isDesktop && isMobileSidebarOpen}>
        <PageHeader {...pageTitles[pathname]} />
        {children}
      </main>

    </div>
  );
}

export default Layout;
