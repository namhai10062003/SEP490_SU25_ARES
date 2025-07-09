import React, { useEffect, useState } from "react";
import Header from "../../../../components/header.jsx";
import { useAuth } from "../../../../context/authContext.jsx";
import {
  createPost,
  getApartmentList,
  getPlazaList,
} from "../../../service/postService.js";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    loaiHinh: "",
    tenThanhPho: "",
    quanHuyen: "",
    diaChiCuThe: "",
    tieuDe: "",
    toaplaza: "",
    socanho: "",
    moTaChiTiet: "",
    dienTich: "",
    gia: "",
    trongTinViec: "",
    giayto: "",
    tinhtrang: "",
    huongdat: "",
    thongTinNguoiDangBan: "",
    images: [],
    postPackage: "",
  });
  const { user, logout } = useAuth();
  const [name, setName] = useState(null);
  const [loaiBaiDang, setLoaiBaiDang] = useState("ban");
  const [loaiHinhCon, setLoaiHinhCon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plazaOptions, setPlazaOptions] = useState([]);
  const [apartmentOptions, setApartmentOptions] = useState([]);

  // hàm để xử lí lấy căn hộ ra á
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const response = await getApartmentList();
        console.log("📦 Full response:", response); // log toàn bộ response

        if (response?.data) {
          const apartments = Array.isArray(response.data)
            ? response.data
            : response.data.data;
          console.log("✅ Danh sách căn hộ:", apartments);
          setApartmentOptions(apartments);
        } else {
          console.warn("⚠️ Không có dữ liệu căn hộ trong response");
        }
      } catch (error) {
        console.error("❌ Không thể lấy danh sách căn hộ:", error);
      }
    };

    fetchApartments();
  }, []);

  // ham de xu li get ra plazaNDate
  useEffect(() => {
    const fetchPlazas = async () => {
      const token = localStorage.getItem("token"); // đảm bảo lấy được
  
      if (!token) return console.warn("⚠️ Token chưa có");
  
      try {
        const response = await getPlazaList(token);
        console.log("📦 Dữ liệu plaza từ server:", response.data);
  
        if (response?.data?.data) {
          setPlazaOptions(response.data.data);
        }
      } catch (error) {
        console.error("❌ Không thể lấy danh sách plaza:", error);
      }
    };
  
    fetchPlazas();
  }, []);
  //
  useEffect(() => {
    setName(user?.name || null);
  }, [user]);
// hàm xử lí tất cả dữ liệu input 
const handleInputChange = (e) => {
  const { name, value } = e.target;

  // Nếu người dùng chọn loại hình là căn hộ
  if (name === "loaiHinh") {
    if (value === "nha_can_ho") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        diaChiCuThe: "FPT City", // Gán mặc định
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        diaChiCuThe: "", // Xóa nếu chọn loại khác
      }));
    }
  } else {
    // Các trường khác giữ nguyên
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};
  // hàm xử lí diện tích và mấy thông tin khác 
  useEffect(() => {
    if (formData.soCanHo && apartmentOptions.length > 0) {
      const selectedApartment = apartmentOptions.find(
        (apartment) => apartment._id === formData.soCanHo
      );
  
      if (selectedApartment) {
        setFormData((prev) => ({
          ...prev,
          dienTich: selectedApartment.area,
          giayto: selectedApartment.legalDocuments,
          huongdat: selectedApartment.direction,
          tinhtrang: selectedApartment.furniture,
          diaChiCuThe: "FPT City",
        }));
      }
    }
  }, [formData.soCanHo, apartmentOptions]);
