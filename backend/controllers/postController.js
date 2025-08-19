import mongoose from "mongoose";
import { decrypt } from "../db/encryption.js";
import Post from '../models/Post.js';
import PostHistory from "../models/PostHistory.js"; // nhớ thêm `.js` nếu dùng ESM
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
// get ra xem all post

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
export const getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const query = {};

    // Filter theo trạng thái
    if (status && status !== "all") {
      if (status === "blog") {
        // ✅ Lấy bài approved + paid
        query.status = "approved";
        query.paymentStatus = "paid";
      } else {
        query.status = status;
      }
    }

    // Tìm kiếm theo tiêu đề, vị trí, loại bài, tên người liên hệ
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");

      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { type: searchRegex }
        // NOTE: Tìm theo `contactInfo.name` cần aggregate, để đơn giản ta sẽ populate và lọc ở FE
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Truy vấn DB
    const posts = await Post.find(query)
      .populate("contactInfo", "name email phone")
      .populate("postPackage", "type price expireAt")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      message: "Danh sách bài đăng",
      success: true,
      error: false,
      data: posts,
      total,
      totalPages,
      currentPage: parseInt(page),
      pageSize: parseInt(pageSize)
    });

  } catch (error) {
    console.error("Lỗi lấy bài đăng:", error);
    return res.status(500).json({
      message: "Lỗi server",
      success: false,
      error: true
    });
  }
};


