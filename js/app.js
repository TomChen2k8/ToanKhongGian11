/**
 * TOÁN HÌNH KHÔNG GIAN 11 - MAIN APP CONTROLLER
 * Điều phối Tab, Sub-tab, Chế độ Dark/Light và Trợ lý Sư phạm MATH-SAFE AI
 */

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    currentLesson: 'bai10',
    currentSubTab: 'theory',
    chatHistory: [],
    currentMathStep: 'Nhận diện',
    currentSupportLevel: 'M1',

    init() {
        this.setupTheme();
        this.setupMainTabs();
        this.setupSubTabs();
        this.setupChatbot();
        this.hideLoadingScreen();

        // Khởi tạo bài học đầu tiên (Bài 10 - Lý thuyết 3D)
        this.activateLesson('bai10');
    },

    // Ẩn màn hình loading
    hideLoadingScreen() {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 600);
            }, 600);
        }
    },

    // =========================================================================
    // THEME (DARK / LIGHT)
    // =========================================================================
    setupTheme() {
        const themeBtn = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('app_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);

        if (themeBtn) {
            themeBtn.onclick = () => {
                const current = document.documentElement.getAttribute('data-theme');
                const target = (current === 'dark') ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', target);
                localStorage.setItem('app_theme', target);
                this.updateThemeIcon(target);
            };
        }
    },

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        if (!icon) return;
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            icon.style.color = '#f59e0b';
        } else {
            icon.className = 'fas fa-moon';
            icon.style.color = '';
        }
    },

    // =========================================================================
    // MAIN LESSON TABS (Bài 10 -> Bài 14)
    // =========================================================================
    setupMainTabs() {
        const tabBtns = document.querySelectorAll('.nav-tab');
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                const lessonId = btn.dataset.tab;
                if (lessonId === this.currentLesson) return;

                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.activateLesson(lessonId);
            };
        });
    },

    activateLesson(lessonId) {
        this.currentLesson = lessonId;

        // Ẩn/Hiện panel bài học
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const targetPanel = document.getElementById(`panel-${lessonId}`);
        if (targetPanel) targetPanel.classList.add('active');

        // Kích hoạt subtab hiện tại của bài
        this.activateSubTab(this.currentSubTab);
    },

    // =========================================================================
    // SUB TABS (Lý thuyết, Trò chơi, Chấm điểm)
    // =========================================================================
    setupSubTabs() {
        const subTabBtns = document.querySelectorAll('.sub-tab');
        subTabBtns.forEach(btn => {
            btn.onclick = () => {
                const subType = btn.dataset.subtab;
                subTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activateSubTab(subType);
            };
        });
    },

    activateSubTab(subType) {
        this.currentSubTab = subType;
        const panel = document.getElementById(`panel-${this.currentLesson}`);
        if (!panel) return;

        // Ẩn/Hiện sub-panel
        panel.querySelectorAll('.sub-panel').forEach(sp => {
            sp.classList.toggle('active', sp.dataset.content === subType);
        });

        // Khởi tạo thành phần tương ứng
        if (subType === 'theory') {
            ThreeScenes.activeLesson = this.currentLesson;
            setTimeout(() => {
                ThreeScenes.init(this.currentLesson);
            }, 50);
        } else if (subType === 'game') {
            Games.init(this.currentLesson);
        } else if (subType === 'grading') {
            Grading.init(this.currentLesson);
        } else if (subType === 'bilingual') {
            if (window.Bilingual && typeof window.Bilingual.init === 'function') {
                Bilingual.init(this.currentLesson);
            }
        }
    },

    // =========================================================================
    // TRỢ LÝ SƯ PHẠM MATH-SAFE AI CHATBOT
    // =========================================================================
    setupChatbot() {
        const toggleBtn = document.getElementById('chatbot-toggle-btn');
        const panel = document.getElementById('chatbot-panel');
        const closeBtn = document.getElementById('btn-close-chatbot');
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('btn-send-chat');
        const chips = document.querySelectorAll('.chip-btn');

        if (toggleBtn && panel) {
            toggleBtn.onclick = () => {
                panel.classList.toggle('open');
                if (panel.classList.contains('open')) {
                    input.focus();
                }
            };
        }

        if (closeBtn && panel) {
            closeBtn.onclick = () => {
                panel.classList.remove('open');
            };
        }

        const handleSend = () => {
            const query = input.value.trim();
            if (!query) return;
            input.value = '';
            this.sendChatMessage(query);
        };

        if (sendBtn) sendBtn.onclick = handleSend;
        if (input) {
            input.onkeydown = (e) => {
                if (e.key === 'Enter') handleSend();
            };
        }

        chips.forEach(chip => {
            chip.onclick = () => {
                const prompt = chip.dataset.prompt;
                this.sendChatMessage(prompt);
            };
        });

        // Cửa sổ toàn cục hỗ trợ mở từ bên ngoài
        window.openMathSafeChatbot = (initialQuestion = '') => {
            panel.classList.add('open');
            if (initialQuestion) {
                this.appendChatBubble('user', initialQuestion);
                this.generateMathSafeResponse(initialQuestion);
            }
        };
    },

    sendChatMessage(text) {
        this.appendChatBubble('user', text);
        this.generateMathSafeResponse(text);
    },

    appendChatBubble(sender, text, tag = '') {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;

        if (sender === 'bot') {
            const tagHtml = tag ? `<span class="math-tag">${tag}</span>` : '';
            bubble.innerHTML = `${tagHtml}<p>${text}</p>`;
        } else {
            bubble.innerText = text;
        }

        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    },

    // Phản hồi sư phạm theo chuẩn MATH-SAFE AI (Nhận diện -> Kết nối -> Lựa chọn -> Thực hiện -> Kiểm tra -> Mở rộng)
    async generateMathSafeResponse(userInput) {
        const container = document.getElementById('chat-messages');
        const typingBubble = document.createElement('div');
        typingBubble.className = 'chat-bubble bot';
        typingBubble.innerHTML = '<span class="math-tag">Đang suy nghĩ gợi mở...</span><p><i class="fas fa-spinner fa-spin"></i> MATH-SAFE AI đang đọc câu hỏi của bạn...</p>';
        container.appendChild(typingBubble);
        container.scrollTop = container.scrollHeight;

        // Lấy API Key từ file config.js hoặc localStorage
        const apiKey = (window.CONFIG && (window.CONFIG.API_KEY || window.CONFIG.GEMINI_API_KEY)) || localStorage.getItem('ai_api_key') || localStorage.getItem('gemini_api_key');

        // Nếu có API Key, dùng AI với System Prompt chuẩn của MATH-SAFE AI
        if (apiKey) {
            try {
                const aiResponse = await this.callAIChat(userInput, apiKey);
                typingBubble.remove();
                this.appendChatBubble('bot', aiResponse, 'Gợi mở MATH-SAFE AI');
                return;
            } catch (err) {
                console.warn('Lỗi gọi AI cho chatbot, chuyển sang luật sư phạm cục bộ:', err);
            }
        }

        // Chế độ sư phạm cục bộ chuẩn hóa theo tài liệu docx
        setTimeout(() => {
            typingBubble.remove();
            const response = this.getRuleBasedMathResponse(userInput);
            this.appendChatBubble('bot', response.text, response.stage);
        }, 800);
    },

    // Gọi AI API (OpenAI-compatible) kèm system prompt MATH-SAFE AI
    async callAIChat(userText, key) {
        const systemInstruction = `
Bạn là MATH-SAFE AI - trợ lý môn Toán THPT chuyên hình học không gian 11 SGK Kết nối tri thức.
Mục tiêu của bạn KHÔNG PHẢI LÀM BÀI THAY người dùng, mà giúp người dùng từng bước phát triển tư duy giải quyết vấn đề toán học qua câu hỏi gợi mở, phản hồi chẩn đoán và tự kiểm chứng.
NGUYÊN TẮC:
1. Tuyệt đối KHÔNG đưa ngay lời giải hoàn chỉnh. Trước tiên chỉ dùng DUY NHẤT 1 câu hỏi gợi mở để học sinh tư duy.
2. Ưu tiên quá trình tư duy; yêu cầu học sinh giải thích "vì sao", nêu căn cứ và tự làm bước tiếp theo.
3. Bám sát Quy trình phản hồi MATH:
- Nhận diện: Đề cho gì? Cần tìm/chứng minh gì?
- Kết nối: Bài này liên quan kiến thức nào?
- Lựa chọn: Chúng ta định bắt đầu từ đâu? Vì sao?
- Thực hiện: Bước tiếp theo người dùng làm gì?
- Kiểm tra: Kết quả có thỏa điều kiện không?
- Mở rộng: Có cách khác không? Rút ra điều gì?
4. Khi được hỏi "ai tạo ra bạn", hãy trả lời: "Tôi được tạo ra bởi nhóm nghiên cứu".
5. Ngôn ngữ ngắn, rõ, chuẩn sư phạm Việt Nam. Mỗi câu trả lời dưới 80 từ, tập trung vào 1 câu hỏi gợi mở.
        `;

        const selectedModel = (window.CONFIG && (window.CONFIG.MODEL || window.CONFIG.GEMINI_MODEL)) || localStorage.getItem('ai_model') || 'mistralai/mistral-medium-3.5';
        const apiBase = (window.CONFIG && (window.CONFIG.BASE_URL || window.CONFIG.GEMINI_ENDPOINT)) || 'https://api.xkiro.com/v1';
        const endpoint = `${apiBase.replace(/\/+$/, '')}/chat/completions`;

        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: userText }
                ],
                temperature: 0.7
            })
        });

        if (!resp.ok) {
            const errText = await resp.text();
            throw new Error(`HTTP ${resp.status}: ${errText}`);
        }
        const data = await resp.json();
        return data.choices[0].message.content;
    },

    // Giữ hàm callGeminiChat để đảm bảo tương thích ngược
    async callGeminiChat(userText, key) {
        return this.callAIChat(userText, key);
    },

    // Logic sư phạm dựa trên luật bám sát tài liệu
    getRuleBasedMathResponse(text) {
        const lower = text.toLowerCase();

        // 1. Khi được hỏi ai tạo ra
        if (lower.includes('ai tạo') || lower.includes('ai sinh') || lower.includes('tác giả') || lower.includes('nguồn gốc')) {
            return {
                stage: 'Giới thiệu',
                text: 'Mình được phát triển bởi <strong>nhóm nghiên cứu</strong> nhằm giúp các bạn học sinh rèn luyện tư duy tự giải toán hình không gian thay vì chép lời giải có sẵn.'
            };
        }

        // 2. Chứng minh đường thẳng song song mặt phẳng
        if (lower.includes('đường') && lower.includes('mặt') && lower.includes('song song')) {
            return {
                stage: 'Kết nối (M2)',
                text: 'Để chứng minh đường thẳng d song song với mp(α), theo em chúng ta cần tìm một đường thẳng d\' thỏa mãn 2 điều kiện nào? (Gợi ý: Vị trí của d\' đối với mp(α) và quan hệ giữa d với d\').'
            };
        }

        // 3. Tìm giao tuyến
        if (lower.includes('giao tuyến')) {
            return {
                stage: 'Nhận diện (M1)',
                text: 'Để tìm giao tuyến của hai mặt phẳng phân biệt, nhiệm vụ cốt lõi của chúng ta là tìm bao nhiêu điểm chung phân biệt? Hai mặt phẳng trong bài của em hiện đã có sẵn điểm chung nào rồi?'
            };
        }

        // 4. Đường thẳng chéo nhau
        if (lower.includes('chéo nhau')) {
            return {
                stage: 'Kết nối (M2)',
                text: 'Hai đường thẳng gọi là chéo nhau khi nào? Giả sử hai đường thẳng đó cùng nằm trong một mặt phẳng thì có thể xảy ra những vị trí tương đối nào mà ta đã học ở lớp dưới?'
            };
        }

        // 5. Phép chiếu song song
        if (lower.includes('chiếu')) {
            return {
                stage: 'Lựa chọn (M3)',
                text: 'Phép chiếu song song bảo toàn tính chất nào của các đoạn thẳng: độ lớn góc hay tính song song và tỉ số? Hãy đối chiếu với bài toán của em nhé.'
            };
        }

        // 6. Thuật ngữ song ngữ (Point, Line, Plane, Space geometry, Intersection, Belong to)
        if (lower.includes('thuật ngữ') || lower.includes('song ngữ') || lower.includes('bilingual') || lower.includes('point') || lower.includes('belong')) {
            return {
                stage: 'Thuật ngữ Song ngữ',
                text: '6 thuật ngữ nền tảng bằng tiếng Anh:<br>• <strong>Point</strong> (/pɔɪnt/): Điểm (A, B, C...)<br>• <strong>Line</strong> (/laɪn/): Đường thẳng (d, AB...)<br>• <strong>Plane</strong> (/pleɪn/): Mặt phẳng ((P), (α)...)<br>• <strong>Space geometry</strong>: Hình học không gian (3D)<br>• <strong>Intersection</strong>: Giao điểm (d ∩ (P) = {I}) / Giao tuyến ((P) ∩ (Q) = a)<br>• <strong>Belong to</strong>: Thuộc (∈, ∉, ⊂).<br>Em có thể mở tab <strong>Song ngữ (Bilingual)</strong> ở Bài 10 để nghe đọc mẫu và luyện tập nhé!'
            };
        }

        // 7. Xác định mối quan hệ giữa điểm, đường thẳng và mặt phẳng
        if (lower.includes('quan hệ') || lower.includes('relationship')) {
            return {
                stage: 'Khám phá (M1 - M2)',
                text: 'Để xác định mối quan hệ (Identify relationship):<br>1. Giữa <strong>Điểm và Đường/Mặt</strong>: Ta dùng quan hệ thuộc (∈) hoặc không thuộc (∉).<br>2. Giữa <strong>Đường thẳng và Mặt phẳng</strong>: Đường thẳng có thể nằm trong (⊂), cắt nhau có 1 điểm chung (∩), hoặc song song (//).<br>Trong bài toán của em, điểm hay đường thẳng nào cần xác định vị trí?'
            };
        }

        // 8. Xác định giao điểm của đường thẳng và mặt phẳng (Determine the intersection of a line and a plane)
        if (lower.includes('giao điểm') || lower.includes('intersection of a line')) {
            return {
                stage: 'Phương pháp 3 bước (M2 - M3)',
                text: 'Quy tắc 3 bước xác định giao điểm của đường thẳng d và mp(α):<br>• <strong>Bước 1:</strong> Chọn mp phụ (β) chứa d.<br>• <strong>Bước 2:</strong> Tìm giao tuyến a = (α) ∩ (β).<br>• <strong>Bước 3:</strong> Trong (β), tìm I = d ∩ a ⟹ I = d ∩ (α).<br>Em đã tìm được mặt phẳng phụ nào chứa d chưa?'
            };
        }

        // 9. Trả lời chung bám theo quy trình MATH
        return {
            stage: 'Nhận diện (M1)',
            text: 'Một câu hỏi rất hay! Để giải quyết vấn đề này, trước hết em hãy cho thầy/cô biết: <strong>Đề bài đã cho giả thiết gì</strong> và <strong>mục tiêu cần chứng minh/tìm kiếm</strong> là gì?'
        };
    }
};
