import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import Footer from "../../../../components/footer";
import ContractForm from "../../../../components/contractForm";
import { FaArrowCircleLeft } from "react-icons/fa";
const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [contract, setContract] = useState(null);
  const [post, setPost] = useState(null);
  const today = new Date();

  const formatVNDate = (dateStr) => {
    if (!dateStr) return "....../....../......";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const getAutoEndDateVN = (startDate, plusDays = 7) => {
    if (!startDate) return "....../....../......";
    const d = new Date(startDate);
    d.setDate(d.getDate() + plusDays);
    return formatVNDate(d.toISOString());
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contracts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contractData = res.data.data;
        setContract(contractData);

        if (contractData.postId) {
          const postRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/posts/postdetail/${contractData.postId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPost(postRes.data.data);
        }
      } catch (err) {
        console.error(err);
        alert("Không thể tải chi tiết hợp đồng hoặc bài đăng.");
        navigate("/my-contracts");
      }
    };

    fetchDetail();
  }, [id, navigate]);

  if (loading || !contract)
    return <div className="text-center py-4">🔄 Đang tải chi tiết...</div>;
  const formatVNDayOfWeek = (dateStr) => {
    if (!dateStr) return "....../....../......";
    const d = new Date(dateStr);
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return `${days[d.getDay()]}, ngày ${String(d.getDate()).padStart(2, "0")} tháng ${String(d.getMonth() + 1).padStart(2, "0")} năm ${d.getFullYear()}`;
  };

  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={user?.name} />
      <div className="bg-light py-2 px-3 ">
        <button
          type="button"
          className="btn btn-secondary d-flex align-items-center"
          style={{ width: "fit-content" }}
          onClick={() => navigate(-1)}
        >
          <FaArrowCircleLeft className="me-1 " /> Quay lại
        </button>
      </div>
      <ContractForm
        contractData={{
          startDate: contract.startDate,
          endDate: contract.endDate,
          depositAmount: contract.depositAmount,
          terms: contract.contractTerms,
        }}
        post={post}
        user={user}
        landlord={post?.contactInfo}
        readOnly={true}
        headerDate={contract.createdAt}
      />
      <Footer />
    </div>
  );
};

export default ContractDetail;
