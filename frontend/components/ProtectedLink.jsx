// src/components/ProtectedLink.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/authContext";

const ProtectedLink = ({ to, children, className, allowWithoutProfile = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  console.log("🟡 Current user:", user);

  const isIncompleteProfile = () => {
    const requiredFields = ["name", "dob", "phone", "address"];
    return requiredFields.some(
      (field) => !user?.[field] || String(user[field]).trim() === ""
    );
  };
  console.log("📋 Kiểm tra profile:", {
    name: user?.name,
    dob: user?.dob,
    phone: user?.phone,
    address: user?.address,
    identityNumber: user?.identityNumber
  });
  

  const handleClick = (e) => {
    if (!allowWithoutProfile && isIncompleteProfile()) {
      e.preventDefault();
      toast.warn("⚠️ Vui lòng cập nhật hồ sơ để sử dụng chức năng này!");
      navigate("/profile");
    }
  };

  return (
    <Link to={to} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
};

export default ProtectedLink;
