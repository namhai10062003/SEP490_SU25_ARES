import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingModal from "../../../components/loadingModal";
import StaffNavbar from "./staffNavbar";

export default function RefundForm() {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    note: "",
  });

  // lấy danh sách user (trừ staff/admin)
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users?limit=1000`);
        let users = Array.isArray(res.data) ? res.data : res.data.users || [];
        const filtered = users.filter((u) => u.role !== "admin" && u.role !== "staff");
        setAllUsers(filtered);
        setFilteredUsers(filtered);
      } catch (err) {
        console.error("❌ Lỗi khi lấy users:", err);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // search user
  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = query.trim().toLowerCase();
    if (!keyword) return setFilteredUsers(allUsers);

    setFilteredUsers(
      allUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(keyword) ||
          u.email?.toLowerCase().includes(keyword) ||
          u.phone?.includes(keyword)
      )
    );
  };

  // thay đổi form refund
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // submit refund
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("❌ Vui lòng chọn cư dân trước.");
    if (!formData.amount || Number(formData.amount) <= 0) {
      return toast.error("❌ Số tiền không hợp lệ.");
    }
  
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // 🔑 Lấy token từ localStorage
  
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/refunds`,
        {
          amount: formData.amount,
          accountHolder: formData.accountHolder,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          note: formData.note,
        },
        { headers: { Authorization: `Bearer ${token}` } } // ✅ dùng token ở đây
      );
  
      toast.success("✅ Hoàn tiền thành công!");
      setUser(null);
      setFormData({
        amount: "",
        accountHolder: "",
        accountNumber: "",
        bankName: "",
        note: "",
      });
    } catch (err) {
      console.error("❌ Lỗi khi hoàn tiền:", err);
      toast.error("❌ Thất bại khi hoàn tiền.");
    }
    setLoading(false);
  };
  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(value);
  };
  
  const handleAmountChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, ""); // chỉ giữ số
    setFormData({
      ...formData,
      amount: rawValue,
    });
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <StaffNavbar />
      <main className="flex-grow-1 p-4">
        <div className="container" style={{ maxWidth: 900 }}>
          {/* Bảng user */}
          <div className="table-responsive mt-4">
            <h4 className="fw-bold mb-3">Danh sách cư dân</h4>
            <form onSubmit={handleSearch} className="mb-3 row g-2">
              <div className="col-md-10">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="form-control"
                  placeholder="Tìm theo tên, email hoặc số điện thoại"
                />
              </div>
              <div className="col-md-2 d-grid">
                <button className="btn btn-primary" type="submit">Tìm kiếm</button>
              </div>
            </form>

            <table className="table table-bordered table-striped">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">Không có cư dân phù hợp.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <tr key={u._id}>
                      <td>{idx + 1}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => setUser(u)}
                        >
                          Hoàn tiền
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal form hoàn tiền */}
          {user && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded-4 shadow-lg border-0">
                  <div className="modal-header border-0 pb-0">
                    <h5 className="fw-bold text-primary m-0">Hoàn tiền cho cư dân</h5>
                    <button type="button" className="btn-close" onClick={() => setUser(null)}></button>
                  </div>
                  <div className="modal-body pt-3">
                  <form onSubmit={handleSubmit}>
  <div className="row g-3">
    {/* Thông tin cư dân */}
    <div className="col-md-4">
      <label className="form-label">Họ và tên</label>
      <input value={user.name} disabled className="form-control" />
    </div>
    <div className="col-md-4">
      <label className="form-label">Email</label>
      <input value={user.email} disabled className="form-control" />
    </div>
    <div className="col-md-4">
      <label className="form-label">SĐT</label>
      <input value={user.phone} disabled className="form-control" />
    </div>

    {/* Số tiền */}
    <div className="col-md-6">
  <label className="form-label">Số tiền hoàn</label>
  <div className="input-group">
    <input
      type="text"
      name="amount"
      value={formatCurrency(formData.amount)}
      onChange={handleAmountChange}
      className="form-control"
      placeholder="Nhập số tiền"
      required
    />
    <span className="input-group-text">VNĐ</span>
  </div>
</div>


    {/* Chủ tài khoản */}
    <div className="col-md-6">
      <label className="form-label">Chủ tài khoản</label>
      <input
        type="text"
        name="accountHolder"
        value={formData.accountHolder}
        onChange={handleChange}
        className="form-control"
        placeholder="Nhập tên chủ tài khoản"
        required
      />
    </div>

    {/* Số tài khoản */}
    <div className="col-md-6">
      <label className="form-label">Số tài khoản</label>
      <input
        type="text"
        name="accountNumber"
        value={formData.accountNumber}
        onChange={handleChange}
        className="form-control"
        placeholder="Nhập số tài khoản"
        required
      />
    </div>

    {/* Tên ngân hàng */}
    <div className="col-md-6">
      <label className="form-label">Tên ngân hàng</label>
      <input
        type="text"
        name="bankName"
        value={formData.bankName}
        onChange={handleChange}
        className="form-control"
        placeholder="Nhập tên ngân hàng"
        required
      />
    </div>

    {/* Ghi chú */}
    <div className="col-md-12">
      <label className="form-label">Ghi chú</label>
      <textarea
        name="note"
        value={formData.note}
        onChange={handleChange}
        className="form-control"
        rows={3}
      ></textarea>
    </div>
  </div>

  {/* Nút submit */}
  <div className="d-flex justify-content-end mt-4 gap-2">
    <button type="submit" className="btn btn-success px-5" disabled={loading}>
      Xác nhận hoàn tiền
    </button>
  </div>
</form>

                  </div>
                </div>
              </div>
            </div>
          )}
          {loading && <LoadingModal />}
        </div>
      </main>
    </div>
  );
}
