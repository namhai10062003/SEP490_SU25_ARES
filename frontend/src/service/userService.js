// src/service/userService.js
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserById = (id) => {
    return axios.get(`${API_BASE}/users/${id}`, { headers: authHeaders() });
};

export const getUsers = (params) => {
    return axios.get(`${API_BASE}/users`, { params, headers: authHeaders() });
};

export const deleteUserById = (id) => {
    return axios.delete(`${API_BASE}/users/${id}`, { headers: authHeaders() });
};

export const checkUserDependencies = (id) => {
    return axios.get(`${API_BASE}/users/${id}/dependencies`, { headers: authHeaders() });
};

// block/unblock posting (chặn đăng bài)
export const blockUserFromPosting = (id, body = {}) => {
    return axios.patch(`${API_BASE}/users/block/${id}`, body, {
        headers: { "Content-Type": "application/json", ...authHeaders() },
    });
};
export const unblockUserFromPosting = (id, body = {}) => {
    return axios.patch(`${API_BASE}/users/unblock/${id}`, body, {
        headers: { "Content-Type": "application/json", ...authHeaders() },
    });
};

// block/unblock full account (không thể login)
export const blockUserAccount = (id, body = {}) => {
    return axios.patch(`${API_BASE}/users/blockAccount/${id}`, body, {
        headers: { "Content-Type": "application/json", ...authHeaders() },
    });
};
export const unblockUserAccount = (id, body = {}) => {
    return axios.patch(`${API_BASE}/users/unblockAccount/${id}`, body, {
        headers: { "Content-Type": "application/json", ...authHeaders() },
    });
};

// Get user Dependencies
export const getUserDependencies = (id) => {
    return axios.get(`${API_BASE}/users/checkDependency/${id}`, { headers: authHeaders() });
};