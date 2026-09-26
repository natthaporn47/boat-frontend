import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import '../pages/Home.css';
import { Icon } from '@iconify/react';
import Popup from '../components/Popup';
import MapView from '../components/MapView';

function Home({onMenuClick}) {
  const [showPopup, setShowPopup] = useState(false);
  const [piOnline, setPiOnline] = useState(false);
  const [boatData, setBoatData] = useState(null);
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
  
  return (
    <>
      <PageHeader
        title="หน้าหลัก"
        subtitle="ระบบควบคุมเรือพ่นยาอัตโนมัติ"
        onMenuClick={onMenuClick}
      />
      <div className="home-content">
        {/* แถวที่ 1 */}
        <div className="status-grid">
          <div className="dashboard-card">
            <h3>สถานะเรือ</h3>
            <div className="boat-status">
              <span
                className={`boat-status-dot ${
                  piOnline ? "online" : "offline"
                }`}
              ></span>

              <span>
                {piOnline
                  ? "Raspberry Pi พร้อมใช้งาน"
                  : "Raspberry Pi ไม่พร้อมใช้งาน"}
              </span>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>ภารกิจปัจจุบัน</h3>
            <p>พ่นยาแปลง A</p>
          </div>

          <div className="dashboard-card">
            <h3>ความเร็ว</h3>
            <p>2.1 km/h</p>
          </div>
        </div>

        {/* แถวที่ 2 */}
        <div className="main-grid">
          <div className="dashboard-card location-card">
            <h3>ตำแหน่งปัจจุบัน</h3>

            <p>Latitude : 13.812345° N</p>
            <p>Longitude : 100.123456° E</p>
          </div>

          <div className="dashboard-card map-card">
            <h3>แผนที่การทำงาน</h3>
            <MapView />
            {/* ตรงนี้ค่อยใส่ Map */}
          </div>
        </div>

        {/* แถวที่ 3 */}
        <div className="bottom-grid">
          <div className="dashboard-card">
            <h3>สถานะระบบ</h3>

            <p>GPS 🟢</p>
            <p>LiDAR 🟢</p>
            <p>แบตเตอรี่ 78%</p>
          </div>

          <div className="dashboard-card control-card">
            <h3>ควบคุมเรือ</h3>

            <button
              className="control-button"
              style={{ backgroundColor: "#007bff", color: "white" }}
              onClick={() => setShowPopup(true)}
            >
              <Icon icon="carbon:play-filled-alt"></Icon>เริ่มภารกิจ
            </button>
            <button
              className="control-button"
              style={{ backgroundColor: "#fbc216f7", color: "white" }}
            >
              <Icon icon="carbon:stop-filled-alt"></Icon>หยุดชั่วคราว
            </button>
            <button
              className="control-button"
              style={{ backgroundColor: "#dc3545", color: "white" }}
            >
              <Icon icon="ci:triangle-warning"></Icon>หยุดฉุกเฉิน
            </button>
          </div>
        </div>
        <Popup
  isOpen={showPopup}
  onClose={() => setShowPopup(false)}
  onConfirm={(data) => {
    console.log(data);
    setShowPopup(false);
  }}
/>
      </div>
      
    </>
  );
}

export default Home;