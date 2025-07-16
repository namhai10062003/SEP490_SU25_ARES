import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/withdrawals`;
// ✅ Hàm lấy token từ localStorage
const getToken = () => localStorage.getItem("token");

// 🔍 GET /api/withdrawals - lấy tất cả yêu cầu rút tiền
export const fetchAllWithdrawals = async () => {
    const token = localStorage.getItem("token"); // 🔒 Lấy token trực tiếp
    const res = await axios.get(`${API_URL}/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };
  

// ✅ PUT /api/withdrawals/:id/approve
export const approveWithdrawal = async (id, token = getToken()) => {
    const res = await axios.put(
      `${API_URL}/${id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  };
  
  // ❌ PUT /api/withdrawals/:id/reject
  // withdrawService.js
 // ❌ TỪ CHỐI yêu cầu rút
 export const rejectWithdrawal = async (id, reason) => {
    const token = getToken();
    const res = await axios.put(
      `${API_URL}/${id}/reject`,
      { reason }, // GỬI ĐÚNG DẠNG BẠN TEST TRÊN POSTMAN
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  };
