import React from "react";
import { Icon } from "@iconify/react";
import "../components/PageHeader.css";

function PageHeader({ title, subtitle, onMenuClick }) {
  return (
    <header className="page-header">
        {/* ปุ่มเมนู */}
        <button className="header-menu-button" 
            onClick={onMenuClick}><Icon icon="akar-icons:three-line-horizontal" />
        </button>
        {/* ชื่อหน้า */}
        <div className="page-title">
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
        {/* สถานะระบบ */}
        <div className="system-status">
            <div className="simulation-mode">
                🧪 โหมดจำลอง
            </div>
            <div className="system-status-text">

                <span className="status-dot"></span>
                สถานะ: ระบบจำลองทำงานปกติ
            </div>
        </div>
    </header>
  );
}

export default PageHeader;