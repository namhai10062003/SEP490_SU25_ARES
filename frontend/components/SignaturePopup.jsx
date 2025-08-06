import React, { useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Modal, Button } from "react-bootstrap";

const SignaturePopup = ({ show, onClose, onSave }) => {
  const [sign, setSign] = useState(null);

  const handleClear = () => {
    sign.clear();
  };

  const handleSave = async () => {
    if (!sign || sign.isEmpty()) return alert("Bạn chưa ký!");

    const dataUrl = sign.getCanvas().toDataURL("image/png");

    // Gửi base64 ra ngoài cho component cha xử lý (lưu vào state tạm thời)
    onSave(dataUrl);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ký hợp đồng (Bên B)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ border: "2px solid black", width: "100%", height: 200 }}>
          <SignatureCanvas
            canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
            ref={(data) => setSign(data)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClear}>
          Xóa
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Lưu chữ ký
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SignaturePopup;
