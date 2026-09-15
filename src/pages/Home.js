import React from 'react';
import PageHeader from '../components/PageHeader';

function Home({onMenuClick}) {
  return (
    <>
    <PageHeader title="หน้าหลัก" subtitle="ระบบควบคุมเรือพ่นยาอัตโนมัติ" onMenuClick={onMenuClick} />
    <div className="home-page">
      <h1>หน้าหลัก</h1>
      <p>ระบบควบคุมเรือพ่นยาอัตโนมัติ</p>
    </div>
    </>
  );
}

export default Home;