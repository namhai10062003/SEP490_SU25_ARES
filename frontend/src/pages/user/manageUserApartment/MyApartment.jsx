import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/authContext";
import Header from "../../../../components/header";
import { useNavigate } from "react-router-dom";

const MyApartment = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [apartment, setApartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [maintenanceFee, setMaintenanceFee] = useState(0);
    const [parkingRegs, setParkingRegs] = useState([]);
    const [waterFee, setWaterFee] = useState(0);

    useEffect(() => {
        if (user?._id) {
            fetchApartment();
        }
    }, [user]);

    useEffect(() => {
        if (apartment?._id) {
            fetchExpenses();
        }
    }, [apartment]);

    const fetchApartment = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/apartments/my-apartment/${user._id}`);
            setApartment(res.data);
        } catch (err) {
            setApartment(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchExpenses = async () => {
        try {
            const [feeRes, parkingRes, waterRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/apartments/expense/${apartment._id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/parkinglot/user/${user._id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/water/usage`)
            ]);

            setMaintenanceFee(feeRes.data.maintenanceFee || 0);

            const approvedParking = parkingRes.data.data.filter(item => item.status === "approved");
            setParkingRegs(approvedParking);

            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const matched = waterRes.data.find(item =>
                item.apartmentCode === apartment.apartmentCode && item.month === currentMonth
            );
            setWaterFee(matched?.total || 0);



        } catch (err) {
            console.error("❌ Lỗi khi fetch chi phí:", err);
            setMaintenanceFee(0);
            setParkingRegs([]);
            setWaterFee(0);
        }
    };

    if (loading) return (<><Header user={user} name={user?.name} logout={logout} /><div className="text-center py-5">Đang tải dữ liệu căn hộ...</div></>);
    if (!apartment) return (<><Header user={user} name={user?.name} logout={logout} /><div className="text-center py-5">Bạn chưa sở hữu hoặc thuê căn hộ nào.</div></>);

    const totalParking = parkingRegs.reduce((sum, reg) => sum + (reg.price || 0), 0);
    const total = (maintenanceFee || 0) + (waterFee || 0) + totalParking;

    return (
        <div className="bg-light min-vh-100">
            <Header user={user} name={user?.name} logout={logout} />
            <div className="container py-5">
                <h2 className="fw-bold text-center mb-4 text-primary">Quản Lý Chi Phí Căn Hộ</h2>

                <div className="bg-white text-center rounded-4 shadow p-2 mb-4">
                    <div className="row mb-2">
                        <div className="col-md-3 mb-2">
                            <span className="fw-bold">Mã căn hộ:</span> {apartment?.apartmentCode}
                        </div>
                        <div className="col-md-3 mb-2">
                            <span className="fw-bold">Vai trò của bạn:</span> {user?.role === 'renter' ? 'Người thuê' : 'Chủ hộ'}
                        </div>
                        <div className="col-md-3 mb-2">
                            <span className="fw-bold">Chủ căn hộ:</span> {apartment?.ownerName}
                        </div>
                        <div className="col-md-3 mb-2">
                            <span className="fw-bold">Số hóa đơn:</span> 1
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-4 overflow-auto">
                    {["07/2025"].map((month, idx) => (
                        <div key={idx} className="bg-white shadow rounded-4 p-4" style={{ minWidth: 300 }}>
                            <h5 className="fw-bold mb-3">Tháng {month}</h5>
                            <div><span className="fw-bold">Tòa nhà:</span> {apartment.building}</div>
                            <div><span className="fw-bold">Diện tích:</span> {apartment.area} m²</div>
                            <div><span className="fw-bold">Phí bảo trì:</span> {maintenanceFee.toLocaleString("vi-VN")} đ</div>
                            <div><span className="fw-bold">Phí nước:</span> {waterFee.toLocaleString("vi-VN")} đ</div>
                            <div><span className="fw-bold">Phí gửi xe:</span>
                                <ul className="ps-3 mb-0">
                                    {parkingRegs.length ? parkingRegs.map((reg, i) => (
                                        <li key={i}>{reg.vehicleType} ({reg.licensePlate}): {reg.price?.toLocaleString("vi-VN")} đ</li>
                                    )) : <li>Không có</li>}
                                </ul>
                            </div>
                            <div className="mt-2 fw-bold">Tổng cộng: {total.toLocaleString("vi-VN")} đ</div>
                            <button
                                className="btn btn-success rounded-pill fw-semibold mt-3"
                                onClick={() => navigate(`/thanh-toan?month=${month}`)}
                            >
                                Thanh toán
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyApartment;
