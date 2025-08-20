import React, { useState, useMemo } from "react";

function maskPhone(phone) {
  if (!phone) return "Không có";
  const p = phone.replace(/\s+/g, "");
  if (p.length < 7) return p;
  return `${p.slice(0, 4)} ${p.slice(4, 7)} ***`;
}

export default function UserInfo({
  user,
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
    <div className="w-full">
      <div className="bg-white border border-slate-200 rounded-2xl shadow overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-teal-700 text-white text-center">
          <p className="text-sm font-semibold">Môi giới chuyên nghiệp</p>
        </div>
  
        {/* Body */}
        <div className="p-4">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white shadow">
              <img
                src={avatar}
                alt={user.name || "avatar"}
                className="w-full h-full object-cover"
                width={80}
                height={80}
              />
            </div>
            <p className="mt-2 font-semibold text-slate-800">{user.name || "Không có"}</p>
            <p className="text-xs text-slate-500">{user.jobTitle || "Người bán"}</p>
          </div>
  
          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 rounded-xl border border-slate-200 divide-x divide-slate-200 bg-slate-50">
            <div className="p-3 text-center">
              <p className="text-xs text-slate-500">Tham gia</p>
              <p className="text-lg font-bold text-slate-800">
                {joinYears}
                <span className="text-sm ml-1">năm</span>
              </p>
            </div>
            <div className="p-3 text-center">
              <p className="text-xs text-slate-500">Tin đăng</p>
              <p className="text-lg font-bold text-slate-800">{postCount}</p>
            </div>
          </div>
  
          {/* Tip box */}
          {relatedCount > 0 && (
            <div className="mt-4 flex gap-2 items-start rounded-xl bg-amber-50 p-3 text-amber-900">
              <span className="text-xl">💡</span>
              <p className="text-sm leading-5">
                Có {relatedCount} tin đất nền dự án cùng FPT City Đà Nẵng
              </p>
            </div>
          )}
  
          {/* Xem trang cá nhân */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="mt-4 w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Xem trang cá nhân</span>
            <span aria-hidden>›</span>
          </button>
  
          {/* Actions */}
          <div className="mt-3 space-y-3">
            <a
              href={phone ? `https://zalo.me/${phone}` : "#"}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
            >
              <img src="/zalo-icon.svg" alt="" className="w-5 h-5" />
              Chat qua Zalo
            </a>
  
            <button
              type="button"
              onClick={() => setShowPhone((v) => !v)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              📞 {showPhone && phone ? phone : `${maskedPhone} · Hiện số`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
}
