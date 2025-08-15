// src/pages/PaymentCancel.jsx
import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get("orderCode");

  useEffect(() => {
    const cancelPayment = async () => {
      if (!orderCode) {
        toast.error("Không tìm thấy mã giao dịch");
        navigate("/my-contracts");
        return;
      }
      try {
        await axios.get(
            `${import.meta.env.VITE_API_URL}/api/contracts/cancel-payment/${orderCode}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        toast.info("💳 Thanh toán đã bị hủy");
        navigate("/my-contracts");
      } catch (err) {
        toast.error("❌ Lỗi khi hủy thanh toán");
        navigate("/my-contracts");
      }
    };
    cancelPayment();
  }, [orderCode, navigate]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Đang xử lý hủy thanh toán...</h2>
    </div>
  );
}
