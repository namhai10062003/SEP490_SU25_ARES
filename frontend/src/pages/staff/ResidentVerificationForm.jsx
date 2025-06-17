import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ResidentVerificationForm() {
  // Form dữ liệu
  const [formData, setFormData] = useState({
    documentType: "",
    apartmentCode: "",
    contractStart: "",
    contractEnd: "",
    documentImage: null,
  });

  // Dữ liệu người dùng & căn hộ
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [apartments, setApartments] = useState([]);

  // Load danh sách căn hộ
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/apartments");
        if (Array.isArray(res.data)) {
          setApartments(res.data);
        } else {
          console.error("API không trả về danh sách hợp lệ");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API căn hộ:", err.message);
      }
    };
    fetchApartments();
  }, []);

  // Tìm người dùng theo tên/email
  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await axios.get(`http://localhost:4000/api/resident-verification/search-user?keyword=${query}`);
      setUser(res.data);
    } catch (err) {
      setUser(null);
      alert("Không tìm thấy người dùng");
    }
  };

  // Xử lý input form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Gửi xác thực
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !user ||
      !formData.documentType ||
      !formData.apartmentCode ||
      !formData.contractStart ||
      !formData.contractEnd
    ) {
      alert("Vui lòng điền đủ thông tin bắt buộc.");
      return;
    }

    const data = new FormData();
    data.append("userId", user._id);
    data.append("fullName", user.name || "");
    data.append("email", user.email || "");
    data.append("phone", user.phone || "");
    data.append("documentType", formData.documentType);
    data.append("apartmentCode", formData.apartmentCode);
    data.append("contractStart", formData.contractStart);
    data.append("contractEnd", formData.contractEnd);
    if (formData.documentImage) data.append("documentImage", formData.documentImage);

    try {
      await axios.post("http://localhost:4000/api/resident-verification/verify", data);
      alert("Gửi yêu cầu xác thực thành công!");
    } catch (err) {
      console.error("Gửi thất bại:", err);
      alert("Gửi thất bại! Vui lòng kiểm tra lại.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Tìm kiếm người dùng</h2>
      <div className="flex gap-4 items-center mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tên người dùng hoặc Email"
          className="flex-1 border rounded p-2"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Tìm kiếm
        </button>
      </div>

      {user && (
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-medium mb-4">Nhập thông tin xác thực cư dân</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={user.name || ""}
              disabled
              placeholder="Họ và tên"
              className="border p-2 rounded bg-gray-100"
            />
            <input
              type="email"
              value={user.email || ""}
              disabled
              placeholder="Email"
              className="border p-2 rounded bg-gray-100"
            />
            <input
              type="text"
              value={user.phone || ""}
              disabled
              placeholder="Số điện thoại"
              className="border p-2 rounded bg-gray-100"
            />
            <select
              name="apartmentCode"
              value={formData.apartmentCode}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            >
              <option value="">-- Chọn căn hộ --</option>
              {apartments.map((ap) => (
                <option key={ap._id} value={ap.apartmentCode}>
                  {ap.apartmentCode}
                </option>
              ))}
            </select>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            >
              <option value="">-- Loại hợp đồng --</option>
              <option value="rental">Hợp đồng thuê</option>
              <option value="ownership">Giấy chủ quyền</option>
              <option value="other">Khác</option>
            </select>
            <input
              type="file"
              name="documentImage"
              accept="image/*"
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="date"
              name="contractStart"
              value={formData.contractStart}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="date"
              name="contractEnd"
              value={formData.contractEnd}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Gửi xác thực
          </button>
        </form>
      )}
    </div>
  );
}
