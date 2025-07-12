import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function BillPopup({ show, onClose, bill }) {
  const getMonthText = (month) => {
    if (!month) return "";
    const [m, y] = month.split("/");
    return `tháng ${parseInt(m, 10)}/${y}`;
  };

  return (
    <Modal show={show} onHide={onClose} centered>
  <Modal.Body className="text-center py-4">
    <h4 className="fw-bold text-primary mb-3">Hóa đơn tháng {bill.month}</h4>
    <p className="text-muted">Mã giao dịch: <br /><span className="fw-semibold">{bill.orderCode || bill._id}</span></p>
    <p className="text-muted">Tên người dùng: <br /><span className="fw-semibold">{bill.ownerName}</span></p>
    <h5 className="fw-bold mt-2">Tổng tiền: {bill.total?.toLocaleString("vi-VN")} VNĐ</h5>
    <div className={`mt-3 ${bill.paymentStatus === "paid" ? "text-success" : "text-danger"}`}>
      {bill.paymentStatus === "paid" ? "✅ Đã thanh toán" : "❌ Chưa thanh toán"}
    </div>
    <Button variant="outline-primary" className="mt-4 rounded-pill px-4" onClick={onClose}>Đóng</Button>
  </Modal.Body>
</Modal>
  );
}
