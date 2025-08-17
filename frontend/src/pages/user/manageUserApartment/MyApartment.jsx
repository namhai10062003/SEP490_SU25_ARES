import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import { createFeePayment } from "../../../service/feePayment.js";
import BillPopup from "../../../../components/BillPopup.jsx";

const MyApartment = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expensesMap, setExpensesMap] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showPopup, setShowPopup] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    if (user?._id) {
      fetchApartments();
    }
  }, [user, selectedMonth]);

  const fetchApartments = async () => {
    const currentMonth = selectedMonth;
    const formattedMonth = `${currentMonth.slice(5, 7)}/${currentMonth.slice(0, 4)}`;
    const encodedMonth = encodeURIComponent(formattedMonth);

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/apartments/my-apartment/${user._id}`);
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setApartments(data);
      for (let apt of data) {
        await fetchExpenses(apt, encodedMonth, currentMonth);
      }
    } catch (err) {
      console.error("❌ Lỗi lấy căn hộ:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (apartment, encodedMonth, currentMonth) => {
    try {
      const [feeRes, parkingFeeRes, waterRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/fees/detail/${apartment._id}/${currentMonth}`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/parkinglot/fee/${user._id}/${apartment._id}/${encodedMonth}`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/water/usage`)
      ]);

      const approvedParking = Array.isArray(parkingFeeRes.data?.data) ? parkingFeeRes.data.data : [];

      const filteredParking = approvedParking.filter((reg) => {
        const regDate = new Date(reg.registerDate);
        const cutoff = new Date(currentMonth + "-15");
        return regDate <= cutoff;
      });

      const totalParkingFee = filteredParking.reduce((sum, r) => sum + (r.price || 0), 0);

      const matchedWater = waterRes.data.find(
        (item) => item.apartmentCode === apartment.apartmentCode && item.month === currentMonth
      );

      await axios.patch(`${import.meta.env.VITE_API_URL}/api/fees/update-parking-fee/${apartment._id}/${currentMonth}`, {
        parkingFee: totalParkingFee
      });

      const newExpense = {
        maintenanceFee: feeRes.data.managementFee || 0,
        parkingRegs: filteredParking,
        parkingFee: totalParkingFee,
        waterFee: matchedWater?.total || 0,
        paymentStatus: feeRes.data.paymentStatus || "unpaid"
      };

      setExpensesMap((prev) => ({
        ...prev,
        [apartment._id]: newExpense
      }));
    } catch (err) {
      console.error("❌ Lỗi fetch chi phí:", err);
    }
  };


  const handlePayment = async (apartmentId) => {
    const formattedMonth = `${selectedMonth.slice(5, 7)}/${selectedMonth.slice(0, 4)}`;
    try {
      const res = await createFeePayment(apartmentId, formattedMonth);
      const paymentUrl = res.data.data.paymentUrl;
      window.location.href = paymentUrl;
    } catch (err) {
      console.error("❌ Lỗi tạo thanh toán:", err);
      alert("Không thể tạo thanh toán");
    }
  };

  const handleShowBill = async (apartmentId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/fees/detail/${apartmentId}/${selectedMonth}`
      );
      const fullBill = { ...res.data, month: selectedMonth };
      setCurrentBill(fullBill);
      setShowPopup(true);
    } catch (err) {
      console.error("❌ Lỗi lấy hóa đơn:", err);
      alert("Không thể lấy hóa đơn");
    }
  };

  if (loading) {
    return (
      <>
        <Header user={user} name={user?.name} logout={logout} />
        <div className="text-center py-5">Đang tải dữ liệu căn hộ...</div>
      </>
    );
  }

  const filteredApartments = apartments.filter((apartment) => {
    const roleText = String(apartment?.isRenter?._id) === user._id
      ? "Người thuê"
      : String(apartment?.isOwner?._id) === user._id
        ? "Chủ hộ"
        : "Không xác định";

    const haystack = `${apartment.apartmentCode} ${roleText} ${apartment?.ownerName || ""} 1`.toLowerCase();
    return haystack.includes(filterText.toLowerCase());
  });

  const formattedMonth = `${selectedMonth.slice(5, 7)}/${selectedMonth.slice(0, 4)}`;

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={user?.name} logout={logout} />
      <div className="container py-5">
        <h2 className="fw-bold text-center mb-4 text-primary">Quản Lý Chi Phí Căn Hộ</h2>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <input
            type="month"
            className="form-control w-auto"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setLoading(true);
              setExpensesMap({});
            }}
          />

          <input
            type="text"
            className="form-control w-auto ms-3"
            placeholder="Tìm kiếm..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <div className="d-flex flex-column gap-4 text-w">
          {filteredApartments.length === 0 && (
            <div className="text-center text-muted py-5">
              🏢 Bạn không có căn hộ nào
            </div>
          )}
          {filteredApartments.map((apartment) => {
            const expenses = expensesMap[apartment._id] || {};
            const { maintenanceFee = 0, waterFee = 0, parkingRegs = [], parkingFee = 0, paymentStatus = "unpaid" } = expenses;
            const total = maintenanceFee + waterFee + parkingFee;

            const isRenter = String(apartment?.isRenter?._id) === user._id;
            const isOwner = String(apartment?.isOwner?._id) === user._id;
            const roleText = isRenter ? "Người thuê" : isOwner ? "Chủ hộ" : "Không xác định";
            console.log(roleText);

            return (
              <div key={apartment._id} className="bg-white shadow rounded-4 p-4">
                <div className="row mb-2">
                  <div className="col-md-3 mb-2"><span className="fw-bold">Mã căn hộ:</span> {apartment.apartmentCode}</div>
                  <div className="col-md-3 mb-2"><span className="fw-bold">Vai trò của bạn:</span> {roleText}</div>
                  <div className="col-md-3 mb-2"><span className="fw-bold">Chủ căn hộ:</span> {apartment?.ownerName}</div>
                  <div className="col-md-3 mb-2"><span className="fw-bold">Số hóa đơn:</span> 1</div>
                </div>

                <h5 className="fw-bold mb-3">Tháng {formattedMonth}</h5>
                <div><span className="fw-bold">Tòa nhà:</span> {apartment.building}</div>
                <div><span className="fw-bold">Diện tích:</span> {apartment.area} m²</div>
                <div><span className="fw-bold">Phí bảo trì:</span> {maintenanceFee.toLocaleString("vi-VN")} VND</div>
                <div><span className="fw-bold">Phí nước:</span> {waterFee.toLocaleString("vi-VN")} VND</div>
                <div><span className="fw-bold">Phí gửi xe:</span>
                  <ul className="ps-3 mb-0">
                    {parkingRegs.length ? parkingRegs.map((reg, i) => (
                      <li key={i}>{reg.vehicleType} ({reg.licensePlate}): {reg.price?.toLocaleString("vi-VN")} VND</li>
                    )) : <li>Không có</li>}
                  </ul>
                  <div className="ms-3 fw-semibold text-secondary">Tổng: {parkingFee.toLocaleString("vi-VN")} VND</div>
                </div>
                <div className="mt-2 fw-bold">Tổng cộng: {total.toLocaleString("vi-VN")} VND</div>

                {apartment.canPay ? (
                  apartment.paymentStatus === "unpaid" ? (
                    <button
                      className="btn btn-success rounded-pill fw-semibold mt-3"
                      onClick={() => handlePayment(apartment._id)}
                    >
                      Thanh toán
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary rounded-pill fw-semibold mt-3"
                      onClick={() => handleShowBill(apartment._id)}
                    >
                      Xem hóa đơn
                    </button>
                  )
                ) : null}
              </div>
            );
          })}
        </div>

        {showPopup && currentBill && (
          <BillPopup show={showPopup} onClose={() => setShowPopup(false)} bill={currentBill} />
        )}

      </div>
    </div>
  );
};

export default MyApartment;
