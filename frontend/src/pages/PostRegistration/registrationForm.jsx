import React, { useState, useEffect } from "react";
import Header from "../../../components/header";
import { useAuth } from "../../../context/authContext";
import { createPost } from "../../service/postService.js";
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
  const [loaiBaiDang, setLoaiBaiDang] = useState("ban"); // từ sidebar
  const [loaiHinhCon, setLoaiHinhCon] = useState(""); // ví dụ: "nha_can_ho" hoặc "nha_dat"

  useEffect(() => {
    setName(user?.name || null);
  }, [user]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (formData.images.length === 0) {
        alert("Vui lòng upload ít nhất 1 ảnh");
        setIsSubmitting(false);
        return;
      }
      // Create FormData for API submission
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

      // Add images
      formData.images.forEach((image) => {
        submitData.append("images", image); // ✅ đúng
      });
      // submitData.append("loaiBaiDang", loaiBaiDang); // 👈 gửi kèm loại bài đăng

      // Call API (replace with your actual endpoint)
      const response = await createPost(submitData);

      if (response.data.success) {
        alert("Đăng tin thành công!");
        // Reset form
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

  return (
    <div style={styles.container}>
      <Header user={user} name={name} logout={logout} />
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>🏠 Đăng tin</h1>
          <p style={styles.headerSubtitle}>
            Đăng tin các dịch vụ nhanh chóng và vô cùng dễ dàng
          </p>
        </div>
        <div style={styles.pageLayout}>
          {/* Sidebar bên trái */}
          <div style={styles.sidebar}>
            <h3>Chọn loại bài đăng</h3>
            <ul style={styles.sidebarList}>
              <li
                style={{
                  ...styles.sidebarItem,
                  ...(loaiBaiDang === "ban" ? styles.activeItem : {}),
                }}
                onClick={() => {
                  setLoaiBaiDang("ban");
                  setLoaiHinhCon("");
                  setFormData((prev) => ({ ...prev, loaiHinh: "" }));
                }}
              >
                Tin Bán
              </li>

              <li
                style={{
                  ...styles.sidebarItem,
                  ...(loaiBaiDang === "cho_thue" ? styles.activeItem : {}),
                }}
                onClick={() => {
                  setLoaiBaiDang("cho_thue");
                  setLoaiHinhCon("");
                  setFormData((prev) => ({ ...prev, loaiHinh: "" }));
                }}
              >
                Tin Cho Thuê
              </li>

              <li
                style={{
                  ...styles.sidebarItem,
                  ...(loaiBaiDang === "dich_vu" ? styles.activeItem : {}),
                }}
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

          {/* Content bên phải */}
          <div style={styles.formContent}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Loại hình <span style={styles.required}>*</span>
              </label>

              {/* Nếu là bán hoặc cho thuê */}
              {["ban", "cho_thue"].includes(loaiBaiDang) && (
                <select
                  name="loaiHinh"
                  value={formData.loaiHinh}
                  onChange={(e) => {
                    handleInputChange(e);
                    setLoaiHinhCon(e.target.value); // lưu loại phụ: nhà/căn hộ hay nhà đất
                  }}
                  style={styles.select}
                  required
                >
                  <option value="">Chọn loại hình</option>
                  <option value="nha_can_ho">Nhà / Căn hộ</option>
                  <option value="nha_dat">BĐS</option>
                </select>
              )}
              {/* Nếu là dịch vụ */}
              {loaiBaiDang === "dich_vu" && (
                <select
                  name="loaiHinh"
                  value={formData.loaiHinh}
                  onChange={handleInputChange}
                  style={styles.select}
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
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Tòa plaza <span style={styles.required}>*</span>
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
                    style={styles.select}
                    required
                  >
                    <option value="">Chọn tòa plaza</option>
                    <option value="plaza-a">Plaza A</option>
                    <option value="plaza-b">Plaza B</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Số căn hộ <span style={styles.required}>*</span>
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
                    style={styles.select}
                    required
                  >
                    <option value="">Chọn số căn hộ</option>
                    <option value="101">101</option>
                    <option value="202">202</option>
                    <option value="303">303</option>
                  </select>
                </div>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Địa chỉ cụ thể <span style={styles.required}>*</span>
              </label>
              <div style={styles.inputGroup}>
                <span style={styles.inputIcon}>📍</span>
                <input
                  type="text"
                  name="diaChiCuThe"
                  value={formData.diaChiCuThe}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ cụ thể"
                  style={styles.inputWithIcon}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Tiêu đề <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="tieuDe"
                value={formData.tieuDe}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Mô tả chi tiết <span style={styles.required}>*</span>
              </label>
              <textarea
                name="moTaChiTiet"
                value={formData.moTaChiTiet}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết về bất động sản..."
                rows="4"
                style={styles.textarea}
                required
              />
            </div>

            {["ban", "cho_thue"].includes(loaiBaiDang) && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Diện tích <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputGroup}>
                    <span style={styles.inputIcon}>🏠</span>
                    <input
                      type="number"
                      name="dienTich"
                      value={formData.dienTich}
                      onChange={handleInputChange}
                      placeholder="m²"
                      style={styles.inputWithIcon}
                      required
                    />
                  </div>
                </div>
              </>
            )}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Giá <span style={styles.required}>*</span>
              </label>
              <div style={styles.inputGroup}>
                <span style={styles.inputIcon}>💰</span>
                <input
                  type="number"
                  name="gia"
                  value={formData.gia}
                  onChange={handleInputChange}
                  placeholder="Thỏa thuận hoặc giá cụ thể"
                  style={styles.inputWithIcon}
                  required
                />
              </div>
            </div>

            {/* <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Diện tích <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>🏠</span>
                  <input
                    type="number"
                    name="dienTich"
                    value={formData.dienTich}
                    onChange={handleInputChange}
                    placeholder="m²"
                    style={styles.inputWithIcon}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Giá <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>💰</span>
                  <input
                    type="number"
                    name="gia"
                    value={formData.gia}
                    onChange={handleInputChange}
                    placeholder="Thỏa thuận hoặc giá cụ thể"
                    style={styles.inputWithIcon}
                    required
                  />
                </div>
              </div>
            </div> */}
            {["ban", "cho_thue"].includes(loaiBaiDang) && (
              <>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Giấy tờ pháp lí<span style={styles.required}>*</span>
                    </label>
                    <div style={styles.inputGroup}>
                      <span style={styles.inputIcon}>🏠</span>
                      <input
                        type="text"
                        name="giayto"
                        value={formData.giayto}
                        onChange={handleInputChange}
                        placeholder="Giấy tờ đất, căn hộ..."
                        style={styles.inputWithIcon}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Tình trạng nổi bật <span style={styles.required}>*</span>
                    </label>
                    <div style={styles.inputGroup}>
                      <span style={styles.inputIcon}>💰</span>
                      <input
                        type="text"
                        name="tinhtrang"
                        value={formData.tinhtrang}
                        onChange={handleInputChange}
                        placeholder="Nội thất..."
                        style={styles.inputWithIcon}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Hướng đất, căn hộ <span style={styles.required}>*</span>
                    </label>
                    <div style={styles.inputGroup}>
                      <span style={styles.inputIcon}>🏠</span>
                      <input
                        type="text"
                        name="huongdat"
                        value={formData.huongdat}
                        onChange={handleInputChange}
                        placeholder="Hướng thuận lợi..."
                        style={styles.inputWithIcon}
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Thông tin người đăng bán <span style={styles.required}>*</span>
              </label>
              <div style={styles.inputGroup}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  type="text"
                  name="thongTinNguoiDangBan"
                  value={formData.thongTinNguoiDangBan}
                  onChange={handleInputChange}
                  placeholder="Số điện thoại"
                  style={styles.inputWithIcon}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Upload ảnh <span style={styles.required}>*</span>
              </label>
              <div
                style={styles.uploadArea}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("imageInput").click()}
              >
                <div style={styles.uploadIcon}>📤</div>
                <div style={styles.uploadText}>Upload Images</div>
                <div style={styles.uploadSubtext}>
                  Click to select multiple images
                </div>
                <input
                  type="file"
                  id="imageInput"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={styles.hiddenInput}
                />
              </div>

              {formData.images.length > 0 && (
                <div style={styles.imagePreview}>
                  {formData.images.map((image, index) => (
                    <div key={index} style={styles.imageItem}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        style={styles.previewImage}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={styles.removeButton}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Chọn gói đăng tin <span style={styles.required}>*</span>
              </label>
              <div style={styles.genderOptions}>
                {[
                  {
                    value: "685039e4f8f1552c6378a7a5",
                    title: "VIP1 - Tin sẽ tồn tại trên Blog 3 ngày",
                    subtitle: "10000d/tin",
                  },
                  {
                    value: "685174b550c6fbcbc4efbe87",
                    title: "VIP2 - Tin sẽ tồn tại trên Blog 5 ngày",
                    subtitle: "20000d/tin",
                  },
                  {
                    value: "685174db50c6fbcbc4efbe88",
                    title: "VIP3 - Tin sẽ tồn tại trên Blog 7 ngày",
                    subtitle: "30000d/tin",
                  },
                ].map((option) => (
                  <div
                    key={option.value}
                    style={{
                      ...styles.genderCard,
                      ...(formData.postPackage === option.value
                        ? styles.genderCardSelected
                        : {}),
                    }}
                    onClick={() => handleGenderSelect(option.value)}
                  >
                    <div style={styles.genderTitle}>{option.title}</div>
                    <div style={styles.genderSubtitle}>{option.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                ...styles.submitBtn,
                ...(isSubmitting ? styles.submitBtnDisabled : {}),
              }}
            >
              {isSubmitting ? (
                <div style={styles.loading}>
                  <div style={styles.spinner}></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                "Đăng tin"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100vw",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    backgroundColor: "#f4f6f8",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  formWrapper: {
    width: "100%",
  },

  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px 20px",
    textAlign: "center",
    color: "white",
  },
  headerTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    marginBottom: "10px",
  },
  headerSubtitle: {
    fontSize: "1.25rem",
    opacity: 0.9,
  },
  pageLayout: {
    display: "flex",
    width: "100%",
    backgroundImage: "url('')", // Đường dẫn ảnh
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },

  sidebar: {
    width: "220px",
    marginTop: "20px",
    marginLeft: "20px",
    background: "#ffffff",
    padding: "30px 20px",
    borderRight: "1px solid #e0e0e0",
    height: "100%",
  },

  sidebarList: {
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
  },

  sidebarItem: {
    padding: "12px 16px",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.3s",
    color: "#333",
  },

  activeItem: {
    background: "#667eea",
    color: "white",
    fontWeight: "bold",
  },

  formContent: {
    maxWidth: "1000px",
    marginTop: "20px",
    marginLeft: "150px",
    padding: "40px 30px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    marginBottom: "60px",
  },

  formGroup: {
    marginBottom: "25px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#333",
    fontSize: "1rem",
  },
  required: {
    color: "#e74c3c",
    marginLeft: "4px",
  },

  input: {
    width: "100%",
    padding: "12px 16px",
    border: "1.5px solid #ccc",
    borderRadius: "10px",
    fontSize: "1rem",
    backgroundColor: "#fff",
  },
  inputWithIcon: {
    width: "100%",
    padding: "12px 16px 12px 40px",
    border: "1.5px solid #ccc",
    borderRadius: "10px",
    fontSize: "1rem",
    backgroundColor: "#fff",
  },

  select: {
    width: "100%",
    padding: "12px 16px",
    border: "1.5px solid #ccc",
    borderRadius: "10px",
    fontSize: "1rem",
    backgroundColor: "#fff",
  },
  featureIcon: {
    fontSize: "0.8rem",
    fontWeight: "bold",
    marginRight: "8px",
    width: "16px",
    textAlign: "center",
  },

  selectedBadge: {
    position: "absolute",
    top: "-8px",
    right: "16px",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "600",
    padding: "4px 12px",
    borderRadius: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  textarea: {
    width: "100%",
    padding: "14px",
    border: "1.5px solid #ccc",
    borderRadius: "10px",
    fontSize: "1rem",
    resize: "vertical",
    minHeight: "120px",
    backgroundColor: "#fff",
  },

  inputGroup: {
    position: "relative",
  },

  inputIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#666",
    fontSize: "1.1rem",
    zIndex: "1",
  },

  uploadArea: {
    border: "2px dashed #aaa",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    background: "#fafafa",
    cursor: "pointer",
  },
  uploadIcon: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    color: "#999",
  },
  uploadText: {
    fontSize: "1.1rem",
    fontWeight: "500",
    color: "#333",
  },
  uploadSubtext: {
    fontSize: "0.9rem",
    color: "#888",
  },
  hiddenInput: {
    display: "none",
  },

  imagePreview: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "15px",
    marginTop: "15px",
  },
  imageItem: {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #ddd",
  },
  previewImage: {
    width: "100%",
    height: "100px",
    objectFit: "cover",
  },
  removeButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    fontSize: "14px",
    cursor: "pointer",
  },

  genderOptions: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  genderCard: {
    border: "2px solid #ccc",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#fff",
    transition: "0.3s",
  },
  genderCardSelected: {
    borderColor: "#667eea",
    backgroundColor: "#eef0ff",
    boxShadow: "0 5px 20px rgba(102, 126, 234, 0.2)",
  },
  genderEmoji: {
    fontSize: "2rem",
    marginBottom: "8px",
  },
  genderTitle: {
    fontWeight: "600",
    color: "#333",
  },
  genderSubtitle: {
    color: "#777",
    fontWeight: "700",
    fontSize: "15px",
  },

  submitBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    fontSize: "1.2rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "30px",
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr !important;
    }
    .gender-options {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default RegistrationForm;
