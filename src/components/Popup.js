import React, { useState } from "react";
import "./Popup.css";
import { Icon } from "@iconify/react";

function Popup({ isOpen, onClose, onConfirm }) {

  const [chemical, setChemical] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("ลิตร");

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {

    const sprayData = {
      chemical: chemical,
      quantity: quantity,
      unit: unit
    };

    onConfirm(sprayData);
  };

  return (
    <div className="popup-overlay">

      <div className="popup-box">

        <h2>ข้อมูลการพ่นยา</h2>

        <label>น้ำยาที่ใช้</label>

        <input
          type="text"
          value={chemical}
          onChange={(e) => setChemical(e.target.value)}
          placeholder="กรอกชื่อน้ำยา"
        />

        <label>ปริมาณ</label>

        <div className="quantity-row">

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="ปริมาณ"
          />

          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="ลิตร">ลิตร</option>
            <option value="มิลลิลิตร">มิลลิลิตร</option>
          </select>

        </div>

        <div className="popup-buttons">

          <button
            className="cancel-button"
            onClick={onClose}
          >
            ยกเลิก
          </button>

          <button
            className="confirm-button"
            onClick={handleConfirm}
          >
            <Icon icon="ic:round-play-arrow" />
            ยืนยันเริ่มภารกิจ
          </button>

        </div>

      </div>

    </div>
  );
}

export default Popup;