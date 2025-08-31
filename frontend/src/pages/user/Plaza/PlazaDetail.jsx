import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../../../components/header";
import LoadingModal from "../../../../components/loadingModal";

function PlazaDetail({ user, name, logout }) {
  const { id } = useParams();
  const [plaza, setPlaza] = useState(null);
  const [otherPlazas, setOtherPlazas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plazaRes, plazasRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/plaza/${id}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/plaza`)
        ]);

        setPlaza(plazaRes.data.data);
        setOtherPlazas(plazasRes.data.data.filter((p) => p._id !== id));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (loading) {
    return (
      <LoadingModal />
    );
  }

  if (!plaza) {
    return (
      <>
        <Header user={user} name={name} logout={logout} />
        <div className="container py-5">
          <div className="text-center">
            <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
            <h3 className="text-muted">Không tìm thấy thông tin plaza</h3>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header user={user} name={name} logout={logout} />
      <div className="container py-5">
        <div className="row g-4">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Header */}
            <div className="mb-4">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/" className="text-decoration-none">
                      <i className="bi  me-1"></i>Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {plaza.name}
                  </li>
                </ol>
              </nav>
              <h1 className="display-6 fw-bold text-dark mb-3">{plaza.name}</h1>
            </div>

            {/* Hero Image */}
            <div className="position-relative mb-4">
              <img
                src={plaza.img}
                alt={plaza.name}
                className="img-fluid rounded-4 shadow-lg w-100"
                style={{ height: "500px", objectFit: "cover" }}
              />
              <div className="position-absolute bottom-0 start-0 w-100 p-4"
                style={{
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  borderBottomLeftRadius: "1rem",
                  borderBottomRightRadius: "1rem"
                }}>
                <div className="d-flex align-items-center text-white">
                  <i className="bi bi-geo-alt-fill fs-4 me-2"></i>
                  <span className="fw-semibold">{plaza.location}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-3">
                  <i className="bi bi-info-circle me-2 text-primary"></i>
                  Mô tả dự án
                </h5>
                <p className="card-text lh-lg text-secondary">
                  {plaza.description}
                </p>
              </div>
            </div>

            {/* Project Details */}
            {plaza.info && Object.keys(plaza.info).length > 0 && (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-4">
                    <i className="bi bi-clipboard-data me-2 text-primary"></i>
                    Thông tin chi tiết
                  </h5>
                  <div className="row g-3">
                    {Object.entries(plaza.info).map(([key, value]) => (
                      <div className="col-md-6" key={key}>
                        <div className="d-flex align-items-center p-3 bg-light rounded-3 h-100">
                          <div className="flex-shrink-0 me-3">
                            <i className="bi bi-check-circle-fill text-success fs-5"></i>
                          </div>
                          <div className="flex-grow-1">
                            <small className="text-muted d-block fw-medium">
                              {fieldLabels[key] || key}
                            </small>
                            <span className="fw-semibold text-dark">{value}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="position-sticky" style={{ top: "100px" }}>
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white border-0">
                  <h5 className="card-title mb-0 fw-bold">
                    <i className="bi bi-building me-2"></i>
                    Plaza khác
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                  {otherPlazas
  .sort((a, b) => a.name.localeCompare(b.name)) // sắp xếp theo tên
  .slice(0, 5)
  .map((p) => (
    <Link
      key={p._id}
      to={`/plaza/${p._id}`}
      className="list-group-item list-group-item-action border-0 p-3 d-flex align-items-center gap-3 hover-lift"
      style={{ transition: "all 0.2s ease" }}
    >
      <div className="flex-shrink-0">
        <img
          src={p.img}
          alt={p.name}
          className="rounded-3"
          style={{
            width: "60px",
            height: "60px",
            objectFit: "cover",
          }}
        />
      </div>
      <div className="flex-grow-1 min-w-0">
        <h6 className="mb-1 fw-semibold text-truncate">{p.name}</h6>
        <small className="text-muted d-flex align-items-center">
          <i className="bi bi-geo-alt me-1"></i>
          <span className="text-truncate">{p.location}</span>
        </small>
      </div>
      <i className="bi bi-chevron-right text-muted"></i>
    </Link>
))}

                  </div>
                </div>
                {otherPlazas.length > 5 && (
                  <div className="card-footer bg-light border-0 text-center">
                    <Link to="/plaza" className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-arrow-right me-1"></i>
                      Xem tất cả
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PlazaDetail;
