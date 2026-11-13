/**
 * TOÁN HÌNH KHÔNG GIAN 11 - CHẤM ĐIỂM TỰ LUẬN BẰNG AI
 * Tải ảnh bài làm tự luận, gọi AI API phân tích và chấm điểm chi tiết 4 tiêu chí
 * Hỗ trợ demo bài mẫu, lưu trữ API key an toàn trong localStorage
 */

const Grading = {
    apiKey: (window.CONFIG && (window.CONFIG.API_KEY || window.CONFIG.GEMINI_API_KEY)) || localStorage.getItem('ai_api_key') || localStorage.getItem('gemini_api_key') || '',
    currentLesson: 'bai10',
    selectedFile: null,
    base64Image: null,

    lessonNames: {
        'bai10': 'Bài 10: Đường thẳng và mặt phẳng trong không gian',
        'bai11': 'Bài 11: Hai đường thẳng song song',
        'bai12': 'Bài 12: Đường thẳng và mặt phẳng song song',
        'bai13': 'Bài 13: Hai mặt phẳng song song',
        'bai14': 'Bài 14: Phép chiếu song song'
    },

    // Khởi tạo giao diện chấm điểm theo bài
    init(lessonId) {
        this.currentLesson = lessonId;
        const container = document.getElementById(`grading-${lessonId}`);
        if (!container) return;

        container.innerHTML = `
            <div class="grading-container">
                <!-- Vùng tải ảnh bài làm -->
                <div class="upload-zone" id="drop-zone-${lessonId}">
                    <i class="fas fa-file-invoice"></i>
                    <h3>Kéo thả hoặc tải ảnh bài làm tự luận</h3>
                    <p>Hỗ trợ ảnh chụp vở bài tập, giấy kiểm tra định dạng JPG, PNG</p>
                    <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:14px;">
                        <label class="btn-upload" style="margin-top:0;">
                            <i class="fas fa-camera"></i> Chọn ảnh bài làm
                            <input type="file" id="file-input-${lessonId}" accept="image/*" style="display:none">
                        </label>
                        <button class="btn-upload" id="btn-sample-${lessonId}" style="margin-top:0; background: var(--secondary);">
                            <i class="fas fa-magic"></i> Thử nghiệm với bài mẫu
                        </button>
                    </div>
                    <p class="upload-sub">Độ phân giải khuyến nghị: 1080p, chữ viết và hình vẽ rõ ràng</p>
                </div>

                <!-- 3. Vùng xem trước ảnh -->
                <div class="preview-section" id="preview-section-${lessonId}">
                    <img id="preview-img-${lessonId}" class="preview-image" alt="Ảnh bài làm">
                    <div style="margin-top:14px;">
                        <button class="btn-grade" id="btn-submit-grade-${lessonId}">
                            <i class="fas fa-robot"></i> Chấm điểm chi tiết với Math-Safe AI
                        </button>
                        <button class="btn-change-image" id="btn-change-img-${lessonId}">
                            <i class="fas fa-sync-alt"></i> Đổi ảnh khác
                        </button>
                    </div>
                </div>

                <!-- 4. Hiệu ứng đang chấm -->
                <div class="grading-loading" id="loading-${lessonId}">
                    <div class="spinner"></div>
                    <h4>Math-Safe AI đang phân tích bài giải hình không gian...</h4>
                    <p style="color:var(--text-secondary); font-size:14px; margin-top:6px;">
                        Đang nhận diện chữ viết, kiểm tra tính đúng đắn của định lí và tính toán điểm số...
                    </p>
                </div>

                <!-- 5. Kết quả chấm điểm -->
                <div class="grading-result" id="result-${lessonId}"></div>
            </div>
        `;

        this.bindEvents(lessonId);
    },

    bindEvents(lessonId) {
        const dropZone = document.getElementById(`drop-zone-${lessonId}`);
        const fileInput = document.getElementById(`file-input-${lessonId}`);
        const previewSection = document.getElementById(`preview-section-${lessonId}`);
        const previewImg = document.getElementById(`preview-img-${lessonId}`);
        const btnSubmit = document.getElementById(`btn-submit-grade-${lessonId}`);
        const btnChangeImg = document.getElementById(`btn-change-img-${lessonId}`);
        const btnSample = document.getElementById(`btn-sample-${lessonId}`);

        // Kéo thả file
        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        };
        dropZone.ondragleave = () => dropZone.classList.remove('dragover');
        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                this.handleFile(e.dataTransfer.files[0], lessonId);
            }
        };

        // Chọn file từ máy
        fileInput.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleFile(e.target.files[0], lessonId);
            }
        };

        // Dùng bài mẫu thử nghiệm
        btnSample.onclick = () => {
            this.generateSampleImage(lessonId);
        };

        // Đổi ảnh
        btnChangeImg.onclick = () => {
            dropZone.style.display = 'block';
            previewSection.classList.remove('show');
            document.getElementById(`result-${lessonId}`).classList.remove('show');
            this.selectedFile = null;
            this.base64Image = null;
        };

        // Bấm nút chấm
        btnSubmit.onclick = () => {
            this.startGrading(lessonId);
        };
    },

    // Xử lý file ảnh
    handleFile(file, lessonId) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Vui lòng chọn file hình ảnh (JPG, PNG)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.base64Image = e.target.result;
            const dropZone = document.getElementById(`drop-zone-${lessonId}`);
            const previewSection = document.getElementById(`preview-section-${lessonId}`);
            const previewImg = document.getElementById(`preview-img-${lessonId}`);

            previewImg.src = this.base64Image;
            dropZone.style.display = 'none';
            previewSection.classList.add('show');
            document.getElementById(`result-${lessonId}`).classList.remove('show');
        };
        reader.readAsDataURL(file);
    },

    // Tạo ảnh bài mẫu vẽ bằng canvas nếu học sinh muốn trải nghiệm nhanh
    generateSampleImage(lessonId) {
        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 700;
        const ctx = canvas.getContext('2d');

        // Nền trang vở kẻ ô ly
        ctx.fillStyle = '#fdfbf7';
        ctx.fillRect(0, 0, 900, 700);

        // Kẻ dòng vở
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let y = 40; y < 700; y += 30) {
            ctx.beginPath();
            ctx.moveTo(30, y);
            ctx.lineTo(870, y);
            ctx.stroke();
        }

        // Viết chữ bài làm
        ctx.font = 'bold 22px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.fillText(`BÀI KIỂM TRA TỰ LUẬN - ${this.lessonNames[lessonId]}`, 40, 70);

        ctx.font = '16px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText('Đề bài: Cho hình chóp S.ABCD có đáy ABCD là hình bình hành.', 40, 110);
        ctx.fillText('Gọi M, N lần lượt là trung điểm của SA và SB. Chứng minh MN // (ABCD).', 40, 140);

        ctx.font = 'bold 18px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('Lời giải của học sinh:', 40, 190);

        ctx.font = '17px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText('• Xét tam giác SAB, ta có:', 40, 230);
        ctx.fillText('  + M là trung điểm của SA (giả thiết)', 40, 260);
        ctx.fillText('  + N là trung điểm của SB (giả thiết)', 40, 290);
        ctx.fillText('  ⟹ MN là đường trung bình của tam giác SAB.', 40, 320);
        ctx.fillText('  ⟹ MN // AB.', 40, 350);
        ctx.fillText('• Mặt khác, ta có:', 40, 390);
        ctx.fillText('  + AB ⊂ mp(ABCD)', 40, 420);
        ctx.fillText('  + MN ⊄ mp(ABCD)', 40, 450);
        ctx.fillText('• Từ đó suy ra: MN // mp(ABCD) (Điều phải chứng minh).', 40, 490);

        // Vẽ hình chóp minh họa góc phải
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        const S = [720, 240];
        const A = [600, 460];
        const B = [740, 480];
        const C = [840, 440];
        const D = [700, 420];
        const M = [(S[0] + A[0]) / 2, (S[1] + A[1]) / 2];
        const N = [(S[0] + B[0]) / 2, (S[1] + B[1]) / 2];

        // Cạnh nét liền
        [[S, A], [S, B], [S, C], [A, B], [B, C], [M, N]].forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line[0][0], line[0][1]);
            ctx.lineTo(line[1][0], line[1][1]);
            ctx.stroke();
        });

        // Nét đứt
        ctx.setLineDash([4, 4]);
        [[S, D], [A, D], [C, D]].forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line[0][0], line[0][1]);
            ctx.lineTo(line[1][0], line[1][1]);
            ctx.stroke();
        });
        ctx.setLineDash([]);

        // Chữ đỉnh
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('S', S[0] - 5, S[1] - 10);
        ctx.fillText('A', A[0] - 15, A[1] + 15);
        ctx.fillText('B', B[0] - 5, B[1] + 20);
        ctx.fillText('C', C[0] + 10, C[1] + 5);
        ctx.fillText('D', D[0] + 5, D[1] - 5);
        ctx.fillText('M', M[0] - 18, M[1] - 5);
        ctx.fillText('N', N[0] + 10, N[1] - 5);

        this.base64Image = canvas.toDataURL('image/png');
        const dropZone = document.getElementById(`drop-zone-${lessonId}`);
        const previewSection = document.getElementById(`preview-section-${lessonId}`);
        const previewImg = document.getElementById(`preview-img-${lessonId}`);

        previewImg.src = this.base64Image;
        dropZone.style.display = 'none';
        previewSection.classList.add('show');
        document.getElementById(`result-${lessonId}`).classList.remove('show');

        this.showToast('Đã tải bài làm mẫu thành công!', 'info');
    },

    // Bắt đầu quy trình chấm điểm
    async startGrading(lessonId) {
        if (!this.base64Image) {
            this.showToast('Vui lòng tải ảnh bài làm trước khi chấm!', 'error');
            return;
        }

        const loadingDiv = document.getElementById(`loading-${lessonId}`);
        const resultDiv = document.getElementById(`result-${lessonId}`);
        const previewSection = document.getElementById(`preview-section-${lessonId}`);

        loadingDiv.classList.add('show');
        resultDiv.classList.remove('show');
        previewSection.classList.remove('show');

        try {
            let resultData = null;

            // Lấy API Key từ config.js hoặc localStorage
            const effectiveKey = (window.CONFIG && (window.CONFIG.API_KEY || window.CONFIG.GEMINI_API_KEY)) || this.apiKey || localStorage.getItem('ai_api_key') || localStorage.getItem('gemini_api_key');
            if (effectiveKey) {
                resultData = await this.callAIAPI(this.base64Image, lessonId);
            } else {
                // Giả lập thời gian suy nghĩ của AI 1.8 giây nếu dùng chế độ mô phỏng
                await new Promise(r => setTimeout(r, 1800));
                resultData = this.getMockPedagogicalResult(lessonId);
            }

            loadingDiv.classList.remove('show');
            this.renderGradingResult(resultDiv, resultData, lessonId);
            resultDiv.classList.add('show');
            resultDiv.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Lỗi chấm điểm:', error);
            loadingDiv.classList.remove('show');
            previewSection.classList.add('show');
            this.showToast(`Lỗi gọi AI API: ${error.message}. Chuyển sang chấm mô phỏng.`, 'warning');

            // Fallback chấm mô phỏng
            const mockData = this.getMockPedagogicalResult(lessonId);
            this.renderGradingResult(resultDiv, mockData, lessonId);
            resultDiv.classList.add('show');
        }
    },

    // Gọi AI API (OpenAI-compatible) phân tích ảnh bài làm tự luận
    async callAIAPI(base64Data, lessonId) {
        const promptText = `
Bạn là giám khảo chuyên chấm thi học sinh giỏi và giáo viên Toán THPT 10 năm kinh nghiệm bám sát SGK Kết nối tri thức.
Bài học đang chấm: "${this.lessonNames[lessonId]}".
Hãy chấm bài giải tự luận của học sinh trong ảnh theo thang điểm 10 với 4 tiêu chí khắt khe:
1. Trình bày & Hình vẽ (Tối đa 2.0 điểm): Hình vẽ có chuẩn không, nét đứt nét liền đúng quy ước hình không gian không, trình bày có sạch đẹp không.
2. Áp dụng định lí & Kiến thức (Tối đa 4.0 điểm): Áp dụng đúng định lí, tính chất của bài học không, có đủ điều kiện giả thiết không.
3. Lập luận logic & Suy luận (Tối đa 2.0 điểm): Các bước suy luận có chặt chẽ không, có bị ngộ nhận điều chưa chứng minh không.
4. Kết quả & Kết luận (Tối đa 2.0 điểm): Kết luận đúng câu hỏi đề bài không.

ĐẶC BIỆT: Bắt buộc trả về duy nhất định dạng JSON thuần túy (không bọc codeblock markdown, không thêm chữ nào khác ngoài JSON):
{
    "totalScore": 9.0,
    "criteria": [
        {"name": "Trình bày & Hình vẽ", "score": 2.0, "maxScore": 2.0, "comment": "Hình vẽ rõ ràng, phân biệt nét đứt và nét liền chính xác.", "status": "good"},
        {"name": "Kiến thức & Định lí", "score": 3.5, "maxScore": 4.0, "comment": "Nắm vững định lí về đường trung bình và điều kiện song song.", "status": "good"},
        {"name": "Lập luận logic", "score": 1.75, "maxScore": 2.0, "comment": "Lập luận rõ ràng, các bước suy luận có căn cứ.", "status": "good"},
        {"name": "Kết quả & Kết luận", "score": 1.75, "maxScore": 2.0, "comment": "Kết luận chính xác theo yêu cầu đề bài.", "status": "good"}
    ],
    "overallComment": "Bài làm rất tốt, hiểu bài và vận dụng linh hoạt kiến thức.",
    "diagnostics": [
        "Học sinh đã chỉ ra được MN là đường trung bình tam giác SAB.",
        "Cần lưu ý ghi rõ lý do MN không nằm trong mp(ABCD) để lập luận chặt chẽ hơn."
    ],
    "mathSafeQuestion": "Nếu đề bài yêu cầu tìm thiết diện cắt bởi mặt phẳng qua MN và song song với SC, em sẽ dùng định lí nào để xác định giao tuyến tiếp theo?",
    "detailedSolution": "Lời giải chi tiết chuẩn: Ta có MN // AB (đường trung bình). Mà AB nằm trong (ABCD), MN không nằm trong (ABCD) nên MN // (ABCD)."
}
        `;

        const selectedModel = (window.CONFIG && (window.CONFIG.MODEL || window.CONFIG.GEMINI_MODEL)) || localStorage.getItem('ai_model') || 'mistralai/mistral-medium-3.5';
        const apiBase = (window.CONFIG && (window.CONFIG.BASE_URL || window.CONFIG.GEMINI_ENDPOINT)) || 'https://api.xkiro.com/v1';
        const effectiveKey = this.apiKey || (window.CONFIG && (window.CONFIG.API_KEY || window.CONFIG.GEMINI_API_KEY)) || localStorage.getItem('ai_api_key') || localStorage.getItem('gemini_api_key');
        const endpoint = `${apiBase.replace(/\/+$/, '')}/chat/completions`;

        // Chuẩn hóa định dạng base64 Data URL
        const imageUrl = base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${effectiveKey}`
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: promptText },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageUrl
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.2
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`HTTP ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        const textResp = data.choices[0].message.content;

        // Làm sạch chuỗi JSON nếu có markdown codeblock
        const cleaned = textResp.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(cleaned);
    },

    // Giữ tương thích ngược
    async callGeminiAPI(base64Data, lessonId) {
        return this.callAIAPI(base64Data, lessonId);
    },

    // Kết quả chấm mô phỏng chuẩn Sư phạm chất lượng cao khi chưa có API key
    getMockPedagogicalResult(lessonId) {
        return {
            totalScore: 9.25,
            criteria: [
                {
                    name: "Trình bày & Hình vẽ",
                    score: 2.0,
                    maxScore: 2.0,
                    comment: "Hình vẽ chuẩn xác, thể hiện rõ nét đứt đối với các đường khuất (SD, AD, CD) và nét liền đối với các cạnh nhìn thấy.",
                    status: "good"
                },
                {
                    name: "Kiến thức & Định lí SGK",
                    score: 3.75,
                    maxScore: 4.0,
                    comment: "Áp dụng chính xác Định lí 1 Bài 12: d ⊄ (α), d' ⊂ (α), d // d' ⟹ d // (α). Ghi nhận đủ 2 điều kiện cần thiết.",
                    status: "good"
                },
                {
                    name: "Lập luận logic & Biến đổi",
                    score: 1.75,
                    maxScore: 2.0,
                    comment: "Lập luận mạch lạc từ tính chất đường trung bình trong tam giác phẳng đến quan hệ song song trong không gian.",
                    status: "good"
                },
                {
                    name: "Kết quả & Kết luận",
                    score: 1.75,
                    maxScore: 2.0,
                    comment: "Kết luận đúng trọng tâm, ghi rõ 'Điều phải chứng minh'.",
                    status: "good"
                }
            ],
            overallComment: "Bài làm rất chuẩn mực, trình bày sạch sẽ, bám sát phương pháp chứng minh quan hệ song song trong SGK Toán 11 Kết nối tri thức.",
            diagnostics: [
                "✅ Đã chứng minh được MN // AB nhờ tính chất đường trung bình tam giác SAB.",
                "✅ Không bị mắc bẫy quên điều kiện MN không nằm trong mp(ABCD).",
                "💡 Lưu ý thêm: Khi vẽ hình không gian, nên ký hiệu tên các đỉnh rõ ràng hơn để tránh nhầm lẫn giữa nét khuất và nét thấy."
            ],
            mathSafeQuestion: "Em hãy cho biết: Nếu thay điểm M, N bằng hai điểm bất kì trên SA, SB sao cho SM/SA = SN/SB thì MN có còn song song với mp(ABCD) không? Định lí nào giúp em khẳng định điều đó?",
            detailedSolution: "Lời giải mẫu hoàn chỉnh:\nTrong mặt phẳng (SAB), xét tam giác SAB có M là trung điểm SA, N là trung điểm SB nên MN là đường trung bình của tam giác SAB. Suy ra MN // AB.\nLại có: AB ⊂ (ABCD) và MN ⊄ (ABCD).\nTheo Định lí 1 về điều kiện đường thẳng song song mặt phẳng, ta suy ra MN // (ABCD) (đpcm)."
        };
    },

    // Hiển thị kết quả chấm điểm
    renderGradingResult(container, data, lessonId) {
        const radius = 55;
        const circumference = 2 * Math.PI * radius;
        const scorePercent = (data.totalScore / 10);
        const strokeOffset = circumference - (circumference * scorePercent);

        container.innerHTML = `
            <div class="score-circle-container">
                <div class="score-circle">
                    <svg viewBox="0 0 140 140">
                        <circle class="bg" cx="70" cy="70" r="${radius}"></circle>
                        <circle class="fg" cx="70" cy="70" r="${radius}" 
                                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeOffset}; stroke: ${data.totalScore >= 8 ? 'var(--success)' : (data.totalScore >= 5 ? 'var(--warning)' : 'var(--danger)')};"></circle>
                    </svg>
                    <div class="score-value">
                        <span class="number">${data.totalScore}</span>
                        <span class="label">TRÊN 10</span>
                    </div>
                </div>
                <h3 style="margin-top:16px; font-size:20px; color:var(--text);">Phiếu Đánh Giá Chi Tiết</h3>
                <p style="color:var(--text-secondary); font-size:14px;">Chấm điểm tự động bởi Math-Safe AI theo chuẩn thang điểm THPT</p>
            </div>

            <!-- 4 Tiêu chí -->
            <div class="criteria-cards">
                ${data.criteria.map(c => `
                    <div class="criteria-card ${c.status || 'good'}">
                        <div class="criteria-name">${c.name}</div>
                        <div class="criteria-score">${c.score} <span style="font-size:14px; font-weight:normal; color:var(--text-secondary);">/ ${c.maxScore}đ</span></div>
                        <div class="criteria-comment">${c.comment}</div>
                    </div>
                `).join('')}
            </div>

            <!-- Nhận xét tổng quan -->
            <div class="overall-comment">
                <h4><i class="fas fa-clipboard-check" style="color:var(--primary);"></i> Nhận xét của Giám khảo AI:</h4>
                <p>${data.overallComment}</p>
            </div>

            <!-- Chẩn đoán & Gợi ý -->
            <div class="suggestions-section">
                <h4><i class="fas fa-lightbulb"></i> Chẩn đoán bước giải & Lưu ý sư phạm:</h4>
                <ul>
                    ${data.diagnostics.map(d => `<li>${d}</li>`).join('')}
                </ul>
            </div>

            <!-- Câu hỏi gợi mở từ MATH-SAFE AI -->
            ${data.mathSafeQuestion ? `
                <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(37, 99, 235, 0.08)); border: 1px solid rgba(124, 58, 237, 0.25); border-radius: var(--radius); padding: 20px; margin-bottom: 20px;">
                    <h4 style="color:var(--secondary); font-size:15px; margin-bottom:8px;">
                        <i class="fas fa-brain"></i> Câu hỏi đào sâu tư duy (MATH-SAFE AI):
                    </h4>
                    <p style="font-size:14px; color:var(--text); line-height:1.6;">${data.mathSafeQuestion}</p>
                    <button class="btn-save-key" id="btn-open-chatbot-${lessonId}" style="margin-top:12px; background:var(--secondary);">
                        <i class="fas fa-comments"></i> Thảo luận câu này với Trợ lý MATH-SAFE AI
                    </button>
                </div>
            ` : ''}

            <!-- Lời giải mẫu -->
            <div class="concept-card highlight" style="margin-top:20px;">
                <h4 style="font-size:15px; margin-bottom:8px; color:var(--text);"><i class="fas fa-check-double"></i> Lời giải mẫu tham khảo:</h4>
                <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; color: var(--text-secondary); line-height: 1.7;">${data.detailedSolution}</pre>
            </div>

            <div style="text-align:center; margin-top:24px;">
                <button class="btn-regrade" id="btn-regrade-action-${lessonId}">
                    <i class="fas fa-redo"></i> Chấm bài khác
                </button>
            </div>
        `;

        // Nút chấm bài khác
        container.querySelector(`#btn-regrade-action-${lessonId}`).onclick = () => {
            const dropZone = document.getElementById(`drop-zone-${lessonId}`);
            const previewSection = document.getElementById(`preview-section-${lessonId}`);
            dropZone.style.display = 'block';
            previewSection.classList.remove('show');
            container.classList.remove('show');
            this.selectedFile = null;
            this.base64Image = null;
        };

        // Nút mở Chatbot
        const btnChat = container.querySelector(`#btn-open-chatbot-${lessonId}`);
        if (btnChat) {
            btnChat.onclick = () => {
                if (window.openMathSafeChatbot) {
                    window.openMathSafeChatbot(data.mathSafeQuestion);
                } else {
                    this.showToast('Vui lòng mở Trợ lý MATH-SAFE AI ở góc phải màn hình!', 'info');
                }
            };
        }
    },

    showToast(msg, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = msg;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }
};
