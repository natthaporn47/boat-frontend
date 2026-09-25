import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import "../components/PageHeader.css";

function PageHeader({ title, subtitle, onMenuClick }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const [piOnline, setPiOnline] = useState(false);
  useEffect(() => {

    const checkPiStatus = async () => {

      try {

        const response = await fetch(
          "http://100.73.198.53:8000/api/status"
        );

        if (!response.ok) {
          throw new Error("Pi response error");
        }

        // อ่านข้อมูลจาก Pi
        const data = await response.json();

        console.log("ข้อมูลจาก Raspberry Pi:", data);

        // ถ้าได้รับข้อมูลจาก Pi ถือว่าออนไลน์
        setPiOnline(true);

      } catch (error) {

        console.log("ไม่สามารถเชื่อมต่อ Raspberry Pi:", error);

        setPiOnline(false);
      }
    };

    // ตรวจสอบทันทีเมื่อเปิดหน้า
    checkPiStatus();

    // ตรวจสอบซ้ำทุก 3 วินาที
    const piTimer = setInterval(() => {
      checkPiStatus();
    }, 3000);

    return () => clearInterval(piTimer);

  }, []);

  return (
    <header className="page-header">
      {/* ปุ่มเมนู */}
      <button className="header-menu-button" onClick={onMenuClick}>
        <Icon icon="akar-icons:three-line-horizontal" />
      </button>
      {/* ชื่อหน้า */}
      <div className="page-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {/* สถานะระบบ */}
      <div className="header-right">
        <div className="system-status">
          <span
            className={`status-dot ${
              piOnline ? "online" : "offline"
            }`}
          ></span>

          <span>
            {piOnline
              ? "Raspberry Pi พร้อมใช้งาน"
              : "Raspberry Pi ไม่พร้อมใช้งาน"}
          </span>
        </div>

        <div className="current-time">
          <Icon icon="mdi:clock-outline" />
          <span>{timeString}</span>
        </div>

        <button className="settings-button">
          <Icon icon="mdi:cog" />
        </button>
      </div>
    </header>
  );
}

export default PageHeader;
