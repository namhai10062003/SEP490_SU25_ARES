import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/authContext";
import Header from "../../../components/header";

const MyApartment = () => {
    const { user, logout } = useAuth();
    const [apartment, setApartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [maintenanceFee, setMaintenanceFee] = useState(null);
    const [feeLoading, setFeeLoading] = useState(false);

    useEffect(() => {
        const fetchApartment = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/apartments/my-apartment/${user._id}`
                );
                setApartment(res.data);
            } catch (err) {
                setApartment(null);
            } finally {
                setLoading(false);
            }
        };
        if (user?._id) fetchApartment();
    }, [user]);

    const handleShowExpense = async () => {
        if (!apartment?._id) return;
        setFeeLoading(true);
        setShowExpenseModal(true);
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/apartments/expense/${apartment._id}`
            );
            setMaintenanceFee(res.data.maintenanceFee);
        } catch (err) {
            setMaintenanceFee(null);
        } finally {
            setFeeLoading(false);
        }
    };

    if (loading) return (
        <>
            <Header user={user} name={user?.name} logout={logout} />
            <div style={{ padding: 40, textAlign: "center" }}>Đang tải dữ liệu căn hộ...</div>
        </>
    );
    if (!apartment)
        return (
            <>
                <Header user={user} name={user?.name} logout={logout} />
                <div style={{ padding: 40, textAlign: "center" }}>
                    Bạn chưa sở hữu hoặc thuê căn hộ nào.
                </div>
            </>
        );

    return (
        <>
            <Header user={user} name={user?.name} logout={logout} />
            <div style={{
                maxWidth: 600,
                margin: "40px auto",
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px #eee",
                padding: 32
            }}>
                <h2 style={{ marginBottom: 24 }}>Căn hộ của tôi</h2>
                <div>
                    <strong>Mã căn hộ:</strong> {apartment?.apartmentCode || "Chưa có"}
                </div>
                <div>
                    <strong>Chủ sở hữu:</strong> {apartment?.ownerName || "Chưa có"}
                </div>
                <div>
                    <strong>Trạng thái:</strong> {apartment?.status || "Chưa có"}
                </div>
                {/* Thêm các thông tin khác nếu muốn */}
                <div style={{ marginTop: 24 }}>
                    <button
                        style={{
                            background: "#f2b600",
                            color: "#fff",
                            padding: "10px 22px",
                            borderRadius: 6,
                            textDecoration: "none",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer"
                        }}
                        onClick={handleShowExpense}
                    >
                        Xem chi phí/Hóa đơn
                    </button>
                </div>
            </div>

            {showExpenseModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                }}>
                    <div style={{
                        background: "#fff", borderRadius: 8, minWidth: 320, maxWidth: 400,
                        padding: 24, position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.18)"
                    }}>
                        <h3>Chi phí/Hóa đơn bảo trì</h3>
                        <div><strong>Tòa nhà:</strong> {apartment.building}</div>
                        <div><strong>Diện tích:</strong> {apartment.area} m²</div>
                        {feeLoading ? (
                            <div>Đang tải phí bảo trì...</div>
                        ) : (
                            <div>
                                <strong>Phí bảo trì:</strong>{" "}
                                {maintenanceFee !== null
                                    ? maintenanceFee.toLocaleString("vi-VN") + " đ/tháng"
                                    : "Không có dữ liệu"}
                            </div>
                        )}
                        <div style={{ marginTop: 24, textAlign: "right" }}>
                            <button onClick={() => setShowExpenseModal(false)} style={{
                                background: "#f2b600", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer"
                            }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyApartment;