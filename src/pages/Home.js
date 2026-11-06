import React, { useState, useEffect } from "react";
import "../pages/Home.css";
import { Icon } from "@iconify/react";
import Popup from "../components/Popup";
import MapView from "../components/MapView";

function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [piOnline, setPiOnline] = useState(false);
  const [boatData, setBoatData] = useState(null);
  useEffect(() => {
    const checkPiStatus = async () => {
      try {
        const response = await fetch("http://100.73.198.53:8000/api/status");

        if (!response.ok) {
          throw new Error("Pi response error");
        }

        // อ่านข้อมูลจาก Pi
        const data = await response.json();

        console.log("ข้อมูลจาก Raspberry Pi:", data);

        // ถ้าได้รับข้อมูลจาก Pi ถือว่าออนไลน์
        // เก็บข้อมูลที่ได้จาก Backend
        setBoatData(data);
        setPiOnline(true);
      } catch (error) {
        console.log("ไม่สามารถเชื่อมต่อ Raspberry Pi:", error);
        setBoatData(null);
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

  const statuses = [
    { name: "Raspberry Pi", icon: "lucide:cpu", ready: piOnline, text: piOnline ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน" },
    { name: "ระบบควบคุม", icon: "lucide:bot", ready: Boolean(boatData), text: boatData ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน" },
    { name: "GPS", icon: "lucide:map-pin", ready: Boolean(boatData?.gps), text: boatData?.gps ? "รับสัญญาณปกติ" : "ไม่มีสัญญาณ" },
    { name: "LiDAR", icon: "lucide:radar", ready: Boolean(boatData?.lidar), text: boatData?.lidar ? "ทำงานปกติ" : "ไม่พร้อมใช้งาน" },
    { name: "ปั๊มน้ำยา", icon: "lucide:droplets", ready: null, text: "ยังไม่มีข้อมูล" },
    { name: "การเชื่อมต่อเรือ", icon: "lucide:unplug", ready: piOnline, text: piOnline ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ" },
  ];

  return (
    <div className="home-content">
      <section className="dashboard-card system-status-card" aria-labelledby="system-summary-title">
        <div className="section-heading"><h2 id="system-summary-title">สถานะระบบ</h2><span>ตรวจสอบทุก 3 วินาที</span></div>
        <div className="system-summary-grid">
          {statuses.map(status => <div className="system-status-row" key={status.name}>
            <div className="system-status-name"><Icon icon={status.icon} aria-hidden="true" /><span>{status.name}</span></div>
            <div className="system-status-value"><span className={`system-status-dot ${status.ready === null ? "unknown" : status.ready ? "online" : "offline"}`} /><span>{status.text}</span></div>
          </div>)}
        </div>
      </section>

      <div className="home-overview">
        <section className="dashboard-card current-mission-card" aria-labelledby="current-mission-title">
          <div className="section-heading"><h2 id="current-mission-title">ภารกิจปัจจุบัน</h2><span className="mission-state-badge">รอข้อมูลภารกิจ</span></div>
          <h3 className="current-mission-name">พ่นยาแปลง A</h3>
          <p className="supporting-text">ภาพรวมการปฏิบัติงานของเรือ</p>
          <dl className="mission-metrics">
            <div><dt>เวลาเริ่ม</dt><dd>—</dd></div>
            <div><dt>เวลาที่ทำงาน</dt><dd>—</dd></div>
            <div><dt>ระยะทาง</dt><dd>— <small>กม.</small></dd></div>
            <div><dt>พื้นที่</dt><dd>— <small>ไร่</small></dd></div>
          </dl>
        </section>

        <section className="dashboard-card map-card" aria-labelledby="overview-map-title">
          <div className="section-heading"><h2 id="overview-map-title">แผนที่การทำงาน</h2><span>ภาพรวมพื้นที่ภารกิจ</span></div>
          <MapView />
          <div className="location-card"><Icon icon="lucide:navigation" aria-hidden="true" /><div><strong>ตำแหน่งตัวอย่าง</strong><p>Latitude: 13.812345° N <span>Longitude: 100.123456° E</span></p></div></div>
        </section>

        <section className="dashboard-card control-card" aria-labelledby="boat-controls-title">
          <div className="section-heading"><h2 id="boat-controls-title">ควบคุมเรือ</h2></div>
          <button type="button" className="control-button control-start" onClick={() => setShowPopup(true)}><Icon icon="carbon:play-filled-alt" aria-hidden="true" />เริ่มภารกิจ</button>
          <button type="button" className="control-button control-pause"><Icon icon="carbon:stop-filled-alt" aria-hidden="true" />หยุดชั่วคราว</button>
          <button type="button" className="control-button control-emergency"><Icon icon="ci:triangle-warning" aria-hidden="true" />หยุดฉุกเฉิน</button>
        </section>
      </div>

      <Popup isOpen={showPopup} onClose={() => setShowPopup(false)} onConfirm={data => { console.log(data); setShowPopup(false); }} />
    </div>
  );
}

export default Home;