// hàm xử lí lấy sdt của user 
useEffect(() => {
  if (user?.phone && !formData.thongTinNguoiDangBan) {
    setFormData((prev) => ({
      ...prev,
      thongTinNguoiDangBan: user.phone,
    }));
    console.log("📲 Gán SDT tự động:", user.phone);
  }
}, [user?.phone]);
useEffect(() => {
  console.log("👤 USER:", user);
}, [user]);
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageFiles],
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleGenderSelect = (postPackage) => {
    setFormData((prev) => ({
      ...prev,
      postPackage: postPackage,
    }));
  };
  const selectedApartment = apartmentOptions.find(
    (ap) => ap._id === formData.soCanHo
  );
  const apartmentCode = selectedApartment?.apartmentCode || "";
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (formData.images.length === 0) {
        alert("Vui lòng upload ít nhất 1 ảnh");
        setIsSubmitting(false);
        return;
      }
      const submitData = new FormData();
      submitData.append("type", loaiBaiDang);
      submitData.append("title", formData.tieuDe);
      submitData.append("description", formData.moTaChiTiet);
      submitData.append("location", formData.diaChiCuThe);
      submitData.append("property", formData.loaiHinh);
      submitData.append("area", formData.dienTich);
      submitData.append("price", formData.gia);
      submitData.append("legalDocument", formData.giayto);
      submitData.append("interiorStatus", formData.tinhtrang);
      submitData.append("amenities", formData.huongdat);
      submitData.append("postPackage", formData.postPackage);
      submitData.append("phone", formData.thongTinNguoiDangBan);
      submitData.append("apartmentCode", apartmentCode);
      
      formData.images.forEach((image) => {
        submitData.append("images", image);
      });

      const response = await createPost(submitData);

      if (response.data.success) {
        alert("Đăng tin thành công!");
        setFormData({
          loaiHinh: "",
          tenThanhPho: "",
          quanHuyen: "",
          diaChiCuThe: "",
          tieuDe: "",
          moTaChiTiet: "",
          dienTich: "",
          toaplaza: "",
          socanho: "",
          gia: "",
          trongTinViec: "",
          thongTinNguoiDangBan: "",
          images: [],
          giayto: "",
          tinhtrang: "",
          huongdat: "",
          loaiBaiDang: "",
          postPackage: "",
        });
      } else {
        throw new Error("Lỗi khi đăng tin");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };
  // hàm xử lí lọc plaza vs căn hộ
  const selectedPlaza = plazaOptions.find(
    (plaza) => plaza._id === formData.toaPlaza
  );
  const selectedPlazaName = selectedPlaza?.name || "";

  console.log("🧱 Tòa plaza đã chọn (_id):", formData.toaPlaza);
  console.log("🏷️ Tên plaza đã chọn:", selectedPlazaName);
  const filteredApartments = apartmentOptions.filter(
    (apartment) => apartment.building === selectedPlazaName
  );

  console.log("🏘️ Danh sách căn hộ sau lọc theo plaza:", filteredApartments);
  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={name} logout={logout} />
      <div className="container py-5">
        <div className="bg-white rounded-4 shadow p-4 mb-4">
          <h1 className="fw-bold text-center mb-2">🏠 Đăng tin</h1>
          <p className="text-center text-secondary mb-4">
            Đăng tin các dịch vụ nhanh chóng và vô cùng dễ dàng
          </p>
          <div className="row">
            {/* Sidebar */}
            <div className="col-12 col-md-3 mb-4">
              <div className="bg-light rounded-3 p-3 shadow-sm">
                <h5 className="fw-bold mb-3">Chọn loại bài đăng</h5>
                <ul className="list-group">
                  <li
                    className={`list-group-item list-group-item-action ${
                      loaiBaiDang === "ban" ? "active" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setLoaiBaiDang("ban");
                      setLoaiHinhCon("");
                      setFormData((prev) => ({ ...prev, loaiHinh: "" }));
                    }}
                  >
                    Tin Bán
                  </li>
                  <li
                    className={`list-group-item list-group-item-action ${
                      loaiBaiDang === "cho_thue" ? "active" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setLoaiBaiDang("cho_thue");
                      setLoaiHinhCon("");
                      setFormData((prev) => ({ ...prev, loaiHinh: "" }));
                    }}
                  >
                    Tin Cho Thuê
                  </li>
                  <li
                    className={`list-group-item list-group-item-action ${
                      loaiBaiDang === "dich_vu" ? "active" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setLoaiBaiDang("dich_vu");
                      setLoaiHinhCon("");
                      setFormData((prev) => ({ ...prev, loaiHinh: "" }));
                    }}
                  >
                    Tin Dịch Vụ
                  </li>
                </ul>
              </div>
            </div>
            {/* Form Content */}
            <div className="col-12 col-md-9">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">
                    Loại hình <span className="text-danger">*</span>
                  </label>
                  {["ban", "cho_thue"].includes(loaiBaiDang) && (
                    <select
                      name="loaiHinh"
                      value={formData.loaiHinh}
                      onChange={(e) => {
                        handleInputChange(e);
                        setLoaiHinhCon(e.target.value);
                      }}
                      className="form-select"
                      required
                    >
                      <option value="">Chọn loại hình</option>
                      <option value="nha_can_ho">Căn hộ</option>
                      <option value="nha_dat">BĐS</option>
                    </select>
                  )}
                  {loaiBaiDang === "dich_vu" && (
                    <select
                      name="loaiHinh"
                      value={formData.loaiHinh}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Chọn loại dịch vụ</option>
                      <option value="sua_chua">Sửa chữa</option>
                      <option value="ve_sinh">Vệ sinh</option>
                      <option value="khac">Khác</option>
                    </select>
                  )}
                </div>
                {loaiHinhCon === "nha_can_ho" && (
                  <>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Tòa plaza <span className="text-danger">*</span>
                      </label>
                      <select
                        name="toaPlaza"
                        value={formData.toaPlaza || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            toaPlaza: e.target.value,
                          }))
                        }
                        className="form-select"
                        required
                      >
                        <option value="">Chọn tòa plaza</option>
                        {Array.isArray(plazaOptions) &&
                          plazaOptions.map((plaza) => (
                            <option key={plaza._id} value={plaza._id}>
                              {plaza.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Số căn hộ <span className="text-danger">*</span>
                      </label>
                      <select
                        name="soCanHo"
                        value={formData.soCanHo || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            soCanHo: e.target.value,
                          }))
                        }
                        className="form-select"
                        required
                      >
                        <option value="">Chọn số căn hộ</option>

                        {filteredApartments.length === 0 && (
                          <option disabled>Không có căn hộ phù hợp</option>
                        )}

                        {filteredApartments.map((apartment) => (
                          <option key={apartment._id} value={apartment._id}>
                            {apartment.apartmentCode}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div className="col-12">
                  <label className="form-label">
                    Địa chỉ cụ thể <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">📍</span>
                    <input
                      type="text"
                      name="diaChiCuThe"
                      value={formData.diaChiCuThe}
                      onChange={handleInputChange}
                      placeholder="Nhập địa chỉ cụ thể"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Tiêu đề <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="tieuDe"
                    value={formData.tieuDe}
                    onChange={handleInputChange}
                    placeholder="Nhập tiêu đề"
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Mô tả chi tiết <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="moTaChiTiet"
                    value={formData.moTaChiTiet}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về bất động sản..."
                    rows="4"
                    className="form-control"
                    required
                  />
                </div>
                {["ban", "cho_thue"].includes(loaiBaiDang) && (
                  <div className="col-12 col-md-6">
                    <label className="form-label">
                      Diện tích <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">🏠</span>
                      <input
                        type="number"
                        name="dienTich"
                        value={formData.dienTich}
                        onChange={handleInputChange}
                        placeholder="m²"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                )}
                <div className="col-12 col-md-6">
                  <label className="form-label">
                    Giá <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">💰</span>
                    <input
                      type="number"
                      name="gia"
                      value={formData.gia}
                      onChange={handleInputChange}
                      placeholder="Thỏa thuận hoặc giá cụ thể"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                {["ban", "cho_thue"].includes(loaiBaiDang) && (
                  <>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Giấy tờ pháp lí <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="giayto"
                        value={formData.giayto}
                        onChange={handleInputChange}
                        placeholder="Giấy tờ đất, căn hộ..."
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Tình trạng nổi bật{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="tinhtrang"
                        value={formData.tinhtrang}
                        onChange={handleInputChange}
                        placeholder="Nội thất..."
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Hướng đất, căn hộ <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="huongdat"
                        value={formData.huongdat}
                        onChange={handleInputChange}
                        placeholder="Hướng thuận lợi..."
                        className="form-control"
                        required
                      />
                    </div>
                  </>
                )}
                <div className="col-12">
                  <label className="form-label">
                    Thông tin người đăng bán{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">👤</span>
                    <input
                      type="text"
                      name="thongTinNguoiDangBan"
                      value={formData.thongTinNguoiDangBan}
                      onChange={handleInputChange}
                      placeholder="Số điện thoại"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Upload ảnh <span className="text-danger">*</span>
                  </label>
                  <div
                    className="border border-2 border-primary rounded-3 p-4 text-center bg-light mb-3"
                    style={{ cursor: "pointer" }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() =>
                      document.getElementById("imageInput").click()
                    }
                  >
                    <div className="fs-2 mb-2 text-primary">📤</div>
                    <div className="fw-semibold">Upload Images</div>
                    <div className="text-secondary small">
                      Click để chọn nhiều ảnh
                    </div>
                    <input
                      type="file"
                      id="imageInput"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                  </div>
                  {formData.images.length > 0 && (
                    <div className="row g-2">
                      {formData.images.map((image, index) => (
                        <div className="col-6 col-md-3" key={index}>
                          <div className="position-relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="img-thumbnail"
                              style={{ height: 100, objectFit: "cover" }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle"
                              onClick={() => removeImage(index)}
                              style={{
                                width: 28,
                                height: 28,
                                lineHeight: "14px",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Chọn gói đăng tin <span className="text-danger">*</span>
                  </label>
                  <div className="row g-2">
                    {[
                      {
                        value: "685039e4f8f1552c6378a7a5",
                        title: "VIP1 - Tin sẽ tồn tại trên Blog 3 ngày",
                        subtitle: "10000đ/tin",
                      },
                      {
                        value: "685174b550c6fbcbc4efbe87",
                        title: "VIP2 - Tin sẽ tồn tại trên Blog 5 ngày",
                        subtitle: "20000đ/tin",
                      },
                      {
                        value: "685174db50c6fbcbc4efbe88",
                        title: "VIP3 - Tin sẽ tồn tại trên Blog 7 ngày",
                        subtitle: "30000đ/tin",
                      },
                    ].map((option) => (
                      <div className="col-12 col-md-4" key={option.value}>
                        <div
                          className={`card h-100 ${
                            formData.postPackage === option.value
                              ? "border-primary shadow"
                              : ""
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleGenderSelect(option.value)}
                        >
                          <div className="card-body text-center">
                            <div className="fw-bold">{option.title}</div>
                            <div className="text-secondary">
                              {option.subtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-12 mt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn btn-primary btn-lg w-100 fw-bold"
                  >
                    {isSubmitting ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang xử lý...
                      </span>
                    ) : (
                      "Đăng tin"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
