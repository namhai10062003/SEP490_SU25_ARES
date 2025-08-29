import axios from "axios";
import React, { useEffect, useState } from "react";
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReusableModal from '../../../components/ReusableModal';
import LoadingModal from "../../../components/loadingModal";
import StaffNavbar from "./staffNavbar";
const API_URL = import.meta.env.VITE_API_URL || "https://api.ares.io.vn";

const TYPE_LABELS = {
    1: "Chi phí quản lý",
    3: "Phí dịch vụ khác",
    4: "Phí tiện ích",
};

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addType, setAddType] = useState("");
    const [addLabel, setAddLabel] = useState("");
    const [addPrice, setAddPrice] = useState("");
    const [apartmentFees, setApartmentFees] = useState([]);
    const [loadingFees, setLoadingFees] = useState(true);
    const [filterMonth, setFilterMonth] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterText, setFilterText] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [priceError, setPriceError] = useState('');
    const rowsPerPage = 10;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [loadingModal, setLoadingModal] = useState(false);
   

    const openDeleteModal = (id) => {
        setSelectedId(id);
        setShowDeleteModal(true);
      };
    const formattedFilterMonth = filterMonth
        ? (() => {
            const [year, month] = filterMonth.split("-");
            return `${month}/${year}`; // thành "06/2025"
        })()
        : null;

    const handlePriceChange = (e) => {
        const value = e.target.value;

        // Cho phép xóa ô hoặc nhập hợp lệ (> 0)
        if (value === '' || (/^[0-9]*$/.test(value) && Number(value) > 0)) {
            setAddPrice(value);
            setPriceError('');
        } else {
            setAddPrice(value);
            setPriceError('Giá phải lớn hơn 0');
        }
    };


    // console.log("Filter month:", formattedFilterMonth);
    // console.log("All fee months:", apartmentFees.map((f) => f.month));
    // console.log("Filtered fee months:", filteredFees.map((f) => f.month));

   // Khi fetch hoặc setApartmentFees lần đầu
