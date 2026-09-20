import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import './Mission.css';
import { Icon } from '@iconify/react';
import Popup from '../components/Popup';

function Mission({ onMenuClick }) {

  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <PageHeader
        title="ภารกิจ / แผนที่"
        subtitle="Mission / Map"
        onMenuClick={onMenuClick}
      />

      <div className="mission-content">

        {/* ส่วนหลัก */}
        <div className="mission-main">

          {/* แผนที่ */}
          <div className="mission-map-card">

            <div className="map-placeholder">
              <p>แผนที่การทำงาน</p>
              <span>Map Area</span>
            </div>

          </div>


          {/* ข้อมูลภารกิจ */}
          <div className="mission-info-card">

            <h3>ข้อมูลภารกิจ</h3>

            <div className="mission-name">
              <Icon icon="mdi:map-marker" />
              <span>สวนหลัก</span>
            </div>


            <div className="mission-info-row">
              <Icon icon="mdi:clock-outline" />
              <span>สถานะภารกิจ</span>
              <strong>ยังไม่เริ่ม</strong>
            </div>

            <div className="mission-info-row">
              <Icon icon="mdi:calendar-month-outline" />
              <span>วันที่</span>
              <strong>26/05/2567</strong>
            </div>

            <div className="mission-info-row">
              <Icon icon="mdi:clock-start" />
              <span>เวลาเริ่ม</span>
              <strong>-</strong>
            </div>

            <div className="mission-info-row">
              <Icon icon="mdi:clock-end" />
              <span>เวลาสิ้นสุด</span>
              <strong>-</strong>
            </div>

            <div className="mission-info-row">
              <Icon icon="mdi:timer-outline" />
              <span>เวลาใช้งานรวม</span>
              <strong>00:00:00</strong>
            </div>

            <div className="mission-info-row">
              <Icon icon="mdi:map-marker-distance" />
              <span>ระยะทาง</span>
              <strong>0.00 กม.</strong>
            </div>

            <div className="mission-info-row">
              <Icon icon="mdi:vector-square" />
              <span>พื้นที่ดำเนินการ</span>
              <strong>12.50 ไร่</strong>
            </div>


            {/* ปุ่มควบคุม */}

            <button
              className="mission-button start"
              onClick={() => setShowPopup(true)}
            >
              <Icon icon="carbon:play-filled-alt" />
              เริ่มภารกิจ
            </button>

            <button className="mission-button pause">
              <Icon icon="carbon:stop-filled-alt" />
              หยุดภารกิจ
            </button>

            <button className="mission-button emergency">
              <Icon icon="ci:triangle-warning" />
              หยุดฉุกเฉิน
            </button>

            <p className="mission-warning">
              <Icon icon="mdi:information-outline" />
              โปรดตรวจสอบเส้นทางและข้อมูลก่อนเริ่มภารกิจ
            </p>

          </div>

        </div>


        {/* ส่วนด้านล่าง */}

        <div className="mission-bottom">

          <div className="route-summary">

            <h3>สรุปเส้นทาง</h3>

            <div className="route-data">

              <div>
                <span>จุดเริ่มต้น</span>
                <strong>13.736421,<br />100.537812</strong>
              </div>

              <div className="arrow">→</div>

              <div>
                <span>จุดผ่านทาง</span>
                <strong>4 จุด</strong>
              </div>

              <div className="arrow">→</div>

              <div>
                <span>จุดสิ้นสุด</span>
                <strong>13.736928,<br />100.539217</strong>
              </div>

              <div className="arrow">→</div>

              <div>
                <span>เส้นทางรอบแปลง</span>
                <strong>1 รอบ</strong>
              </div>

            </div>

          </div>


          <div className="mission-legend">

            <h3>สัญลักษณ์</h3>

            <p>
              <Icon icon="mdi:map-marker" />
              จุดเริ่มต้น
            </p>

            <p>
              <Icon icon="mdi:boat" />
              ตำแหน่งเรือ
            </p>

            <p>
              <Icon icon="mdi:map-marker" />
              เส้นทางที่วางไว้
            </p>

            <p>
              <Icon icon="mdi:map-marker-alert" />
              จุดสิ้นสุด
            </p>

          </div>

        </div>

      </div>


      {/* Popup ข้อมูลการพ่นยา */}

      <Popup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onConfirm={(data) => {
          console.log("ข้อมูลการพ่นยา:", data);
          setShowPopup(false);
        }}
      />

    </>
  );
}

export default Mission;