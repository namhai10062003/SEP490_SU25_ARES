import mongoose from "mongoose";
import Post from '../models/Post.js';
import PostPackage from '../models/Postpackage.js';
import User from '../models/User.js';
export const createPost = async (req, res) => {
    try {
        const postData = req.body;
        const imageUrls = req.files.map((file) => file.path); // nếu dùng Cloudinary

        console.log(imageUrls);
        console.log(postData);

        // Tìm user theo số điện thoại
        const userID = await User.findOne({ phone: postData.phone });
        if (!userID) {
            return res.status(400).json({
                message: "User không tồn tại",
                success: false,
                error: true
            });
        }

        // Kiểm tra gói đăng tin có tồn tại không
        const postPackage = await PostPackage.findById(postData.postPackage);
        if (!postPackage) {
            return res.status(400).json({
                message: "Package không tồn tại",
                success: false,
                error: true
            });
        }

        // Tạo đối tượng post mới
        const post = new Post({
            type: postData.type,
            title: postData.title,
            description: postData.description,
            location: postData.location,
            property: postData.property,
            area: postData.area,
            price: postData.price,
            legalDocument: postData.legalDocument,
            interiorStatus: postData.interiorStatus,
            amenities: postData.amenities,
            contactInfo: userID._id,
            images: imageUrls,
            postPackage: postData.postPackage,
            status: 'pending',
            paymentStatus: 'unpaid',
            reasonreject: null
        });

        // Nếu có apartmentCode thì thêm vào post
        if (postData.apartmentCode) {
            post.apartmentCode = postData.apartmentCode;
        }

        await post.save();

        return res.status(201).json({
            message: "Tạo bài đăng thành công. Vui lòng thanh toán để kích hoạt bài đăng.",
            success: true,
            error: false,
            data: {
                post,
                packagePrice: postPackage.price
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true
        });
    }
};


export const getPost = async (req, res) => {
    try {
        const post = await Post.find()
            .populate('contactInfo', 'name email phone')
            .populate('postPackage', 'type price expireAt')
            .sort({ createdAt: -1 }); // 👈 DESCENDING
        if (post.length === 0) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: true
            });
        }
        return res.status(200).json({
            message: "Post retrieved successfully",
            success: true,
            error: false,
            data: post
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true
        });
    }
};
// list ra all post have status active
export const getActivePosts = async (req, res) => {
    try {
        const activePosts = await Post.find({ status: "active", isActive: true }) // thêm điều kiện isActive
            .populate('contactInfo', 'name email phone')
            .populate('postPackage', 'type price expireAt')
            .sort({ createdAt: -1 });

        if (activePosts.length === 0) {
            return res.status(404).json({
                message: "No active posts found",
                success: false,
                error: true
            });
        }

        return res.status(200).json({
            message: "Active posts retrieved successfully",
            success: true,
            error: false,
            data: activePosts
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true
        });
    }
};


export const getPostbyUser = async (req, res) => {
    try {
        const userId = req.user._id
        console.log(userId);

        const post = await Post.find({ contactInfo: userId })
            .populate('contactInfo', 'name email phone')
            .populate('postPackage', 'type price expireAt')
        if (post.length === 0) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: true
            });
        }
        return res.status(200).json({
            message: "Post retrieved successfully",
            success: true,
            error: false,
            data: post
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true
        });
    }
};

export const getPostActive = async (req, res) => {
    try {
        const post = await Post.find({ status: "active", isActive: true })
            .populate('contactInfo', 'name email phone')
            .populate('postPackage', 'type price expireAt')
        if (post.length === 0) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: true
            });
        }
        return res.status(200).json({
            message: "Post retrieved successfully",
            success: true,
            error: false,
            data: post
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true
        });
    }
};
// lấy bài viết chi tiết 
export const getPostDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Kiểm tra ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid post ID",
                success: false,
                error: true,
            });
        }

        // 2️⃣ Truy vấn đúng ID
        const post = await Post.findById(id)
            .populate("contactInfo", "name email phone identityNumber address")
            .populate("postPackage", "type price expireAt")
            .lean();

        if (!post) {
            // Không hề tồn tại trong DB
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: true,
            });
        }

        // 3️⃣ Kiểm tra trạng thái
        if (post.status !== "active" || !post.isActive) {
            return res.status(403).json({
                message: "Bài viết tồn tại nhưng không hoạt động (inactive)",
                success: false,
                error: true,
            });
        }

        // 4️⃣ Thành công
        return res.status(200).json({
            message: "Post details retrieved successfully",
            success: true,
            error: false,
            data: {
                ...post,
                contactInfo: {
                    ...post.contactInfo,
                    userId: post.contactInfo._id,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true,
        });
    }
};
export const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const updateData = req.body;
        const images = req.file?.path;

        // Kiểm tra xem bài đăng có tồn tại không
        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: true
            });
        }
        // Cập nhật từng trường riêng biệt
        existingPost.title = updateData.title;
        existingPost.description = updateData.description;
        existingPost.location = updateData.location;
        existingPost.property = updateData.property;
        existingPost.area = updateData.area;
        existingPost.price = updateData.price;
        existingPost.legalDocument = updateData.legalDocument;
        existingPost.interiorStatus = updateData.interiorStatus;
        existingPost.amenities = updateData.amenities;
        existingPost.postPackage = updateData.postPackagename;
        existingPost.images = images || existingPost.images;
        // Lưu các thay đổi
        await existingPost.save();
        return res.status(200).json({
            message: "Post updated successfully",
            success: true,
            error: false,
            data: existingPost
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true
        });
    }
};

export const updatePostStatusByAdmin = async (req, res) => {
    try {
        const postId = req.params.id;
        const status = req.body.status;
        const reasonreject = req.body.reasonreject;
        // Kiểm tra xem bài đăng có tồn tại không
        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: true
            });
        }
        if (status === "rejected") {
            existingPost.status = status;
            existingPost.reasonreject = reasonreject
        } else {
            existingPost.status = status;
        }
        // Lưu các thay đổi
        await existingPost.save();
        return res.status(200).json({
            message: "Post updated successfully",
            success: true,
            error: false,
            data: existingPost
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true
        });
    }
};
export const getPostDetailForAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid post ID",
                success: false,
                error: true,
            });
        }

        const post = await Post.findById(id)
            .populate("contactInfo", "name email phone identityNumber address")
            .populate("postPackage", "type price expireAt")
            .lean();

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: true,
            });
        }

        // ✅ No status check here
        return res.status(200).json({
            message: "Post details retrieved successfully",
            success: true,
            error: false,
            data: {
                ...post,
                contactInfo: {
                    ...post.contactInfo,
                    userId: post.contactInfo._id,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true,
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        // Kiểm tra xem bài đăng có tồn tại không
        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: true
            });
        }

        await Post.findByIdAndDelete(postId);

        return res.status(200).json({
            message: "Post deleted successfully",
            success: true,
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            error: true
        });
    }
};
