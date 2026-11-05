import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import { Icon } from "@iconify/react";
import "../pages/History.css";
import { mockMissionHistory, missionStatuses } from "../data/mockMissionHistory";

const formatDate = date => new Date(`${date}T00:00:00+07:00`).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" });
const formatDuration = minutes => `${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`;
const PAGE_SIZE = 10;

function History({ onMenuClick }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [range, setRange] = useState({ start: "", end: "" });
  const [filterError, setFilterError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const missions = mockMissionHistory.filter(mission =>
    (!range.start || mission.date >= range.start) && (!range.end || mission.date <= range.end)
  );
  const totalArea = missions.reduce((sum, mission) => sum + mission.areaRai, 0);
  const totalMinutes = missions.reduce((sum, mission) => sum + mission.durationMinutes, 0);
  const pageCount = Math.max(1, Math.ceil(missions.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const visibleMissions = missions.slice(pageStart, pageStart + PAGE_SIZE);

  function changePage(nextPage) {
    setPage(nextPage);
    setExpandedId(null);
  }

  function applyFilter(event) {
    event.preventDefault();
    if (startDate && endDate && startDate > endDate) {
      setFilterError("วันที่เริ่มต้นต้องไม่อยู่หลังวันที่สิ้นสุด");
      return;
    }
    setFilterError("");
    setExpandedId(null);
    setPage(1);
    setRange({ start: startDate, end: endDate });
  }

  function resetFilter() {
    setStartDate("");
    setEndDate("");
    setRange({ start: "", end: "" });
    setFilterError("");
    setExpandedId(null);
    setPage(1);
  }
  return (
    <>
      <PageHeader
        title="ประวัติการทำงาน"
        onMenuClick={onMenuClick}
      />
      <div className="history-content">
        <p className="history-demo-notice"><Icon icon="mdi:information-outline" aria-hidden="true" /> ข้อมูลตัวอย่างสมมติ {mockMissionHistory.length} ภารกิจ สำหรับทดลองหน้าประวัติ ยังไม่ได้เชื่อมฐานข้อมูลหรือผลจากเรือจริง</p>
        <form className="history-filter" onSubmit={applyFilter}>
          <h2 className="history-filter-title">ช่วงวันที่</h2>
          <div className="date-range">
            <label className="date-box"><span>วันที่เริ่มต้น</span><input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} /></label>
            <span className="date-separator" aria-hidden="true">−</span>
            <label className="date-box"><span>วันที่สิ้นสุด</span><input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} /></label>
            <button className="filter-button" type="submit"><Icon icon="mi:filter" aria-hidden="true" />กรองข้อมูล</button>
            <button className="history-reset-button" type="button" onClick={resetFilter}>ล้างตัวกรอง</button>
          </div>
          {filterError && <p className="history-filter-error" role="alert">{filterError}</p>}
        </form>

        <div className="history-summary">
          <div className="history-card">
            <h3>ภารกิจทั้งหมด</h3>
            <p>{missions.length}</p>
          </div>

          <div className="history-card">
            <h3>สำเร็จ</h3>
            <p>{missions.filter(mission => mission.status === "COMPLETED").length}</p>
          </div>

          <div className="history-card">
            <h3>พื้นที่รวม</h3>
            <p>{totalArea.toFixed(2)} ไร่</p>
          </div>

          <div className="history-card">
            <h3>เวลาใช้งานรวม</h3>
            <p>{formatDuration(totalMinutes)}</p>
          </div>
        </div>
        <section className="history-list" aria-labelledby="history-list-title">
          <div className="history-list-heading"><h2 id="history-list-title">รายการภารกิจย้อนหลัง</h2><span role="status">พบ {missions.length} รายการ</span></div>
          <div className="history-table-scroll">
            <table className="history-table">
              <thead><tr><th scope="col">ภารกิจ</th><th scope="col">วันที่ / เวลา</th><th scope="col">สถานะ</th><th scope="col">พื้นที่ที่ทำได้</th><th scope="col">ระยะทาง</th><th scope="col">รายละเอียด</th></tr></thead>
              <tbody>
                {visibleMissions.map(mission => {
                  const status = missionStatuses[mission.status];
                  const expanded = expandedId === mission.id;
                  return <React.Fragment key={mission.id}>
                    <tr>
                      <th scope="row"><span className="history-mission-name">{mission.name}</span><small>{mission.id}</small></th>
                      <td data-label="วันที่ / เวลา"><div><span>{formatDate(mission.date)}</span><small>{mission.startTime}–{mission.endTime} น.</small></div></td>
                      <td data-label="สถานะ"><span className={`history-status ${status.className}`}>{status.label}</span></td>
                      <td data-label="พื้นที่ที่ทำได้">{mission.areaRai.toFixed(2)} ไร่</td>
                      <td data-label="ระยะทาง">{mission.distanceKm.toFixed(2)} กม.</td>
                      <td className="history-row-action"><button className="history-detail-button" type="button" aria-label={`${expanded ? "ซ่อน" : "ดู"}รายละเอียด ${mission.id}`} aria-expanded={expanded} aria-controls={`history-detail-${mission.id}`} onClick={() => setExpandedId(expanded ? null : mission.id)}>{expanded ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}</button></td>
                    </tr>
                    {expanded && <tr className="history-detail-row" id={`history-detail-${mission.id}`}><td colSpan="6">
                      <div className="history-detail-grid">
                        <div><h3>ผลการทำงาน</h3><p>เวลาทำงาน: {formatDuration(mission.durationMinutes)}</p><p>พื้นที่ตามแผน: {mission.plannedArea.toFixed(2)} ไร่</p><p>พื้นที่ที่ทำได้: {mission.areaRai.toFixed(2)} ไร่</p></div>
                        <div><h3>ข้อมูลน้ำยาตัวอย่าง</h3>{mission.chemicals.length ? <ul>{mission.chemicals.map(chemical => <li key={chemical.name}>{chemical.name}: {chemical.quantity.toLocaleString("th-TH")} {chemical.unit}</li>)}</ul> : <p>ไม่ได้ใช้น้ำยาในภารกิจนี้</p>}</div>
                        <div><h3>หมายเหตุสมมติ</h3><p>{mission.notes}</p></div>
                      </div>
                    </td></tr>}
                  </React.Fragment>;
                })}
                {missions.length === 0 && <tr><td className="history-empty" colSpan="6">ไม่พบภารกิจในช่วงวันที่เลือก ลองเปลี่ยนช่วงวันที่หรือล้างตัวกรอง</td></tr>}
              </tbody>
            </table>
          </div>
          <nav className="history-pagination" aria-label="เปลี่ยนหน้าประวัติ">
            <span>แสดง {missions.length ? pageStart + 1 : 0}–{Math.min(pageStart + PAGE_SIZE, missions.length)} จาก {missions.length} รายการ</span>
            <div className="history-pagination-buttons">
              <button type="button" disabled={page === 1} onClick={() => changePage(page - 1)}>ก่อนหน้า</button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" aria-label={`หน้าที่ ${number}`} aria-current={page === number ? "page" : undefined} disabled={missions.length === 0} onClick={() => changePage(number)}>{number}</button>)}
              <button type="button" disabled={page >= pageCount} onClick={() => changePage(page + 1)}>ถัดไป</button>
            </div>
          </nav>
        </section>
      </div>
    </>
  );
}

export default History;
