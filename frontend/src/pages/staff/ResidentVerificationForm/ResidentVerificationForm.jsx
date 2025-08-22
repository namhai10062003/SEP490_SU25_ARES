import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import LoadingModal from "../../../../components/loadingModal";
import StaffNavbar from "../staffNavbar";
export default function ResidentVerificationForm() {
  const [formData, setFormData] = useState({
    documentType: "",
    apartmentCode: "",
    contractStart: "",
    contractEnd: "",
    documentImage: null,
  });
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState([]);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);


  const customStyles = {
    menu: (provided) => ({
      ...provided,
      maxHeight: 200,
      overflowY: 'auto',
    }),
  };
  // hàm sort apartment 
  // 🛠️ Di chuyển HÀM NÀY LÊN ĐÂU FILE, TRƯỚC KHI GỌI
  const sortApartments = (apartments) => {
    console.log("Danh sách apartments đầu vào:", apartments);
    return apartments
      .slice() // tạo bản sao
      .sort((a, b) => {
        // Tách block và phần số: "P1-10.01" => ["P1", "10.01"]
        const [blockA, numberA] = a.apartmentCode.split("-");
        const [blockB, numberB] = b.apartmentCode.split("-");

        // Tách tầng và phòng: "10.01" => [10, 1]
        const [floorA, roomA] = numberA.split(".").map(Number);
        const [floorB, roomB] = numberB.split(".").map(Number);

        // So sánh theo block (P1 < P2 < P3 ...)
        if (blockA !== blockB) return blockA.localeCompare(blockB);

        // So sánh theo tầng
        if (floorA !== floorB) return floorA - floorB;

        // So sánh theo phòng
        return roomA - roomB;
      });
  };

  // 👇 Lúc này gọi mới hợp lệ
  const sortedApartments = sortApartments(apartments);
  const apartmentOptions = sortedApartments.map((ap) => ({
    value: ap.apartmentCode,
    label: ap.apartmentCode, // hoặc `${ap.apartmentCode} (Tầng ${tầng}, Phòng ${phòng})` nếu muốn chi tiết hơn
  }));
  // list ra all users
  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users?limit=1000`);

        let users = [];

        if (Array.isArray(res.data)) {
          users = res.data;
        } else if (res.data && res.data.users && Array.isArray(res.data.users)) {
          users = res.data.users;
        } else {
          console.error("❌ API không trả về danh sách người dùng hợp lệ:", res.data);
          return;
        }

        // 🔥 Lọc ra chỉ những user không phải admin hoặc staff
        const filtered = users.filter(
          (u) => u.role !== "admin" && u.role !== "staff"
        );

        setAllUsers(filtered);
        setFilteredUsers(filtered);
      } catch (err) {
        console.error("❌ Lỗi khi gọi API lấy tất cả người dùng:", err.message);
      }
      setLoading(false);
    };

    fetchAllUsers();
  }, []);


  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/apartments`);
        if (Array.isArray(res.data.data)) {
          setApartments(res.data.data);
        } else {
          console.error("API không trả về danh sách hợp lệ");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API căn hộ:", err.message);
      }
    };
    fetchApartments();
  }, []);

  // const handleSearch = async () => {
  //   if (!query) return;
  //   setLoading(true);
  //   try {
  //     const res = await axios.get(
  //       `${import.meta.env.VITE_API_URL}/api/resident-verifications/search-user?keyword=${query}`
  //     );
  //     setUser(res.data);
  //   } catch (err) {
  //     setUser(null);
  //     alert("Không tìm thấy người dùng");
  //   }
  //   setLoading(false);
  // };
  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const keyword = query.trim().toLowerCase();
  
      if (!keyword) {
        setFilteredUsers(allUsers);
        return;
      }
  
      const filtered = allUsers.filter(
        (u) =>
          (u.name?.toLowerCase().includes(keyword) ||
            u.email?.toLowerCase().includes(keyword) ||
            u.phone?.includes(keyword)) &&
          u.role !== "admin" &&
          u.role !== "staff"
      );
  
      setFilteredUsers(filtered);
    } finally {
      setLoading(false); // luôn chạy, dù return hay lỗi
    }
  };
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0] && name === "documentImage") {
      setPreviewImage(URL.createObjectURL(files[0]));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: files ? Array.from(files) : value, // Lưu nhiều ảnh
    }));
    
    
    // 👉 Update luôn preview
    if (files && files.length > 0 && name === "documentImage") {
      const previews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewImage(previews); // đổi previewImage thành mảng
    }
    
  };

  // hàm sumit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===== Validate từng trường =====
    if (!user) {
      toast.error("❌ Vui lòng chọn cư dân cần xác thực.");
      return;
    }
    if (!formData.documentType) {
      toast.error("❌ Vui lòng chọn loại giấy tờ.");
      return;
    }
    if (!formData.apartmentCode) {
      toast.error("❌ Vui lòng nhập mã căn hộ.");
      return;
    }
    
   // Nếu là hợp đồng cho thuê thì bắt buộc nhập ngày
