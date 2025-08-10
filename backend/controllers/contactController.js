// backend/controllers/contactController.js

import Contact from "../models/Contact.js";

export const createContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      userId: req.user ? req.user._id : null // ✅ nếu đăng nhập thì lưu id, nếu không thì null
    };

    const contact = new Contact(contactData);
    await contact.save();

    res.status(201).json({ message: "Liên hệ đã được gửi!" });
  } catch (err) {
    console.error("❌ Lỗi khi tạo liên hệ:", err);
    res.status(500).json({ error: "Lỗi khi tạo liên hệ" });
  }
};


export const getAllContacts = async (req, res) => {
    try {
      const { status } = req.query;
      let query = {};
  
      // Nếu có filter trạng thái
      if (status === "reviewed") {
        query.status = "reviewed";
        query.isDeleted = false;
      } else if (status === "pending") {
        query.status = "pending";
        query.isDeleted = false;
      } else if (status === "archived") {
        query.isDeleted = true;
      } // else: không filter gì => lấy tất cả (kể cả đã xoá)
      
  
      const contacts = await Contact.find(query).sort({ createdAt: -1 });
      res.status(200).json({ message: "Lấy danh sách liên hệ thành công", data: contacts });
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu liên hệ:", err);
      res.status(500).json({ error: "Lỗi khi lấy dữ liệu liên hệ" });
    }
  };

  export const deleteContact = async (req, res) => {
    try {
      const id = req.params.id;
  
      // ✅ Soft delete bằng cách đánh dấu isDeleted = true
      const contact = await Contact.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
  
      if (!contact) {
        return res.status(404).json({ message: "Không tìm thấy liên hệ" });
      }
  
      res.json({ message: "Đã xoá liên hệ (soft delete)" });
    } catch (err) {
      console.error("❌ Lỗi khi xoá liên hệ:", err);
      res.status(500).json({ error: "Lỗi khi xoá liên hệ" });
    }
  };
  

export const updateContactStatus = async (req, res) => {
    try {
      const id = req.params.id;
      const { status } = req.body;
  
      if (!["pending", "reviewed"].includes(status)) {
        return res.status(400).json({ error: "Trạng thái không hợp lệ" });
      }
  
      const contact = await Contact.findByIdAndUpdate(id, { status }, { new: true });
      if (!contact) return res.status(404).json({ error: "Không tìm thấy liên hệ" });
  
      res.json({ message: "Đã cập nhật trạng thái", contact });
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi cập nhật trạng thái" });
    }
  };
  
  
// ✅ Admin xem tất cả liên hệ (có thể lọc theo userId hoặc status)
export const adminGetContacts = async (req, res) => {
  try {
    const { userId, status } = req.query;
    let query = {};

    if (userId) query.userId = userId; // lọc theo user cụ thể
    if (status) query.status = status; // lọc theo trạng thái

    const contacts = await Contact.find(query)
      .populate("userId", "name email") // lấy thông tin user nếu có
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách liên hệ cho admin thành công",
      data: contacts
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy dữ liệu liên hệ cho admin:", err);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu liên hệ cho admin" });
  }
};
