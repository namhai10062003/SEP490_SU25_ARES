import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const token = localStorage.getItem("token");
// 🟢 GET posts of current user
export const getPostsByUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return Promise.reject(new Error("No token"));
    return axios.get(`${API_BASE}/posts/get-postbyUser`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
// get Plaza để sửa 
export const getPlazaList = async (token) => {
    return axios.get(`${API_BASE}/plaza`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
// get aparment ra á 
export const getApartmentList = async () => {
    return await axios.get(`${API_BASE}/apartments`); // Giả sử route là đúng
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
    return axios.post(`https://api.ares.io.vn/api/payment/create-payment/${postId}`);
};

export const getAllPosts = async () => {
    const token = localStorage.getItem("token");
    return axios.get(`${API_BASE}/posts/get-post`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const getAllPostsActive = async () => {
    const token = localStorage.getItem("token");
    return axios.get(`${API_BASE}/posts/get-post-active`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
// ham chi tiet blog 
export const getPostById = async (id) => {
    const token = localStorage.getItem("token");
    return axios.get(`${import.meta.env.VITE_API_URL}/api/posts/postdetail/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
export const getPostByIdForAdmin = async (id) => {
    const token = localStorage.getItem("token");
    return axios.get(`${import.meta.env.VITE_API_URL}/api/posts/admin/postdetail/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
export const verifyPostByAdmin = async (postId) => {
    const token = localStorage.getItem("token");
    return axios.put(
        `${API_BASE}/posts/verify-post/${postId}`,
        {},
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
};
export const rejectPostByAdmin = async (postId, reasonReject) => {
    const token = localStorage.getItem("token");
    return axios.put(
        `${API_BASE}/posts/reject-post/${postId}`,
        { reasonReject },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
};
export const deletePostByAdmin = async (postId) => {
    const token = localStorage.getItem("token");
    return axios.put(
        `${API_BASE}/posts/delete-post/${postId}`,
        {},
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
}
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

