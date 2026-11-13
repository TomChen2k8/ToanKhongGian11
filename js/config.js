/**
 * =========================================================================
 * 🔑 CẤU HÌNH API AI TOÀN BỘ WEBSITE (THAY ĐỔI API TẠI ĐÂY)
 * =========================================================================
 * Cấu hình endpoint, model và API key cho toàn bộ website (MATH-SAFE Chat & Chấm điểm tự luận)
 */

const CONFIG = {
    // 👉 1. API KEY:
    API_KEY: "sk-xt-8e4a9267a1c801524fbf3ec6fb2bc8262dae92b36fb53213",

    // 👉 2. TÊN MÔ HÌNH AI:
    MODEL: "mistralai/mistral-medium-3.5",

    // 👉 3. ĐỊA CHỈ BASE URL API (Chuẩn OpenAI API):
    BASE_URL: "https://api.xkiro.com/v1",

    // Các trường tương thích ngược:
    GEMINI_API_KEY: "sk-xt-8e4a9267a1c801524fbf3ec6fb2bc8262dae92b36fb53213",
    GEMINI_MODEL: "mistralai/mistral-medium-3.5",
    GEMINI_ENDPOINT: "https://api.xkiro.com/v1"
};

// Xuất ra phạm vi toàn cục
window.CONFIG = CONFIG;
