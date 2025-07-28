import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
// hàm lấy ra tát cả
export const getAllProfileUpdateRequests = async (token) => {
    if (!token) {
      throw new Error("❌ Không tìm thấy token");
    }
  
    return axios.get(`${API_BASE}/profile-update/profile-update/requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
// 🟡 Hàm lấy danh sách yêu cầu cập nhật hồ sơ, có hỗ trợ lọc theo status
export const getPendingProfileUpdates = async (token, filter) => {
  if (!token) {
    throw new Error("❌ Không tìm thấy token");
  }

  return axios.get(`${API_BASE}/profile-update/requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: filter ? { status: filter } : {}, // ✅ Truyền status nếu có filter
  });
};

// ✅ Duyệt yêu cầu cập nhật hồ sơ
export const approveProfileUpdate = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("❌ Không có token khi duyệt yêu cầu");

  return axios.put(`${API_BASE}/profile-update/requests/${id}/approve`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ✅ Từ chối yêu cầu cập nhật hồ sơ
export const rejectProfileUpdate = async (id, reason) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("❌ Không có token khi từ chối yêu cầu");

  return axios.put(
    `${API_BASE}/profile-update/requests/${id}/reject`,
    { reason }, // 🔴 Không được truyền token nhầm trong reason
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
