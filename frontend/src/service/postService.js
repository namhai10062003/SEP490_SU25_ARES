import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const token = localStorage.getItem("token");
export const getPostHistoryByPostId = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("❌ Không tìm thấy token, vui lòng đăng nhập lại");
    }
    const response = await axios.get(`${API_BASE}/posts/posts/${postId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

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
            Authorization: `Bearer ${token}`, // chỉ set Authorization thôi
            // Không set Content-Type ở đây
        },
    });
};


// 🔵 CREATE payment for post
export const createPayment = async (postId) => {
    return axios.post(`https://api.ares.io.vn/api/payment/create-payment/${postId}`);
};

export const getAllPosts = async (page, pageSize, status, search) => {
    const token = localStorage.getItem("token");
    return axios.get(`${API_BASE}/posts/get-all-posts`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            page,
            pageSize,
            status,
            search,
        },
    });
};

export const getPostApproved = async () => {
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

    // Nếu là object thì lấy thuộc tính reasonreject, nếu không thì dùng nguyên giá trị
    const reasonText = typeof reasonReject === "object"
        ? reasonReject.reasonreject
        : reasonReject;

    return axios.put(
        `${API_BASE}/posts/reject-post/${postId}`,
        { reasonreject: reasonText },
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

export const getLatestPosts = async () => {
    const token = localStorage.getItem("token");
    return axios.get(`${API_BASE}/posts/get-post`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
};

export const getNearlyExpiringPosts = async () => {
    const token = localStorage.getItem("token");
    return axios.get(`${API_BASE}/posts/get-nearly-expire-post`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
};
