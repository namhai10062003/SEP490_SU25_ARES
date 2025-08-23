import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function PlazaDetail() {
  const { id } = useParams();
  const [plaza, setPlaza] = useState(null);
  const [otherPlazas, setOtherPlazas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy chi tiết plaza
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/plaza/${id}`)
      .then((res) => setPlaza(res.data.data))
      .catch((err) => console.error(err));

    // Lấy danh sách các plaza khác
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/plaza`)
      .then((res) => setOtherPlazas(res.data.data.filter((p) => p._id !== id)))
      .catch((err) => console.error(err));
  }, [id]);

  const fieldLabels = {
    investor: "Chủ đầu tư",
    totalCapital: "Vốn đầu tư",
    scale: "Quy mô",
    type: "Loại hình",
    floors: "Số tầng",
    contractor: "Tổng thầu",
    totalArea: "Tổng diện tích",
    constructionDensity: "Mật độ xây dựng",
    completion: "Tiến độ",
    architect: "Kiến trúc sư",
  };

  if (!plaza) return <h2 className="text-center mt-5">Đang tải...</h2>;

  return (
    <div className="container py-5">
      <div className="row">
        {/* Cột trái: Chi tiết Plaza */}
        <div className="col-lg-8">
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <h2 className="fw-bold text-dark mb-3">{plaza.name}</h2>
          <img
            src={plaza.img}
            alt={plaza.name}
            className="img-fluid rounded shadow mb-4"
            style={{
              width: "100%",
              height: "500px",
              objectFit: "cover",
            }}
          />
          <p className="text-muted mb-2">
            <i className="bi bi-geo-alt-fill me-2"></i>
            <strong>Địa chỉ:</strong> {plaza.location}
          </p>
          <p
  style={{
    whiteSpace: "pre-line",   // xuống dòng theo \n
    lineHeight: "1.9",        // giãn dòng thoáng hơn
    fontSize: "1.05rem",      // cỡ chữ ~ 16.8px
    textAlign: "justify",     // căn đều 2 bên
    color: "#333",            // màu chữ dịu hơn đen
    fontFamily: "'Times New Roman', 'Georgia', serif", // chữ báo chí
  }}
>
  {plaza.description}
</p>


          {/* Thông tin chi tiết */}
          <div className="row mt-4">
            {plaza.info &&
              Object.entries(plaza.info).map(([key, value]) => (
                <div className="col-md-6 mb-3" key={key}>
                  <div className="p-3 bg-light rounded-3 shadow-sm h-100">
                    <p className="mb-1 text-secondary small">
                      {fieldLabels[key] || key}
                    </p>
                    <h6 className="fw-bold">{value}</h6>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Cột phải: Plaza khác */}
        <div className="col-lg-4">
          <div className="bg-white shadow-sm rounded-4 p-3 sticky-top" style={{ top: "90px" }}>
            <h5 className="fw-bold mb-3">📌 Plaza khác</h5>
            <div className="list-group">
              {otherPlazas.map((p) => (
                <Link
                  key={p._id}
                  to={`/plaza/${p._id}`}
                  className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                >
                  <img
                    src={p.img}
                    alt={p.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <div>
                    <h6 className="mb-1 fw-semibold">{p.name}</h6>
                    <small className="text-muted text-truncate d-block" style={{ maxWidth: "200px" }}>
                      {p.location}
                    </small>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlazaDetail;