// Nếu là hợp đồng cho thuê thì bắt buộc nhập ngày
if (formData.documentType === "Hợp đồng cho thuê") {
  const { contractStart, contractEnd } = formData;

  if (!contractStart || !contractEnd) {
    toast.error("❌ Vui lòng nhập ngày bắt đầu và kết thúc hợp đồng.");
    return;
  }

  const startDate = new Date(contractStart);
  const endDate = new Date(contractEnd);

  // Kiểm tra ngày hợp lệ và logic ngày bắt đầu <= ngày kết thúc
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    toast.error("❌ Ngày không hợp lệ. Vui lòng chọn lại.");
    return;
  }

  if (startDate > endDate) {
    toast.error("❌ Ngày bắt đầu không được lớn hơn ngày kết thúc.");
    return;
  }

  // Append lên FormData khi gửi

}

if (!formData.documentImage || formData.documentImage.length === 0) {
  toast.error("❌ Vui lòng tải lên ít nhất 1 ảnh giấy tờ.");
  return;
}
 // ===== Bật loading khi bắt đầu gửi =====
 setLoading(true);
    // ===== Tạo FormData để gửi =====
    try {
      const data = new FormData();
      data.append("user", user._id);
      data.append("fullName", user.name || "");
      data.append("email", user.email || "");
      data.append("phone", user.phone || "");
      data.append("documentType", formData.documentType);
      data.append("apartmentCode", formData.apartmentCode);
  
      formData.documentImage.forEach((img) => {
        data.append("documentImage", img);
      });
      
      if (formData.documentType === "Hợp đồng cho thuê") {
        const startDate = new Date(formData.contractStart);
        const endDate = new Date(formData.contractEnd);
      
        data.append("contractStart", startDate.toISOString());
        data.append("contractEnd", endDate.toISOString());
      }
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/resident-verifications/verification`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      toast.success("✅ Gửi yêu cầu xác thực thành công!");
  
      // ===== Reset form =====
      setFormData({
        documentType: "",
        apartmentCode: "",
        contractStart: "",
        contractEnd: "",
        documentImage: null,
      });
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      setUser(null);
      setQuery("");
    } catch (err) {
      console.error("Gửi thất bại:", err?.response || err);
      toast.error("❌ Gửi thất bại! Vui lòng kiểm tra lại.");
    }finally {
      setLoading(false); // 🔥 luôn tắt loading ở đây
    }
  };
  


  return (
    <div className="d-flex min-vh-100 bg-light">
      <StaffNavbar />
      <main className="flex-grow-1 p-4">
        <div className="container" style={{ maxWidth: 900 }}>
          {/* {!user && (
            <div className="bg-white rounded-4 shadow p-4 mx-auto mb-4">
              <h2 className="fw-bold text-center mb-4">Tìm kiếm người dùng</h2>
              <form
                className="row g-2 justify-content-center"
                onSubmit={e => {
                  e.preventDefault();
                  handleSearch();
                }}
              >
                <div className="col-12 col-md-8">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tên người dùng hoặc Email"
                    className="form-control form-control-lg"
                  />
                </div>
                <div className="col-12 col-md-4 d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : null}
                    Tìm kiếm
                  </button>
                </div>
              </form>
            </div>
          )} */}
          <div className="table-responsive mt-4">
            <h4 className="fw-bold mb-3">Danh sách tất cả người dùng</h4>
            <form onSubmit={handleSearch} className="mb-3 row g-2">
              <div className="col-md-10">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="form-control"
                  placeholder="Tìm theo tên, email hoặc số điện thoại"
                />
              </div>
              <div className="col-md-2 d-grid">
                <button className="btn btn-primary" type="submit">Tìm kiếm</button>
              </div>
            </form>
            <table className="table table-bordered table-striped">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">Không có người dùng phù hợp.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u, index) => (
                    <tr key={u._id}>
                      <td>{index + 1}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setUser(u)}
                        >
                          Xác thực
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {user && (
  <div
    className="modal fade show"
    id="verifyModal"
    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    tabIndex="-1"
  >
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div
        className="modal-content rounded-4 shadow-lg border-0"
        style={{
          maxHeight: "80vh", // Chiều cao tối đa 80% màn hình
          overflowY: "auto", // Nếu form dài sẽ có scroll
        }}
      >
        {/* Header */}
        <div className="modal-header border-0 pb-0">
          <h5 className="fw-bold text-primary m-0">Nhập thông tin xác thực cư dân</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setUser(null);
              setFormData({
                documentType: "",
                apartmentCode: "",
                contractStart: "",
                contractEnd: "",
                documentImage: null,
              });
              setPreviewImage(null);
              setQuery("");
            }}
          ></button>
        </div>

        {/* Body */}
        <div className="modal-body pt-3">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Họ tên */}
              <div className="col-md-4">
                <label className="form-label">Họ và tên</label>
                <input type="text" value={user.name || ""} disabled className="form-control" />
              </div>
              {/* Email */}
              <div className="col-md-4">
                <label className="form-label">Email</label>
                <input type="email" value={user.email || ""} disabled className="form-control" />
              </div>
              {/* SĐT */}
              <div className="col-md-4">
                <label className="form-label">Số điện thoại</label>
                <input type="text" value={user.phone || ""} disabled className="form-control" />
              </div>

              {/* Loại hợp đồng */}
              <div className="col-md-6">
                <label className="form-label">Loại hợp đồng</label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className="form-select"
                  
                >
                  <option value="">-- Loại hợp đồng --</option>
                  <option value="Hợp đồng cho thuê">Hợp đồng cho thuê</option>
                  <option value="Hợp đồng mua bán">Hợp đồng mua bán</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Căn hộ */}
              <div className="col-md-6">
  <label className="form-label">Căn hộ</label>
  <Select
    options={apartmentOptions}
    value={apartmentOptions.find(opt => opt.value === formData.apartmentCode)}
    onChange={(selected) =>
      setFormData((prev) => ({
        ...prev,
        apartmentCode: selected ? selected.value : ""
      }))
    }
    placeholder="Nhập hoặc chọn căn hộ"
    isClearable
    menuPortalTarget={document.body}
    menuPosition="fixed"
    menuPlacement="bottom"
    styles={apartmentSelectStyles}
  />
</div>


              {/* Ngày hợp đồng */}
              {formData.documentType === "Hợp đồng cho thuê" && (
                <>
                  <div className="col-md-6">
                    <label className="form-label">Ngày bắt đầu hợp đồng</label>
                    <input
                      type="date"
                      name="contractStart"
                      value={formData.contractStart}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ngày kết thúc hợp đồng</label>
                    <input
                      type="date"
                      name="contractEnd"
                      value={formData.contractEnd}
                      onChange={handleChange}
                      className="form-control"
                      min={formData.contractStart}
                    />
                  </div>
                </>
              )}

              {/* Upload ảnh */}
              <div className="col-md-12">
                <label className="form-label">Ảnh hợp đồng</label>
                <input
                  type="file"
                  name="documentImage"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setFormData((prev) => ({
                      ...prev,
                      documentImage: files,
                    }));
                    const previews = files.map((file) => URL.createObjectURL(file));
                    setPreviewImage(previews);
                  }}
                />
                {previewImage?.length > 0 && (
                  <div className="mt-3">
                    <span className="d-block mb-2 text-secondary">Ảnh hợp đồng đã chọn:</span>
                    <div className="d-flex flex-wrap gap-2">
                      {previewImage.map((imgUrl, idx) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt={`Ảnh ${idx + 1}`}
                          className="img-thumbnail"
                          style={{ maxHeight: 150 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {/* Footer */}
  <div className="d-flex justify-content-end mt-4 gap-2">
    <button
      type="submit"
      className="btn btn-success px-5 d-flex align-items-center justify-content-center"
      disabled={loading} // disable khi đang loading
    >
      Gửi xác thực
    </button>
  </div>

 
          </form>
        </div>
      </div>
    </div>
  </div>
)}
 {/* Modal loading toàn màn hình */}
 {loading && <LoadingModal />}

        </div>
      </main>
    </div>
    
  );
}
const apartmentSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: '0.5rem',
    borderColor: state.isFocused ? '#0d6efd' : '#ced4da',
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.25)' : 'none',
    minHeight: '45px',
    fontSize: '1rem',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#fff', // nền trắng đồng nhất
    color: '#212529',         // chữ rõ
    borderRadius: '0.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // shadow mềm mại
    zIndex: 99999,
    maxHeight: 250,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 99999 }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#e7f1ff' : '#fff',
    color: '#212529',
    cursor: 'pointer',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6c757d', // placeholder màu xám
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#212529',
  }),
};