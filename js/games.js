/**
 * TOÁN HÌNH KHÔNG GIAN 11 - TRÒ CHƠI TƯƠNG TÁC SÁNG TẠO & TRỰC QUAN
 * 5 mini-games mô phỏng trực quan 3D/Canvas thời gian thực
 * Người chơi trực tiếp xoay hình, kéo thanh trượt lát cắt, chiếu bóng và tương tác điểm
 */

const Games = {
    currentLesson: null,
    score: 0,
    round: 0,
    animFrame: null,

    // Hiệu ứng âm thanh bằng Web Audio API
    playSound(type) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'correct') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, ctx.currentTime);
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            } else if (type === 'wrong') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } else if (type === 'complete') {
                const now = ctx.currentTime;
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                    osc.frequency.setValueAtTime(freq, now + i * 0.1);
                });
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.start();
                osc.stop(now + 0.6);
            }
        } catch (e) {}
    },

    // Khởi tạo trò chơi theo từng bài
    init(lessonId) {
        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
            this.animFrame = null;
        }

        this.currentLesson = lessonId;
        this.score = 0;
        this.round = 0;

        const container = document.getElementById(`game-${lessonId}`);
        if (!container) return;

        switch (lessonId) {
            case 'bai10':
                this.initGame10(container);
                break;
            case 'bai11':
                this.initGame11(container);
                break;
            case 'bai12':
                this.initGame12(container);
                break;
            case 'bai13':
                this.initGame13(container);
                break;
            case 'bai14':
                this.initGame14(container);
                break;
        }
    },

    // =========================================================================
    // GAME BÀI 10: "THỢ SĂN MẶT PHẲNG BÍ MẬT" (Interactive Plane Builder)
    // Tương tác trực quan: Bấm chọn các điểm để bung mặt phẳng neon 3D
    // =========================================================================
    initGame10(container) {
        const missions = [
            {
                task: "Chọn đúng 3 điểm KHÔNG THẲNG HÀNG để tạo ra 1 mặt phẳng duy nhất (T1)",
                validTriplets: [['A','B','C'], ['A','C','D'], ['A','B','D'], ['B','C','D']],
                collinear: [['A','B','E']],
                hint: "Lưu ý: Ba điểm thẳng hàng A, B, E có vô số mặt phẳng xoay quanh nó!"
            },
            {
                task: "Tìm giao tuyến của mp(SAB) và mp(SCD): Chọn đúng 2 điểm chung",
                validTriplets: [['S', 'O']], // O là giao điểm AB và CD
                hint: "Giao tuyến của hai mặt phẳng phân biệt được xác định bởi đúng 2 điểm chung phân biệt."
            },
            {
                task: "Khám phá tứ diện: Chọn 4 điểm KHÔNG ĐỒNG PHẲNG để tạo thành tứ diện 3D",
                validTriplets: [['S','A','B','C'], ['S','A','B','D'], ['S','B','C','D']],
                hint: "Bốn điểm A, B, C, D nằm cùng trên đáy thì đồng phẳng, cần kết hợp đỉnh S!"
            }
        ];

        let selectedPoints = [];
        let rotAngle = 0;

        const renderUI = () => {
            const currentMission = missions[this.round];
            container.innerHTML = `
                <div class="game-container">
                    <div class="game-canvas-card">
                        <div class="game-canvas-header">
                            <span class="game-mission-badge"><i class="fas fa-crosshairs"></i> Màn ${this.round + 1} / ${missions.length}</span>
                            <span style="font-size:14px; color:#38bdf8;"><i class="fas fa-trophy"></i> Điểm: <strong>${this.score}</strong></span>
                        </div>
                        <div class="game-canvas-container" id="canvas-wrap-10">
                            <canvas id="canvas-game-10" width="700" height="380"></canvas>
                            <div class="game-canvas-hint">🖱️ Kéo để xoay không gian 3D · Bấm các điểm bên dưới để chọn</div>
                        </div>
                    </div>

                    <div class="game-control-panel">
                        <div class="game-instruction">
                            <i class="fas fa-bullseye"></i> ${currentMission.task}
                        </div>

                        <div style="font-size:13px; color:var(--text-secondary); margin-bottom:10px;">
                            Đã chọn: <strong style="color:var(--primary); font-size:16px;">${selectedPoints.length > 0 ? selectedPoints.join(' - ') : '(Chưa chọn điểm nào)'}</strong>
                        </div>

                        <div class="point-selector-grid">
                            ${['S', 'A', 'B', 'C', 'D', 'E'].map(pt => `
                                <button class="point-select-btn ${selectedPoints.includes(pt) ? 'selected' : ''}" data-pt="${pt}">${pt}</button>
                            `).join('')}
                            <button id="btn-clear-pts-10" style="padding:0 16px; border-radius:20px; border:1px solid var(--border); background:var(--bg-secondary); cursor:pointer; font-size:13px;">
                                <i class="fas fa-undo"></i> Chọn lại
                            </button>
                        </div>

                        <button class="btn-next" id="btn-confirm-10" style="margin: 16px 0 0 0; width:100%;">
                            <i class="fas fa-magic"></i> Tạo Mặt Phẳng & Kiểm Tra
                        </button>

                        <div id="feedback-10"></div>
                    </div>
                </div>
            `;

            // Canvas Drawing
            const canvas = container.querySelector('#canvas-game-10');
            const ctx = canvas.getContext('2d');
            let isDragging = false;
            let lastMouseX = 0;

            const drawScene = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cx = canvas.width / 2;
                const cy = canvas.height / 2 + 30;

                // Tọa độ 3D các điểm
                const rawPts = {
                    'S': [0, 140, 0],
                    'A': [-150, -60, -80],
                    'B': [140, -50, -80],
                    'C': [100, -70, 90],
                    'D': [-120, -80, 80],
                    'E': [-5, -55, -80] // E nằm trên đoạn AB (thẳng hàng A, B, E)
                };

                // Phép chiếu phối cảnh xoay trục Y
                const project = (coord) => {
                    const rad = rotAngle * Math.PI / 180;
                    const cos = Math.cos(rad);
                    const sin = Math.sin(rad);
                    const x = coord[0] * cos - coord[2] * sin;
                    const z = coord[0] * sin + coord[2] * cos;
                    const y = -coord[1];
                    const scale = 380 / (380 + z);
                    return [cx + x * scale, cy + y * scale, z];
                };

                const proj = {};
                for (const k in rawPts) {
                    proj[k] = project(rawPts[k]);
                }

                // Vẽ mặt phẳng nếu học sinh đã chọn đủ điểm
                if (selectedPoints.length >= 3) {
                    ctx.beginPath();
                    const p0 = proj[selectedPoints[0]];
                    ctx.moveTo(p0[0], p0[1]);
                    for (let i = 1; i < selectedPoints.length; i++) {
                        const pi = proj[selectedPoints[i]];
                        ctx.lineTo(pi[0], pi[1]);
                    }
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
                    ctx.fill();
                    ctx.strokeStyle = '#38bdf8';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Cạnh hình chóp
                const edges = [
                    ['S', 'A'], ['S', 'B'], ['S', 'C'], ['S', 'D'],
                    ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']
                ];

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.lineWidth = 1.5;
                edges.forEach(e => {
                    const p1 = proj[e[0]];
                    const p2 = proj[e[1]];
                    ctx.beginPath();
                    ctx.moveTo(p1[0], p1[1]);
                    ctx.lineTo(p2[0], p2[1]);
                    ctx.stroke();
                });

                // Vẽ các điểm
                for (const k in proj) {
                    const p = proj[k];
                    const isSelected = selectedPoints.includes(k);
                    ctx.beginPath();
                    ctx.arc(p[0], p[1], isSelected ? 8 : 6, 0, Math.PI * 2);
                    ctx.fillStyle = isSelected ? '#38bdf8' : (k === 'E' ? '#f59e0b' : '#ef4444');
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Tên đỉnh
                    ctx.font = 'bold 15px "Be Vietnam Pro"';
                    ctx.fillStyle = isSelected ? '#38bdf8' : '#fff';
                    ctx.fillText(k + (k === 'E' ? ' (∈ AB)' : ''), p[0] + 10, p[1] - 8);
                }

                rotAngle += 0.15;
                this.animFrame = requestAnimationFrame(drawScene);
            };
            drawScene();

            // Kéo chuột xoay canvas
            canvas.onmousedown = (e) => {
                isDragging = true;
                lastMouseX = e.clientX;
            };
            window.onmousemove = (e) => {
                if (isDragging) {
                    const dx = e.clientX - lastMouseX;
                    rotAngle += dx * 0.5;
                    lastMouseX = e.clientX;
                }
            };
            window.onmouseup = () => { isDragging = false; };

            // Bấm chọn điểm
            container.querySelectorAll('.point-select-btn').forEach(b => {
                b.onclick = () => {
                    const pt = b.dataset.pt;
                    if (selectedPoints.includes(pt)) {
                        selectedPoints = selectedPoints.filter(p => p !== pt);
                    } else {
                        selectedPoints.push(pt);
                    }
                    renderUI();
                };
            });

            container.querySelector('#btn-clear-pts-10').onclick = () => {
                selectedPoints = [];
                renderUI();
            };

            // Bấm xác nhận
            container.querySelector('#btn-confirm-10').onclick = () => {
                const feedback = container.querySelector('#feedback-10');
                let isCorrect = false;

                if (this.round === 0) {
                    if (selectedPoints.length !== 3) {
                        feedback.innerHTML = `<div class="game-feedback-box wrong">⚠️ Vui lòng chọn đúng 3 điểm để xác định mặt phẳng!</div>`;
                        return;
                    }
                    if (selectedPoints.includes('A') && selectedPoints.includes('B') && selectedPoints.includes('E')) {
                        this.playSound('wrong');
                        feedback.innerHTML = `<div class="game-feedback-box wrong">❌ Bẫy rồi! Điểm E nằm trên đoạn thẳng AB nên 3 điểm A, B, E thẳng hàng ⟹ có vô số mặt phẳng đi qua chúng!</div>`;
                        return;
                    }
                    isCorrect = true;
                } else if (this.round === 1) {
                    if (selectedPoints.length !== 2) {
                        feedback.innerHTML = `<div class="game-feedback-box wrong">⚠️ Giao tuyến là một đường thẳng, vui lòng chọn đúng 2 điểm chung!</div>`;
                        return;
                    }
                    isCorrect = true;
                } else {
                    if (selectedPoints.length !== 4) {
                        feedback.innerHTML = `<div class="game-feedback-box wrong">⚠️ Vui lòng chọn 4 điểm không cùng thuộc mặt phẳng đáy!</div>`;
                        return;
                    }
                    if (!selectedPoints.includes('S')) {
                        this.playSound('wrong');
                        feedback.innerHTML = `<div class="game-feedback-box wrong">❌ Cả 4 điểm A, B, C, D đều nằm trên đáy (ABCD) nên chúng đồng phẳng, không tạo được tứ diện!</div>`;
                        return;
                    }
                    isCorrect = true;
                }

                if (isCorrect) {
                    this.score += 10;
                    this.playSound('correct');
                    feedback.innerHTML = `
                        <div class="game-feedback-box correct">
                            <strong>🎉 Xuất sắc! Bạn đã xác định chính xác!</strong>
                            <p>${currentMission.hint}</p>
                        </div>
                        <button class="btn-next" id="btn-next-mission-10">
                            ${this.round < missions.length - 1 ? 'Màn tiếp theo <i class="fas fa-arrow-right"></i>' : 'Xem chiến tích <i class="fas fa-trophy"></i>'}
                        </button>
                    `;
                    container.querySelector('#btn-next-mission-10').onclick = () => {
                        this.round++;
                        selectedPoints = [];
                        if (this.round < missions.length) {
                            renderUI();
                        } else {
                            this.renderFinalResult(container, missions.length * 10);
                        }
                    };
                }
            };
        };

        renderUI();
    },

    // =========================================================================
    // GAME BÀI 11: "RADAR 3D: PHÂN LOẠI VỊ TRÍ TƯƠNG ĐỐI"
    // Tương tác trực quan: Radar quét sáng 2 đường, xoay 360 độ rồi quyết định
    // =========================================================================
    initGame11(container) {
        const scenarios = [
            {
                shape: "Hình Chóp S.ABCD (Đáy hình bình hành)",
                line1: "AB", line2: "CD",
                answer: "parallel",
                desc: "AB và CD cùng nằm trong mp đáy (ABCD) và song song với nhau do đáy là hình bình hành."
            },
            {
                shape: "Hình Chóp S.ABCD",
                line1: "SA", line2: "BC",
                answer: "skew",
                desc: "SA và BC không cùng nằm trong bất kì mặt phẳng nào ⟹ Chúng CHÉO NHAU!"
            },
            {
                shape: "Hình Chóp S.ABCD",
                line1: "SA", line2: "AB",
                answer: "intersect",
                desc: "SA và AB cùng nằm trong mp(SAB) và cắt nhau tại đỉnh A!"
            },
            {
                shape: "Hình Lập Phương ABCD.A'B'C'D'",
                line1: "A'B'", line2: "CD",
                answer: "parallel",
                desc: "A'B' // AB mà AB // CD ⟹ A'B' // CD (theo tính chất bắc cầu 2 đường cùng // đường thứ ba)."
            }
        ];

        let rotY = 25;
        let rotX = 15;

        const renderUI = () => {
            const sc = scenarios[this.round];
            container.innerHTML = `
                <div class="game-container">
                    <div class="game-canvas-card">
                        <div class="game-canvas-header">
                            <span class="game-mission-badge"><i class="fas fa-radar"></i> Radar Quét Mục Tiêu: Vòng ${this.round + 1} / ${scenarios.length}</span>
                            <span style="font-size:14px; color:#38bdf8;"><i class="fas fa-star"></i> Điểm: <strong>${this.score}</strong></span>
                        </div>
                        <div class="game-canvas-container" id="canvas-wrap-11">
                            <canvas id="canvas-game-11" width="700" height="380"></canvas>
                            <div class="game-canvas-hint">🖱️ Kéo chuột tự do để xoay nhìn rõ vị trí 2 đường thẳng</div>
                        </div>
                    </div>

                    <div class="game-control-panel">
                        <div class="game-instruction">
                            <i class="fas fa-search-location"></i> Khối: <strong>${sc.shape}</strong> — Phân loại 2 đường: 
                            <span style="color:#06b6d4; font-weight:800; margin-left:6px;">Đường (${sc.line1})</span> và 
                            <span style="color:#ec4899; font-weight:800; margin-left:6px;">Đường (${sc.line2})</span>
                        </div>

                        <div class="decision-grid">
                            <button class="decision-btn btn-parallel" data-ans="parallel">
                                <i class="fas fa-arrows-alt-h" style="color:#06b6d4;"></i>
                                <span>SONG SONG</span>
                                <small style="font-weight:normal; font-size:11px; opacity:0.8;">Cùng mp, không cắt</small>
                            </button>
                            <button class="decision-btn btn-intersect" data-ans="intersect">
                                <i class="fas fa-times" style="color:#f59e0b;"></i>
                                <span>CẮT NHAU</span>
                                <small style="font-weight:normal; font-size:11px; opacity:0.8;">Cùng mp, có 1 điểm chung</small>
                            </button>
                            <button class="decision-btn btn-skew" data-ans="skew">
                                <i class="fas fa-random" style="color:#a855f7;"></i>
                                <span>CHÉO NHAU</span>
                                <small style="font-weight:normal; font-size:11px; opacity:0.8;">Không đồng phẳng</small>
                            </button>
                        </div>

                        <div id="feedback-11"></div>
                    </div>
                </div>
            `;

            const canvas = container.querySelector('#canvas-game-11');
            const ctx = canvas.getContext('2d');
            let isDragging = false;
            let lastMouseX = 0, lastMouseY = 0;

            const drawScene = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cx = canvas.width / 2;
                const cy = canvas.height / 2 + 20;

                const pts = {
                    'S': [0, 130, 0],
                    'A': [-130, -50, -70],
                    'B': [130, -50, -70],
                    'C': [90, -70, 70],
                    'D': [-90, -70, 70]
                };

                const project = (coord) => {
                    const radY = rotY * Math.PI / 180;
                    const cosY = Math.cos(radY), sinY = Math.sin(radY);
                    const x = coord[0] * cosY - coord[2] * sinY;
                    const z = coord[0] * sinY + coord[2] * cosY;

                    const radX = rotX * Math.PI / 180;
                    const cosX = Math.cos(radX), sinX = Math.sin(radX);
                    const y = -coord[1] * cosX - z * sinX;
                    const depth = z * cosX - coord[1] * sinX;

                    const scale = 360 / (360 + depth);
                    return [cx + x * scale, cy + y * scale];
                };

                const proj = {};
                for (const k in pts) proj[k] = project(pts[k]);

                const allEdges = [
                    ['S', 'A'], ['S', 'B'], ['S', 'C'], ['S', 'D'],
                    ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']
                ];

                allEdges.forEach(e => {
                    const p1 = proj[e[0]], p2 = proj[e[1]];
                    const name = e[0] + e[1];
                    const rev = e[1] + e[0];

                    const isLine1 = (name === sc.line1 || rev === sc.line1);
                    const isLine2 = (name === sc.line2 || rev === sc.line2);

                    ctx.beginPath();
                    ctx.moveTo(p1[0], p1[1]);
                    ctx.lineTo(p2[0], p2[1]);

                    if (isLine1) {
                        ctx.strokeStyle = '#06b6d4';
                        ctx.lineWidth = 4.5;
                        ctx.shadowColor = '#06b6d4';
                        ctx.shadowBlur = 12;
                    } else if (isLine2) {
                        ctx.strokeStyle = '#ec4899';
                        ctx.lineWidth = 4.5;
                        ctx.shadowColor = '#ec4899';
                        ctx.shadowBlur = 12;
                    } else {
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                        ctx.lineWidth = 1.5;
                        ctx.shadowBlur = 0;
                    }
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                });

                for (const k in proj) {
                    const p = proj[k];
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 14px "Be Vietnam Pro"';
                    ctx.fillText(k, p[0] + 8, p[1] - 6);
                }

                rotY += 0.2;
                this.animFrame = requestAnimationFrame(drawScene);
            };
            drawScene();

            canvas.onmousedown = (e) => {
                isDragging = true;
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            };
            window.onmousemove = (e) => {
                if (isDragging) {
                    rotY += (e.clientX - lastMouseX) * 0.5;
                    rotX += (e.clientY - lastMouseY) * 0.3;
                    lastMouseX = e.clientX;
                    lastMouseY = e.clientY;
                }
            };
            window.onmouseup = () => { isDragging = false; };

            container.querySelectorAll('.decision-btn').forEach(btn => {
                btn.onclick = () => {
                    const chosen = btn.dataset.ans;
                    const feedback = container.querySelector('#feedback-11');
                    container.querySelectorAll('.decision-btn').forEach(b => b.style.pointerEvents = 'none');

                    if (chosen === sc.answer) {
                        this.score += 10;
                        this.playSound('correct');
                        feedback.innerHTML = `
                            <div class="game-feedback-box correct">
                                <strong>🎉 Chính xác! Bạn nhận định không gian rất tốt!</strong>
                                <p>${sc.desc}</p>
                            </div>
                            <button class="btn-next" id="btn-next-11">
                                ${this.round < scenarios.length - 1 ? 'Vòng tiếp theo <i class="fas fa-arrow-right"></i>' : 'Xem tổng kết <i class="fas fa-trophy"></i>'}
                            </button>
                        `;
                    } else {
                        this.playSound('wrong');
                        feedback.innerHTML = `
                            <div class="game-feedback-box wrong">
                                <strong>❌ Chưa chính xác!</strong>
                                <p>${sc.desc}</p>
                            </div>
                            <button class="btn-next" id="btn-next-11">Vòng tiếp theo <i class="fas fa-arrow-right"></i></button>
                        `;
                    }

                    container.querySelector('#btn-next-11').onclick = () => {
                        this.round++;
                        if (this.round < scenarios.length) {
                            renderUI();
                        } else {
                            this.renderFinalResult(container, scenarios.length * 10);
                        }
                    };
                };
            });
        };

        renderUI();
    },

    // =========================================================================
    // GAME BÀI 12: "LÁT CẮT THIẾT DIỆN MA THUẬT"
    // Tương tác trực quan: Kéo thanh trượt để mặt phẳng cắt tịnh tiến theo thời gian thực
    // =========================================================================
    initGame12(container) {
        let slicePercent = 50;
        let rotY = 30;

        container.innerHTML = `
            <div class="game-container">
                <div class="game-canvas-card">
                    <div class="game-canvas-header">
                        <span class="game-mission-badge"><i class="fas fa-layer-group"></i> Thí Nghiệm Lát Cắt Thiết Diện Song Song</span>
                        <span style="font-size:14px; color:#10b981;">Vị trí M trên SA: <strong id="slice-pos-label">50%</strong></span>
                    </div>
                    <div class="game-canvas-container" id="canvas-wrap-12">
                        <canvas id="canvas-game-12" width="700" height="380"></canvas>
                        <div class="game-canvas-hint">Thanh trượt bên dưới điều khiển mặt phẳng cắt di động</div>
                    </div>
                </div>

                <div class="game-control-panel">
                    <div class="slider-control-box">
                        <div style="font-size:14px; font-weight:600; margin-bottom:8px; display:flex; justify-content:space-between;">
                            <span><i class="fas fa-sliders-h"></i> Di chuyển mặt phẳng cắt qua điểm M trên cạnh bên SA:</span>
                            <span class="slider-val-badge" id="slider-val">50%</span>
                        </div>
                        <div class="slider-row">
                            <span style="font-size:12px; color:var(--text-secondary);">Đỉnh S</span>
                            <input type="range" id="slice-slider" min="5" max="95" value="50">
                            <span style="font-size:12px; color:var(--text-secondary);">Đáy (ABCD)</span>
                        </div>
                    </div>

                    <div class="game-instruction">
                        <i class="fas fa-question-circle"></i> Câu đố: Mặt phẳng (P) qua M song song với đáy (ABCD). Thiết diện tạo bởi (P) và hình chóp là hình gì?
                    </div>

                    <div class="options-list">
                        <button class="option-btn" data-choice="hbh">
                            <span class="option-letter">A</span>
                            <span>Hình bình hành đồng dạng với đáy (ABCD)</span>
                        </button>
                        <button class="option-btn" data-choice="tg">
                            <span class="option-letter">B</span>
                            <span>Hình tam giác</span>
                        </button>
                        <button class="option-btn" data-choice="th">
                            <span class="option-letter">C</span>
                            <span>Hình thang cân</span>
                        </button>
                    </div>

                    <div id="feedback-12"></div>
                </div>
            </div>
        `;

        const canvas = container.querySelector('#canvas-game-12');
        const ctx = canvas.getContext('2d');
        const slider = container.querySelector('#slice-slider');
        const sliderVal = container.querySelector('#slider-val');
        const slicePosLabel = container.querySelector('#slice-pos-label');

        slider.oninput = () => {
            slicePercent = parseInt(slider.value);
            sliderVal.innerText = `${slicePercent}%`;
            slicePosLabel.innerText = `${slicePercent}%`;
        };

        const drawScene = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2 + 30;

            const rad = rotY * Math.PI / 180;
            const cos = Math.cos(rad), sin = Math.sin(rad);

            const project = (coord) => {
                const x = coord[0] * cos - coord[2] * sin;
                const z = coord[0] * sin + coord[2] * cos;
                const y = -coord[1];
                const scale = 360 / (360 + z);
                return [cx + x * scale, cy + y * scale];
            };

            const S = [0, 140, 0];
            const A = [-140, -60, -70];
            const B = [140, -60, -70];
            const C = [90, -70, 70];
            const D = [-90, -70, 70];

            const k = slicePercent / 100;
            const interpolate = (p1, p2, t) => [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t, p1[2] + (p2[2] - p1[2]) * t];

            const M = interpolate(S, A, k);
            const N = interpolate(S, B, k);
            const P = interpolate(S, C, k);
            const Q = interpolate(S, D, k);

            const pS = project(S);
            const pA = project(A), pB = project(B), pC = project(C), pD = project(D);
            const pM = project(M), pN = project(N), pP = project(P), pQ = project(Q);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1.5;
            [[pS, pA], [pS, pB], [pS, pC], [pS, pD], [pA, pB], [pB, pC], [pC, pD], [pD, pA]].forEach(line => {
                ctx.beginPath();
                ctx.moveTo(line[0][0], line[0][1]);
                ctx.lineTo(line[1][0], line[1][1]);
                ctx.stroke();
            });

            ctx.beginPath();
            ctx.moveTo(pM[0], pM[1]);
            ctx.lineTo(pN[0], pN[1]);
            ctx.lineTo(pP[0], pP[1]);
            ctx.lineTo(pQ[0], pQ[1]);
            ctx.closePath();
            ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 15px "Be Vietnam Pro"';
            ctx.fillText('M', pM[0] - 18, pM[1]);
            ctx.fillText('Thiết diện // Đáy', pN[0] + 10, pN[1]);

            rotY += 0.15;
            this.animFrame = requestAnimationFrame(drawScene);
        };
        drawScene();

        container.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = () => {
                const choice = btn.dataset.choice;
                const feedback = container.querySelector('#feedback-12');
                container.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));

                if (choice === 'hbh') {
                    btn.classList.add('correct');
                    this.score = 10;
                    this.playSound('correct');
                    feedback.innerHTML = `
                        <div class="game-feedback-box correct">
                            <strong>🎉 Hoàn toàn chính xác!</strong>
                            <p>Khi mặt phẳng cắt song song với mặt phẳng đáy thì thiết diện thu được luôn là một đa giác đồng dạng với đa giác đáy (ở đây là hình bình hành MNPQ có các cạnh song song tương ứng với đáy).</p>
                        </div>
                    `;
                } else {
                    btn.classList.add('wrong');
                    this.playSound('wrong');
                    feedback.innerHTML = `
                        <div class="game-feedback-box wrong">
                            <strong>❌ Chưa đúng!</strong>
                            <p>Hãy kéo thanh trượt để quan sát: Thiết diện cắt ngang 4 cạnh bên tạo thành 4 đỉnh M, N, P, Q với MN // AB và MQ // AD nên nó là hình bình hành!</p>
                        </div>
                    `;
                }
            };
        });
    },

    // =========================================================================
    // GAME BÀI 13: "KIẾN TRÚC SƯ LĂNG TRỤ 3D"
    // Tương tác trực quan: Lắp ghép các cạnh bên song song giữa 2 mặt phẳng
    // =========================================================================
    initGame13(container) {
        let assembledEdges = [];
        let rotY = 40;

        const renderUI = () => {
            container.innerHTML = `
                <div class="game-container">
                    <div class="game-canvas-card">
                        <div class="game-canvas-header">
                            <span class="game-mission-badge"><i class="fas fa-cube"></i> Lắp Ghép Lăng Trụ Đứng Tam Giác</span>
                            <span style="font-size:14px; color:#a855f7;">Tiến độ lắp: <strong>${assembledEdges.length} / 3 cạnh bên</strong></span>
                        </div>
                        <div class="game-canvas-container" id="canvas-wrap-13">
                            <canvas id="canvas-game-13" width="700" height="380"></canvas>
                            <div class="game-canvas-hint">Hai mặt phẳng song song chứa 2 đáy tam giác ABC và A'B'C'</div>
                        </div>
                    </div>

                    <div class="game-control-panel">
                        <div class="game-instruction">
                            <i class="fas fa-hammer"></i> Lắp ráp các cột cạnh bên: Cạnh bên của lăng trụ phải song song và bằng nhau!
                        </div>

                        <div style="display:flex; gap:10px; flex-wrap:wrap; margin:14px 0;">
                            <button class="point-select-btn ${assembledEdges.includes("AA'") ? 'selected' : ''}" style="width:auto; padding:0 20px; border-radius:20px;" data-edge="AA'">
                                Cột bên AA'
                            </button>
                            <button class="point-select-btn ${assembledEdges.includes("BB'") ? 'selected' : ''}" style="width:auto; padding:0 20px; border-radius:20px;" data-edge="BB'">
                                Cột bên BB'
                            </button>
                            <button class="point-select-btn ${assembledEdges.includes("CC'") ? 'selected' : ''}" style="width:auto; padding:0 20px; border-radius:20px;" data-edge="CC'">
                                Cột bên CC'
                            </button>
                        </div>

                        <div id="feedback-13">
                            ${assembledEdges.length === 3 ? `
                                <div class="game-feedback-box correct">
                                    <strong>🏆 Chúc mừng Kiến trúc sư! Lăng trụ tam giác đã hoàn thành xuất sắc!</strong>
                                    <p>Các cạnh bên AA' // BB' // CC' và bằng nhau; các mặt bên là các hình bình hành nối 2 đáy nằm trên 2 mặt phẳng song song.</p>
                                </div>
                            ` : '<p style="color:var(--text-secondary); font-size:14px;">Bấm chọn các nút trên để dựng 3 cạnh bên nối hai đáy!</p>'}
                        </div>
                    </div>
                </div>
            `;

            const canvas = container.querySelector('#canvas-game-13');
            const ctx = canvas.getContext('2d');

            const drawScene = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;

                const rad = rotY * Math.PI / 180;
                const cos = Math.cos(rad), sin = Math.sin(rad);

                const project = (coord) => {
                    const x = coord[0] * cos - coord[2] * sin;
                    const z = coord[0] * sin + coord[2] * cos;
                    const y = -coord[1];
                    const scale = 360 / (360 + z);
                    return [cx + x * scale, cy + y * scale];
                };

                const A = [-100, -80, -60], B = [100, -80, -60], C = [0, -80, 80];
                const A1 = [-100, 80, -60], B1 = [100, 80, -60], C1 = [0, 80, 80];

                const pA = project(A), pB = project(B), pC = project(C);
                const pA1 = project(A1), pB1 = project(B1), pC1 = project(C1);

                const drawPlane = (yLevel, color) => {
                    const p1 = project([-180, yLevel, -120]);
                    const p2 = project([180, yLevel, -120]);
                    const p3 = project([180, yLevel, 120]);
                    const p4 = project([-180, yLevel, 120]);
                    ctx.beginPath();
                    ctx.moveTo(p1[0], p1[1]);
                    ctx.lineTo(p2[0], p2[1]);
                    ctx.lineTo(p3[0], p3[1]);
                    ctx.lineTo(p4[0], p4[1]);
                    ctx.closePath();
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                    ctx.stroke();
                };

                drawPlane(-80, 'rgba(59, 130, 246, 0.15)');
                drawPlane(80, 'rgba(168, 85, 247, 0.15)');

                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.5;
                [[pA, pB], [pB, pC], [pC, pA]].forEach(l => {
                    ctx.beginPath();
                    ctx.moveTo(l[0][0], l[0][1]);
                    ctx.lineTo(l[1][0], l[1][1]);
                    ctx.stroke();
                });

                ctx.strokeStyle = '#c084fc';
                ctx.lineWidth = 2.5;
                [[pA1, pB1], [pB1, pC1], [pC1, pA1]].forEach(l => {
                    ctx.beginPath();
                    ctx.moveTo(l[0][0], l[0][1]);
                    ctx.lineTo(l[1][0], l[1][1]);
                    ctx.stroke();
                });

                const edgeMap = {
                    "AA'": [pA, pA1],
                    "BB'": [pB, pB1],
                    "CC'": [pC, pC1]
                };

                assembledEdges.forEach(eName => {
                    const pair = edgeMap[eName];
                    ctx.beginPath();
                    ctx.moveTo(pair[0][0], pair[0][1]);
                    ctx.lineTo(pair[0][0], pair[1][1]);
                    ctx.strokeStyle = '#facc15';
                    ctx.lineWidth = 4;
                    ctx.shadowColor = '#facc15';
                    ctx.shadowBlur = 8;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                });

                rotY += 0.2;
                this.animFrame = requestAnimationFrame(drawScene);
            };
            drawScene();

            container.querySelectorAll('.point-select-btn').forEach(btn => {
                btn.onclick = () => {
                    const edge = btn.dataset.edge;
                    if (!assembledEdges.includes(edge)) {
                        assembledEdges.push(edge);
                        this.playSound('correct');
                        renderUI();
                    }
                };
            });
        };

        renderUI();
    },

    // =========================================================================
    // GAME BÀI 14: "RỌI ĐÈN CHIẾU BÓNG KHÔNG GIAN"
    // Tương tác trực quan: Xoay góc vật thể để xem bóng chiếu biến đổi theo thời gian thực
    // =========================================================================
    initGame14(container) {
        let tiltAngle = 30;

        container.innerHTML = `
            <div class="game-container">
                <div class="game-canvas-card">
                    <div class="game-canvas-header">
                        <span class="game-mission-badge"><i class="fas fa-lightbulb"></i> Phòng Chiếu Bóng Phép Chiếu Song Song</span>
                        <span style="font-size:14px; color:#facc15;">Góc nghiêng vật thể: <strong id="tilt-label">30°</strong></span>
                    </div>
                    <div class="game-canvas-container" id="canvas-wrap-14">
                        <canvas id="canvas-game-14" width="700" height="380"></canvas>
                        <div class="game-canvas-hint">Tia sáng chiếu từ trên xuống, bóng hiện rõ trên màn sàn</div>
                    </div>
                </div>

                <div class="game-control-panel">
                    <div class="slider-control-box">
                        <div style="font-size:14px; font-weight:600; margin-bottom:8px; display:flex; justify-content:space-between;">
                            <span><i class="fas fa-sync-alt"></i> Xoay góc nghiêng của khung hình vuông trong không gian:</span>
                            <span class="slider-val-badge" id="tilt-val" style="background:#f59e0b;">30°</span>
                        </div>
                        <div class="slider-row">
                            <span style="font-size:12px; color:var(--text-secondary);">Song song sàn (0°)</span>
                            <input type="range" id="tilt-slider" min="0" max="90" value="30">
                            <span style="font-size:12px; color:var(--text-secondary);">Vuông góc sàn (90°)</span>
                        </div>
                    </div>

                    <div class="game-instruction">
                        <i class="fas fa-eye"></i> Hiện tượng quan sát được: Khi xoay góc nghiêng vật thể lên 90° (vuông góc với sàn chiếu), hình chiếu của hình vuông biến thành gì?
                    </div>

                    <div class="options-list">
                        <button class="option-btn" data-choice="line">
                            <span class="option-letter">A</span>
                            <span>Một đoạn thẳng</span>
                        </button>
                        <button class="option-btn" data-choice="point">
                            <span class="option-letter">B</span>
                            <span>Một điểm duy nhất</span>
                        </button>
                        <button class="option-btn" data-choice="square">
                            <span class="option-letter">C</span>
                            <span>Vẫn là hình vuông</span>
                        </button>
                    </div>

                    <div id="feedback-14"></div>
                </div>
            </div>
        `;

        const canvas = container.querySelector('#canvas-game-14');
        const ctx = canvas.getContext('2d');
        const slider = container.querySelector('#tilt-slider');
        const tiltVal = container.querySelector('#tilt-val');
        const tiltLabel = container.querySelector('#tilt-label');

        slider.oninput = () => {
            tiltAngle = parseInt(slider.value);
            tiltVal.innerText = `${tiltAngle}°`;
            tiltLabel.innerText = `${tiltAngle}°`;
        };

        const drawScene = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const floorY = canvas.height - 70;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(50, floorY - 30, canvas.width - 100, 60);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.strokeRect(50, floorY - 30, canvas.width - 100, 60);

            const rad = tiltAngle * Math.PI / 180;
            const objLen = 140;
            const objHeight = 70;
            const centerY = 130;

            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            const halfL = objLen / 2;
            const p1 = [cx - halfL, centerY - sin * halfL];
            const p2 = [cx + halfL, centerY + sin * halfL];
            const p3 = [cx + halfL, centerY + sin * halfL - objHeight * cos];
            const p4 = [cx - halfL, centerY - sin * halfL - objHeight * cos];

            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
            [p1, p2].forEach(p => {
                ctx.beginPath();
                ctx.moveTo(p[0], p[1]);
                ctx.lineTo(p[0], floorY);
                ctx.stroke();
            });
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.lineTo(p3[0], p3[1]);
            ctx.lineTo(p4[0], p4[1]);
            ctx.closePath();
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 13px "Be Vietnam Pro"';
            ctx.fillText('Vật thể gốc', p4[0] - 80, p4[1]);

            const shadowWidth = objLen * cos;
            ctx.beginPath();
            ctx.ellipse(cx, floorY, Math.max(shadowWidth / 2, 4), 16 * cos, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
            ctx.fill();
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 13px "Be Vietnam Pro"';
            ctx.fillText('Bóng (Hình chiếu song song)', cx - 80, floorY + 25);

            this.animFrame = requestAnimationFrame(drawScene);
        };
        drawScene();

        container.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = () => {
                const choice = btn.dataset.choice;
                const feedback = container.querySelector('#feedback-14');
                container.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));

                if (choice === 'line') {
                    btn.classList.add('correct');
                    this.score = 10;
                    this.playSound('correct');
                    feedback.innerHTML = `
                        <div class="game-feedback-box correct">
                            <strong>🎉 Tuyệt vời! Bạn có trực giác không gian cực kỳ nhạy bén!</strong>
                            <p>Khi mặt phẳng chứa hình phẳng song song với phương chiếu (ở đây góc 90°), toàn bộ hình phẳng bị "ép dẹp" và hình chiếu của nó trở thành một đoạn thẳng!</p>
                        </div>
                    `;
                } else {
                    btn.classList.add('wrong');
                    this.playSound('wrong');
                    feedback.innerHTML = `
                        <div class="game-feedback-box wrong">
                            <strong>❌ Chưa đúng!</strong>
                            <p>Hãy kéo thanh trượt lên mức tối đa 90° để quan sát: Bóng chiếu trên sàn sẽ thu hẹp lại hoàn toàn thành một đoạn thẳng!</p>
                        </div>
                    `;
                }
            };
        });
    },

    // Hiển thị kết quả chung cuộc
    renderFinalResult(container, maxScore) {
        this.playSound('complete');
        container.innerHTML = `
            <div class="game-container">
                <div class="game-result">
                    <div class="result-emoji">🏆</div>
                    <div class="result-score">${this.score} / ${maxScore}</div>
                    <div class="result-percent" style="font-size: 18px; color: var(--primary); font-weight: 700; margin-top: 6px;">Hoàn thành xuất sắc thử thách!</div>
                    <p class="result-message">Bạn đã làm chủ hoàn toàn các khái niệm và trực giác hình học không gian của bài học này!</p>
                    <button class="btn-replay" id="btn-replay-all">
                        <i class="fas fa-redo"></i> Chơi lại lần nữa
                    </button>
                </div>
            </div>
        `;
        container.querySelector('#btn-replay-all').onclick = () => {
            this.init(this.currentLesson);
        };
    }
};
