import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import socket from '../../../server/socket';
import StaffNavbar from '../../staff/staffNavbar'; // ✅ Thêm dòng này

const ManageParkingLot = () => {
  const [parkingRequests, setParkingRequests] = useState([]);
  const [role, setRole] = useState('');
  const isMountedRef = useRef(true);
  //search
  const [searchTerm, setSearchTerm] = useState('');
  // hàm thực hiện popup chi tiết 
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  
  const openRejectModal = (id) => {
    setSelectedId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };
  
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setSelectedId(null);
  };

  const handleRowClick = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Không có token. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parkinglot/detail-parkinglot/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      setSelectedRequest(json.data);
      setShowDetailModal(true);
    } catch (err) {
      toast.error(`Không lấy được chi tiết: ${err.message}`);
    }
  };

  useEffect(() => {
    if (showDetailModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDetailModal]);

  useEffect(() => {
    isMountedRef.current = true;

    socket.on('parkingStatusUpdated', ({ id, status }) => {
      if (isMountedRef.current) {
        setParkingRequests((prevList) =>
          prevList.filter((item) => item._id !== id)
        );
      }
    });

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const userRole = decoded.role || '';
        if (isMountedRef.current) {
          setRole(userRole);
          fetchParkingRequests(storedToken);
        }
      } catch (err) {
        if (isMountedRef.current)
          toast.error('Token không hợp lệ. Vui lòng đăng nhập lại.');
      }
    } else {
      if (isMountedRef.current)
        toast.error('Không tìm thấy token! Vui lòng đăng nhập lại.');
    }

    return () => {
      isMountedRef.current = false;
      socket.off('parkingStatusUpdated');
    };
  }, []);

  const fetchParkingRequests = async (token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parkinglot/parkinglotall`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await res.json();
      console.log(responseData);
      const rawList = Array.isArray(responseData.data) ? responseData.data : [];

      const mappedList = rawList
        .filter((item) => item['trạngThái'] === 'pending')
        .map((item) => ({
          _id: item.id,
          apartmentCode: item['mãCănHộ'],
          owner: item['tênChủSởHữu'],
          licensePlate: item['biểnSốXe'],
          vehicleType: item['loạiXe'],
          registerDate: item['ngàyĐăngKý'],
          status: item['trạngThái'] || 'pending',
        }));

      if (isMountedRef.current) setParkingRequests(mappedList);
    } catch (err) {
      if (isMountedRef.current)
        toast.error(`Lỗi tải dữ liệu: ${err.message}`);
    }
  };

  const handleStatusChange = async (id, action, reason = null) => {
    const token = localStorage.getItem('token');
    if (role !== 'staff') {
      toast.error('🚫 Bạn không có quyền thực hiện hành động này.');
      return;
    }
  
    const url = `${import.meta.env.VITE_API_URL}/api/parkinglot/${action}/${id}`;
    const method = 'PATCH';
    const status = action === 'approve' ? 'approved' : 'rejected';
  
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
  
      // 🆕 nếu reject thì gửi lý do từ modal
      if (status === 'rejected') {
        if (!reason || !reason.trim()) {
          toast.error("❌ Bạn phải nhập lý do để từ chối.");
          return;
        }
        options.body = JSON.stringify({ reason });
      }
  
      const res = await fetch(url, options);
  
      if (res.ok) {
        if (status === 'approved') {
          toast.success('✅ Phê duyệt yêu cầu gửi xe thành công');
        } else {
          toast('🚫 Đã từ chối yêu cầu gửi xe', {
            style: { backgroundColor: 'red', color: 'white' },
          });
        }
  
        setParkingRequests((prevList) =>
          prevList.filter((item) => item._id !== id)
        );
  
        socket.emit('parkingStatusUpdated', { id, status, reason });
      } else {
        const errorData = await res.json();
        toast.error(
          errorData.message ||
            (status === 'approved'
              ? '❌ Phê duyệt thất bại'
              : '❌ Từ chối thất bại')
        );
      }
    } catch (err) {
      toast.error('❌ Có lỗi xảy ra, vui lòng thử lại sau');
      console.error('❌ Lỗi khi cập nhật trạng thái:', err);
    }
  };
  
  

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };
  const filteredRequests = parkingRequests.filter((item) =>
    item.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.apartmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatDate(item.registerDate).includes(searchTerm)
  );
  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* ✅ Thay aside bằng component StaffNavbar */}
      <StaffNavbar />

      {/* Main content */}
      <main className="flex-grow-1 p-4">
        <div className="bg-white rounded-4 shadow p-4 mb-4">
          <h2 className="fw-bold mb-3">Quản lý yêu cầu gửi xe</h2>
          <div className="table-responsive">
            <div className="d-flex justify-content-end mb-3">
              <input
                type="text"
                className="form-control w-25"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <table className="table table-bordered align-middle bg-white rounded-4 shadow">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Căn hộ</th>
                  <th>Chủ xe</th>
                  <th>Biển số</th>
                  <th>Loại xe</th>
                  <th>Ngày đăng ký</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((item, idx) => (
                    <tr key={item._id} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(item._id)}>
                      <td>{idx + 1}</td>
                      <td>{item.apartmentCode}</td>
                      <td>{item.owner}</td>
                      <td>{item.licensePlate}</td>
                      <td>{item.vehicleType}</td>
                      <td>{formatDate(item.registerDate)}</td>
                      <td>
                        {role === 'staff' ? (
                          <div className="d-flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(item._id, 'approve');
                              }}
                              className="btn btn-success btn-sm"
                            >
                              Phê duyệt
                            </button>
                           <button
  onClick={(e) => {
    e.stopPropagation();
    openRejectModal(item._id); // 🆕 mở modal thay vì gọi trực tiếp
  }}
  className="btn btn-danger btn-sm"
>
  Từ chối
</button>
                          </div>
                          
                        ) : (
                          <i>Chỉ xem</i>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">Không có kết quả phù hợp.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {showDetailModal && selectedRequest && (
          <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chi tiết yêu cầu gửi xe</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDetailModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p><strong>Tên căn hộ:</strong> {selectedRequest.tênCănHộ}</p>
                  <p><strong>Chủ sở hữu:</strong> {selectedRequest.tênChủSởHữu}</p>
                  <p><strong>SĐT chủ sở hữu:</strong> {selectedRequest.sđtChủSởHữu}</p>
                  <p><strong>Biển số xe:</strong> {selectedRequest.biểnSốXe}</p>
                  <p><strong>Loại xe:</strong> {selectedRequest.loạiXe}</p>
                  <p><strong>Giá:</strong> {selectedRequest.giá}</p>
                  <p><strong>Ngày đăng ký:</strong> {formatDate(selectedRequest.ngàyĐăngKý)}</p>
                  <p><strong>Trạng thái:</strong>
                    <span className={
                      selectedRequest.trạngThái === 'approved' ? 'badge bg-success ms-2'
                        : selectedRequest.trạngThái === 'rejected' ? 'badge bg-danger ms-2'
                          : 'badge bg-secondary ms-2'
                    }>
                      {selectedRequest.trạngThái === 'approved' ? 'Đã phê duyệt'
                        : selectedRequest.trạngThái === 'rejected' ? 'Đã từ chối'
                          : selectedRequest.trạngThái}
                    </span>
                  </p>

                  {(selectedRequest['ảnhTrước'] || selectedRequest['ảnhSau']) && (
                    <div className="row row-cols-2 mt-3">
                      {selectedRequest['ảnhTrước'] && (
                        <div className="col">
                          <strong>Ảnh trước:</strong>
                          <img src={selectedRequest['ảnhTrước']} alt="Ảnh trước" className="img-fluid rounded" />
                        </div>
                      )}
                      {selectedRequest['ảnhSau'] && (
                        <div className="col">
                          <strong>Ảnh sau:</strong>
                          <img src={selectedRequest['ảnhSau']} alt="Ảnh sau" className="img-fluid rounded" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    {showRejectModal && (
  <div
    className="modal fade show d-block"
    tabIndex="-1"
    style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
  >
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Nhập lý do từ chối</h5>
          <button type="button" className="btn-close" onClick={closeRejectModal}></button>
        </div>
        <div className="modal-body">
          <textarea
            className="form-control"
            placeholder="Nhập lý do..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeRejectModal}>
            Hủy
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (!rejectReason.trim()) {
                toast.error("❌ Vui lòng nhập lý do từ chối");
                return;
              }
              handleStatusChange(selectedId, "reject", rejectReason);
              closeRejectModal();
            }}
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
};

export default ManageParkingLot;
