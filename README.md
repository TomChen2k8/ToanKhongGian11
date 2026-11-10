# 📐 TOÁN HÌNH KHÔNG GIAN 11 — SGK KẾT NỐI TRI THỨC

Website học tập trực quan và tương tác chuyên sâu về **Chương IV: Quan hệ song song trong không gian** (Toán 11 - Tập Một, SGK Kết nối tri thức với cuộc sống).

Tích hợp công nghệ mô phỏng không gian 3D tương tác (Three.js), hệ thống mini-games củng cố kiến thức, module **Chấm điểm tự luận thông minh bằng Google Gemini AI**, cùng trợ lý sư phạm gợi mở **MATH-SAFE AI**.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Cấu trúc 5 Bài học trọng tâm (Chương IV)
- **Bài 10**: Đường thẳng và mặt phẳng trong không gian (Điểm, đường, mặt, tính chất thừa nhận T1-T5, cách xác định mặt phẳng).
- **Bài 11**: Hai đường thẳng song song (Vị trí tương đối: song song, cắt nhau, chéo nhau; các định lí cơ bản và giao tuyến).
- **Bài 12**: Đường thẳng và mặt phẳng song song (Định nghĩa, điều kiện d // (α), tính chất giao tuyến, ứng dụng hình chóp).
- **Bài 13**: Hai mặt phẳng song song (Định nghĩa, điều kiện song song, tính chất giao tuyến, hình lăng trụ, hình hộp).
- **Bài 14**: Phép chiếu song song (Phương chiếu, mặt phẳng chiếu, tính chất bất biến, tỉ số đoạn thẳng, hình biểu diễn).

---

### 2. Mỗi bài học gồm 3 phân hệ tương tác:

#### 📐 Phân hệ 1: Lý thuyết SGK & Không gian 3D tương tác
- Mô hình 3D trực quan dựng bằng **Three.js** chuẩn xác tỉ lệ toán học.
- **Xoay đa chiều 360°** (xoay trên xuống, dưới lên, trái sang phải) bằng thao tác kéo chuột hoặc vuốt chạm màn hình.
- **Tương tác kéo di chuyển điểm**: Dùng chuột kéo các điểm $A, B, C, D...$ trong không gian để quan sát sự thay đổi động của các đường thẳng, mặt phẳng và tứ diện.
- Chế độ chuyển đổi góc nhìn (Song song / Cắt nhau / Chéo nhau, Chiếu điểm / Chiếu tam giác).
- Hỗ trợ xem toàn màn hình (Fullscreen) và Reset góc nhìn mặc định.

#### 🎮 Phân hệ 2: Trò chơi tương tác (Mini-Games)
- **Bài 10**: *Thử Thách Xác Định Mặt Phẳng* — 5 câu hỏi tình huống không gian rèn luyện phản xạ tính chất thừa nhận.
- **Bài 11**: *Đấu Trí Vị Trí Tương Đối* — Phân loại đường thẳng song song, cắt nhau và chéo nhau trong hình chóp & tứ diện.
- **Bài 12**: *Đúng Hay Sai: Bẫy Hình Học Không Gian* — Rèn luyện khả năng nhận diện các mệnh đề bẫy phổ biến trong đề thi.
- **Bài 13**: *Ghép Đôi Định Lý & Khái Niệm Lăng Trụ* — Nối giả thiết với kết luận tương ứng với hiệu ứng phản hồi sinh động.
- **Bài 14**: *Bậc Thầy Phép Chiếu Song Song* — Khám phá các tính chất bất biến của phép chiếu song song và hình biểu diễn.
- Tích hợp hiệu ứng âm thanh sống động bằng **Web Audio API** (không cần tải file âm thanh ngoài).

#### 📝 Phân hệ 3: Chấm điểm tự luận bằng Gemini AI
- Tải ảnh bài làm tự luận (chụp từ vở bài tập, đề kiểm tra hoặc dùng chức năng *Thử nghiệm với bài mẫu*).
- Gọi **Google Gemini API** (`gemini-2.0-flash` / `gemini-1.5-flash`) để phân tích chữ viết, hình vẽ và lập luận toán học.
- **Bảng điểm chi tiết 4 tiêu chí khắt khe theo chuẩn THPT**:
  1. *Trình bày & Hình vẽ* (2.0 điểm): Kiểm tra quy ước nét đứt, nét liền, bố cục.
  2. *Kiến thức & Định lí* (4.0 điểm): Kiểm tra việc áp dụng đúng và đủ điều kiện các định lí SGK.
  3. *Lập luận logic* (2.0 điểm): Đánh giá tính chặt chẽ, không ngộ nhận.
  4. *Kết quả & Kết luận* (2.0 điểm): Độ chính xác của đáp số/kết luận chứng minh.
- Đồng hồ điểm số trực quan (Score Gauge), chẩn đoán từng bước đúng/sai và đưa ra lời giải mẫu hoàn chỉnh.
- **Chế độ Sư phạm Mô phỏng thông minh (Offline Fallback)**: Ngay cả khi chưa nhập API key hoặc mất mạng, hệ thống vẫn có sẵn bộ máy chấm điểm chuẩn mực để trải nghiệm mượt mà.

---

### 3. Trợ lý Sư phạm MATH-SAFE AI (Chatbot nổi)
- Được phát triển bám sát tài liệu đặc tả của **nhóm nghiên cứu**.
- **Phương pháp sư phạm MATH** 6 giai đoạn: *Nhận diện $\to$ Kết nối $\to$ Lựa chọn $\to$ Thực hiện $\to$ Kiểm tra $\to$ Mở rộng*.
- **5 Mức hỗ trợ (M1 - M5)**: Chatbot không giải bài thay học sinh mà dùng các câu hỏi gợi mở từng bước, kích hoạt tư duy phản biện.
- Trả lời thông minh khi kết nối Gemini API hoặc chế độ phân tích sư phạm cục bộ.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY

### Cách 1: Chạy bằng file Batch (Khuyến nghị)
Nhấp đúp chuột vào file:
```
Chay_Trang_Web.bat
```
Tự động khởi động máy chủ Web cục bộ tại `http://localhost:8080` và mở trình duyệt.

### Cách 2: Mở trực tiếp
Mở file `index.html` bằng bất kỳ trình duyệt hiện đại nào (Chrome, Edge, Firefox, Safari).

---

## 🔑 HƯỚNG DẪN THAY ĐỔI GEMINI API TRONG SOURCE CODE
Để thay đổi API, bạn mở trực tiếp tệp:
👉 [`js/config.js`](file:///d:/Download/DuAn/ToanKhongGian11/js/config.js)

```javascript
const CONFIG = {
    // 1. Dán API Key Google Gemini của bạn vào đây:
    GEMINI_API_KEY: "AIzaSy...", 

    // 2. Tên mô hình AI:
    GEMINI_MODEL: "gemini-2.0-flash",

    // 3. Endpoint Gemini:
    GEMINI_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models"
};
```
Cả **Trợ lý MATH-SAFE AI** và **Phân hệ Chấm điểm tự luận** sẽ tự động nhận API Key này từ tệp cấu hình duy nhất.

---

## 📁 CẤU TRÚC THƯ MỤC
```
ToanKhongGian11/
├── index.html              # Trang giao diện chính với 5 bài học & tabs
├── Chay_Trang_Web.bat      # Script khởi chạy nhanh website
├── README.md               # Tài liệu hướng dẫn chi tiết
├── css/
│   └── styles.css          # Hệ thống giao diện hiện đại, Dark/Light mode, hiệu ứng
└── js/
    ├── config.js           # 🔑 NƠI THAY ĐỔI API GEMINI & MÔ HÌNH TOÀN DỰ ÁN
    ├── app.js              # Điều phối ứng dụng, tabs, giao diện & MATH-SAFE AI
    ├── three-scenes.js     # Đồ họa Three.js 3D tương tác cho 5 bài học
    ├── games.js            # 5 trò chơi mô phỏng 3D/Canvas tương tác thời gian thực
    └── grading.js          # Hệ thống chấm điểm tự luận bằng Gemini AI
```

---
© 2024 Nhóm nghiên cứu **MATH-SAFE AI** · Toán Hình Không Gian 11 SGK Kết nối tri thức.