// get post ra trang home 
export const getPostForGuest = async (req, res) => {
  try {
    const now = new Date();

    // Lọc ở DB: chỉ lấy bài approved + paid và có expiredDate >= now
    const posts = await Post.find({
      status: "approved",
      paymentStatus: "paid",
      expiredDate: { $exists: true, $gte: now } // <- quan trọng
    })
      .populate('contactInfo', 'name email phone')
      .populate('postPackage', 'type price expireAt')
      .sort({ createdAt: -1 })
      .lean();

    if (posts.length === 0) {
      return res.status(404).json({
        message: "Không có bài đăng hợp lệ.",
        success: false,
        error: true
      });
    }

    return res.status(200).json({
      message: "Lấy bài đăng thành công (cho khách xem)",
      success: true,
      error: false,
      data: posts
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
export const getApprovedPosts = async (req, res) => {
  try {
    console.log("📌 Đang tìm bài với điều kiện: status = 'approved'");

    const approvedPosts = await Post.find({
      status: "approved" // KHÔNG lọc theo isActive nữa
    })
      .populate('contactInfo', 'name email phone')
      .populate('postPackage', 'type price expireAt')
      .sort({ createdAt: -1 });

    console.log("📦 Kết quả truy vấn:", approvedPosts.length, "bài");

    if (!approvedPosts || approvedPosts.length === 0) {
      console.warn("⚠️ Không có bài nào đã được duyệt.");
      return res.status(404).json({
        message: "Không có bài đăng nào đã được duyệt",
        success: false,
        error: true
      });
    }

    console.log("✅ Trả về bài viết thành công.");
    return res.status(200).json({
      message: "Lấy danh sách bài đăng đã được duyệt thành công",
      success: true,
      error: false,
      data: approvedPosts
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách bài đăng:", error);
    return res.status(500).json({
      message: "Lỗi server: " + error.message,
      success: false,
      error: true
    });
  }
};

export const getPostbyUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Lấy tất cả bài viết của user
    const posts = await Post.find({ contactInfo: userId })
      .populate("contactInfo", "name email phone")
      .populate("postPackage", "type price expireAt");

    // Nếu không có bài nào
    if (!posts || posts.length === 0) {
      return res.status(200).json({
        message: "No posts found",
        success: true,
        error: false,
        data: [],
        count: 0, // 👈 thêm số lượng để frontend dùng luôn
      });
    }

    // Nếu có bài viết
    return res.status(200).json({
      message: "Post retrieved successfully",
      success: true,
      error: false,
      data: posts,
      count: posts.length, // 👈 trả thêm số lượng
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

export const getPostApproved = async (req, res) => {
  try {
    const posts = await Post.find({
      status: "approved",
      paymentStatus: "paid" // Chỉ lấy bài đã thanh toán
    })
      .populate('contactInfo', 'name email phone')
      .populate('postPackage', 'type price expireAt');

    if (posts.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy bài viết đã duyệt và đã thanh toán nào",
        success: false,
        error: true
      });
    }

    return res.status(200).json({
      message: "Lấy bài viết đã duyệt và đã thanh toán thành công",
      success: true,
      error: false,
      data: posts
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};


// lấy bài đăng chi tiết 

// Hàm giải mã an toàn có log vị trí
function safeDecrypt(value, fieldName, postId) {
  const isHex = /^[0-9a-fA-F]+$/.test(value);
  if (!value || !isHex) return value;
  try {
    return decrypt(value);
  } catch (err) {
    console.warn(
      `⚠️ Không thể giải mã ${fieldName} (postId: ${postId}) - ${err.message}`
    );
    console.warn(new Error().stack);
    return value;
  }
}

export const getPostDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID bài đăng không hợp lệ",
        success: false,
        error: true,
      });
    }

    const post = await Post.findById(id)
      .populate("contactInfo", "_id name email phone identityNumber address profileImage")
      .populate("postPackage", "type price expireAt")
      .lean();

    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài đăng",
        success: false,
        error: true,
      });
    }

    if (post.status !== "approved") {
      return res.status(403).json({
        message: "Bài đăng không hoạt động hoặc chưa được duyệt",
        success: false,
        error: true,
      });
    }

    const { contactInfo } = post;

    // 🔐 Chỉ giải mã CCCD
    const decryptedContactInfo = {
      ...contactInfo,
      userId: contactInfo._id,
      identityNumber: safeDecrypt(contactInfo.identityNumber, "identityNumber", post._id),
    };

    // 📋 Log chi tiết
    console.log("📌 Thông tin liên hệ gốc:", contactInfo);
    console.log("🔓 Thông tin sau giải mã:", decryptedContactInfo);

    return res.status(200).json({
      message: "Lấy chi tiết bài đăng thành công",
      success: true,
      error: false,
      data: {
        ...post,
        contactInfo: decryptedContactInfo,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết bài đăng:", error);
    return res.status(500).json({
      message: "Lỗi server: " + error.message,
      success: false,
      error: true,
    });
  }
};




// get post admin histories
export const getPostHistories = async (req, res) => {
  try {
    const postId = req.params.id;

    // Lấy tất cả lịch sử chỉnh sửa của bài đăng, sắp xếp mới nhất trước
    const histories = await PostHistory.find({ postId })
      .populate("editedBy", "name email") // hiển thị người sửa
      .sort({ editedAt: -1 });

    return res.status(200).json({
      message: "Lấy lịch sử chỉnh sửa thành công",
      success: true,
      error: false,
      data: histories,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

export const startEditingPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    // Đánh dấu đang chỉnh sửa
    post.isEditing = true;
    post.editingAt = new Date();

    await post.save();

    return res.status(200).json({
      message: "Đã đánh dấu đang chỉnh sửa",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

const normalizeValue = (val, key) => {
  if (val === null || val === undefined) return val;

  // Convert ObjectId sang string
  if (val._bsontype === "ObjectID") return val.toString();

  // Riêng với images (mảng), sort rồi so sánh mảng chuỗi
  if (key === 'images' && Array.isArray(val)) {
    // Sắp xếp để tránh khác thứ tự cũng bị coi là khác
    return val.slice().sort();
  }

  // Riêng amenities, nếu là mảng, sắp xếp, hoặc nếu là chuỗi, tách thành mảng
  if (key === 'amenities') {
    if (Array.isArray(val)) {
      return val.slice().sort();
    } else if (typeof val === 'string') {
      // Tách chuỗi theo dấu phẩy hoặc khoảng trắng nếu cần (tùy data)
      return val.split(',').map(s => s.trim()).sort();
    }
  }

  if (Array.isArray(val)) return val.map(v => normalizeValue(v));

  // Chuyển thành string để tránh khác biệt kiểu (vd: 90 vs "90")
  return val.toString();
};
export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const updateData = req.body;
    const uploadedImages = req.files?.map(file => file.path) || [];
    const userId = req.user?._id;
    console.log("req.files:", req.files);

    if (!userId) {
      return res.status(401).json({
        message: "Không xác định được người chỉnh sửa (userId)",
        success: false,
        error: true,
      });
    }

    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // if (existingPost.status === "approved") {
    //   return res.status(400).json({
    //     message: "Bài đăng đã được duyệt. Không thể chỉnh sửa.",
    //     success: false,
    //     error: true,
    //   });
    // }

    // Tạo bản sao object post để so sánh
    const oldPostData = existingPost.toObject();

    // Xử lý ảnh mới và ảnh cũ giữ lại
    let keepImages = [];
    if (updateData.oldImages) {
      if (typeof updateData.oldImages === "string") {
        try {
          keepImages = JSON.parse(updateData.oldImages);
        } catch {
          keepImages = [];
        }
      } else if (Array.isArray(updateData.oldImages)) {
        keepImages = updateData.oldImages;
      }
    } else {
      keepImages = existingPost.images || [];
    }
    const newImages = [...keepImages, ...uploadedImages];

    // Gán ảnh mới vào updateData để gán sau
    updateData.images = newImages;

    // Gán các dữ liệu cập nhật (bao gồm cả images)
    Object.assign(existingPost, updateData);

    const editedData = {};
    for (const key in updateData) {
      if (Object.prototype.hasOwnProperty.call(oldPostData, key)) {
        const oldVal = normalizeValue(oldPostData[key], key);
        const newVal = normalizeValue(updateData[key], key);
    
        // Nếu cả 2 là mảng, so sánh từng phần tử
        if (Array.isArray(oldVal) && Array.isArray(newVal)) {
          const arraysEqual = oldVal.length === newVal.length &&
            oldVal.every((v, i) => v === newVal[i]);
          if (!arraysEqual) {
            editedData[key] = {
              old: oldPostData[key],
              new: updateData[key],
            };
          }
        } else if (oldVal !== newVal) {
          editedData[key] = {
            old: oldPostData[key],
            new: updateData[key],
          };
        }
      }
    }
  
      // Lưu lịch sử nếu có thay đổi
      if (Object.keys(editedData).length > 0) {
        await PostHistory.create({
          postId,
          editedData,
          editedBy: userId,
          editedAt: new Date(),
        });
      }

    // Nếu từ unpaid -> paid thì set ngày đăng
    if (
      existingPost.paymentStatus !== "paid" &&
      updateData.paymentStatus === "paid"
    ) {
      existingPost.createdAt = new Date();
    }

    // Nếu đổi packageId thì cập nhật hạn
    if (updateData.packageId) {
      existingPost.packageId = updateData.packageId;

      const newPackage = await Package.findById(updateData.packageId);
      if (newPackage) {
        existingPost.expiredAt = new Date(
          Date.now() + newPackage.expireAt * 24 * 60 * 60 * 1000
        );
      }
    }

    existingPost.isEditing = false;
    existingPost.editingAt = null;

    await existingPost.save();

    return res.status(200).json({
      message: "Cập nhật bài đăng thành công",
      success: true,
      error: false,
      data: existingPost,
    });
  } catch (error) {
    console.error("updatePost error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
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
export const verifyPostByAdmin = async (req, res) => {
  try {
    const postId = req.params.id;

    // Tìm bài đăng
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
        error: true,
      });
    }

    // ⚠️ Kiểm tra nếu đang chỉnh sửa và chưa quá 10 phút thì không duyệt
    const MAX_EDIT_DURATION = 10 * 60 * 1000; // 10 phút
    const isEditingNow =
      existingPost.isEditing &&
      existingPost.editingAt &&
      new Date() - new Date(existingPost.editingAt) < MAX_EDIT_DURATION;

    if (isEditingNow) {
      return res.status(400).json({
        message: "Bài đăng đang được người dùng chỉnh sửa. Không thể duyệt lúc này.",
        success: false,
        error: true,
      });
    }

    // Kiểm tra trạng thái bài đăng
    if (existingPost.status !== "pending") {
      return res.status(400).json({
        message: "Bài đăng không ở trạng thái chờ duyệt.",
        success: false,
        error: true,
      });
    }

    // ✅ Duyệt bài
    existingPost.status = "approved";
    existingPost.isActive = true;
    await existingPost.save();

    return res.status(200).json({
      message: "Post verified and activated successfully",
      success: true,
      error: false,
      data: existingPost,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

export const rejectPostByAdmin = async (req, res) => {
  try {
    const postId = req.params.id;
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
    // Kiểm tra trạng thái bài đăng
    if (existingPost.status !== "pending") {
      return res.status(400).json({
        message: "Bài đăng không ở trạng thái chờ duyệt.",
        success: false,
        error: true
      });
    }
    // Cập nhật trạng thái bài đăng thành "rejected"
    existingPost.status = "rejected";
    existingPost.reasonreject = reasonreject;
    // Lưu các thay đổi
    await existingPost.save();
    return res.status(200).json({
      message: "Post rejected successfully",
      success: true,
      error: false,
      data: existingPost
    });
  }
  catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};
export const deletePostByAdmin = async (req, res) => {
  try {
    const postId = req.params.id;

    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
        error: true
      });
    }

    // Cannot allow deleting posts that are rejected or inactive
    if (existingPost.status === "active" || existingPost.status === "pending") {
      return res.status(400).json({
        message: `Cannot delete a post that is ${existingPost.status}`,
        success: false,
        error: true
      });
    }

    if (existingPost.status === "deleted") {
      return res.status(400).json({
        message: "Post is already deleted",
        success: false,
        error: true
      });
    }

    // Soft delete
    existingPost.isActive = false;
    existingPost.deletedAt = new Date();
    existingPost.status = "deleted";
    await existingPost.save();

    return res.status(200).json({
      message: "Post deleted successfully.",
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

    // Kiểm tra bài đăng có tồn tại không
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({
        message: "Không tìm thấy bài đăng",
        success: false,
        error: true
      });
    }

    // Cập nhật trạng thái bài đăng là đã xoá (soft delete)
    existingPost.status = "deleted";
    existingPost.deletedAt = new Date();

    await existingPost.save();

    return res.status(200).json({
      message: `Bài đăng đã được xoá thành công lúc ${existingPost.deletedAt.toLocaleString("vi-VN")}`,
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


// hàm thực hiện đếm áp dụng trang home 
export const getPostStats = async (req, res) => {
  try {
    const [forSale, forRent, saleAndRent] = await Promise.all([
      Post.countDocuments({ type: "ban" }),
      Post.countDocuments({ type: "cho_thue" }),
      Post.countDocuments({ type: "dich_vu" }),
    ]);

    return res.status(200).json({
      message: "Post statistics fetched successfully",
      success: true,
      error: false,
      data: { forSale, forRent, saleAndRent }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

// Đếm số bài post của 1 user
export const countPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // Đếm theo contactInfo thay vì user
    const count = await Post.countDocuments({ contactInfo: userId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ 
      message: "Lỗi khi đếm số bài đăng", 
      error: err.message 
    });
  }
};

