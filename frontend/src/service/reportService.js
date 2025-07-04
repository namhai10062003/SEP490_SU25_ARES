import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/interaction`;

// ✅ Hàm authHeader chuẩn
const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/**
 * 📌 Lấy danh sách tất cả báo cáo (admin)
 * @param {string} status - (Tùy chọn) "pending", "reviewed", "rejected"
 */
export const fetchAllReports = (status) => {
  const url = status
    ? `${API}/reports?status=${status}`
    : `${API}/reports`;

  return axios.get(url, getAuthHeader());
};

/**
 * 📌 Cập nhật trạng thái báo cáo (admin)
 * @param {string} reportId - ID báo cáo
 * @param {string} status - "reviewed" hoặc "rejected"
 */
export const updateReportStatus = (reportId, body) =>
  axios.patch(
    `${API}/reportsbyadmin/${reportId}`,
    body, // 👈 truyền trực tiếp object { status, reason }
    getAuthHeader()
  );

