import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../../../../context/authContext';
const EditVehicleModal = ({ show, onClose, vehicleData,selectedItem, onSave }) => {
    const [formData, setFormData] = useState({
      tênChủSởHữu: "",
      loạiXe: "",
      biểnSốXe: "",
      mãCănHộ: "",
      giá: "",
      ngàyĐăngKý: "",
      trạngThái: "",
      documentFront: null,
      documentFrontUrl: "",
      documentBack: null,
      documentBackUrl: "",
      removeDocumentFront: false,
      removeDocumentBack: false,
      _id: "",
    });
    const [apartments, setApartments] = useState([]);
    const { user } = useAuth();
    const [frontPreview, setFrontPreview] = useState(null);
    const [backPreview, setBackPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    // Gọi API lấy danh sách căn hộ
    useEffect(() => {
      const fetchApartments = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/apartments`
          );
          const data = res.data.data;
  
          const userId = String(user._id);
  
          // ✅ Lọc căn hộ theo user
          const filtered = data.filter((apt) => {
            const isOwner = apt.isOwner && String(apt.isOwner._id) === userId;
            const isRenter = apt.isRenter && String(apt.isRenter._id) === userId;
            if (isRenter) return true; // là người thuê thì cho hiển thị
            if (isOwner && !apt.isRenter) return true; // là chủ sở hữu và chưa có người thuê
            return false;
          });
  
          console.log("📌 Apartments fetched:", data);
          console.log("✅ Apartments filtered:", filtered);
  
          setApartments(filtered);
        } catch (error) {
          console.error("❌ Lỗi khi load apartments:", error);
          toast.error("❌ Lỗi khi lấy dữ liệu căn hộ");
        }
      };
  
      if (user?._id) {
        fetchApartments();
      }
    }, [user]);
  
    // ✅ Khi vehicleData thay đổi thì load dữ liệu cũ
    // Cập nhật dữ liệu khi vehicleData thay đổi
  useEffect(() => {
    if (vehicleData) {
      setFormData({
        _id: vehicleData._id || vehicleData.id || "",
        tênChủSởHữu: vehicleData.tênChủSởHữu || "",
        loạiXe: vehicleData.loạiXe || "",
        biểnSốXe: vehicleData.biểnSốXe || "",
        mãCănHộ: vehicleData.mãCănHộ || "",
        giá: vehicleData.giá || "",
        ngàyĐăngKý: vehicleData.ngàyĐăngKý || "",
        trạngThái: vehicleData.trạngThái || "",
        documentFront: null,
        documentFrontUrl: vehicleData.ảnhTrước || "",
        documentBack: null,
        documentBackUrl: vehicleData.ảnhSau || "",
        removeDocumentFront: false,
        removeDocumentBack: false,
      });
    }
  }, [vehicleData]);
      
    // Cập nhật preview khi chọn file mới
    useEffect(() => {
        if (formData.documentFront) {
          const reader = new FileReader();
          reader.onloadend = () => setFrontPreview(reader.result);
          reader.readAsDataURL(formData.documentFront);
        } else {
          setFrontPreview(formData.documentFrontUrl || null);
        }
      }, [formData.documentFront, formData.documentFrontUrl]);
    
      useEffect(() => {
        if (formData.documentBack) {
          const reader = new FileReader();
          reader.onloadend = () => setBackPreview(reader.result);
          reader.readAsDataURL(formData.documentBack);
        } else {
          setBackPreview(formData.documentBackUrl || null);
        }
      }, [formData.documentBack, formData.documentBackUrl]);
      const handleChange = (e) => {
        const { name, value } = e.target;
      
        setFormData(prev => ({
          ...prev,
          [name]: value,
          // Nếu đang đổi loại xe, tự gán giá tương ứng
          giá: name === "loạiXe" ? (value === "ô tô" ? "800.000VNĐ/ tháng" : "80.000VNĐ / tháng") : prev.giá
        }));
      };
      
      const handleSave = async () => {
        if (!vehicleData) {
          toast.error("❌ Không tìm thấy dữ liệu xe!");
          return;
        }
      
        setLoading(true); // bật loading
      
        try {
          const data = new FormData();
          data.append("_id", vehicleData._id || vehicleData.id);
      
          let hasChange = false;
      
          const keyMap = {
            tênChủSởHữu: "owner",
            loạiXe: "vehicleType",
            biểnSốXe: "licensePlate",
            mãCănHộ: "apartmentId",
            ngàyĐăngKý: "registerDate",
            expireDate: "expireDate",
          };
      
          Object.entries(keyMap).forEach(([frontendKey, backendKey]) => {
            const value = formData[frontendKey];
            const oldValue = vehicleData[frontendKey] || vehicleData[backendKey];
            if (value != null && value !== "" && value !== oldValue) {
              data.append(backendKey, value);
              hasChange = true;
            }
          });
      
          if (formData.documentFront instanceof File) {
            data.append("documentFront", formData.documentFront);
            hasChange = true;
          }
          if (formData.documentBack instanceof File) {
            data.append("documentBack", formData.documentBack);
            hasChange = true;
          }
      
          if (formData.removeDocumentFront) {
            data.append("removeDocumentFront", "true");
            hasChange = true;
          }
          if (formData.removeDocumentBack) {
            data.append("removeDocumentBack", "true");
            hasChange = true;
          }
      
          if (!hasChange) {
            toast.info("ℹ️ Không có thay đổi để cập nhật.");
            return;
          }
      
          console.log("🔹 FormData _id:", data.get("_id"));
      
          // Nếu onSave là async, đợi nó xong mới tắt loading
          await onSave(data);
        } catch (error) {
          console.error(error);
          toast.error("❌ Có lỗi xảy ra khi lưu!");
        } finally {
          setLoading(false); // tắt loading dù thành công hay lỗi
        }
      };
      
      
      
    // Hàm xóa ảnh trước
  const handleRemoveFront = () => {
    setFormData({
      ...formData,
      documentFront: null,
      documentFrontUrl: null,
      removeDocumentFront: true,
    });
  };

  // Hàm xóa ảnh sau
  const handleRemoveBack = () => {
    setFormData({
      ...formData,
      documentBack: null,
      documentBackUrl: null,
      removeDocumentBack: true,
    });
  };

  
  return (
    <Modal show={show} onHide={onClose} centered size="lg">
    <Modal.Header closeButton className="bg-primary text-white">
      <Modal.Title>✏️ Chỉnh sửa thông tin xe</Modal.Title>
    </Modal.Header>
  
    <Modal.Body className="bg-light">
      <Form>
        <div className="row g-3">
          {/* Tên chủ sở hữu */}
          <div className="col-md-6">
            <Form.Label className="fw-semibold">Tên chủ sở hữu</Form.Label>
            <Form.Control
              type="text"
              name="tênChủSởHữu"
              value={formData.tênChủSởHữu}
              onChange={handleChange}
              placeholder="Nhập tên chủ sở hữu"
            />
          </div>
  
          {/* Loại xe */}
          <div className="col-md-6">
            <Form.Label className="fw-semibold">Loại xe</Form.Label>
            <Form.Select
              name="loạiXe"
              value={formData.loạiXe}
              onChange={handleChange}
            >
              <option value="xe máy">Xe máy</option>
              <option value="ô tô">Ô tô</option>
            </Form.Select>
          </div>
  
          {/* Biển số xe */}
          <div className="col-md-6">
            <Form.Label className="fw-semibold">Biển số xe</Form.Label>
            <Form.Control
              type="text"
              name="biểnSốXe"
              value={formData.biểnSốXe}
              onChange={handleChange}
              placeholder="Ví dụ: 30F-12345"
            />
          </div>
  
          {/* Mã căn hộ */}
          <div className="col-md-6">
            <Form.Label className="fw-semibold">Mã căn hộ</Form.Label>
            <Form.Select
              name="apartmentCode"
              value={formData.mãCănHộ}
              onChange={handleChange}
            >
              <option value="">-- Chọn căn hộ --</option>
              {apartments.map((apt) => (
                <option key={apt._id} value={apt.apartmentCode}>
                  {apt.apartmentCode}
                </option>
              ))}
            </Form.Select>
          </div>
  
          {/* Giá */}
          <div className="col-md-6">
            <Form.Label className="fw-semibold">Giá</Form.Label>
            <Form.Control
              type="text"
              name="giá"
              value={formData.giá}
              onChange={handleChange}
              placeholder="Nhập giá"
            />
          </div>
  
          {/* Ngày đăng ký */}
          <div className="col-md-6">
            <Form.Label className="fw-semibold">Ngày đăng ký</Form.Label>
            <Form.Control
              type="date"
              name="ngàyĐăngKý"
              value={formData.ngàyĐăngKý}
              onChange={handleChange}
            />
          </div>
  
          {/* Ảnh giấy tờ xe trước */}
          <div className="col-12">
            <Form.Label className="fw-semibold">Ảnh giấy tờ xe (mặt trước)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setFormData({
                    ...formData,
                    documentFront: e.target.files[0],
                    removeDocumentFront: false,
                  });
                }
              }}
            />
            {/* Ảnh giấy tờ xe trước */}
{frontPreview && (
  <div className="mt-2 position-relative" style={{ maxWidth: "400px", margin: "auto" }}>
    <img
      src={frontPreview}
      alt="Giấy tờ xe trước"
      className="img-fluid rounded shadow-sm"
      style={{ maxHeight: "200px", objectFit: "contain", display: "block" }}
    />
    <button
      type="button"
      className="btn btn-sm btn-danger position-absolute"
      style={{ top: "5px", right: "5px" }}
      onClick={handleRemoveFront}
    >
      X
    </button>
  </div>
)}
          </div>
  
          {/* Ảnh giấy tờ xe sau */}
          <div className="col-12">
            <Form.Label className="fw-semibold">Ảnh giấy tờ xe (mặt sau)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setFormData({
                    ...formData,
                    documentBack: e.target.files[0],
                    removeDocumentBack: false,
                  });
                }
              }}
            />
            {/* Ảnh giấy tờ xe sau */}
{backPreview && (
  <div className="mt-2 position-relative" style={{ maxWidth: "400px", margin: "auto" }}>
    <img
      src={backPreview}
      alt="Giấy tờ xe sau"
      className="img-fluid rounded shadow-sm"
      style={{ maxHeight: "200px", objectFit: "contain", display: "block" }}
    />
    <button
      type="button"
      className="btn btn-sm btn-danger position-absolute"
      style={{ top: "5px", right: "5px" }}
      onClick={handleRemoveBack}
    >
      X
    </button>
  </div>
)}
          </div>
        </div>
      </Form>
    </Modal.Body>
  
    <Modal.Footer className="bg-light">
      <Button variant="secondary" onClick={onClose}>
        Đóng
      </Button>
      <Button variant="primary" onClick={handleSave} disabled={loading}>
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />{" "}
            Đang lưu...
          </>
        ) : (
          "Lưu thay đổi"
        )}
      </Button>
    </Modal.Footer>
  </Modal>
  
  );
};

export default EditVehicleModal;
