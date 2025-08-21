import { faEye, faEyeSlash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Pagination from "../../../components/Pagination.jsx";
import ReusableModal from "../../../components/ReusableModal.jsx";
import SearchInput from "../../../components/admin/searchInput.jsx";
import StatusFilter from "../../../components/admin/statusFilter.jsx";
import LoadingModal from "../../../components/loadingModal.jsx";
import AdminDashboard from "./adminDashboard.jsx";
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const ManageStaff = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // data + UI state
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [showPassword, setShowPassword] = useState(false);

  // local controlled input for SearchInput
  const [searchInput, setSearchInput] = useState(
    searchParams.get("email") || ""
  );

  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // derive pagination & filter from URL (defaults)
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("pageSize")) || 10;
  const filterStatus = searchParams.get("status") || "";

  // axios instance with token
  const getAxios = () => {
    const token = localStorage.getItem("token");
    return axios.create({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  };

  // update URL query params helper (merge)
  const updateQuery = (next = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(searchParams.entries())
    );
  
    // chỉ áp dụng cho filter (không liên quan tới update staff)
    const filterKeys = ["search", "email", "status", "page", "limit"];
  
    filterKeys.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(next, k)) {
        const v = next[k];
        if (v === "" || v === null || v === undefined) params.delete(k);
        else params.set(k, String(v));
      }
    });
  
    setSearchParams(params, { replace: true });
  };
  

  // fetch staff using URL params
  const fetchStaff = useCallback(async () => {
    try {
      setLoadingFetch(true);
      const params = { page, limit, role: "staff" };
      if (filterStatus !== "") params.status = filterStatus;
      const emailParam = searchParams.get("email");
      if (emailParam) params.email = emailParam;

      const res = await getAxios().get(`${API_BASE}/users`, { params });
      const data = res.data || {};
      setStaffList(Array.isArray(data.users) ? data.users : []);
      setTotalPages(
        data.totalPages ?? Math.max(1, Math.ceil((data.total || 0) / limit))
      );
      setTotalItems(data.total ?? 0);
    } catch (err) {
      console.error("fetchStaff error:", err);
      toast.error("Không thể tải danh sách staff!");
      setStaffList([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoadingFetch(false);
    }
  }, [searchParams, page, limit, filterStatus]);

  // sync local search input with URL and fetch data
  useEffect(() => {
    setSearchInput(searchParams.get("email") || "");
    fetchStaff();
  }, [searchParams, fetchStaff]);

  // reset page when pageSize/status/search change is handled by updateQuery when invoked

  // open add modal
  const openAdd = () => {
    setIsUpdate(false);
    setForm({ username: "", password: "", email: "" });
    setSelectedStaff(null);
    setShowModal(true);
    setShowPassword(false);
  };

  // open update modal
  const openUpdate = (staff) => {
    setIsUpdate(true);
    setForm({
      username: staff.name || "",
      password: "",
      email: staff.email || "",
    });
    setSelectedStaff(staff);
    setShowModal(true);
    setShowPassword(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isUpdate && selectedStaff) {
        await getAxios().put(`${API_BASE}/staff/${selectedStaff._id}`, {
          name: form.username,
          password: form.password || undefined,
          email: form.email,
        });
        toast.success("Cập nhật thành công!");
        fetchStaff();
      } else {
        await getAxios().post(`${API_BASE}/staff`, {
          name: form.username,
          password: form.password,
          email: form.email,
          role: "staff",
          verified: true,
        });
        toast.success("Tạo staff thành công!");
        // after creating, go to first page
        updateQuery({ page: 1 });
        fetchStaff();
      }
      setShowModal(false);
    } catch (err) {
      console.error("handleSubmit error:", err);
      const msg = err?.response?.data?.error || "Thao tác thất bại!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // toggle active/block status
  const handleToggleStatus = async (staff) => {
    try {
      const newStatus = staff.status === 1 ? 2 : 1;
      await getAxios().patch(`${API_BASE}/staff/${staff._id}`, {
        status: newStatus,
      });
      toast.success("Đã đổi trạng thái!");
      fetchStaff();
    } catch (err) {
      console.error("handleToggleStatus error:", err);
      toast.error("Đổi trạng thái thất bại!");
    }
  };
  // hàm xóa staff
  const handleDeleteStaff = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Hành động này sẽ xóa staff vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
  
    if (!result.isConfirmed) return;
  
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("✅ Xóa staff thành công!");
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi xóa staff!");
    }
  };
  // search handlers
  const triggerSearch = () => {
    updateQuery({ email: (searchInput || "").trim(), page: 1 });
  };

  const clearSearch = () => {
    setSearchInput("");
    updateQuery({ email: "", page: 1 });
  };

  const renderModalBody = () => (
    <>
      <div className="form-group mb-3">
        <label>Tên tài khoản</label>
        <input
          type="text"
          className="form-control"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group mb-2">
        <label>Email</label>
        <input
          type="email"
          className="form-control"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group mb-0">
        <label>Mật khẩu</label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required={!isUpdate}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>
      </div>
    </>
  );

  const modalButtons = [
    {
      label: loading ? "Đang xử lý..." : isUpdate ? "Cập nhật" : "Tạo",
      onClick: handleSubmit,
      variant: "primary",
      disabled: loading,
    },
    {
      label: "Hủy",
      onClick: () => setShowModal(false),
      variant: "secondary",
      disabled: loading,
    },
  ];

  return (
    <AdminDashboard>
      <div className="w-100 position-relative">
        {(loadingFetch || loading) && <LoadingModal />}

        <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
          <h2 className="fw-bold mb-0">Quản lý Staff</h2>

          <div className="d-flex gap-3 align-items-center">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              onSearch={triggerSearch}
              onClear={clearSearch}
            />

            <StatusFilter
              value={filterStatus}
              onChange={(val) => updateQuery({ status: val, page: 1 })}
              type="staff"
            />

            <button
              className="btn btn-primary fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
              onClick={openAdd}
            >
              <FontAwesomeIcon icon={faPlus} />
              Staff
            </button>
          </div>
        </div>

        <div className="card w-100">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="thead-light">
                <tr>
                  <th>STT</th>
                  <th>Tên Tài khoản</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      Không có staff nào.
                    </td>
                  </tr>
                ) : (
                  staffList.map((staff, idx) => (
                    <tr key={staff._id}>
                      <td>{(page - 1) * limit + idx + 1}</td>
                      <td>{staff.name}</td>
                      <td>{staff.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            staff.status === 1 ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {staff.status === 1 ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-start gap-2">
                          {/* Nút Cập nhật */}
                          <button
                            className="btn btn-sm btn-outline-primary"
                            style={{ minWidth: 85 }}
                            onClick={() => openUpdate(staff)}
                          >
                            Cập nhật
                          </button>

                          {/* Nút Block / Active */}
                          <button
                            className={`btn btn-sm ${
                              staff.status === 1
                                ? "btn-outline-warning"
                                : "btn-outline-success"
                            }`}
                            style={{ minWidth: 85 }}
                            onClick={() => handleToggleStatus(staff)}
                          >
                            {staff.status === 1 ? "Block" : "Active"}
                          </button>

                          {/* Nút Xóa */}
                          <button
                            className="btn btn-sm btn-danger"
                            style={{ minWidth: 85 }}
                            onClick={() => handleDeleteStaff(staff._id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => updateQuery({ page: p })}
          pageSize={limit}
          onPageSizeChange={(s) => updateQuery({ limit: s, page: 1 })}
        />

        {showModal && (
          <ReusableModal
            show={showModal}
            title={isUpdate ? "Cập nhật tài khoản" : "Thêm tài khoản"}
            body={renderModalBody()}
            footerButtons={modalButtons}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </AdminDashboard>
  );
};

export default ManageStaff;
