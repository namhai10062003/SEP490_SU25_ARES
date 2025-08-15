import React from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function BillPopup({ show, onClose, bill }) {
  const formatMonthYear = (month) => {
    if (!month) return "";
    let [y, m] = month.split("-");
    if (!m || !y) return "";
    return `${m.padStart(2, "0")}/${y}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Modal.Body className="py-4 shadow rounded">
          <h4 className="fw-bold text-primary text-center mb-4">
            Hóa đơn tháng {formatMonthYear(bill.month)}
          </h4>

          <Table bordered hover responsive size="sm" className="mb-3">
            <tbody>
              <tr>
                <th>Mã giao dịch</th>
                <td>{bill.orderCode || bill._id}</td>
              </tr>
              <tr>
                <th>Tên người dùng</th>
                <td>{bill.ownerName}</td>
              </tr>
              {/* <tr>
                <th>Ngày thanh toán</th>
                <td>{formatDate(bill.paymentDate)}</td>
              </tr> */}
              <tr>
                <th>Tổng tiền</th>
                <td>{bill.total?.toLocaleString("vi-VN")} VNĐ</td>
              </tr>
              <tr>
                <th>Phí quản lý</th>
                <td>{bill.managementFee?.toLocaleString("vi-VN")} VNĐ</td>
              </tr>
              <tr>
                <th>Phí nước</th>
                <td>{bill.waterFee?.toLocaleString("vi-VN")} VNĐ</td>
              </tr>
              <tr>
                <th>Phí gửi xe</th>
                <td>{bill.parkingFee?.toLocaleString("vi-VN")} VNĐ</td>
              </tr>
              <tr>
                <th>Phương thức thanh toán</th>
                <td>PayOS</td>
              </tr>
              <tr>
                <th>Trạng thái thanh toán</th>
                <td
                  className={
                    bill.paymentStatus === "paid"
                      ? "text-success fw-bold"
                      : "text-danger fw-bold"
                  }
                >
                  {bill.paymentStatus === "paid" ? (
                    <>
                      <FaCheckCircle className="me-1" /> Đã thanh toán
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="me-1" /> Chưa thanh toán
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </Table>

          <div className="text-center mt-4">
            <Button
              variant="outline-primary"
              className="rounded-pill px-4 shadow-sm"
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        </Modal.Body>
      </motion.div>
    </Modal>
  );
}
