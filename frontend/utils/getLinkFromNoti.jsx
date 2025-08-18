// utils/getLinkFromNoti.jsx
export const getNotificationLink = (notification) => {
    if (!notification) return null;

    // Ưu tiên data (backend trả kèm id)
    if (notification?.data?.postId) {
        return `/postdetail/${notification.data.postId}`;
    }
    if (notification?.data?.declarationId) {
        return `/residence-declaration/detail/${notification.data.declarationId}`;
    }
    if (notification?.data?.contractId) {
        return `/contracts/${notification.data.contractId}`;
    }

    const msg = notification.message || "";

    // ==== Regex có ObjectId ====
    const postMatch = msg.match(/bài\s*đăng.*?([a-f0-9]{24})/i);
    if (postMatch) return `/postdetail/${postMatch[1]}`;

    const declMatch = msg.match(/hồ\s*sơ.*?([a-f0-9]{24})/i);
    if (declMatch) return `/residence-declaration/detail/${declMatch[1]}`;

    const contractMatch = msg.match(/hợp\s*đồng.*?([a-f0-9]{24})/i);
    if (contractMatch) return `/contracts/${contractMatch[1]}`;

    // ==== Các case đặc biệt không có id ====

    // Đơn xác nhận cư dân
    if (/đơn\s+xác\s+nhận\s+cư\s+dân/i.test(msg)) {
        return `/canho/nhaukhau`;
    }

    // Thanh toán trước khi xác nhận cư dân
    if (/vui lòng thanh toán.*xác nhận cư dân/i.test(msg)) {
        return `/my-apartment`;
    }

    return null;
};
// Mask id in message
export const maskNotificationMessage = (message = "") => {
    return message.replace(/\s*[a-f0-9]{24}\s*/gi, " ");
};
