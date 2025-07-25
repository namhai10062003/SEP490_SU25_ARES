import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../../components/header';
import { useAuth } from '../../../../context/authContext';

const ResidentList = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [apartmentData, setData] = useState([]);
  const [modalReason, setModalReason] = useState(null); // { name, reason }
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
const [filterRelation, setFilterRelation] = useState('all');
  useEffect(() => {
    setName(user?.name || null);

    (async () => {
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
        setData(result);
      } catch (err) {
        console.error('❌ Lỗi khi lấy dữ liệu:', err);
      }
    })();
  }, [user]);

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
            <span className="fw-bold">Số nhân khẩu:</span> <span>{apt.residentCount}</span>
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
               filterStatus === 'all' ||
               (filterStatus === 'approved' && r.verifiedByStaff) ||
               (filterStatus === 'rejected' && r.rejectReason) ||
               (filterStatus === 'pending' && !r.verifiedByStaff && !r.rejectReason);
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
                      {r.verifiedByStaff ? (
                        <span className="badge bg-success">✅ Đã duyệt</span>
                      ) : r.rejectReason ? (
                        <span className="badge bg-danger">❌ Đã từ chối</span>
                      ) : (
                        <span className="badge bg-warning text-dark">🟡 Chờ duyệt</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/residents/${r._id}`} className="btn btn-primary btn-sm rounded-pill me-2">
                        Xem chi tiết
                      </Link>
                      {r.rejectReason && (
                        <button
                          className="btn btn-warning btn-sm rounded-pill"
                          onClick={() => setModalReason({ name: r.fullName, reason: r.rejectReason })}
                        >
                          ❓ Lý do
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
      <option value="approved">✅ Đã duyệt</option>
      <option value="rejected">❌ Từ chối</option>
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
    </div>
  );
};

export default ResidentList;