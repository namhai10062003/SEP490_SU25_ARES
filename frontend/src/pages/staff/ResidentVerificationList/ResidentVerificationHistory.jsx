import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast } from "react-toastify";
import StaffNavbar from "../staffNavbar";
const ResidentVerificationHistory = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const [originalStatus, setOriginalStatus] = useState("");

// Hàm xóa bộ lọc
const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCurrentPage(1);
  };
// hàm lender dữ liệu 
const filteredApps = applications
  .filter(app => {
    const matchesSearch =
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.apartmentCode?.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;
  
    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // mới nhất trước

// phân trang 
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
const paginatedApps = filteredApps.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

  //validate
  const validateForm = () => {
    let newErrors = {};
  
    if (!editData.apartmentCode) {
      newErrors.apartmentCode = "Vui lòng chọn hoặc nhập mã căn hộ";
    }
  
    if (!editData.documentType) {
      newErrors.documentType = "Vui lòng chọn loại giấy tờ";
    }
  
    if (editData.note && editData.note.length > 200) {
      newErrors.note = "Ghi chú không được vượt quá 200 ký tự";
    }
  
    // Nếu cần bắt buộc có file khi sửa
    // if (files.length === 0) {
    //   newErrors.files = "Vui lòng tải lên ít nhất 1 ảnh";
    // }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
// Thêm state để lưu danh sách căn hộ
const [apartments, setApartments] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
// Gọi API lấy danh sách căn hộ
const fetchApartments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/apartments`);
      setApartments(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách căn hộ");
    }
  };
  // Lấy dữ liệu
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Lấy token từ localStorage

const res = await axios.get(`${API_URL}/api/resident-verifications`, {
  headers: {
    Authorization: `Bearer ${token}` // Thêm token
  }
});

      // Sắp xếp mới nhất lên đầu
      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setApplications(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách.");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchApplications();
  }, []);
  const handleCloseModal = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token gửi đi:", token);
      if (!token) return console.error("Token không tồn tại!");
  
      await axios.patch(
        `${API_URL}/api/resident-verifications/${editData._id}/status`,
        { status: "Chờ duyệt" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      fetchApplications();
    } catch (err) {
      console.error("Lỗi revert trạng thái:", err.response || err);
    }
  
    setShowEditModal(false);
  };
  
  
  
  // Huỷ xác minh
  const handleCancel = async (id) => {
    confirmAlert({
      title: 'Xác nhận huỷ yêu cầu',
      message: 'Bạn có chắc muốn huỷ yêu cầu này?',
      buttons: [
        {
          label: 'Đồng ý',
          onClick: async () => {
            try {
              const token = localStorage.getItem("token"); // Lấy token từ localStorage

              await axios.patch(
                `${API_URL}/api/resident-verifications/${id}/cancel-staff`,
                {}, // Nếu không gửi body, vẫn cần truyền {} để axios nhận config là đối số thứ 3
                {
                  headers: {
                    Authorization: `Bearer ${token}` // Thêm token
                  }
                }
              );
              
              toast.success('✅ Huỷ yêu cầu thành công!');
              fetchApplications();
            } catch (err) {
              console.error(err);
              toast.error('❌ Huỷ thất bại!');
            }
          }
        },
        {
          label: 'Hủy',
          onClick: () => {
            // Không làm gì khi người dùng bấm "Hủy"
          }
        }
      ]
    });
  };

  // Mở modal sửa
  // Khi mở modal sửa => gọi API apartments
  const handleEditClick = async (app) => {
    setEditData({
      _id: app._id,
      fullName: app.fullName,
      email: app.email,
      phone: app.phone,
      apartmentCode: app.apartmentCode,
      note: app.note || "",
      documentType: app.documentType || "",
    });
  
    setOriginalStatus(app.status); // Lưu trạng thái gốc
  
    try {
      const token = localStorage.getItem("token"); // Lấy token từ localStorage
if (!token) return console.error("Token không tồn tại!");

await axios.patch(
  `${API_URL}/api/resident-verifications/${app._id}/status`,
  { status: "Đang chỉnh sửa" },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }
);

      fetchApplications(); // Refresh danh sách
    } catch (err) {
      console.error("Lỗi đổi trạng thái sang Đang chỉnh sửa:", err);
    }
  
    setFiles([]);
    await fetchApartments();
    setShowEditModal(true);
  };
  

  // Lưu sửa
  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("fullName", editData.fullName);
      formData.append("email", editData.email);
      formData.append("phone", editData.phone);
      formData.append("apartmentCode", editData.apartmentCode);
      formData.append("documentType", editData.documentType);
      formData.append("note", editData.note);
  
      // Thêm ảnh mới nếu có
      files.forEach((file) => formData.append("documentImage", file));
  
      const token = localStorage.getItem("token"); // Lấy token từ localStorage
if (!token) return console.error("Token không tồn tại!");

await axios.put(
  `${API_URL}/api/resident-verifications/${editData._id}`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}` // Thêm token
    }
  }
);

  
      toast.success("Cập nhật thành công");
      
      // Đóng modal và reset dữ liệu
      setShowEditModal(false);
      setEditData({});
      setFiles([]);
      
      // Refresh danh sách
      fetchApplications();
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      toast.error("Cập nhật thất bại");
    }
  };
  

  return (
    <div className="d-flex min-vh-100 bg-light">
      <StaffNavbar />

      <main className="flex-grow-1 p-4">
        <h2 className="fw-bold mb-4">Lịch sử xác minh cư dân</h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" />
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : (
          <div className="table-responsive">
            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
  {/* Search */}
  <Form.Control
    style={{ width: "300px" }}
    type="text"
    placeholder="Tìm kiếm theo tên hoặc căn hộ"
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1); // reset về page 1 khi search
    }}
  />

  {/* Filter */}
  <Form.Select
    style={{ width: "200px" }}
    value={statusFilter}
    onChange={(e) => {
      setStatusFilter(e.target.value);
      setCurrentPage(1);
    }}
  >
    <option value="all">Tất cả trạng thái</option>
    <option value="Chờ duyệt">Chờ duyệt</option>
    <option value="Đã duyệt">Đã duyệt</option>
    <option value="Đã từ chối">Đã từ chối</option>
    <option value="Đã hủy bỏ">Đã huỷ bỏ</option>
  </Form.Select>

  {/* Số lượng hiển thị */}
  {/* <Form.Select
    style={{ width: "120px" }}
    value={itemsPerPage}
    onChange={(e) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1);
    }}
  >
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={20}>20</option>
  </Form.Select> */}
  {/* Nút xóa bộ lọc */}
  <Button
    variant="outline-secondary"
    onClick={() => {
      setSearchTerm("");
      setStatusFilter("all");
      setItemsPerPage(10); // hoặc giữ nguyên tùy bạn
      setCurrentPage(1);
    }}
  >
    Xóa bộ lọc
  </Button>
