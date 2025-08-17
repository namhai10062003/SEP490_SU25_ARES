import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
const UpdateResidentModal = ({ show, onClose, resident, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    relationWithOwner: "",
    moveInDate: "",
    nationality: "Việt Nam",
    idNumber: "",
    issueDate: "",
    documentFront: null,
    documentBack: null,
  });
  const [frontPreview, setFrontPreview] = useState(
    resident?.documentFront || null
  );
  const [backPreview, setBackPreview] = useState(
    resident?.documentBack || null
  );

  const [removeFront, setRemoveFront] = useState(false);
  const [removeBack, setRemoveBack] = useState(false);

  const [isAdult, setIsAdult] = useState(false);
  const [loading, setLoading] = useState(false);
const frontInputRef = useRef();
const backInputRef = useRef();
  useEffect(() => {
    if (resident) {
      console.log("Resident nhận được:", resident);
      setFormData({
        fullName: resident.fullName || "",
        gender: resident.gender || "",
        dateOfBirth: resident.dateOfBirth
          ? resident.dateOfBirth.slice(0, 10)
          : "",
        relationWithOwner: resident.relationWithOwner || "",
        moveInDate: resident.moveInDate ? resident.moveInDate.slice(0, 10) : "",
        nationality: resident.nationality || "Việt Nam", // fallback mặc định
        idNumber: resident.idNumber || "",
        issueDate: resident.issueDate ? resident.issueDate.slice(0, 10) : "",
        documentFront: resident.documentFront || null,
        documentBack: resident.documentBack || null,
      });
      // Tính tuổi ngay khi load dữ liệu cũ
    if (resident.dateOfBirth) {
        const dob = new Date(resident.dateOfBirth);
        const ageDifMs = Date.now() - dob.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        setIsAdult(age >= 16);
      }
      setFrontPreview(resident.documentFront || null);
      setBackPreview(resident.documentBack || null);
      setRemoveFront(false);
      setRemoveBack(false);
    }
  }, [resident]);

  const handleChange = (e) => {
    const { name, files, value } = e.target;
  
    if (files && files[0]) {
      const file = files[0];
      const extension = file.name.split(".").pop().toLowerCase();
  
      // ✅ Kiểm tra file zip
      if (extension === "zip") {
        toast.error("Không được upload file .zip");
        // Reset input file tương ứng
        if (name === "documentFront" && frontInputRef.current) frontInputRef.current.value = "";
        if (name === "documentBack" && backInputRef.current) backInputRef.current.value = "";
        return;
      }
  
      // Giữ nguyên logic hiện tại
      setFormData((prev) => ({ ...prev, [name]: file }));
  
      if (name === "documentFront") setRemoveFront(false);
      if (name === "documentBack") setRemoveBack(false);
  
      const reader = new FileReader();
      reader.onload = () => {
        if (name === "documentFront") setFrontPreview(reader.result);
        else if (name === "documentBack") setBackPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      let newValue = value;
      // Giới hạn độ dài 10 ký tự
      if (name === "dateOfBirth" && value.length > 10) {
        newValue = value.slice(0, 10);
      }
  
      setFormData((prev) => ({ ...prev, [name]: newValue }));
  
      if (name === "dateOfBirth") {
        const dob = new Date(newValue);
        if (!isNaN(dob)) {
          const ageDifMs = Date.now() - dob.getTime();
          const ageDate = new Date(ageDifMs);
          const age = Math.abs(ageDate.getUTCFullYear() - 1970);
          setIsAdult(age >= 16);
        }
      }
    }
  };
  
  

  // handleSubmit chỉ append dữ liệu người dùng và flags ảnh
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resident?._id) return;
    setLoading(true);
    const errors = [];
  
    // Validate các trường cơ bản
    if (!formData.fullName?.trim())
      errors.push("Họ và tên không được để trống.");
    if (!formData.gender) errors.push("Giới tính không được để trống.");
    if (!formData.dateOfBirth) errors.push("Ngày sinh không được để trống.");
    if (!formData.relationWithOwner?.trim())
      errors.push("Quan hệ với chủ hộ không được để trống.");
    if (!formData.moveInDate)
      errors.push("Ngày chuyển đến không được để trống.");
    if (!formData.nationality?.trim())
      errors.push("Quốc tịch không được để trống.");
    if (!formData.idNumber?.trim())
      errors.push("Số CCCD/CMND không được để trống.");
    if (!formData.issueDate) errors.push("Ngày cấp không được để trống.");
  
    // Tính tuổi
    const dob = formData.dateOfBirth ? new Date(formData.dateOfBirth) : null;
    let age = 0;
    if (dob) {
      const ageDifMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDifMs);
      age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }
  
    // Validate CCCD/Giấy khai sinh
    if (age >= 16) {
      if (!formData.documentFront) errors.push("CCCD mặt trước là bắt buộc.");
      if (!formData.documentBack) errors.push("CCCD mặt sau là bắt buộc.");
    } else {
      if (!formData.documentFront)
        errors.push("Ảnh giấy khai sinh là bắt buộc.");
    }
  
    if (errors.length > 0) {
      // Hiển thị toast cho từng lỗi
      errors.forEach((err) => toast.error(err, { autoClose: 3000 }));
      setLoading(false); // ❌ nhớ tắt loading nếu validate fail
      return;
    }
  
    // Nếu validate xong → gửi form
    const data = new FormData();
    for (let key in formData) {
      if (formData[key] != null) data.append(key, formData[key]);
    }
    if (removeFront) data.append("removeFront", "true");
    if (removeBack) data.append("removeBack", "true");
  
    try {
      await onUpdate(resident._id, data, resident);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Có lỗi khi cập nhật!");
    } finally {
      setLoading(false); // ✅ luôn tắt loading sau khi gọi API xong
    }
  };
  

  return (
    <Modal
    show={show}
    onHide={onClose}
    size="lg"
    centered
    backdrop="static" // ✅ backdrop tĩnh, click ngoài không tắt modal
  >
    <Modal.Header closeButton className="bg-primary text-white">
      <Modal.Title>📝 Chỉnh sửa nhân khẩu</Modal.Title>
    </Modal.Header>
  
    <Modal.Body className="bg-light">
      <Form onSubmit={handleSubmit}>
        <div className="row">
          {/* Họ và tên */}
          <Form.Group className="mb-3 col-md-6">
            <Form.Label className="fw-bold">Họ và tên</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
            />
          </Form.Group>
  
          {/* Giới tính */}
          <Form.Group className="mb-3 col-md-6">
            <Form.Label className="fw-bold">Giới tính</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </Form.Select>
          </Form.Group>
  
          {/* Ngày sinh */}
          <Form.Group className="mb-3 col-md-6">
            <Form.Label className="fw-bold">Ngày sinh</Form.Label>
            <Form.Control
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              onInput={(e) => {
                if (e.target.value.length > 10)
                  e.target.value = e.target.value.slice(0, 10);
              }}
            />
          </Form.Group>
  
          {/* Quan hệ với chủ hộ */}
          <Form.Group className="mb-3 col-md-6">
            <Form.Label className="fw-bold">Quan hệ với chủ hộ</Form.Label>
            <Form.Control
              type="text"
              name="relationWithOwner"
              value={formData.relationWithOwner}
              onChange={handleChange}
              placeholder="Ví dụ: Con, Vợ, Chồng..."
            />
          </Form.Group>
  
          {/* Ngày chuyển đến */}
          <Form.Group className="mb-3 col-md-6">
            <Form.Label className="fw-bold">Ngày chuyển đến</Form.Label>
            <Form.Control
              type="date"
              name="moveInDate"
              value={formData.moveInDate}
              onChange={handleChange}
            />
          </Form.Group>
  
          {/* Quốc tịch */}
          <Form.Group className="mb-3 col-md-6">
            <Form.Label className="fw-bold">Quốc tịch</Form.Label>
            <Form.Control
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              placeholder="Nhập quốc tịch"
            />
          </Form.Group>
  
          {/* Số CCCD */}
          <Form.Group className="mb-3 col-md-6">
            <Form.Label className="fw-bold">Số CCCD/CMND</Form.Label>
            <Form.Control
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="Nhập số CCCD/CMND"
            />
          </Form.Group>
  
          {/* Ngày cấp */}
          <Form.Group className="mb-3 col-md-6">
            <Form.Label className="fw-bold">Ngày cấp</Form.Label>
            <Form.Control
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
            />
          </Form.Group>
        </div>
  
        {/* CCCD mặt trước / giấy khai sinh */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">
            {isAdult ? "📄 CCCD mặt trước" : "📄 Giấy khai sinh"}
          </Form.Label>
          <Form.Control
            type="file"
            name="documentFront"
            onChange={handleChange}
            ref={frontInputRef}
          />
          {frontPreview && (
            <div className="position-relative d-inline-block mt-2">
              <img
                src={frontPreview}
                alt={isAdult ? "Mặt trước CCCD" : "Giấy khai sinh"}
                className="rounded shadow border"
                style={{ maxWidth: "200px", cursor: "pointer" }}
                onClick={() => window.open(frontPreview, "_blank")}
              />
              <Button
                variant="danger"
                size="sm"
                className="position-absolute top-0 end-0 p-1 rounded-circle shadow-sm"
                style={{ transform: "translate(30%, -30%)" }}
                onClick={() => {
                  setFrontPreview(null);
                  setFormData((prev) => ({ ...prev, documentFront: null }));
                  setRemoveFront(true);
                  if (frontInputRef.current) frontInputRef.current.value = "";
                }}
              >
                ❌
              </Button>
            </div>
          )}
        </Form.Group>
  
        {/* CCCD mặt sau */}
        {isAdult && (
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">📄 CCCD mặt sau</Form.Label>
            <Form.Control
              type="file"
              name="documentBack"
              onChange={handleChange}
              ref={backInputRef}
            />
            {backPreview && (
              <div className="position-relative d-inline-block mt-2">
                <img
                  src={backPreview}
                  alt="Mặt sau CCCD"
                  className="rounded shadow border"
                  style={{ maxWidth: "200px", cursor: "pointer" }}
                  onClick={() => window.open(backPreview, "_blank")}
                />
                <Button
                  variant="danger"
                  size="sm"
                  className="position-absolute top-0 end-0 p-1 rounded-circle shadow-sm"
                  style={{ transform: "translate(30%, -30%)" }}
                  onClick={() => {
                    setBackPreview(null);
                    setFormData((prev) => ({ ...prev, documentBack: null }));
                    setRemoveBack(true);
                    if (backInputRef.current) backInputRef.current.value = "";
                  }}
                >
                  ❌
                </Button>
              </div>
            )}
          </Form.Group>
        )}
  
        {/* Nút hành động */}
        <div className="d-flex justify-content-end mt-4">
          <Button variant="secondary" onClick={onClose} className="me-2">
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Đang lưu...
              </>
            ) : (
              "💾 Lưu thay đổi"
            )}
          </Button>
        </div>
      </Form>
    </Modal.Body>
  </Modal>
  
  );
};

export default UpdateResidentModal;
