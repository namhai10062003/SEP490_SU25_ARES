import { useMemo, useState } from "react";
import zaloLogo from "../../src/pages/images/zalo-logo.png";

function maskPhone(phone) {
  if (!phone) return "Không có";
  const p = phone.replace(/\s+/g, "");
  if (p.length < 7) return p;
  return `${p.slice(0, 4)} ${p.slice(4, 7)} ***`;
}

export default function UserInfo({
  user = {},
  postCount = 0,
  relatedCount = 0,
  onOpenProfile = () => { },
}) {
  if (!user) return null;

  const createdYear = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();
  const joinYears = Math.max(0, new Date().getFullYear() - createdYear);

  const [showPhone, setShowPhone] = useState(false);
  const phone = user.phone || "";
  const maskedPhone = useMemo(() => maskPhone(phone), [phone]);
  const avatar = user.profileImage || user.picture || "/default-avatar.png";

  return (
    <div
      className="container d-flex justify-content-center"
      style={{
        minHeight: 420,
        padding: "32px 0"
      }}
    >
      <div
        className="bg-white"
        style={{
          background: "linear-gradient(90deg, #1ec6b6 0%, #0e9488 100%)",
          width: 340,
          minWidth: 300,
          borderColor: "#20c997",
          borderWidth: 1,
          borderStyle: "solid",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
          padding: "2px"
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "end",
            padding: "20px 10px"
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: 0.5
            }}
          >
            Môi giới chuyên nghiệp
          </span>
        </div>

        <div 
          className="bg-white"
          style={{
            width: "100%",
            minWidth: 300,
            borderColor: "#20c997",
            borderWidth: 2,
            borderStyle: "solid",
            borderRadius: 12,
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
            overflow: "visible",
            paddingBottom: 18,
          }}
        >
          {/* Avatar */}
          <div
            className="d-flex align-items-center"
            style={{ position: "relative", marginTop: "-32px", padding: "0 20px" }}
          >
            <div 
              style={{
                overflow: "hidden",
                position: "relative"
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #fff",
                  background: "#f8f9fa",
                  position: "relative",
                  flexShrink: 0
                }}
              >
                <img
                  src={avatar}
                  alt={avatar || "avatar"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                  width={96}
                  height={96}
                />
                {/* Badge */}
                <span
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    background: "#fff",
                    borderRadius: "50%",
                    border: "1.5px solid #ffc107",
                    padding: 2,
                    boxShadow: "0 0 0 2px #fff"
                  }}
                >
                </span>
              </div>
              <div
                style={{
                  position:"absolute",
                  right: 0,
                  bottom: 2,
                }}
              >
                {/* SVG icon */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffc107">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </div>
            <div style={{ height: 96, marginLeft: 16, textAlign: "left", display:"flex", flexDirection:"column", justifyContent:"end" }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  color: "#212529"
                }}
              >
                {user.name || "Name"}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#6c757d"
                }}
              >
                {user.jobTitle || "Batdongsan"}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            className="row"
            style={{
              margin: "24px 0 0 0",
              borderRadius: 12,
              overflow: "hidden",
              padding: 5
            }}
          >
            <div className="col-6 text-center" style={{ padding: 12, borderRight: "1px solid #e9ecef" }}>
              <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 2 }}>Tham gia Batdongsan</div>
              <div style={{ fontWeight: 800, fontSize: 28, color: "#212529", lineHeight: 1 }}>{joinYears}</div>
              <span style={{ fontSize: 12, color: "#6c757d" }}>năm</span>
            </div>
            <div className="col-6 text-center" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 2 }}>Tin đăng đang có</div>
              <div style={{ fontWeight: 800, fontSize: 28, color: "#212529", lineHeight: 1 }}>{postCount}</div>
            </div>
          </div>

          {/* Tip box luôn hiển thị */}
          <div
            className="d-flex align-items-center"
            style={{
              margin: "20px 16px 0 16px",
              borderRadius: 12,
              background: "#fff8e1",
              border: "1px solid #ffe082",
              padding: "10px 12px",
              fontWeight: 600,
              fontSize: 14
            }}
          >
            <span style={{ fontSize: 20, marginRight: 8 }}>💡</span>
            <span>
              Có {relatedCount} tin đất nền dự án cùng dự án FPT City Đà Nẵng
            </span>
          </div>

          {/* Xem trang cá nhân */}
          {/* <a
            href="#"
            onClick={e => { e.preventDefault(); onOpenProfile(); }}
            style={{
              margin: "20px 16px 0 16px",
              width: "calc(100% - 32px)",
              borderRadius: 12,
              fontWeight: 500,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 18px",
              color: "#495057",
              textDecoration: "none",
              background: "#fff",
              transition: "background 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "#f8f9fa"}
            onMouseOut={e => e.currentTarget.style.background = "#fff"}
          >
            <span>Xem trang cá nhân</span>
            <span aria-hidden style={{ marginLeft: 10, fontSize: 20, fontWeight: 700 }}>&#8250;</span>
          </a> */}

          {/* Actions */}
          <div style={{ margin: "18px 16px 0 16px" }}>
            <a
              href={phone ? `https://zalo.me/${phone}` : "#"}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
              style={{
                width: "100%",
                borderRadius: 12,
                fontWeight: 500,
                fontSize: 16,
                marginBottom: 12,
                gap: 8,
                padding: "10px 0"
              }}
            >
              <img src={zaloLogo} alt="zalo_logo" style={{ width: 26, height: 26, marginRight: 8 }} />
              Chat qua Zalo
            </a>

            <button
              type="button"
              onClick={() => setShowPhone((v) => !v)}
              className="btn"
              style={{
                width: "100%",
                borderRadius: 12,
                background: "#20c997",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 0",
                boxShadow: "0 2px 8px 0 rgba(32,201,151,0.08)"
              }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" fill="#fff" />
              </svg>
              <span>
                {showPhone && phone
                  ? <span>{phone}</span>
                  : <span>
                    <span style={{ letterSpacing: 2 }}>{maskedPhone}</span>
                    <span style={{ fontWeight: 400, fontSize: 13, opacity: 0.85, marginLeft: 6 }}>· Hiện số</span>
                  </span>
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