</div>

            <Table striped bordered hover className="bg-white rounded-3 shadow-sm">
              <thead className="table-primary">
                <tr>
                  <th>STT</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Mã căn hộ</th>
                  <th>Loại giấy tờ</th>
                  <th>Trạng thái</th>
                  <th>Ngày gửi</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
  {paginatedApps.map((app, index) => (
    <tr key={app._id}>
      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
      <td>{app.fullName || "N/A"}</td>
      <td>{app.email || "N/A"}</td>
      <td>{app.phone || "N/A"}</td>
      <td>{app.apartmentCode || "N/A"}</td>
      <td>{app.documentType || "-"}</td>
      <td>
      <span
  className={`badge ${
    app.status === "Đã duyệt"
      ? "bg-success"
      : app.status === "Chờ duyệt"
      ? "bg-warning text-dark"
      : app.status === "Đã từ chối"
      ? "bg-danger"
      : app.status === "Đã huỷ bỏ"
      ? "bg-secondary text-dark"
      : "bg-secondary"
  }`}
>
  {app.status === "Chờ duyệt"
    ? "Chờ duyệt"
    : app.status === "Đã duyệt"
    ? "Đã duyệt"
    : app.status === "Đã từ chối"
    ? "Từ chối"
    : app.status === "Đã huỷ bỏ"
    ? "Đã huỷ bỏ"
    : app.status}
</span>

      </td>
      <td>
        {app.createdAt
          ? new Date(app.createdAt).toLocaleDateString("vi-VN")
          : "-"}
      </td>
      <td>
      {(app.status === "Chờ duyệt" || app.status === "Đã từ chối") && (
  <Button
    size="sm"
    variant="primary"
    className="me-2"
    onClick={() => handleEditClick(app)}
  >
    Sửa
  </Button>
)}

        {app.status === "Chờ duyệt" && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleCancel(app._id)}
          >
            Huỷ
          </Button>
        )}
      </td>
    </tr>
  ))}

  {paginatedApps.length === 0 && (
    <tr>
      <td colSpan={9} className="text-center">
        Không có dữ liệu
      </td>
    </tr>
  )}
