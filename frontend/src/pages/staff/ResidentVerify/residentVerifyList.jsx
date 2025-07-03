import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import StaffNavbar from '../../staff/staffNavbar';

const ResidentVerifyList = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState(null);

  const fetchUnverifiedResidents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/residents/residents/unverified', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResidents(data.residents || []);
    } catch (err) {
      toast.error('❌ Lỗi tải danh sách nhân khẩu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverifiedResidents();
  }, []);

  const handleVerify = async (id) => {
    if (!window.confirm('✅ Xác nhận đã kiểm tra và muốn xác minh nhân khẩu này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/residents/verify-by-staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || '✅ Đã xác minh nhân khẩu');
        setResidents((prev) => prev.filter((r) => r._id !== id));
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('❌ Có lỗi xảy ra khi xác minh');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning('❗ Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/residents/reject-by-staff/${rejectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || '🚫 Đã từ chối nhân khẩu');
        setResidents((prev) => prev.filter((r) => r._id !== rejectId));
        setRejectId(null);
        setRejectReason('');
      } else {
        toast.error(result.message || '❌ Từ chối thất bại');
      }
    } catch (err) {
      toast.error('❌ Có lỗi xảy ra khi từ chối');
    }
  };

  const openImage = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <StaffNavbar />
      <main className="flex-grow-1 p-4">
        <h2 className="fw-bold mb-4 text-center text-primary">Danh sách nhân khẩu chờ xác minh</h2>
        <div className="card shadow-sm rounded-4 p-3">
          {loading ? (
            <div className="d-flex align-items-center justify-content-center py-5">
              <div className="spinner-border text-primary me-2"></div>
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : residents.length === 0 ? (
            <p className="text-center mb-0">Không có nhân khẩu nào cần xác minh.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>Họ tên</th>
                    <th>Căn hộ</th>
                    <th>Giới tính</th>
                    <th>Ngày sinh</th>
                    <th>Quan hệ</th>
                    <th>Quốc tịch</th>
                    <th>CCCD</th>
                    <th>Ngày cấp</th>
                    <th>Ảnh CCCD</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.map((r) => (
                    <tr key={r._id}>
                      <td>{r.fullName}</td>
                      <td>{r.apartmentId?.apartmentCode || '---'}</td>
                      <td>{r.gender}</td>
                      <td>{r.dateOfBirth ? new Date(r.dateOfBirth).toLocaleDateString('vi-VN') : ''}</td>
                      <td>{r.relationWithOwner}</td>
                      <td>{r.nationality}</td>
                      <td>{r.idNumber}</td>
                      <td>{r.issueDate ? new Date(r.issueDate).toLocaleDateString('vi-VN') : ''}</td>
                      <td>
                        {r.documentFront ? (
                          <img
                            src={r.documentFront}
                            alt="front"
                            style={{
                              width: 60,
                              height: 40,
                              objectFit: "cover",
                              cursor: "pointer",
                              borderRadius: 4,
                              border: "1px solid #ccc"
                            }}
                            onClick={() => openImage(r.documentFront)}
                          />
                        ) : '---'}
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm mb-1 w-100" onClick={() => handleVerify(r._id)}>Xác minh</button>
                        <button className="btn btn-danger btn-sm w-100" onClick={() => setRejectId(r._id)}>Từ chối</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal từ chối */}
        {rejectId && (
          <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(30,41,59,0.5)" }}
            tabIndex={-1}
            onClick={() => setRejectId(null)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Lý do từ chối</h5>
                  <button type="button" className="btn-close" onClick={() => setRejectId(null)} />
                </div>
                <div className="modal-body">
                  <textarea
                    rows="4"
                    className="form-control"
                    placeholder="Nhập lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="modal-footer d-flex justify-content-end gap-2">
                  <button className="btn btn-danger" onClick={handleReject}>Gửi từ chối</button>
                  <button className="btn btn-secondary" onClick={() => {
                    setRejectId(null);
                    setRejectReason('');
                  }}>Huỷ</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResidentVerifyList;