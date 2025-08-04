// src/components/ProtectedLink.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { toast } from "react-toastify";

const ProtectedLink = ({ to, children, className, allowWithoutProfile = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isIncompleteProfile = () => {
    return !user?.name || !user?.dob || !user?.phone || !user?.address;
  };

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
