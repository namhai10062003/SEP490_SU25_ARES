import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap"; // dùng react-bootstrap
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
const ResidenceDeclarationList = () => {
  const { user, logout } = useAuth();
  const [declarations, setDeclarations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const fileInputRef = useRef(null); 
  const [saving, setSaving] = useState(false); 
  const [show, setShow] = useState(false);

  // 🔹 State modal
  const [showModal, setShowModal] = useState(false);
const [removingImage, setRemovingImage] = useState(false); //
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    relationWithOwner: "",
    nationality: "",
    idNumber: "",
    startDate: "",
    endDate: "",
    documentImage: null
  });

  const fetchDeclarations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/residence-declaration/my-declarations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi tải dữ liệu");
      setDeclarations(data.data || []);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }
  };

  useEffect(() => {
    fetchDeclarations();
  }, []);

  // 🔹 Mở modal chỉnh sửa
  const handleEditClick = (declaration) => {
    setSelectedDeclaration(declaration);
    setEditForm({
      fullName: declaration.fullName || "",
      gender: declaration.gender || "",
      dateOfBirth: declaration.dateOfBirth
        ? new Date(declaration.dateOfBirth).toISOString().slice(0, 10)
        : "",
      relationWithOwner: declaration.relationWithOwner || "",
      nationality: declaration.nationality || "",
      idNumber: declaration.idNumber || "",
      startDate: declaration.startDate
        ? new Date(declaration.startDate).toISOString().slice(0, 10)
        : "",
      endDate: declaration.endDate
        ? new Date(declaration.endDate).toISOString().slice(0, 10)
        : "",
      documentImage: null
    });
    setShowModal(true);
  };

  // 🔹 Thay đổi input trong modal
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setEditForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 🔹 Lưu chỉnh sửa
  const handleSave = async () => {
    if (!selectedDeclaration) return;
  
    // 🔹 Validate từng trường bắt buộc với thông báo tiếng Việt
if (!editForm.fullName || editForm.fullName.trim() === "") {
  toast.error("❌ Vui lòng nhập Họ và tên!");
  return;
}

if (!editForm.gender || editForm.gender.trim() === "") {
  toast.error("❌ Vui lòng chọn Giới tính!");
  return;
}

if (!editForm.startDate || editForm.startDate.trim() === "") {
  toast.error("❌ Vui lòng chọn Ngày bắt đầu!");
  return;
}

if (!editForm.endDate || editForm.endDate.trim() === "") {
  toast.error("❌ Vui lòng chọn Ngày kết thúc!");
  return;
}

// 🔹 Validate CCCD (nếu nhập)
if (editForm.idNumber && !/^\d{12}$/.test(editForm.idNumber.trim())) {
  toast.error("❌ Số CCCD không hợp lệ. Vui lòng nhập đúng 12 chữ số.");
  return;
}
    // 🔹 Kiểm tra xem có gì thay đổi không
    const hasChange = Object.keys(editForm).some((key) => {
      if (key === "documentImage") {
        // Nếu documentImage là file mới hoặc null (xóa ảnh cũ)
        return editForm[key] !== undefined && (
          editForm[key] instanceof File || editForm[key] === null
        );
      }
      const originalValue = selectedDeclaration[key];
      const newValue = editForm[key];
      if (!originalValue && !newValue) return false;
      if (originalValue instanceof Date) {
        return new Date(originalValue).toISOString().slice(0,10) !== newValue;
      }
      return originalValue !== newValue;
    });
  
    if (!hasChange) {
      toast.info("⚠️ Bạn chưa thay đổi gì.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
  
      Object.keys(editForm).forEach((key) => {
        if (editForm[key] !== undefined && key !== "documentImagePreview") {
          if (key === "documentImage") {
            // Nếu user xóa ảnh, gửi flag removeOldImage
            if (editForm[key] === null && selectedDeclaration.documentImage) {
              formData.append("removeOldImage", "true");
            } else if (editForm[key] instanceof File) {
              formData.append("documentImage", editForm[key]);
            }
          } else {
            formData.append(key, editForm[key]);
          }
        }
      });
  
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/residence-declaration/${selectedDeclaration._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        }
      );
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi cập nhật");
  
      toast.success("✅ Cập nhật hồ sơ thành công!");
      setShowModal(false);
      fetchDeclarations(); // reload danh sách
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }
  };
  
  
  
  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={user?.name} logout={logout} />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary m-0">
            Hồ sơ tạm trú / tạm vắng của tôi
          </h2>
          <Link
            to="/residence-declaration"
            className="btn btn-success rounded-pill fw-semibold"
          >
            + Đăng ký tạm trú-tạm vắng
          </Link>
        </div>

        {/* Bộ lọc */}
        <div className="row mb-4">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Tìm theo tên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">🟡 Chờ duyệt</option>
              <option value="true">✅ Đã duyệt</option>
              <option value="false">❌ Đã từ chối</option>
            </select>
          </div>
          <div className="col-md-2 mb-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearchText("");
                setFilterStatus("all");
              }}
            >
              🔄 Xóa lọc
            </button>
          </div>
        </div>

        {/* Danh sách */}
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-primary">
              <tr>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Căn hộ</th>
                <th>Quan hệ</th>
                <th>Thời gian</th>
                <th>Giấy tờ</th>
                <th>Trạng thái</th>
                <th>Lý do từ chối</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {declarations
                .filter((d) =>
                  d.fullName?.toLowerCase().includes(searchText.toLowerCase())
                )
                .filter((d) =>
                  filterStatus === "all"
                    ? true
                    : d.verifiedByStaff === filterStatus
                )
                .map((d) => (
                  <tr key={d._id}>
                    <td>{d.fullName}</td>
                    <td>
                      {d.dateOfBirth &&
                        new Date(d.dateOfBirth).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{d.gender}</td>
                    <td>{d.apartmentId?.apartmentCode || "—"}</td>
                    <td>{d.relationWithOwner}</td>
                    <td>
                      {d.startDate
                        ? new Date(d.startDate).toLocaleDateString("vi-VN")
                        : "—"}{" "}
                      →{" "}
                      {d.endDate
                        ? new Date(d.endDate).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td>
      {d.documentImage ? (
        <>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShow(true)}
          >
            Xem ảnh
          </Button>

          {/* Popup ảnh */}
          <Modal show={show} onHide={() => setShow(false)} centered size="lg">
            <Modal.Body className="text-center">
              <img
                src={d.documentImage}
                alt="Giấy tờ"
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            </Modal.Body>
          </Modal>
        </>
      ) : (
        <span className="text-muted">Không có</span>
      )}
    </td>
                    <td>
                      {d.verifiedByStaff === "true" ? (
                        <span className="badge bg-success">✅ Đã duyệt</span>
                      ) : d.verifiedByStaff === "false" ? (
                        <span className="badge bg-danger">❌ Từ chối</span>
                      ) : (
                        <span className="badge bg-warning text-dark">
                          🟡 Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td>
                      {d.verifiedByStaff === "false" && d.rejectReason && (
                        <span className="text-danger fw-bold">
                          {d.rejectReason}
                        </span>
                      )}
                    </td>
                    <td>
                    <Link
  to={`/residence-declaration/detail/${d._id}`}
  className="d-inline-flex align-items-center gap-1 shadow-sm text-decoration-none"
  style={{
    borderRadius: "0.375rem",
    background: "#0d6efd",
    color: "#fff",
    fontSize: "0.85rem", // giảm size chữ
    padding: "0.25rem 0.6rem", // giảm padding
    transition: "all 0.2s",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
>
  <i className="bi bi-eye"></i>
  Xem chi tiết
</Link>


                      {/* 🔹 Nút chỉnh sửa nếu trạng thái là từ chối */}
                     {d.verifiedByStaff === "false" && (
  <Button
    size="sm"
    variant="warning"
    className="d-flex align-items-center gap-1 shadow-sm"
    style={{
      borderRadius: "0.375rem", // bo góc mềm mại
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    onClick={() => handleEditClick(d)}
  >
    <i className="bi bi-pencil-square"></i> {/* icon bút từ Bootstrap Icons */}
    Chỉnh sửa
  </Button>
)}

                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
  <Modal.Header closeButton className="bg-primary text-white">
    <Modal.Title>Chỉnh sửa hồ sơ</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form>
      <div className="row g-3">
        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Họ tên</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={editForm.fullName}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
            />
          </Form.Group>
        </div>

        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Giới tính</Form.Label>
            <Form.Select
              name="gender"
              value={editForm.gender}
              onChange={handleInputChange}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </Form.Select>
          </Form.Group>
        </div>

        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Ngày sinh</Form.Label>
            <Form.Control
              type="date"
              name="dateOfBirth"
              value={editForm.dateOfBirth}
              onChange={handleInputChange}
            />
          </Form.Group>
        </div>

        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Quan hệ với chủ hộ</Form.Label>
            <Form.Control
              type="text"
              name="relationWithOwner"
              value={editForm.relationWithOwner}
              onChange={handleInputChange}
            />
          </Form.Group>
        </div>

        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Quốc tịch</Form.Label>
            <Form.Control
              type="text"
              name="nationality"
              value={editForm.nationality}
              onChange={handleInputChange}
            />
          </Form.Group>
        </div>

        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Số CCCD</Form.Label>
            <Form.Control
              type="text"
              name="idNumber"
              value={editForm.idNumber}
              onChange={handleInputChange}
              placeholder="Nhập 12 số CCCD"
            />
          </Form.Group>
        </div>

        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Thời gian bắt đầu</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={editForm.startDate}
              onChange={handleInputChange}
            />
          </Form.Group>
        </div>

        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Thời gian kết thúc</Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={editForm.endDate}
              onChange={handleInputChange}
            />
          </Form.Group>
        </div>

        <div className="col-12">
          <Form.Group>
            <Form.Label>Ảnh giấy tờ (chỉ 1 ảnh)</Form.Label>
            <Form.Control
              type="file"
              name="documentImage"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setEditForm((prev) => ({
                    ...prev,
                    documentImage: file,
                    documentImagePreview: URL.createObjectURL(file),
                  }));
                }
              }}
            />

            {(editForm.documentImagePreview || selectedDeclaration?.documentImage) && (
              <div className="mt-2 position-relative d-inline-block">
                <img
                  src={editForm.documentImagePreview || selectedDeclaration.documentImage}
                  alt="Giấy tờ"
                  className="img-thumbnail"
                  style={{ maxWidth: "200px", maxHeight: "150px" }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger position-absolute top-0 end-0"
                  onClick={async () => {
                    setRemovingImage(true);

                    if (editForm.documentImagePreview) {
                      setEditForm((prev) => ({
                        ...prev,
                        documentImage: null,
                        documentImagePreview: null,
                      }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      setRemovingImage(false);
                      return;
                    }

                    if (selectedDeclaration?.documentImage) {
                      try {
                        const token = localStorage.getItem("token");
                        const res = await fetch(
                          `${import.meta.env.VITE_API_URL}/api/residence-declaration/${selectedDeclaration._id}/remove-image`,
                          {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                          }
                        );
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || "Lỗi xóa ảnh");

                        toast.success("✅ Xóa ảnh cũ thành công!");
                        setSelectedDeclaration((prev) => ({
                          ...prev,
                          documentImage: null,
                        }));
                        setEditForm((prev) => ({
                          ...prev,
                          documentImage: null,
                          documentImagePreview: null,
                        }));
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      } catch (err) {
                        toast.error(`❌ ${err.message}`);
                      } finally {
                        setRemovingImage(false);
                      }
                    }
                  }}
                >
                  {removingImage ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "×"
                  )}
                </button>
              </div>
            )}
          </Form.Group>
        </div>
      </div>
    </Form>
  </Modal.Body>

  <Modal.Footer className="d-flex justify-content-between">
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Hủy
    </Button>
    <Button
      variant="primary"
      onClick={async () => {
        setSaving(true);
        try {
          await handleSave();
        } finally {
          setSaving(false);
        }
      }}
      disabled={saving}
    >
      {saving ? <Spinner animation="border" size="sm" /> : "Lưu"}
    </Button>
  </Modal.Footer>
</Modal>

      </div>
    </div>
  );
};

export default ResidenceDeclarationList;
