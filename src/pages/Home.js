import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import '../pages/Home.css';
import { Icon } from '@iconify/react';
import Popup from '../components/Popup';

function Home({onMenuClick}) {
  const [showPopup, setShowPopup] = useState(false);
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
            <p>🟢 ONLINE</p>
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