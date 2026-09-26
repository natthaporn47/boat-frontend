import React, { useState } from "react";
import "./Popup.css";
import { Icon } from "@iconify/react";

function Popup({ isOpen, onClose, onConfirm }) {
  const [chemicals, setChemicals] = useState([
    { chemical: "", quantity: "", unit: "ลิตร" }
  ]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    const sprayData = {
      ...chemicals[0],
      chemicals: chemicals.map((item) => ({ ...item }))
    };

    onConfirm(sprayData);
  };

  const handleClose = () => {
    setChemicals([{ chemical: "", quantity: "", unit: "ลิตร" }]);
    onClose();
  };

  const handleChemicalCountChange = (event) => {
    const count = Number(event.target.value);
    setChemicals((currentChemicals) =>
      Array.from({ length: count }, (_, index) =>
        currentChemicals[index] || { chemical: "", quantity: "", unit: "ลิตร" }
      )
    );
  };

  const updateChemical = (index, field, value) => {
    setChemicals((currentChemicals) =>
      currentChemicals.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="popup-overlay">

      <div className="popup-box">
        <button
          className="popup-close-button"
          type="button"
          onClick={handleClose}
          aria-label="ปิดหน้าต่าง"
          title="ปิด"
        >
          <Icon icon="bitcoin-icons:cross-outline" />
        </button>

        <form onSubmit={(event) => {
          event.preventDefault();
          handleConfirm();
        }}>
          <h2>ข้อมูลการพ่นยา</h2>

          <label htmlFor="chemical-count">จำนวนชนิดน้ำยา</label>
          <select
            id="chemical-count"
            value={chemicals.length}
            onChange={handleChemicalCountChange}
          >
            {Array.from({ length: 5 }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>{count} ชนิด</option>
            ))}
          </select>

          {chemicals.map((item, index) => (
            <div className="chemical-entry" key={index}>
              <h3>น้ำยาชนิดที่ {index + 1}</h3>

              <label htmlFor={`chemical-name-${index}`}>ชื่อยา</label>
              <input
                id={`chemical-name-${index}`}
                type="text"
                value={item.chemical}
                onChange={(event) => updateChemical(index, "chemical", event.target.value)}
                placeholder="กรอกชื่อน้ำยา"
              />

              <label htmlFor={`chemical-quantity-${index}`}>ปริมาณ</label>
              <div className="quantity-row">
                <input
                  id={`chemical-quantity-${index}`}
                  type="number"
                  min="0.00"
                  step="any"
                  value={item.quantity}
                  onChange={(event) => updateChemical(index, "quantity", event.target.value)}
                  placeholder="ปริมาณ"
                />
                <select
                  aria-label={`หน่วยปริมาณน้ำยาชนิดที่ ${index + 1}`}
                  value={item.unit}
                  onChange={(event) => updateChemical(index, "unit", event.target.value)}
                >
                  <option value="ลิตร">ลิตร</option>
                  <option value="มิลลิลิตร">มิลลิลิตร</option>
                </select>
              </div>
            </div>
          ))}

          <div className="popup-buttons">
            <button className="cancel-button" type="button" onClick={handleClose}>
              ยกเลิก
            </button>
            <button className="confirm-button" type="submit">
              <Icon icon="ic:round-play-arrow" />
              ยืนยันเริ่มภารกิจ
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}

export default Popup;