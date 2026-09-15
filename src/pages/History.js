import React from "react";
import PageHeader from "../components/PageHeader";

function History({onMenuClick}) {
  return (
    <>
      <PageHeader
        title="ประวัติการทำงาน"
        subtitle="ระบบควบคุมเรือพ่นยาอัตโนมัติ"
        onMenuClick={onMenuClick}
      />
      <div className="system-status-text">
        สถานะ: ระบบจำลองทำงานปกติ
        <span className="status-dot"></span>
      </div>
    </>
  );
}

export default History;
