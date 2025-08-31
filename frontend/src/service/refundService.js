import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Hàm helper để lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // hoặc "user" nếu bạn lưu JSON
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Lấy tất cả refund
export const fetchAllRefunds = async () => {
  return axios.get(`${API_URL}/api/refunds`, {
    headers: getAuthHeaders(),
  });
};

// Duyệt
export const approveRefund = async (id) => {
  return axios.put(
    `${API_URL}/api/refunds/${id}/approve`,
    {},
    { headers: getAuthHeaders() }
  );
};

// Từ chối
// rejectRefund kèm lý do từ chối
export const rejectRefund = async (id, rejectReason) => {
    return axios.put(
      `${API_URL}/api/refunds/${id}/reject`,
      { rejectReason }, // gửi body chứa rejectReason
      { headers: getAuthHeaders() }
    );
  };
  
