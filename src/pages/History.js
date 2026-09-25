import React from "react";
import PageHeader from "../components/PageHeader";
import { Icon } from "@iconify/react";
import "../pages/History.css";

function History({ onMenuClick }) {
  return (
    <>
      <PageHeader
        title="ประวัติการทำงาน"
        onMenuClick={onMenuClick}
      />
      <div className="history-content">
        <div className="history-filter">

  <label>ช่วงวันที่</label>

  <div className="date-range">

    <div className="date-box">
      <span>วันที่เริ่มต้น</span>

      <input
        type="date"
      />
    </div>

    <div className="date-separator">−</div>

    <div className="date-box">
      <span>วันที่สิ้นสุด</span>

      <input
        type="date"
      />
    </div>

    <button className="filter-button">
      <Icon icon="mi:filter" />
      กรองข้อมูล
    </button>

  </div>

</div>

        <div className="history-summary">
          <div className="history-card">
            <h3>ภารกิจทั้งหมด</h3>
            <p>5</p>
          </div>

          <div className="history-card">
            <h3>สำเร็จ</h3>
            <p>4</p>
          </div>

          <div className="history-card">
            <h3>พื้นที่รวม</h3>
            <p>47.90 ไร่</p>
          </div>

          <div className="history-card">
            <h3>เวลาใช้งานรวม</h3>
            <p>4 ชม. 28 นาที</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default History;
