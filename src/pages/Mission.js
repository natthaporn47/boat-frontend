import React from 'react';
import PageHeader from '../components/PageHeader';

function Mission({onMenuClick}) {
  return (
    <>
    <PageHeader title="สร้างภารกิจ" subtitle="ระบบควบคุมเรือพ่นยาอัตโนมัติ" onMenuClick={onMenuClick} />
    <div>
      <h1>ภารกิจ</h1>
      <p>หน้านี้ใช้สำหรับสร้างและควบคุมภารกิจ</p>
    </div>
    </>
  );
}

export default Mission;