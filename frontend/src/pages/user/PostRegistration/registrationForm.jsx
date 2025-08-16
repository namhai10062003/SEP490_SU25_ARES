import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [isBlocked, setIsBlocked] = useState(false);
  const [useCustomPlaza, setUseCustomPlaza] = useState(false);
  const [useCustomApartment, setUseCustomApartment] = useState(false);
  const [charCount, setCharCount] = useState({
    tieuDe: 0,
    moTaChiTiet: 0,
  });

  useEffect(() => {
    if (user && user.status === 0) {
      console.log("🚫 Tài khoản bị chặn đăng bài");
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [user]);

  // hàm để xử lí lấy căn hộ ra á
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const response = await getApartmentList();
        console.log("📦 Full response:", response);

        if (response?.data) {
          const apartments = Array.isArray(response.data)
            ? response.data
            : response.data.data;

          console.log("✅ Danh sách căn hộ (trước sort):", apartments);

          // ✅ Sắp xếp theo apartmentCode, xử lý khi thiếu
          const sortedApartments = [...apartments].sort((a, b) =>
            (a?.apartmentCode || "").localeCompare(
              b?.apartmentCode || "",
              "vi",
              { numeric: true }
            )
          );

          console.log("📑 Danh sách căn hộ (đã sort):", sortedApartments);

          setApartmentOptions(sortedApartments);
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
  // validate khi nhập
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate số điện thoại
    if (name === "thongTinNguoiDangBan") {
      if (!/^\d*$/.test(value)) return;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value.length !== 10) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "Số điện thoại phải gồm đúng 10 chữ số",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
      return;
    }

    // Giới hạn ký tự cho tiêu đề và mô tả + cập nhật đếm ký tự
    if (name === "tieuDe") {
      if (value.length > 100) return;
      setCharCount((prev) => ({ ...prev, tieuDe: value.length }));
    }
    if (name === "moTaChiTiet") {
      if (value.length > 1000) return;
      setCharCount((prev) => ({ ...prev, moTaChiTiet: value.length }));
    }

    // Không cho nhập giá hoặc diện tích âm
    if (
      (name === "gia" || name === "dienTich") &&
      value !== "" &&
      Number(value) <= 0
    ) {
      return;
    }

    // Loại hình căn hộ tự gán địa chỉ
    if (name === "loaiHinh") {
      if (value === "nha_can_ho") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          diaChiCuThe: "FPT City",
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value, diaChiCuThe: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const [formErrors, setFormErrors] = useState({});

  // hàm xử lí diện tích và mấy thông tin khác
  useEffect(() => {
    if (formData.soCanHo && apartmentOptions.length > 0) {
      const selectedApartment = apartmentOptions.find(
        (apartment) => apartment.apartmentCode === formData.soCanHo
      );

      if (selectedApartment) {
        setFormData((prev) => ({
          ...prev,
          dienTich: selectedApartment.area || "",
          giayto: selectedApartment.legalDocuments || "",
          huongdat: selectedApartment.direction || "",
          tinhtrang: selectedApartment.furniture || "",
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

    // Validate chung
    if (!formData.loaiHinh) return showError("Vui lòng chọn loại hình dịch vụ");
    if (!formData.diaChiCuThe) return showError("Vui lòng nhập địa chỉ");
    if (!formData.tieuDe) return showError("Vui lòng nhập tiêu đề");
    if (!formData.moTaChiTiet) return showError("Vui lòng nhập mô tả");
    if (!formData.thongTinNguoiDangBan) return showError("Vui lòng nhập số điện thoại");

    // Validate riêng cho từng loại trước
    if (loaiBaiDang === "ban" || loaiBaiDang === "cho_thue") {
      if (!formData.toaPlaza) return showError("Vui lòng nhập tòa Plaza");
      if (!formData.soCanHo) return showError("Vui lòng nhập số căn hộ");
      if (formData.dienTich === "" || formData.dienTich <= 0) return showError("Diện tích không hợp lệ");
      if (formData.gia === "" || formData.gia <= 0) return showError("Vui lòng nhập giá hợp lệ");
      if (!formData.giayto) return showError("Vui lòng nhập giấy tờ pháp lý");
      if (!formData.tinhtrang) return showError("Vui lòng nhập tình trạng");
      if (!formData.huongdat) return showError("Vui lòng nhập hướng đất");
    }

    if (loaiBaiDang === "dich_vu") {
      if (formData.gia === "" || formData.gia <= 0) return showError("Giá không hợp lệ");
    }

    // Kiểm tra ảnh sau khi đã check giá
    if (formData.images.length === 0) return showError("Vui lòng upload ít nhất 1 ảnh");

    // Kiểm tra gói đăng tin
    if (!formData.postPackage) return showError("Vui lòng chọn gói đăng tin");
    // Nếu qua hết validate thì submit
    try {
      const submitData = new FormData();
      submitData.append("type", loaiBaiDang);
      submitData.append("title", formData.tieuDe);
      submitData.append("description", formData.moTaChiTiet);
      submitData.append("location", formData.diaChiCuThe);
      submitData.append("property", formData.loaiHinh);
      submitData.append("price", formData.gia);
      submitData.append("postPackage", formData.postPackage);
      submitData.append("phone", formData.thongTinNguoiDangBan);

      if (loaiBaiDang === "ban" || loaiBaiDang === "cho_thue") {
        submitData.append("area", formData.dienTich);
        submitData.append("legalDocument", formData.giayto);
        submitData.append("interiorStatus", formData.tinhtrang);
        submitData.append("amenities", formData.huongdat);
        submitData.append("apartmentCode", formData.soCanHo);
        submitData.append("building", formData.toaPlaza);
      }

      formData.images.forEach((image) => {
        submitData.append("images", image);
      });

      const response = await createPost(submitData);

      if (response.data.success) {
        toast.success("Đăng tin thành công!");
        setFormData({
          loaiHinh: "",
          tenThanhPho: "",
          quanHuyen: "",
          diaChiCuThe: "",
          tieuDe: "",
          moTaChiTiet: "",
          dienTich: "",
          toaPlaza: "",
          soCanHo: "",
          gia: "",
          trongTinViec: "",
          thongTinNguoiDangBan: "",
          images: [],
          giayto: "",
          tinhtrang: "",
          huongdat: "",
          postPackage: "",
        });
      } else {
        throw new Error("Lỗi khi đăng tin");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm tiện ích để hiện toast và dừng submit
  function showError(message) {
    toast.error(message);
    setIsSubmitting(false);
    return false;
  }




  // hàm xử lí lọc plaza vs căn hộ
  const selectedPlaza = plazaOptions.find(
    (plaza) => String(plaza._id) === String(formData.toaPlaza)
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
        {isBlocked ? (
          <div className="alert alert-danger text-center">
            <h4 className="alert-heading">Tài khoản của bạn đã bị chặn</h4>
            <p>
              Bạn không thể đăng bài đăng mới. Vui lòng liên hệ bộ phận hỗ trợ
              để biết thêm chi tiết.
            </p>
            <button className="btn btn-primary" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        ) : (
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
                      className={`list-group-item list-group-item-action ${loaiBaiDang === "ban" ? "active" : ""
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
                      className={`list-group-item list-group-item-action ${loaiBaiDang === "cho_thue" ? "active" : ""
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
                      className={`list-group-item list-group-item-action ${loaiBaiDang === "dich_vu" ? "active" : ""
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
                      Dịch Vụ <span className="text-danger">*</span>
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
                        <option value="">Chọn dịch vụ</option>
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
                      <div className="row align-items-end mb-3">


                        {/* TOA PLAZA */}
                        <div className="col-md-6">
                          <label className="form-label">
                            Tòa plaza <span className="text-danger">*</span>
                          </label>
                          {!useCustomPlaza ? (
                            <div className="d-flex align-items-center gap-2">
                              <select
                                name="toaPlaza"
                                value={formData.toaPlaza || ""}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    toaPlaza: e.target.value,
                                  }))
                                }
                                className="form-select flex-grow-1" // ❌ không dùng form-select-sm
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
                              {/* <button
                                type="button"
                                className="btn btn-outline-secondary py-0 px-1" // ❌ không dùng btn-sm
                                onClick={() => {
                                  setUseCustomPlaza(true);
                                  setUseCustomApartment(true);
                                  setFormData((prev) => ({
                                    ...prev,
                                    toaPlaza: "",
                                    soCanHo: "",
                                  }));
                                }}
                              >
                                Nhập mới
                              </button> */}
                            </div>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="text"
                                className="form-control flex-grow-1" // ❌ không dùng form-control-sm
                                placeholder="Nhập tên tòa plaza"
                                value={formData.toaPlaza || ""}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    toaPlaza: e.target.value,
                                  }))
                                }
                                required
                              />
                              {/* <button
                                type="button"
                                className="btn btn-outline-secondary py-0 px-1"
                                onClick={() => {
                                  setUseCustomPlaza(false);
                                  setUseCustomApartment(false);
                                  setFormData((prev) => ({
                                    ...prev,
                                    toaPlaza: "",
                                    soCanHo: "",
                                  }));
                                }}
                              >
                                Chọn từ danh sách
                              </button> */}
                            </div>
                          )}
                        </div>


                        {/* SO CAN HO */}
                        <div className="col-md-6">
                          <label className="form-label">
                            Số căn hộ <span className="text-danger">*</span>
                          </label>
                          {!useCustomApartment ? (
                            <div className="d-flex align-items-center gap-2">
                              <select
                                name="soCanHo"
                                value={formData.soCanHo || ""}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    soCanHo: e.target.value,
                                  }))
                                }
                                className="form-select flex-grow-1"
                                required
                              >
                                <option value="">Chọn số căn hộ</option>
                                {filteredApartments.length === 0 && (
                                  <option disabled>Không có căn hộ phù hợp</option>
                                )}
                                {filteredApartments.map((apartment) => (
                                  <option key={apartment._id} value={apartment.apartmentCode}>
                                    {apartment.apartmentCode}
                                  </option>
                                ))}
                              </select>
                              {/* <button
                                type="button"
                                className="btn btn-outline-secondary py-0 px-2"

                                onClick={() => {
                                  setUseCustomApartment(true);
                                  setFormData((prev) => ({
                                    ...prev,
                                    soCanHo: "",
                                  }));
                                }}
                              >
                                Nhập mới
                              </button> */}
                            </div>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="text"
                                className="form-control flex-grow-1"
                                placeholder="Nhập số căn hộ"
                                value={formData.soCanHo || ""}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    soCanHo: e.target.value,
                                  }))
                                }
                                required
                              />
                              {/* <button
                                type="button"
                                className="btn btn-outline-secondary py-0 px-2"

                                onClick={() => {
                                  setUseCustomApartment(false);
                                  setFormData((prev) => ({
                                    ...prev,
                                    soCanHo: "",
                                  }));
                                }}
                              >
                                Chọn từ danh sách
                              </button> */}
                            </div>
                          )}
                        </div>

                      </div>
                    </>
                  )}

                  <div className="col-12">
                    <label className="form-label">
                      Địa chỉ <span className="text-danger">*</span>
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
                    <small style={{ color: charCount.tieuDe >= 100 ? "red" : "#555" }}>
                      {charCount.tieuDe}/100
                    </small>
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
                    <small style={{ color: charCount.moTaChiTiet >= 1000 ? "red" : "#555" }}>
                      {charCount.moTaChiTiet}/1000
                    </small>
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
                          Giấy tờ pháp lý <span className="text-danger">*</span>
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
                          Hướng đất, căn hộ{" "}
                          <span className="text-danger">*</span>
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
                        className={`form-control ${formErrors.thongTinNguoiDangBan ? "is-invalid" : ""
                          }`}
                        maxLength={10}
                        required
                      />
                      {formErrors.thongTinNguoiDangBan && (
                        <div className="invalid-feedback">
                          {formErrors.thongTinNguoiDangBan}
                        </div>
                      )}
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
                          title: (
                            <div>
                              <div className="fw-bold">VIP 1</div>
                              <div>Hiển thị Blog 3 ngày</div>
                              <div>10.000đ/tin</div>
                            </div>
                          ),
                        },

                        {
                          value: "685174b550c6fbcbc4efbe87",
                          title: (
                            <div>
                              <div className="fw-bold">VIP 2</div>
                              <div>Hiển thị Blog 5 ngày</div>
                              <div>20.000đ/tin</div>
                            </div>
                          ),
                        },
                        {
                          value: "685174db50c6fbcbc4efbe88",
                          title: (
                            <div>
                              <div className="fw-bold">VIP 3</div>
                              <div>Hiển thị Blog 7 ngày</div>
                              <div>30.000đ/tin</div>
                            </div>
                          ),
                        },
                      ].map((option) => (
                        <div className="col-12 col-md-4" key={option.value}>
                          <div
                            className={`card h-100 ${formData.postPackage === option.value
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
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;
