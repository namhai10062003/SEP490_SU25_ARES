import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import SignatureCanvas from "react-signature-canvas";

const SignaturePopup = ({ show, onClose, onSave, party }) => {
  const [sign, setSign] = useState(null);

  const handleClear = () => {
    sign.clear();
  };

  const handleSave = () => {
    if (!sign || sign.isEmpty()) return alert("Bạn chưa ký!");

    const dataUrl = sign.getCanvas().toDataURL("image/png");
    onSave(dataUrl);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ký hợp đồng ({party === "A" ? "Bên A" : "Bên B"})</Modal.Title>
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
