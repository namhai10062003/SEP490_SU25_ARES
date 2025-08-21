import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function PlazaDetail() {
    const { id } = useParams();
    const [plaza, setPlaza] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/plaza/${id}`)
            .then(res => setPlaza(res.data.data))
            .catch(err => console.error(err));
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
            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
                ← Quay lại
            </button>
            <h2 className="fw-bold text-dark mb-3">{plaza.name}</h2>
            <img
                src={plaza.img}
                alt={plaza.name}
                className="img-fluid rounded shadow mb-4"
                style={{
                    width: "100%",
                    height: "650px", // tuỳ bạn chọn 300 / 400 / 500px
                    objectFit: "cover",
                }}
            />
            <p>
                <strong>Địa chỉ:</strong> {plaza.location}
            </p>
            <p>{plaza.description}</p>

            {/* Thông tin chi tiết */}
            <div className="row mt-4">
                {plaza.info &&
                    Object.entries(plaza.info).map(([key, value]) => (
                        <div className="col-md-6 mb-2" key={key}>
                            <p>
                                <strong>{fieldLabels[key] || key}:</strong> {value}
                            </p>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default PlazaDetail;
