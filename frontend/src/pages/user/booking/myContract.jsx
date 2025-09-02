import axios from "axios";
import React, { useEffect, useState } from "react";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReusableModal from "../../../../components/ReusableModal";
import Header from "../../../../components/header";
import LoadingModal from "../../../../components/loadingModal";
import { useAuth } from "../../../../context/authContext";
const MyContracts = () => {
  const { user, loading } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editingContract, setEditingContract] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paidStatus, setPaidStatus] = useState({});
  const [isloading, setLoading] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [editForm, setEditForm] = useState({
    startDate: "",
    endDate: "",
    contractTerms: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const getToday = () => {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };
  // xử lý ngày h \
  // Hàm cộng ngày
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // // Khi load dữ liệu vào form
  // useEffect(() => {
  //   if (post) {
  //     const createdAt = new Date(post.createdAt);
  //     setEditForm({
  //       ...editForm,
  //       startDate: createdAt.toISOString().split("T")[0],
  //       endDate: addDays(createdAt, 7).toISOString().split("T")[0],
  //     });
  //   }
  // }, [post]);

  // // ✅ Nếu startDate > endDate → tự set endDate = startDate + 1
  // useEffect(() => {
  //   if (!editingContract) return;
  //   if (editForm.endDate <= editForm.startDate) {
  //     const nextDay = new Date(editForm.startDate);
  //     nextDay.setDate(nextDay.getDate() + 1);
  //     const nextDayStr = nextDay.toISOString().split("T")[0];
  //     setEditForm((prev) => ({ ...prev, endDate: nextDayStr }));
  //   }
  // }, [editForm.startDate, editingContract]);
  //fix lấy trạng thaias
  useEffect(() => {
    contracts.forEach((contract) => {
      fetch(
        `${import.meta.env.VITE_API_URL}/api/contracts/posts/${
          contract.postId
        }/has-paid-contract`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setPaidStatus((prev) => ({
            ...prev,
            [contract.postId]: data.hasPaid,
          }));
        })
        .catch((err) => {
          console.error(
            `Lỗi fetch trạng thái paid của postId ${contract.postId}:`,
            err
          );
        });
    });
  }, [contracts]);

  // ✅ Xử lý khi thanh toán thành công
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");

    const handlePaymentReturn = async () => {
      if (status === "PAID") {
        toast.success("✅ Thanh toán thành công");

        // Đợi webhook xử lý xong
        setTimeout(async () => {
          try {
            await fetchContracts();
          } catch {
            toast.error("❌ Lỗi khi làm mới hợp đồng");
          }
          navigate("/my-contracts", { replace: true });
        }, 2000);
      }
    };

    handlePaymentReturn();
  }, [location.search, navigate]);
  // xử lý hợp đồng
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/contracts/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setContracts(res.data.data);
    } catch {
      toast.error("❌ Lỗi khi tải hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchContracts();
  }, [user]);

  const openEditPopup = (contract) => {
    setEditingContract(contract);

    // Tính startDate = createdAt của contract
    const createdAt = new Date(contract.createdAt);
    const startDate = createdAt.toISOString().split("T")[0];

    // endDate = createdAt + 7 ngày
    const endDate = addDays(createdAt, 7).toISOString().split("T")[0];

    setEditForm({
      startDate,
      endDate,
      contractTerms: contract.contractTerms || "",
    });
  };

  const handleResubmit = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/contracts/${
          editingContract._id
        }/resubmit`,
        editForm,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("📤 Đã gửi lại hợp đồng");
      setContracts((prev) =>
        prev.map((c) =>
          c._id === editingContract._id
            ? { ...c, ...editForm, status: "pending", rejectReason: "" }
            : c
        )
      );
      setEditingContract(null);
    } catch {
      toast.error("❌ Lỗi khi gửi lại hợp đồng");
    } finally {
      setLoading(false);
    }
  };
  // hàm xử lý hủy hợp đồng
  // 👉 Hàm mở modal xác nhận
  const confirmCancelContract = (id) => {
    setCancelId(id);
  };

  // 👉 Hàm xử lý huỷ
  const handleCancelContract = async () => {
    if (!cancelId) return;
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/contracts/cancel/${cancelId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("🗑️ Đã huỷ hợp đồng");
      setContracts((prev) =>
        prev.map((c) =>
          c._id === cancelId ? { ...c, status: "cancelled" } : c
        )
      );
      setCancelId(null); // đóng modal
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi huỷ hợp đồng");
    } finally {
      setLoading(false);
    }
  };
  // hàm xử lí thanh toán
  const handlePayment = async (id) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/contracts/${id}/pay`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const paymentUrl = res.data.data.paymentUrl;
      if (paymentUrl) {
        toast.success("💳 Đang chuyển đến cổng thanh toán...");
        window.location.href = paymentUrl;
      } else {
        toast.error("❌ Không nhận được link thanh toán");
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Lỗi do có người khác đang thanh toán
        toast.warning(
          err.response.data.message ||
            "Hiện tại hợp đồng này đang được thanh toán bởi người khác"
        );
      } else {
        toast.error("❌ Lỗi khi tạo thanh toán hợp đồng");
      }
    }
  };

  if (loading) return <p>🔄 Đang tải...</p>;

  const filteredContracts = contracts.filter((c) => {
    const isMyContract =
      c.userId === user._id || c.userId === user._id?.toString();
    if (!isMyContract || c.status === "cancelled") return false;

    const now = new Date();
    const isExpired = new Date(c.endDate) < now;

    // Danh sách hợp đồng đã thanh toán
    const paidContracts = contracts.filter((pc) => pc.paymentStatus === "paid");

    // ✅ Kiểm tra xem có hợp đồng khác cùng postId đã thanh toán không
    const hasOtherPaid = paidContracts.some(
      (pc) => pc.postId === c.postId && pc._id !== c._id
    );

    const matchesStatus = (() => {
      switch (filter) {
        case "all":
          return true;

        case "pending": // Chờ duyệt, chưa hết hạn
          return c.status === "pending" && !isExpired;

        case "unpaid": // Approved, chưa thanh toán, không bị chặn, chưa hết hạn
          return (
            c.status === "approved" &&
            c.paymentStatus === "unpaid" &&
            !hasOtherPaid &&
            !isExpired
          );

        case "paid": // Đã thanh toán hoặc bị tính đã thanh toán do hợp đồng khác cùng postId
          return c.paymentStatus === "paid" || hasOtherPaid;

        case "cannotPay": // Approved, chưa thanh toán nhưng bị chặn
          return (
            c.status === "approved" &&
            c.paymentStatus === "unpaid" &&
            hasOtherPaid
          );

        case "failed": // Thanh toán thất bại
          return c.paymentStatus === "failed";

        case "rejected": // Bị từ chối
          return c.status === "rejected";

        case "expired": // pending hoặc approved nhưng hết hạn
          return c.status === "expired" && isExpired;

        default:
          return false;
      }
    })();

    const keyword = searchText.toLowerCase().trim();
    const combined = `${c.fullNameA} ${c.addressA} ${c.phoneA}`.toLowerCase();
    const matchesText = combined.includes(keyword);

    const inputAsNumber = parseFloat(searchText.replace(/[^\d]/g, ""));
    const matchesDeposit =
      isNaN(inputAsNumber) || c.depositAmount >= inputAsNumber;

    const matchesKeyword = matchesText || matchesDeposit;

    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);
    const contractDate = new Date(c.startDate);
    const matchesDate =
      (!from || contractDate >= from) && (!to || contractDate <= to);

    return matchesStatus && matchesKeyword && matchesDate;
  });

  return (
    <div className="bg-light min-vh-100">
      <Header
        user={user}
        name={user?.name}
        logout={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      />

      <div className="container py-4">
        <h2 className="fw-bold mb-4 text-primary">📄 Hợp đồng của tôi</h2>

        {/* Bộ lọc */}
        <div className="mb-4 d-flex align-items-center gap-2 flex-wrap">
          <label className="fw-semibold">Lọc trạng thái:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select w-auto"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="expired">Đã hết hạn</option>
            <option value="paid">Đã thanh toán</option>
            {/* <option value="failed">Thanh toán thất bại</option> */}
            <option value="rejected">Bị từ chối</option>
            <option value="cannotPay">Không thể thanh toán</option>
          </select>

          <input
            type="text"
            className="form-control w-auto"
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <input
            type="date"
            className="form-control w-auto"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="form-control w-auto"
            value={dateTo}
            min={dateFrom}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Danh sách hợp đồng */}
        {filteredContracts.length === 0 ? (
          <div className="alert alert-info">📭 Không có hợp đồng phù hợp.</div>
        ) : (
          <div className="row g-4">
            {filteredContracts.map((contract, index) => {
              const isExpired = new Date(contract.endDate) < new Date(); // ✅ Tính riêng từng contract

              return (
                <div className="col-12" key={contract._id}>
                  <div className="card shadow-sm rounded-4 border-0">
                    <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                      <div className="d-flex align-items-start gap-3 flex-grow-1">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 44, height: 44, fontSize: 20 }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">
                            🏠 {contract.fullNameA}
                          </h5>
                          <div className="mb-1">
                            <span className="fw-semibold">📍 Địa chỉ:</span>{" "}
                            {contract.addressA}
                          </div>
                          <div className="mb-1">
                            <span className="fw-semibold">📅 Ngày Tạo:</span>{" "}
                            {contract.createdAt
                              ? new Date(contract.createdAt)
                                  .toISOString()
                                  .slice(0, 10)
                              : "-"}{" "}
                            {/* {contract.createdAt
    ? new Date(new Date(contract.createdAt).setDate(
        new Date(contract.createdAt).getDate() + 7
      ))
        .toISOString()
        .slice(0, 10)
    : "-"} */}
                          </div>

                          <div className="mb-1">
                            <span className="fw-semibold">💰 Đặt cọc:</span>{" "}
                            {contract.depositAmount?.toLocaleString("vi-VN")}{" "}
                            VND
                          </div>
                          <div className="mb-1">
                            <span className="fw-semibold">📞 Liên hệ:</span>{" "}
                            {contract.phoneA}
                          </div>

                          <div className="payment-status">
                            {/* 1. Theo status */}
                            {contract.status === "expired" && (
                              <span className="badge bg-secondary p-2">
                                ⏳ Hợp đồng đã hết hạn
                              </span>
                            )}
                            {contract.status === "pending" && (
                              <span className="badge bg-info text-dark p-2">
                                📋 Đang chờ duyệt
                              </span>
                            )}
                            {contract.status === "rejected" && (
                              <span className="badge bg-danger p-2">
                                ❌ Hợp đồng bị từ chối
                              </span>
                            )}
                            {contract.status === "cancelled" && (
                              <span className="badge bg-warning text-dark p-2">
                                ⚠️ Hợp đồng đã bị hủy
                              </span>
                            )}

                            {/* 2. Theo paymentStatus (chỉ khi approved) */}
                            {contract.status === "approved" &&
                              (() => {
                                const hasOtherPaid =
                                  !!paidStatus?.[contract.postId];

                                switch (contract.paymentStatus) {
                                  case "paid":
                                    return (
                                      <span className="badge bg-success p-2">
                                        ✅ Đã thanh toán
                                      </span>
                                    );
                                  case "pending":
                                    return (
                                      <span className="badge bg-warning text-dark p-2">
                                        ⏳ Đang chờ thanh toán...
                                      </span>
                                    );
                                  case "unpaid":
                                    return hasOtherPaid ? (
                                      <span className="badge bg-info text-dark p-2">
                                        🔒 Đã có hợp đồng khác thanh toán
                                      </span>
                                    ) : (
                                      <span className="badge bg-primary p-2">
                                        💳 Chưa thanh toán
                                      </span>
                                    );
                                  case "failed":
                                    return (
                                      <span className="badge bg-danger p-2">
                                        ❌ Thanh toán thất bại
                                      </span>
                                    );
                                  default:
                                    return null;
                                }
                              })()}
                          </div>

                          {/* Nếu bị từ chối & chưa hết hạn => Gửi lại */}
                          {contract.status === "rejected" && !isExpired && (
                            <>
                              <div className="text-danger fst-italic mt-2">
                                📝 Lý do:{" "}
                                {contract.rejectionReason ||
                                  "Không có lý do cụ thể"}
                              </div>
                              <button
                                className="btn btn-outline-primary btn-sm mt-2"
                                onClick={() => openEditPopup(contract)}
                              >
                                CHỈNH SỬA & GỬI LẠI
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="d-flex flex-column gap-2 mt-3 mt-md-0">
                        <button
                          className="btn btn-info fw-bold"
                          onClick={() => navigate(`/contracts/${contract._id}`)}
                        >
                          XEM CHI TIẾT
                        </button>

                        {/* HUỶ nếu pending và chưa hết hạn */}
                        <>
                          {/* HUỶ nếu pending và chưa hết hạn */}
                          {contract.status === "pending" &&
                            !contract.isExpired && (
                              <button
                                className="btn btn-outline-danger fw-bold mt-2"
                                onClick={() =>
                                  confirmCancelContract(contract._id)
                                }
                              >
                                HUỶ HỢP ĐỒNG
                              </button>
                            )}

                          {/* Modal xác nhận */}
                          <ReusableModal
                            show={!!cancelId}
                            onClose={() => setCancelId(null)}
                            title="Xác nhận huỷ hợp đồng"
                            body={
                              <p>Bạn có chắc chắn muốn huỷ hợp đồng này?</p>
                            }
                            footerButtons={[
                              {
                                label: isloading
                                  ? "⏳ Đang huỷ..."
                                  : "❌ Huỷ hợp đồng",
                                variant: "danger",
                                onClick: handleCancelContract,
                                disabled: isloading,
                              },
                              {
                                label: "Đóng",
                                variant: "secondary",
                                onClick: () => setCancelId(null),
                                disabled: isloading,
                              },
                            ]}
                          />

                          {/* Loading overlay */}
                          {isloading && <LoadingModal />}
                        </>

                        {/* THANH TOÁN nếu đã được duyệt và chưa thanh toán */}
                        {contract.status === "approved" &&
                          contract.paymentStatus === "unpaid" && (
                            <button
                              className="btn btn-primary fw-bold"
                              onClick={() => handlePayment(contract._id)}
                              disabled={paidStatus[contract.postId]} // disable nếu đã có người khác thanh toán
                            >
                              {paidStatus[contract.postId]
                                ? "Đã có hợp đồng khác thanh toán"
                                : "THANH TOÁN"}
                            </button>
                          )}

                        {contract.status === "approved" &&
                          contract.paymentStatus === "pending" && (
                            <span className="text-warning fw-bold">
                              Đang chờ thanh toán...
                            </span>
                          )}

                        {contract.status === "approved" &&
                          contract.paymentStatus === "paid" && (
                            <span className="text-success fw-bold">
                              Đã thanh toán
                            </span>
                          )}

                        {contract.paymentStatus === "failed" && (
                          <span className="text-danger fw-bold">
                            Thanh toán thất bại
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Popup chỉnh sửa hợp đồng */}
                  {editingContract && editingContract._id === contract._id && (
                    <div
                      className="modal fade show d-block"
                      tabIndex="-1"
                      style={{ background: "rgba(0,0,0,0.4)" }}
                    >
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">
                              ✏️ Chỉnh sửa hợp đồng
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => setEditingContract(null)}
                            ></button>
                          </div>
                          <div className="modal-body">
                            <div className="mb-2">
                              <strong>👤 Người thuê:</strong>{" "}
                              {editingContract.fullNameB} -{" "}
                              {editingContract.phoneB}
                            </div>
                            <div className="mb-2">
                              <strong>👤 Chủ nhà:</strong>{" "}
                              {editingContract.fullNameA} -{" "}
                              {editingContract.phoneA}
                            </div>
                            <div className="mb-3">
                              <label className="form-label">
                                📅 Ngày bắt đầu
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                value={editForm.startDate}
                                disabled // ⬅️ chặn sửa + input xám
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label">
                                📅 Ngày kết thúc
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                value={editForm.endDate}
                                disabled // ⬅️ chặn sửa + input xám
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label">
                                📜 Ghi chú thêm vào hợp đồng
                              </label>
                              <textarea
                                rows={4}
                                className="form-control"
                                value={editForm.contractTerms}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    contractTerms: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button
                              className="btn btn-secondary"
                              onClick={() => setEditingContract(null)}
                            >
                              Hủy
                            </button>
                            <button
                              className="btn btn-success"
                              onClick={handleResubmit}
                            >
                              Gửi lại
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isloading && <LoadingModal />}
    </div>
  );
};

export default MyContracts;
