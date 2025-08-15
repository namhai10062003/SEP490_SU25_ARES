/**
 * Helper functions for extracting IDs from notification messages
 */

/**
 * Lấy ID bài đăng từ message
 * @param {string} msg - Nội dung thông báo
 * @returns {string|null} - ID bài đăng (Mongo ObjectId) hoặc null nếu không tìm thấy
 */
export const extractPostId = (msg = "") => {
    const match = msg.match(/bài đăng ([a-f0-9]{24})/i);
    return match ? match[1] : null;
};

/**
 * Lấy ID hồ sơ từ message
 * @param {string} msg - Nội dung thông báo
 * @returns {string|null} - ID hồ sơ (Mongo ObjectId) hoặc null nếu không tìm thấy
 */
export const extractDeclarationId = (msg = "") => {
    const match = msg.match(/hồ sơ ([a-f0-9]{24})/i);
    return match ? match[1] : null;
};
