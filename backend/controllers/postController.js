import Post from '../models/Post.js';
import PostPackage from '../models/Postpackage.js';
import User from '../models/User.js';
export const createPost = async (req, res) => {
    try {
        const postData = req.body;
        const imageUrls = req.files.map((file) => file.path); // nếu dùng Cloudinary
        console.log(imageUrls);

        console.log(postData);

        const userID = await User.findOne({
            phone: postData.phone
        })
        if (!userID) {
            return res.status(400).json({
                message: "User không tồn tại",
                success: false,
                error: true
            });
        }
        // Kiểm tra package có tồn tại không
        const postPackage = await PostPackage.findById(postData.postPackage);
        if (!postPackage) {
            return res.status(400).json({
                message: "Package không tồn tại",
                success: false,
                error: true
            });
        }

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

        await post.save();

        return res.status(201).json({
            message: "Post created successfully. Please proceed to payment to activate your post.",
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
