import { fireEvent, render, screen, within } from "@testing-library/react";
import History from "./History";

jest.mock("@iconify/react", () => ({ Icon: () => null }));

function filterDates(start, end) {
  fireEvent.change(screen.getByLabelText("วันที่เริ่มต้น"), { target: { value: start } });
  fireEvent.change(screen.getByLabelText("วันที่สิ้นสุด"), { target: { value: end } });
  fireEvent.click(screen.getByRole("button", { name: "กรองข้อมูล" }));
}

test("filters both boundaries inclusively and recalculates summaries from visible missions", () => {
  render(<History />);
  expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(11);
  filterDates("2026-11-03", "2026-11-03");
  expect(screen.getByRole("status")).toHaveTextContent("พบ 2 รายการ");
  expect(screen.getByText("ทดสอบเส้นทางร่องสวนฝั่งเหนือ")).toBeInTheDocument();
  expect(screen.getByText("พ่นยาแปลงส้มโอ B")).toBeInTheDocument();
  expect(screen.queryByText("DEMO-024")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "พื้นที่รวม" }).parentElement).toHaveTextContent("7.80 ไร่");
  expect(screen.getByRole("heading", { name: "เวลาใช้งานรวม" }).parentElement).toHaveTextContent("1 ชม. 4 นาที");
  fireEvent.click(screen.getByRole("button", { name: "ล้างตัวกรอง" }));
  expect(screen.getByRole("status")).toHaveTextContent("พบ 24 รายการ");
});

test("paginates 10, 10, and 4 missions and resets the page when filtering", () => {
  render(<History />);
  expect(screen.getByRole("button", { name: "ก่อนหน้า" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "ดูรายละเอียด DEMO-024" }));
  fireEvent.click(screen.getByRole("button", { name: "ถัดไป" }));
  expect(screen.getByText("แสดง 11–20 จาก 24 รายการ")).toBeInTheDocument();
  expect(screen.queryByText("DEMO-024")).not.toBeInTheDocument();
  expect(screen.queryByText("น้ำยาจำลอง A: 16 ลิตร")).not.toBeInTheDocument();
  expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(11);
  expect(screen.getByRole("heading", { name: "ภารกิจทั้งหมด" }).parentElement).toHaveTextContent("24");
  fireEvent.click(screen.getByRole("button", { name: "หน้าที่ 3" }));
  expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(5);
  expect(screen.getByRole("button", { name: "ถัดไป" })).toBeDisabled();
  expect(screen.getByText("แสดง 21–24 จาก 24 รายการ")).toBeInTheDocument();
  filterDates("2026-11-03", "2026-11-03");
  expect(screen.getByRole("button", { name: "หน้าที่ 1" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByText("แสดง 1–2 จาก 2 รายการ")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "ถัดไป" })).toBeDisabled();
});

test("opens different details for spraying and survey missions", () => {
  render(<History />);
  fireEvent.click(screen.getByRole("button", { name: "ดูรายละเอียด DEMO-024" }));
  expect(screen.getByText("น้ำยาจำลอง A: 16 ลิตร")).toBeInTheDocument();
  expect(screen.getByText("น้ำยาจำลอง B: 2,000 มิลลิลิตร")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "ดูรายละเอียด DEMO-023" }));
  expect(screen.queryByText("น้ำยาจำลอง A: 16 ลิตร")).not.toBeInTheDocument();
  expect(screen.getByText("ไม่ได้ใช้น้ำยาในภารกิจนี้")).toBeInTheDocument();
});

test("combines date and status filters, resets pagination and restores all records", () => {
  render(<History />);
  fireEvent.click(screen.getByRole("button", { name: "หน้าที่ 3" }));
  fireEvent.change(screen.getByLabelText("สถานะภารกิจ"), { target: { value: "STOPPED" } });
  // The selection is a draft until the filter form is submitted.
  expect(screen.getByRole("status")).toHaveTextContent("พบ 24 รายการ");
  filterDates("2026-11-03", "2026-11-03");
  expect(screen.getByRole("status")).toHaveTextContent("พบ 1 รายการ");
  expect(screen.getByText("DEMO-022")).toBeInTheDocument();
  expect(screen.queryByText("DEMO-023")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "หน้าที่ 1" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("heading", { name: "ระยะทางรวม" }).parentElement).toHaveTextContent("1.82 กม.");
  fireEvent.click(screen.getByRole("button", { name: "ล้างตัวกรอง" }));
  expect(screen.getByLabelText("สถานะภารกิจ")).toHaveValue("");
  expect(screen.getByRole("status")).toHaveTextContent("พบ 24 รายการ");
});

test("rejects an inverted range and handles dates without records", () => {
  render(<History />);
  filterDates("2026-11-04", "2026-10-13");
  expect(screen.getByRole("alert")).toHaveTextContent("วันที่เริ่มต้นต้องไม่อยู่หลังวันที่สิ้นสุด");
  expect(screen.getByRole("status")).toHaveTextContent("พบ 24 รายการ");
  filterDates("2026-01-01", "2026-01-31");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("พบ 0 รายการ");
  expect(screen.getByText(/ไม่พบภารกิจในช่วงวันที่เลือก/)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "พื้นที่รวม" }).parentElement).toHaveTextContent("0.00 ไร่");
});
