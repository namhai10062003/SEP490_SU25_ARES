import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const token = localStorage.getItem("token");
// 🟢 GET posts of current user
export const getPostsByUser = async () => {
    return axios.get(`${API_BASE}/posts/get-postbyUser`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// 🔴 DELETE post
export const deletePost = async (postId) => {
    return axios.delete(`${API_BASE}/posts/delete-posts/${postId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// 🟡 UPDATE post
export const updatePost = async (postId, updatedData) => {
    return axios.put(`${API_BASE}/posts/update-posts/${postId}`, updatedData, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // hoặc lấy từ context nếu muốn
        },
    });
};

// 🔵 CREATE payment for post
export const createPayment = async (postId) => {
    return axios.post(`${API_BASE}/payment/create-payment/${postId}`);
};

export const getAllPosts = async () => {
    return axios.get(`${API_BASE}/posts/get-post`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const getAllPostsActive = async () => {
    return axios.get(`${API_BASE}/posts/get-post-active`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
// ham chi tiet blog 
export const getPostById = async (id) => {
    return axios.get(`${import.meta.env.VITE_API_URL}/api/posts/postdetail/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
export const createPost = async (updatedData) => {
    return axios.post(`${import.meta.env.VITE_API_URL}/api/posts/create-post`, updatedData, {
        headers: {
            Authorization: `Bearer ${token}`, // hoặc lấy từ context nếu muốn
        },
    });
};

export const updatePostStatus = async (postId, data) => {
    return axios.put(
        `${API_BASE}/posts/update-posts-statusbyAdmin/${postId}`,
        {
            status: data.status,
            reasonreject: data.rejectReason
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
};
export const deletePostById = async (postId) => {
    return axios.delete(`${API_BASE}/posts/delete-posts/${postId}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
};

