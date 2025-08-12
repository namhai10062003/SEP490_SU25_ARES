import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminDashboard from "./adminDashboard.jsx";
import LoadingModal from "../../../components/loadingModal.jsx";
import ContractForm from "../../../components/contractForm";
import { formatDate, formatSmartDate } from "../../../utils/format";

const AdminContractDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/contracts/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
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
                        setPost(null);
                    }
                }
            } catch (err) {
                alert("Không thể tải chi tiết hợp đồng.");
                navigate("/admin/manage-contract");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id, navigate]);

    return (
        <AdminDashboard>
            {loading && <LoadingModal />}
            <div className="container py-4">
                <button
                    type="button"
                    className="btn btn-secondary mb-3"
                    onClick={() => navigate(-1)}
                >
                    ← Quay lại
                </button>
                {!loading && contract ? (
                    <ContractForm
                        contractData={{
                            startDate: contract.startDate,
                            endDate: contract.endDate,
                            depositAmount: contract.depositAmount,
                            terms: contract.contractTerms,
                            orderCode: contract.orderCode,
                            paymentStatus: contract.paymentStatus,
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
                        user={contract.userId}
                        landlord={post?.contactInfo}
                        readOnly={true}
                        headerDate={contract.createdAt}
                        signaturePartyBUrl={contract?.signaturePartyBUrl}
                        signaturePartyAUrl={contract?.signaturePartyAUrl}
                        formatDate={formatDate}
                        formatSmartDate={formatSmartDate}
                    />
                ) : !loading ? (
                    <div className="text-center py-4 text-muted">
                        Không tìm thấy hợp đồng.
                    </div>
                ) : null}
            </div>
        </AdminDashboard>
    );
};

export default AdminContractDetail;
