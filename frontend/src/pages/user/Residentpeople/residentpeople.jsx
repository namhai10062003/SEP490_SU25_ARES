import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from "react-toastify";
import Header from '../../../../components/header';
import { useAuth } from '../../../../context/authContext';
import UpdateResidentModal from './UpdateResidentModal';
const ResidentList = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [apartmentData, setData] = useState([]);
  const [modalReason, setModalReason] = useState(null); // { name, reason }
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterRelation, setFilterRelation] = useState('all');
  const [editingResident, setEditingResident] = useState(null);
  // const [residents, setResidents] = useState([]); 
  const API_URL = import.meta.env.VITE_API_URL; 
 // Gọi khi component mount hoặc user thay đổi
 const fetchMyResidents = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/residents/me/residents`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Không thể lấy dữ liệu từ server');

    const result = await res.json();
    setData(result); // cập nhật state
  } catch (err) {
    console.error('❌ Lỗi khi lấy dữ liệu:', err);
  }
};

// Gọi khi component mount hoặc user thay đổi
useEffect(() => {
  setName(user?.name || null);
  fetchMyResidents();
}, [user]);

// Gọi sau khi update resident
// handleUpdateResident quyết định trạng thái dựa trên dữ liệu gửi lên
const handleUpdateResident = async (residentId, formData, originalResident) => {
  try {
    const token = localStorage.getItem("token");

    const normalize = (key, value) => {
      if (value === null || value === undefined) return "";
      if (["dateOfBirth", "moveInDate", "issueDate"].includes(key)) {
        return new Date(value).toISOString().slice(0, 10);
      }
      return String(value).trim();
    };

    const changedFields = [];
    for (let [key, value] of formData.entries()) {
      if (["removeFront", "removeBack", "verifiedByStaff", "rejectReason"].includes(key)) continue;

      const newVal = normalize(key, value);
      const oldVal = normalize(key, originalResident[key]);

      if (newVal !== oldVal) changedFields.push({ key, oldVal, newVal });
    }

    if (formData.get("removeFront") === "true") changedFields.push({ key: "removeFront", oldVal: false, newVal: true });
    if (formData.get("removeBack") === "true") changedFields.push({ key: "removeBack", oldVal: false, newVal: true });

    const hasChanges = changedFields.length > 0;
    console.log("🔍 Kiểm tra thay đổi trong handleUpdateResident:", { hasChanges, changedFields });

    if (hasChanges) {
      formData.set("verifiedByStaff", "pending");
      formData.set("rejectReason", "");
      console.log("⏳ Có thay đổi → set trạng thái PENDING");
    } else {
      formData.set("verifiedByStaff", originalResident.verifiedByStaff || "false");
      if (originalResident.rejectReason) formData.set("rejectReason", originalResident.rejectReason);
      console.log("⚠️ Không thay đổi → giữ nguyên trạng thái", {
        verifiedByStaff: formData.get("verifiedByStaff"),
        rejectReason: formData.get("rejectReason"),
      });
    }

    // Debug FormData
    const debugData = {};
    for (let [key, value] of formData.entries()) debugData[key] = value || null;
    console.log("📦 FormData gửi đi:", debugData);

    const response = await axios.put(
      `${API_URL}/api/residents/${residentId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("🌐 Response từ API sau PUT:", response.data);
    setEditingResident(null);
// Fetch lại residents
const residents = await fetchMyResidents();
console.log("📄 Danh sách resident sau update:", residents);
toast.success("✅ Chỉnh sửa nhân khẩu thành công", { autoClose: 3000 });
} catch (err) {
console.error("❌ Lỗi update resident:", err.response?.data || err.message);
toast.error(
  err.response?.data?.message || "❌ Lỗi update nhân khẩu.",
  { autoClose: 3000 }
);
}
};




  const renderApartment = (apt) => {
    const userId = String(user?._id);
    const isOwner = String(apt.isOwner?._id) === userId;
    const isRenter = String(apt.isRenter?._id) === userId;

    let roleText = '';
    if (isOwner && isRenter) {
      roleText = 'Chủ hộ & Người thuê – Bạn là cả chủ và người thuê';
    } else if (isOwner) {
      roleText = 'Chủ hộ';
    } else if (isRenter) {
      roleText = 'Người thuê';
    } else {
      const ownerName = apt.isOwner?.name || 'Không rõ';
      const renterName = apt.isRenter?.name || 'Không rõ';
      roleText = `Chủ hộ: ${ownerName} – Người thuê: ${renterName}`;
    }

    return (
      <div className="bg-white rounded-4 shadow p-4 mb-4" key={apt.apartmentId}>
        <div className="row mb-3">
          <div className="col-md-3 mb-2">
            <span className="fw-bold">Mã căn hộ:</span> <span>{apt.apartmentCode}</span>
          </div>
          <div className="col-md-3 mb-2">
            <span className="fw-bold">Vai trò của bạn:</span> <span>{roleText}</span>
          </div>
          <div className="col-md-3 mb-2">
            <span className="fw-bold">Chủ căn hộ:</span> <span>{apt.ownerName || 'Không rõ'}</span>
          </div>
          <div className="col-md-3 mb-2">
            <span className="fw-bold">Số nhân khẩu:</span> <span>
              {
                apt.residents?.filter(r => r.verifiedByStaff === "true").length || 0
              }
            </span>

          </div>
        </div>

        {((isOwner && !apt.isRenter) || isRenter) && (
          <div className="mb-3 text-end">
            <Link to="/canho/dangkynhankhau" className="btn btn-success rounded-pill fw-semibold">
              + Đăng ký nhân khẩu
            </Link>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0">
            <thead className="table-primary">
              <tr>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Quan hệ</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apt.residents.length ? (
                apt.residents
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .filter((r) => {
                    const nameMatch = r.fullName.toLowerCase().includes(searchText.toLowerCase());
                    const statusMatch =
                      filterStatus === "all" ||
                      (filterStatus === "true" && r.verifiedByStaff === "true") ||
                      (filterStatus === "false" && r.verifiedByStaff === "false") ||
                      (filterStatus === "pending" && r.verifiedByStaff === "pending");


                    const relationMatch =
                      filterRelation === 'all' ||
                      (r.relationWithOwner &&
                        r.relationWithOwner.toLowerCase().trim().includes(filterRelation.toLowerCase().trim()));

                    const genderMatch =
                      filterGender === 'all' ||
                      (r.gender && r.gender.toLowerCase().trim() === filterGender.toLowerCase().trim());
                    return nameMatch && statusMatch && relationMatch && genderMatch;
                  })
                  .map((r) => (
                    <tr key={r._id}>
                      <td>{r.fullName}</td>
                      <td>{r.dateOfBirth ? new Date(r.dateOfBirth).toLocaleDateString('vi-VN') : ''}</td>
                      <td>{r.gender}</td>
                      <td>{r.relationWithOwner}</td>
                      <td>
  {(() => {
    const status = r.verifiedByStaff;

    if (status === "true" || status === true) {
      return <span className="badge bg-success">✅ Đã xác minh</span>;
    } else if (status === "false" || status === false) {
      return <span className="badge bg-danger">❌ Đã từ chối</span>;
    } else {
      return <span className="badge bg-warning text-dark">🟡 Chờ duyệt</span>;
    }
  })()}
</td>




                      <td>
                        <Link to={`/residents/${r._id}`} className="btn btn-primary btn-sm rounded-pill me-2">
                          Xem chi tiết
                        </Link>
                        {r.verifiedByStaff === "false" && r.rejectReason && (
  <button
    className="btn btn-warning btn-sm rounded-pill"
    onClick={() =>
      setModalReason({ name: r.fullName, reason: r.rejectReason })
    }
  >
    ❓ Lý do
  </button>
)}
                         {r.verifiedByStaff === "false" && (
  <button
    className="btn btn-success btn-sm rounded-pill"
    onClick={() => setEditingResident(r)}
  >
    ✏️ Chỉnh sửa
  </button>
)}

  
                      </td>

                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3">
                    Chưa có nhân khẩu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={name} logout={logout} />

      <div className="container py-5">
        <h2 className="fw-bold text-center mb-4 text-primary">Danh sách nhân khẩu theo căn hộ</h2>
        <div className="row mb-4 justify-content-between">
          <div className="row mb-4">
            <div className="col-md-3 mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Tìm theo tên nhân khẩu..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="col-md-2 mb-2">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="true">✅ Đã xác minh</option>
                <option value="false">❌ Đã từ chối</option>
                <option value="pending">🟡 Chờ duyệt</option>
              </select>
            </div>

            <div className="col-md-2 mb-2">
              <select
                className="form-select"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="all">Giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="col-md-3 mb-2">
              <select
                className="form-select"
                value={filterRelation}
                onChange={(e) => setFilterRelation(e.target.value)}
              >
                <option value="all">Quan hệ với chủ hộ</option>
                <option value="Vợ">Vợ</option>
                <option value="Chồng">Chồng</option>
                <option value="Con">Con</option>
                <option value="Chị">Chị</option>
                <option value="Em">Em</option>
                <option value="Bố">Bố</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>



            <div className="col-md-2 mb-2 d-grid">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchText('');
                  setFilterStatus('all');
                  setFilterGender('all');
                  setFilterRelation('all');
                }}
              >
                🔄 Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
        {apartmentData.length ? (
          apartmentData.map(renderApartment)
        ) : (
          <p className="text-center mt-5">
            Hiện tại bạn không thuộc căn hộ nào nên không có dữ liệu để hiển thị.
          </p>
        )}
      </div>

      <footer className="text-center py-4 text-secondary small">
        &copy; 2025 Quản lý nhân khẩu
      </footer>

      {modalReason && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.3)" }}
          tabIndex={-1}
          onClick={() => setModalReason(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content rounded-4 text-center">
              <div className="modal-header">
                <h5 className="modal-title">Lý do từ chối</h5>
                <button type="button" className="btn-close" onClick={() => setModalReason(null)} />
              </div>
              <div className="modal-body">
                <p>
                  <strong>{modalReason.name}</strong> đã bị từ chối với lý do:
                </p>
                <p className="text-danger fw-bold">{modalReason.reason}</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-secondary" onClick={() => setModalReason(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
     <UpdateResidentModal
  show={!!editingResident}
  resident={editingResident}
  onClose={() => setEditingResident(null)}
  onUpdate={handleUpdateResident} // gửi resident object + FormData
/>

    </div>
  );
};

export default ResidentList;