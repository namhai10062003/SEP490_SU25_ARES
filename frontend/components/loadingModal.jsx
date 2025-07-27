import React from "react";

const LoadingModal = () => (
    <div
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.35)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
        }}
    >
        <div
            style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 20,
                padding: "40px 56px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
            }}
        >
            <div className="spinner-border text-primary" style={{ width: 56, height: 56 }} />
            <div className="mt-3 fw-bold text-dark" style={{ fontSize: 20 }}>Đang xử lý...</div>
        </div>
    </div>
);

export default LoadingModal;