/**
 * =========================================================================
 * 🔑 CẤU HÌNH API GEMINI TOÀN BỘ WEBSITE (THAY ĐỔI API TẠI ĐÂY)
 * =========================================================================
 * Để thay đổi API, bạn chỉ cần dán API Key của mình vào GEMINI_API_KEY dưới đây:
 */

const CONFIG = {
    // 👉 1. DÁN API KEY GEMINI CỦA BẠN VÀO GIỮA CẶP DẤU NGOẶC KÉP NÀY:
    GEMINI_API_KEY: "AQ.Ab8RN6KVw1833p14R7lKgqhCWbEe5L90ld13Vh22JWbcmq_ORw",

    // 👉 2. TÊN MÔ HÌNH GEMINI (Mặc định: gemini-2.0-flash):
    // Có thể chọn: "gemini-2.0-flash" | "gemini-1.5-flash" | "gemini-1.5-pro"
    GEMINI_MODEL: "gemini-2.0-flash",

    // 👉 3. ĐỊA CHỈ ENDPOINT GEMINI (Nếu dùng proxy/backend riêng thì đổi ở đây):
    GEMINI_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models"
};

// Xuất ra phạm vi toàn cục
window.CONFIG = CONFIG;
