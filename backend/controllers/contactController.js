// backend/controllers/contactController.js

import Contact from "../models/Contact.js";

export const createContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ message: "Liên hệ đã được gửi!" });
  } catch (err) {
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
  
  
