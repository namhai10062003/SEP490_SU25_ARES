    import React from "react";
import { Card, Button } from "react-bootstrap";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";

export default function UserInfo({ user, postCount }) {
  if (!user) return null;

  const joinYears = new Date().getFullYear() - new Date(user.createdAt).getFullYear();

  return (
    <Card className="shadow rounded border-0">
      <Card.Body className="text-center">
        <img
          src={user.profileImage || user.picture || "/default-avatar.png"}
          alt={user.name}
          className="rounded-circle shadow mb-3"
          style={{ width: "90px", height: "90px", objectFit: "cover" }}
        />

        <h5 className="fw-bold">
          {user.name}{" "}
          {user.verified && <FaCheckCircle className="text-primary ms-1" />}
        </h5>
        <p className="text-muted mb-2">{user.jobTitle || "Người bán"}</p>

        <div className="d-flex justify-content-between px-4 mb-3">
          <div>
            <div className="fw-bold">{joinYears}+ năm</div>
            <small className="text-muted">Tham gia</small>
          </div>
          <div>
            <div className="fw-bold">{postCount || 0}</div>
            <small className="text-muted">Tin đăng</small>
          </div>
        </div>

        {user.phone && (
          <p className="mb-1">
            <FaPhone className="me-2 text-success" />
            <a href={`tel:${user.phone}`} className="text-decoration-none">
              {user.phone}
            </a>
          </p>
        )}
        {user.email && (
          <p className="mb-1">
            <FaEnvelope className="me-2 text-warning" />
            {user.email}
          </p>
        )}
        {user.address && (
          <p className="mb-3">
            <FaMapMarkerAlt className="me-2 text-danger" />
            {user.address}
          </p>
        )}

        <Button variant="primary" className="w-100 mb-2">
          Chat qua Zalo
        </Button>
        <Button variant="outline-success" className="w-100">
          Gọi ngay
        </Button>
      </Card.Body>
    </Card>
  );
}
