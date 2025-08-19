import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaArrowCircleLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import ContractForm from "../../../../components/contractForm";
import Footer from "../../../../components/footer";
import Header from "../../../../components/header";
import { useAuth } from "../../../../context/authContext";
import LoadingModal from "../../../../components/loadingModal";
import { getStatusLabel } from "../../../../utils/format";
const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [contract, setContract] = useState(null);
  const [post, setPost] = useState(null);
  const today = new Date();
  const { logout } = useAuth();


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
          try {
            const postRes = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/posts/postdetail/${contractData.postId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setPost(postRes.data.data);
          } catch (postErr) {
            console.warn("⚠️ Bài đăng đã bị xoá hoặc không tồn tại.");
            setPost(null); // vẫn giữ contract
          }
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải hợp đồng:", err);
        alert("Không thể tải chi tiết hợp đồng.");
        navigate("/my-contracts");
      }
    };

    fetchDetail();
  }, [id, navigate]);


  if (loading || !contract)
    return <LoadingModal />;


  return (
    <div className="bg-light min-vh-100">
      <Header user={user} name={user?.name} logout={logout} />
      <div className="bg-light py-2 px-3 ">
        <button
          type="button"
          className="btn btn-secondary d-flex align-items-center"
          style={{ width: "fit-content" }}
          onClick={() => navigate(-1)}
        >
          <FaArrowCircleLeft className="me-1 " /> Quay lại
        </button>
        <div className="d-flex justify-content-center align-items-center mb-4 mt-3">
          {!loading && contract && (
            (() => {
              const { label, color } = getStatusLabel(contract.status);
              return (
                <span
                  className={`badge px-4 py-2 fs-6 fw-semibold bg-${color}${color === "warning" ? " text-dark" : ""}`}
                  style={{ minWidth: 180, textTransform: "capitalize" }}
                >
                  {label}
                </span>
              );
            })()
          )}
        </div>
      </div>
      <ContractForm
        contractData={{
          startDate: contract.startDate,
          endDate: contract.endDate,
          depositAmount: contract.depositAmount,
          terms: contract.contractTerms,
          orderCode: contract.orderCode,
          paymentStatus: contract.paymentStatus,

          // 👇 Bổ sung đầy đủ BÊN A và BÊN B
          fullNameA: contract.fullNameA,
          cmndA: contract.cmndA,
          phoneA: contract.phoneA,
          emailA: contract.emailA,
          addressA: contract.addressA,

          fullNameB: contract.fullNameB,
          cmndB: contract.cmndB,
          phoneB: contract.phoneB,
          emailB: contract.emailB,
          addressB: contract.addressB,


        }}
        post={post}
        user={user}
        landlord={post?.contactInfo}
        readOnly={true}
        headerDate={contract.createdAt}
        signaturePartyBUrl={contract?.signaturePartyBUrl}
        signaturePartyAUrl={contract?.signaturePartyAUrl}
      />

      <Footer />
    </div>
  );
};

export default ContractDetail;