useEffect(() => {
    if (apartmentFees.length > 0) {
      const sorted = [...apartmentFees].sort((a, b) => {
        const dateA = new Date(`01/${a.month}`);
        const dateB = new Date(`01/${b.month}`);
        return dateB - dateA;
      });
      setApartmentFees(sorted);
    }
  }, [apartmentFees.length]);
  
  const getFilteredFees = () => {
    return apartmentFees.filter((fee) => {
      const matchesMonth =
        !filterMonth ||
        fee.month ===
          `${filterMonth.split("-")[1]}/${filterMonth.split("-")[0]}`;
  
      const search = filterText.trim().toLowerCase();
      const matchesText =
        !search ||
        (fee.apartmentCode?.toLowerCase() || "").includes(search) ||
        (fee.ownerName?.toLowerCase() || "").includes(search);
  
      const matchesStatus =
        filterStatus === "all" || fee.paymentStatus === filterStatus;
  
      return matchesMonth && matchesText && matchesStatus;
    });
  };
  


    const filteredFees = getFilteredFees();


    const totalPages = Math.ceil(filteredFees.length / rowsPerPage);
    const paginatedFees = filteredFees.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );


    useEffect(() => {
        fetchExpenses();
        fetchApartmentFees();
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        setLoadingModal(true);
        try {
            const res = await axios.get(`${API_URL}/api/expenses`);
            setExpenses(res.data);
        } catch (err) {
            toast.error("Lỗi tải dữ liệu chi phí!");
        }
        setLoading(false);
        setLoadingModal(false);
    };

    const fetchApartmentFees = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/fees`);
            setApartmentFees(res.data.data || []);
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu chi phí căn hộ:", err);
            toast.error("Lỗi lấy dữ liệu phí tổng hợp!");
        }
        setLoadingFees(false);
    };

    const handleDelete = async () => {
        if (!selectedId) return;
      
        try {
          setLoadingModal(true); // bật loading
          await axios.delete(`${API_URL}/api/expenses/${selectedId}`);
          toast.success("🗑️ Đã xóa chi phí!");
          fetchExpenses();
        } catch (err) {
          toast.error("❌ Xóa thất bại!");
        } finally {
          setLoadingModal(false); // tắt loading
          setShowDeleteModal(false); // đóng modal confirm
          setSelectedId(null);
        }
      };

      const handleRecalculateFees = async () => {
        try {
          setLoadingModal(true); // 👉 bật modal loading
          await axios.post(`${API_URL}/api/fees/calculate`);
          toast.success("✅ Đã tính lại phí!");
          fetchApartmentFees();
        } catch (err) {
          toast.error("❌ Lỗi khi tính lại phí!");
        } finally {
          setLoadingModal(false); // 👉 tắt modal loading
        }
      };

      const handleAdd = async (e) => {
        e.preventDefault();
      
        // Reset lỗi trước khi validate
        setPriceError("");
      
        // Validate
        if (!addType) {
          toast.warn("Vui lòng chọn loại chi phí!");
          return;
        }
      
        if (!addLabel) {
          toast.warn("Vui lòng nhập tên tòa nhà!");
          return;
        }
      
        if (!addPrice) {
          toast.warn("Vui lòng nhập giá chi phí!");
          return;
        }
      
        if (Number(addPrice) <= 0) {
          setPriceError("Giá phải lớn hơn 0");
          toast.warn("Giá phải lớn hơn 0!");
          return;
        }
      
        try {
          setLoadingModal(true); // 👉 bật loading
      
          await axios.post(`${API_URL}/api/expenses`, {
            type: Number(addType),
            label: addLabel,
            price: Number(addPrice),
          });
      
          toast.success("Thêm chi phí thành công!");
          setAddType("");
          setAddLabel("");
          setAddPrice("");
          setPriceError(""); // Reset lỗi sau khi thành công
          fetchExpenses();
        } catch (err) {
          const msg = err?.response?.data?.error || "Thêm chi phí thất bại!";
          toast.error(msg);
        } finally {
          setLoadingModal(false); // 👉 tắt loading
        }
      };



    const grouped = expenses.reduce((acc, exp) => {
        if (!acc[exp.label]) acc[exp.label] = [];
        acc[exp.label].push(exp);
        return acc;
    }, {});

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* <ToastContainer position="top-right" autoClose={2000} /> */}
            <StaffNavbar />

            <main className="flex-grow-1 p-4">
                <h2 className="fw-bold mb-4">Quản lý chi phí căn hộ</h2>


                {/* Form Thêm Chi Phí */}
                <form
                    onSubmit={handleAdd}
                    className="row g-2 align-items-center mb-4"
                    style={{ maxWidth: 600 }}
                >
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={addType}
                            onChange={(e) => setAddType(e.target.value)}

                        >
                            <option value="">Chọn loại chi phí</option>
                            <option value="1">Chi phí quản lý</option>
                            <option value="3">Phí dịch vụ khác</option>
                            <option value="4">Phí tiện ích</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tên Tòa nhà"
                            value={addLabel}
                            onChange={(e) => setAddLabel(e.target.value)}

                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="number"
                            className={`form-control ${priceError ? 'is-invalid' : ''}`}
                            placeholder="Giá (VND/m²)"
                            value={addPrice}
                            onChange={handlePriceChange}
                            min={1}

                        />
                        {priceError && <div className="invalid-feedback">{priceError}</div>}
                    </div>


                    <div className="col-md-2">
                        <button className="btn btn-success w-100" type="submit">
                            Thêm mới
                        </button>
                    </div>
                </form>

                {/* Danh sách chi phí */}
                {loading ? (
                    <div className="text-secondary">Đang tải dữ liệu...</div>
                ) : expenses.length === 0 ? (
                    <div className="text-secondary">Không có dữ liệu chi phí.</div>
                ) : (
                    <div className="d-flex flex-wrap gap-4 justify-content-center">
                        {Object.entries(grouped).map(([label, items]) => (
                            <div
                                key={label}
                                className="bg-white shadow-sm rounded p-4"
                                style={{ minWidth: 320, maxWidth: 420 }}
                            >
                                <h5 className="text-primary fw-bold mb-3">{label}</h5>
                                <table className="table table-bordered table-sm mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Loại phí</th>
                                            <th className="text-end">Giá</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
  {items.map((exp) => (
    <tr key={exp._id}>
      <td>{TYPE_LABELS[exp.type] || `Loại ${exp.type}`}</td>
      <td className="text-end text-primary fw-bold">
        {exp.price.toLocaleString()} {exp.type === 1 ? "VND/m²" : "VND/tháng"}
      </td>
      <td className="text-center">
        <button
          className="btn btn-danger btn-sm"
          onClick={() => openDeleteModal(exp._id)}
        >
          Xóa
        </button>
      </td>
    </tr>
  ))}
</tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}

                <p className="mt-4">
                    <strong>Ghi chú:</strong> Giá quản lý căn hộ được tính tự động theo diện tích và tòa nhà.
                </p>

                <button
  className="btn btn-outline-warning mb-3"
  onClick={handleRecalculateFees}
>
  Tính lại phí tổng hợp
</button>


                <hr className="my-4" />

                <h4 className="fw-bold text-dark mb-3">
                    Bảng chi phí tổng hợp từng căn hộ theo tháng
                </h4>

                <div className="row g-3 mb-3 align-items-end">
                    {/* Bộ lọc theo tháng */}
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Lọc theo tháng</label>
                        <input
                            type="month"
                            className="form-control"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                        />
                    </div>

                    {/* Bộ lọc theo mã căn hộ hoặc tên chủ hộ */}
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Lọc theo mã căn hộ hoặc tên chủ hộ</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập mã căn hộ hoặc tên chủ hộ..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>

                    {/* Bộ lọc theo trạng thái thanh toán */}
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Lọc trạng thái</label>
                        <select
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            <option value="unpaid">Chưa thanh toán</option>
                            <option value="paid">Đã thanh toán</option>
                        </select>
                    </div>
                </div>



                <div className="table-responsive">
                    {loadingFees ? (
                        <div className="text-secondary">Đang tải dữ liệu chi phí...</div>
                    ) : filteredFees.length === 0 ? (
                        <div className="text-secondary">Không có dữ liệu chi phí căn hộ.</div>
                    ) : (
                        <>
                            <table className="table table-bordered table-striped table-hover">
                                <thead className="table-primary">
                                    <tr>
                                        <th>Mã căn hộ</th>
                                        <th>Chủ hộ</th>
                                        <th>Tháng</th>
                                        <th>Phí quản lý</th>
                                        <th>Phí nước</th>
                                        <th>Phí gửi xe</th>
                                        <th className="text-end">Tổng cộng</th>
                                        <th className="text-end">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedFees.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.apartmentCode}</td>
                                            <td>{row.ownerName}</td>
                                            <td>
                                                {(() => {
                                                    if (!row.month) return "---"; // Không có tháng thì hiện ---

                                                    let m;
                                                    // Nếu row.month dạng "MM/YYYY"
                                                    if (/^\d{2}\/\d{4}$/.test(row.month)) {
                                                        const [month, year] = row.month.split("/");
                                                        m = new Date(`${year}-${month}-01`);
                                                    } else {
                                                        m = new Date(row.month);
                                                    }

                                                    return isNaN(m)
                                                        ? "---"
                                                        : `${(m.getMonth() + 1).toString().padStart(2, "0")}/${m.getFullYear()}`;
                                                })()}
                                            </td>
                                            <td>{row.managementFee?.toLocaleString()} VND</td>
                                            <td>{row.waterFee?.toLocaleString()} VND</td>
                                            <td>{row.parkingFee?.toLocaleString()} VND</td>
                                            <td className="text-end fw-bold text-primary">
                                                {row.total?.toLocaleString()} VND
                                            </td>
                                            <td className="text-end">
                                                {(row.paymentStatus || "").toLowerCase().trim() === "paid" ? (
                                                    <span className="text-success">✔️ Đã thanh toán</span>
                                                ) : (
                                                    <span className="text-danger">❌ Chưa thanh toán</span>
                                                )}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Phân trang */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-3">
                                    <nav>
                                        <ul className="pagination">
                                            {Array.from({ length: totalPages }, (_, i) => (
                                                <li
                                                    key={i}
                                                    className={`page-item ${currentPage === i + 1 ? "active" : ""
                                                        }`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {/* Modal xác nhận xóa */}
{/* Modal xác nhận xóa */}
<ReusableModal
  show={showDeleteModal}
  title="Xác nhận xoá chi phí"
  onClose={() => setShowDeleteModal(false)}
  body="Bạn có chắc muốn xoá loại chi phí này?"
  footerButtons={[
    {
      label: "Hủy",
      variant: "secondary",
      onClick: () => setShowDeleteModal(false),
    },
    {
      label: "Xóa",
      variant: "danger",
      onClick: handleDelete,
    },
  ]}
/>


{/* Modal loading */}
{loadingModal && <LoadingModal />}
            </main>
        </div>
    );
};

export default Expenses;
