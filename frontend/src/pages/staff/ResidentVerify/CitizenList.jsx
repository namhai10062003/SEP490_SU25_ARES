import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import StaffNavbar from '../staffNavbar';

const CitizenList = () => {
  const [residentList, setResidentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchResidentData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại!');
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/residents/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await res.json();
        setResidentList(result.data || []);
      } catch (err) {
        toast.error(`Lỗi tải danh sách nhân khẩu: ${err.message}`);
      }
    };

    fetchResidentData();
  }, []);

  const filteredList = residentList.filter(item => {
    const searchMatch =
      item.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.apartmentCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const status =
      item.verifiedByStaff === true ? 'approved' :
      item.rejectReason ? 'rejected' : 'pending';

    const statusMatch = statusFilter === 'all' || status === statusFilter;

    return searchMatch && statusMatch;
  });

  return (
    <div className="d-flex min-vh-100 bg-light">
      <StaffNavbar />
      <main className="flex-grow-1 p-4">
        <div className="bg-white rounded-4 shadow p-4">
          <h2 className="fw-bold mb-3">Danh sách nhân khẩu</h2>

          <div className="d-flex justify-content-between mb-3">
            <div>
              <label className="me-2">Lọc theo trạng thái:</label>
              <select
                className="form-select d-inline-block w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="approved">Đã xác minh</option>
                <option value="pending">Chờ xác minh</option>
                <option value="rejected">Bị từ chối</option>
              </select>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo tên hoặc mã căn hộ"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 300 }}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Họ tên</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Quan hệ chủ hộ</th>
                  <th>Mã căn hộ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((item, index) => {
                    const status =
                      item.verifiedByStaff === true
                        ? 'approved'
                        : item.rejectReason
                        ? 'rejected'
                        : 'pending';

                    return (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.fullName}</td>
                        <td>{item.gender}</td>
                        <td>{new Date(item.dateOfBirth).toLocaleDateString('vi-VN')}</td>
                        <td>{item.relationWithOwner}</td>
                        <td>{item.apartmentCode}</td>
                        <td>
                          <span className={
                            status === 'approved'
                              ? 'badge bg-success'
                              : status === 'pending'
                              ? 'badge bg-warning text-dark'
                              : 'badge bg-danger'
                          }>
                            {status === 'approved'
                              ? 'Đã xác minh'
                              : status === 'pending'
                              ? 'Chờ xác minh'
                              : 'Bị từ chối'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">Không có dữ liệu.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenList;
