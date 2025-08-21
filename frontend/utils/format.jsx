// --- Currency ---
export const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN").format(p || 0) + " VND";

// --- Dates ---
export const formatDateWithTime = (d) => {
    if (!d) return "";
    const date = new Date(d);
    const dateStr = date.toLocaleDateString("vi-VN");
    const pad = (n) => n.toString().padStart(2, "0");
    const h = pad(date.getHours());
    const m = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    return `${dateStr}, ${h}:${m}:${s}`;
};

export const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "";

export const toInputDate = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};
export const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return "0 VND";
    return Number(amount).toLocaleString("vi-VN") + " VND";
};

export const formatSmartDate = (dateStr) => {
    if (!dateStr) return "";

    const WEEKDAYS = [
        "Chủ nhật",
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy"
    ];

    const pad = (n) => n.toString().padStart(2, "0");

    const formatTime = (date) => {
        let h = date.getHours();
        let m = date.getMinutes();
        let ampm = h >= 12 ? "pm" : "am";
        h = h % 12;
        h = h ? h : 12; // 0 => 12
        return `${h}:${pad(m)}${ampm}`;
    };

    const formatDateNumber = (date) => {
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    };

    const now = new Date();
    const target = new Date(dateStr);
    const diffSec = Math.floor((now - target) / 1000);

    // Show time ago for events < 1 day
    if (diffSec < 60) return `${diffSec} giây trước`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;

    // Get YMD for today, yesterday, target
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    // Hôm nay
    if (targetDay.getTime() === today.getTime()) {
        return `Hôm nay, vào lúc ${formatTime(target)}`;
    }
    // Hôm qua
    if (targetDay.getTime() === yesterday.getTime()) {
        return `Hôm qua, vào lúc ${formatTime(target)}`;
    }

    // Check if target is in the same week as today (Mon-Sun)
    // Get ISO week number and year
    const getWeekYear = (d) => {
        // Copy date so don't modify original
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
        return { week: weekNo, year: date.getUTCFullYear() };
    };

    const todayWeek = getWeekYear(today);
    const targetWeek = getWeekYear(targetDay);

    // If in same week and not hôm nay/hôm qua
    if (todayWeek.week === targetWeek.week && todayWeek.year === targetWeek.year) {
        // Show thứ + date + time
        const weekday = WEEKDAYS[targetDay.getDay()];
        return `${weekday}, ${formatDateNumber(targetDay)}, vào lúc ${formatTime(target)}`;
    }

    // If in previous week, but is yesterday (e.g. today is Monday, target is Sunday)
    // Already handled above, but double check for edge case
    // Show date plus the time
    return `${formatDateNumber(targetDay)}, vào lúc ${formatTime(target)}`;
};


// --- Status badge formatter ---
export const getStatusLabel = (status) => {
    const map = {
        pending: { label: "⏳ Chờ duyệt", color: "warning" },
        approved: { label: "✅ Đã duyệt", color: "success" },
        rejected: { label: "❌ Từ chối", color: "danger" },
        expired: { label: "⌛ Hết hạn", color: "secondary" },
        paid: { label: "✔️ Đã thanh toán", color: "success" },
        unpaid: { label: "❌ Chưa thanh toán", color: "danger" },
        active: { label: "🟢 Đang hoạt động", color: "success" },
        inactive: { label: "⚪ Ngưng hoạt động", color: "secondary" },
        blocked: { label: "🚫 Đã chặn", color: "danger" },
        // user status
        1: { label: "🟢 Đang hoạt động", color: "success" },
        0: { label: "🔒 Chặn đăng bài", color: "warning" },
        2: { label: "🚫 Khoá hoàn toàn", color: "danger" },
        // contract status
        cancelled: { label: "🚫 Đã hủy", color: "danger" },
        failed: { label: "❌ Thanh toán thất bại", color: "danger" },

    };
    return map[status] || { label: status, color: "secondary" };
};

// --- String helpers ---
export const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const formatName = (name) =>
    name
        ? name
            .trim()
            .toLowerCase()
            .split(" ")
            .map(capitalizeFirst)
            .join(" ")
        : "";

// --- Phone formatter (VN style: 0905 546 572) ---
export const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
};

// --- Email ---
export const formatEmail = (email) => {
    if (!email) return "";
    return email.trim().toLowerCase();
};

// --- Address ---
export const formatAddress = (address) => {
    if (!address) return "";
    return address
        .trim()
        .replace(/\s+/g, " ") // collapse spaces
        .replace(/,\s*$/, ""); // remove trailing comma
};

// --- URL ---
export const formatURL = (url) => {
    if (!url) return "";
    try {
        const parsed = new URL(url);
        return parsed.href;
    } catch (e) {
        console.warn("Invalid URL:", url);
        return "";
    }
};

// --- CMND/CCCD formatter ---
export const formatCMND = (id) => {
    if (!id) return "";
    const digits = id.replace(/\D/g, "");
    if (digits.length === 9) return digits.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
    if (digits.length === 12) return digits.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
    return id;
};

// --- License plate formatter: 43A-123.45 ---
export const formatLicensePlate = (plate) => {
    if (!plate) return "";
    const cleaned = plate.replace(/\s+/g, "").toUpperCase();
    return cleaned.replace(/^(\d{2}[A-Z])[-\s]?(\d{3})(\d{2})$/, "$1-$2.$3");
};

// --- Date range helper: return { start, end } for filters ---
export const parseDateRange = (startDate, endDate) => {
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        start: startDate ? new Date(startDate) : defaultStart,
        end: endDate ? new Date(endDate) : defaultEnd,
    };
};