</tbody>

            </Table>
            <div className="d-flex justify-content-between align-items-center mt-3">
  <span>
    Hiển thị {paginatedApps.length} / {filteredApps.length} kết quả
  </span>
  <div>
    <Button
      variant="outline-secondary"
      size="sm"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(prev => prev - 1)}
    >
      &lt;
    </Button>
    <span className="mx-2">
      Trang {currentPage} / {totalPages}
    </span>
    <Button
      variant="outline-secondary"
      size="sm"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(prev => prev + 1)}
    >
      &gt;
    </Button>
  </div>
</div>
          </div>
        )}
      </main>

      {/* Modal sửa */}
      <Modal show={showEditModal} onHide={() => handleCloseModal} size="lg">
        <Modal.Header>
          <Modal.Title>Sửa thông tin xác minh</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
              <Form.Group className="mb-3">
  <Form.Label>Họ và tên</Form.Label>
  <Form.Control
    type="text"
    value={editData.fullName || ""}
    readOnly // hoặc dùng disabled
  />
</Form.Group>

              </div>

              <div className="col-md-6">
              <Form.Group className="mb-3">
  <Form.Label>Email</Form.Label>
  <Form.Control
    type="email"
    value={editData.email || ""}
    readOnly
  />
</Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
              <Form.Group className="mb-3">
  <Form.Label>Số điện thoại</Form.Label>
  <Form.Control
    type="text"
    value={editData.phone || ""}
    readOnly
  />
</Form.Group>
              </div>

              <div className="col-md-6">
              <Form.Group className="mb-3">
  <Form.Label>Mã căn hộ</Form.Label>
  <Form.Select
    value={editData.apartmentCode || ""}
    onChange={(e) =>
      setEditData({ ...editData, apartmentCode: e.target.value })
    }
  >
    <option value="">-- Chọn căn hộ --</option>
    {apartments.map((apt) => (
      <option key={apt._id} value={apt.apartmentCode}>
        {apt.apartmentCode}
      </option>
    ))}
  </Form.Select>

  {errors.apartmentCode && (
    <div className="text-danger">{errors.apartmentCode}</div>
  )}
</Form.Group>


              </div>
            </div>

            <Form.Group className="mb-3">
  <Form.Label>Loại giấy tờ</Form.Label>
  <Form.Select
    value={editData.documentType || ""}
    onChange={(e) =>
      setEditData({ ...editData, documentType: e.target.value })
    }
  >
    <option value="">-- Chọn loại giấy tờ --</option>
    <option value="Hợp đồng mua bán">Hợp đồng mua bán</option>
    <option value="Hợp đồng cho thuê">Hợp đồng cho thuê</option>
  </Form.Select>
  {errors.documentType && (
    <div className="text-danger">{errors.documentType}</div>
  )}
</Form.Group>


            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editData.note || ""}
                onChange={(e) =>
                  setEditData({ ...editData, note: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
  <Form.Label>Tài liệu xác minh (có thể chọn nhiều)</Form.Label>
  <Form.Control
    type="file"
    multiple
    accept="image/*"
    onChange={(e) => {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);

      // Tạo preview URL
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setFilePreviews(previews);
    }}
  />

  {/* Preview ảnh */}
  <div className="mt-3 d-flex flex-wrap gap-2">
    {filePreviews.map((src, idx) => (
      <img
        key={idx}
        src={src}
        alt={`preview-${idx}`}
        style={{
          width: "120px",
          height: "120px",
          objectFit: "cover",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />
    ))}
  </div>
</Form.Group>

          </Modal.Body>
          <Modal.Footer>
          <Button variant="secondary" onClick={() => handleCloseModal(editData._id)}>
  Đóng
</Button>

            <Button type="submit" variant="primary">
              Lưu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
    </div>
    
  );
};

export default ResidentVerificationHistory;
