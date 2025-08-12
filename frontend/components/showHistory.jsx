import React, { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";

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
  postPackage: "Gói đăng tin",
  property: "Loại hình",
  interiorStatus: "Nội thất",
};

const vipPackages = [
  { _id: '685039e4f8f1552c6378a7a5', type: "VIP1", price: 10000, expireAt: 3 },
  { _id: '685174b550c6fbcbc4efbe87', type: "VIP2", price: 20000, expireAt: 5 },
  { _id: '685174db50c6fbcbc4efbe88', type: "VIP3", price: 30000, expireAt: 7 },
];

const packageNameMap = vipPackages.reduce((acc, pkg) => {
  acc[pkg._id] = pkg.type;
  return acc;
}, {});

const EditHistoryModal = ({ history }) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const renderImage = (val, key) => {
    if (!val) return "Không rõ";

    const imageFields = ["images", "oldImages"];
    if (imageFields.includes(key)) {
      if (Array.isArray(val)) {
        return val.length === 0
          ? "Không rõ"
          : val.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Ảnh ${i + 1}`}
                style={{ maxWidth: 100, maxHeight: 100, marginRight: 8, objectFit: "cover" }}
              />
            ));
      }
      if (typeof val === "string" && val.startsWith("http")) {
        return (
          <img
            src={val}
            alt="Ảnh"
            style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }}
          />
        );
      }
    }
    return val;
  };

  const renderValue = (val, key) => {
    if (!val) return "Không rõ";

    if (key === "postPackage") {
      return packageNameMap[val] || val;
    }

    const imageFields = ["images", "oldImages"];
    if (imageFields.includes(key)) {
      return renderImage(val, key);
    }

    return val;
  };

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
                            <td className="text-danger">{renderValue(value?.old, key)}</td>
                            <td className="text-success">{renderValue(value?.new, key)}</td>
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
