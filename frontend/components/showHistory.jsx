import React, { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";

// Ánh xạ field → Tiếng Việt
const fieldLabels = {
  legalDocument: "Giấy tờ pháp lý",
  amenities: "Tiện ích",
  isEditing: "Trạng thái chỉnh sửa",
  title: "Tiêu đề",
  description: "Mô tả",
  location: "Địa chỉ",
  area: "Diện tích",
  price: "Giá",
  type: "Loại bài đăng",
  postPackagename: "Gói đăng tin",
  property: "Loại hình",
  interiorStatus: "Nội thất",
};

const EditHistoryModal = ({ history }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="outline-primary" onClick={handleShow}>
        📜 Xem lịch sử chỉnh sửa
      </Button>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📜 Lịch sử chỉnh sửa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Array.isArray(history) && history.length > 0 ? (
            history.map((item, idx) => {
              const filteredChanges = Object.entries(item.editedData || {}).filter(
                ([_, value]) => value?.old !== value?.new
              );

              return (
                <div key={idx} className="mb-4">
                  <h6 className="fw-bold">
                    🕒 Chỉnh sửa lúc:{" "}
                    {item?.editedAt
                      ? new Date(item.editedAt).toLocaleString("vi-VN")
                      : "Không rõ thời gian"}
                  </h6>
                  {filteredChanges.length > 0 ? (
                    <Table striped bordered hover responsive className="mt-2">
                      <thead className="table-light">
                        <tr>
                          <th>Trường</th>
                          <th>Trước</th>
                          <th>Sau</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredChanges.map(([key, value]) => (
                          <tr key={key}>
                            <td className="fw-semibold">{fieldLabels[key] || key}</td>
                            <td className="text-danger">{value?.old ?? "Không rõ"}</td>
                            <td className="text-success">{value?.new ?? "Không rõ"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted">Không có thay đổi</p>
                  )}
                </div>
              );
            })
          ) : (
            <p>Không có lịch sử chỉnh sửa.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditHistoryModal;
