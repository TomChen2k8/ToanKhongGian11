/**
 * TOÁN HÌNH KHÔNG GIAN 11 - PHÂN HỆ KHÁM PHÁ & LUYỆN TẬP SONG NGỮ
 * Dành cho Giáo viên & Học sinh:
 * 1. Giới thiệu thuật ngữ: Point, Line, Plane, Space geometry, Intersection, Belong to
 * 2. Nhiệm vụ khám phá: "Identify the relationship between points, lines and planes"
 * 3. Nhiệm vụ luyện tập: "Determine the intersection of a line and a plane"
 */

const Bilingual = {
    currentLesson: 'bai10',
    exploreScore: 0,
    exploreAnswers: {},
    practiceCurrentStep: {},

    // Phát âm tiếng Anh chuẩn bằng Web Speech API
    speak(text, lang = 'en-US') {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.88;
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Trình duyệt không hỗ trợ Web Speech API');
        }
    },

    // Âm thanh phản hồi ngắn
    playSound(isCorrect) {
        try {
            if (window.Games && typeof window.Games.playSound === 'function') {
                window.Games.playSound(isCorrect ? 'correct' : 'wrong');
            }
        } catch (e) {}
    },

    // Khởi tạo phân hệ song ngữ theo bài học
    init(lessonId) {
        this.currentLesson = lessonId;
        const container = document.getElementById(`bilingual-${lessonId}`);
        if (!container) return;

        if (lessonId === 'bai10') {
            this.renderBai10(container);
        } else {
            this.renderOtherLesson(container, lessonId);
        }
    },

    // =========================================================================
    // DỮ LIỆU THUẬT NGỮ CHUẨN CỦA GIÁO VIÊN (BÀI 10)
    // =========================================================================
    termsData: [
        {
            id: 'point',
            en: 'Point',
            vi: 'Điểm',
            ipa: '/pɔɪnt/',
            symbol: 'A, B, C, M, S...',
            icon: 'fa-circle-dot',
            color: '#38bdf8',
            definitionVi: 'Đối tượng cơ bản nhất trong hình học không gian, không có kích thước, chỉ xác định vị trí.',
            definitionEn: 'The fundamental object in geometry having position but no size or dimensions.',
            mathRelation: 'A ∈ d (Điểm A thuộc đường thẳng d) · M ∈ (P) (Điểm M thuộc mặt phẳng P)',
            mathRelationEn: 'Point A belongs to line d · Point M belongs to plane (P)',
            example: 'Điểm S là đỉnh hình chóp; A, B, C, D là các đỉnh đáy: S ∉ (ABCD), A ∈ (ABCD).'
        },
        {
            id: 'line',
            en: 'Line',
            vi: 'Đường thẳng',
            ipa: '/laɪn/',
            symbol: 'a, b, c, d, AB, SA...',
            icon: 'fa-slash',
            color: '#34d399',
            definitionVi: 'Tập hợp vô hạn các điểm thẳng hàng, kéo dài vô tận về hai phía không giới hạn.',
            definitionEn: 'A straight one-dimensional figure extending infinitely in both directions.',
            mathRelation: 'd ⊂ (P) (Đường thẳng d nằm trong mp P) · d ∩ (P) = {I} (d cắt mp P tại I)',
            mathRelationEn: 'Line d lies in plane (P) · Line d intersects plane (P) at point I',
            example: 'Đường thẳng AB chứa các điểm A và B; cạnh bên SA của hình chóp S.ABCD.'
        },
        {
            id: 'plane',
            en: 'Plane',
            vi: 'Mặt phẳng',
            ipa: '/pleɪn/',
            symbol: '(P), (Q), (α), (β), (ABCD)...',
            icon: 'fa-layer-group',
            color: '#f59e0b',
            definitionVi: 'Bề mặt phẳng kéo dài vô hạn về mọi phía, không có độ dày. Thường biểu diễn bằng hình bình hành.',
            definitionEn: 'A flat, two-dimensional surface that extends infinitely far in all directions without thickness.',
            mathRelation: 'Xác định qua 3 điểm không thẳng hàng: mp(ABC)',
            mathRelationEn: 'Uniquely determined by three non-collinear points, or a line and an external point.',
            example: 'Mặt phẳng đáy (ABCD), mặt phẳng bên (SAB), (SCD) trong hình chóp.'
        },
        {
            id: 'space_geometry',
            en: 'Space geometry',
            vi: 'Hình học không gian',
            ipa: '/speɪs dʒiˈɒmətri/',
            symbol: '3D Geometry / Solid Geometry',
            icon: 'fa-cube',
            color: '#a855f7',
            definitionVi: 'Phân nhánh toán học nghiên cứu các hình thể và quan hệ vị trí của các đối tượng trong không gian 3 chiều.',
            definitionEn: 'The branch of mathematics dealing with figures and their relationships in three-dimensional space.',
            mathRelation: 'Không gian 3 chiều: Chiều dài, chiều rộng và chiều cao/độ sâu.',
            mathRelationEn: 'Study of points, lines, planes, polyhedra, parallelism and intersections in 3D.',
            example: 'Nghiên cứu hình chóp, tứ diện, hình lăng trụ, quan hệ song song và giao điểm.'
        },
        {
            id: 'intersection',
            en: 'Intersection',
            vi: 'Giao điểm / Giao tuyến',
            ipa: '/ˌɪntəˈsekʃn/',
            symbol: '∩',
            icon: 'fa-crosshairs',
            color: '#ec4899',
            definitionVi: 'Tập hợp các điểm chung giữa các đối tượng hình học: Giao điểm (1 điểm chung) hoặc Giao tuyến (đường thẳng chung).',
            definitionEn: 'The set of shared points between geometric figures: Point of intersection or Line of intersection.',
            mathRelation: 'd ∩ (P) = {I} (Giao điểm) · (P) ∩ (Q) = a (Giao tuyến)',
            mathRelationEn: 'Line and plane intersect at point I · Two planes intersect along a common line a',
            example: 'SO là giao tuyến của (SAC) và (SBD); AM cắt SO tại giao điểm I.'
        },
        {
            id: 'belong_to',
            en: 'Belong to',
            vi: 'Thuộc',
            ipa: '/bɪˈlɒŋ tuː/',
            symbol: '∈, ∉, ⊂',
            icon: 'fa-link',
            color: '#06b6d4',
            definitionVi: 'Quan hệ vị trí giữa một điểm với đường thẳng/mặt phẳng (∈), hoặc giữa một đường thẳng nằm trong mặt phẳng (⊂).',
            definitionEn: 'The relation specifying whether an element or figure is contained within or lies on another.',
            mathRelation: 'Điểm: A ∈ d, M ∈ (P), S ∉ (ABCD) · Đường thẳng: d ⊂ (P)',
            mathRelationEn: 'Point belongs to line/plane (∈); Line lies in/is contained in plane (⊂); Negative: does not belong to (∉)',
            example: 'Điểm S không thuộc mp(ABCD) (S ∉ (ABCD)); Cạnh AB nằm trong mp(ABCD) (AB ⊂ (ABCD)).'
        }
    ],

    // =========================================================================
    // DỮ LIỆU KHÁM PHÁ (EXPLORATION): IDENTIFY THE RELATIONSHIP
    // =========================================================================
    explorationTasks: [
        {
            id: 1,
            titleEn: "Point S and Plane (ABCD)",
            titleVi: "Điểm S và Mặt phẳng (ABCD)",
            context: "Trong hình chóp S.ABCD có đỉnh S và đáy ABCD",
            question: "Mối quan hệ giữa đỉnh S và mặt phẳng đáy (ABCD) là gì?",
            questionEn: "What is the relationship between vertex S and the base plane (ABCD)?",
            options: [
                { label: "S ∈ (ABCD) (S thuộc mặt phẳng (ABCD))", correct: false, explain: "Sai. Đỉnh S nằm ngoài mặt phẳng đáy để tạo thành hình chóp 3D." },
                { label: "S ∉ (ABCD) (S không thuộc mặt phẳng (ABCD))", correct: true, explain: "Chính xác! Vertex S does not belong to plane (ABCD). Nếu S thuộc (ABCD) thì hình chóp bị suy biến thành hình phẳng." },
                { label: "S ⊂ (ABCD) (S nằm trong mặt phẳng (ABCD))", correct: false, explain: "Sai ký hiệu. Ký hiệu ⊂ chỉ dùng cho quan hệ đường thẳng hoặc tập hợp con, không dùng cho điểm." }
            ]
        },
        {
            id: 2,
            titleEn: "Line AB and Plane (ABCD)",
            titleVi: "Đường thẳng AB và Mặt phẳng (ABCD)",
            context: "A và B là hai đỉnh liền kề của tứ giác đáy ABCD",
            question: "Mối quan hệ chuẩn xác giữa đường thẳng AB và mặt phẳng (ABCD) là gì?",
            questionEn: "What is the exact relationship between line AB and plane (ABCD)?",
            options: [
                { label: "AB ∈ (ABCD)", correct: false, explain: "Sai ký hiệu! AB là đường thẳng (tập hợp điểm), không dùng ký hiệu phần tử ∈." },
                { label: "AB ⊂ (ABCD) (AB nằm trong mp (ABCD))", correct: true, explain: "Chính xác! Line AB is contained in plane (ABCD). Vì cả 2 điểm A và B đều thuộc (ABCD) nên theo T2, đường thẳng AB nằm trong (ABCD)." },
                { label: "AB ∩ (ABCD) = ∅", correct: false, explain: "Sai. Đoạn AB nằm ngay trên đáy của hình chóp nên có vô số điểm chung với (ABCD)." }
            ]
        },
        {
            id: 3,
            titleEn: "Line SA and Plane (ABCD)",
            titleVi: "Đường thẳng SA và Mặt phẳng (ABCD)",
            context: "SA là một cạnh bên nối đỉnh S với đỉnh đáy A",
            question: "Xác định giao điểm / quan hệ giữa đường thẳng SA và mặt phẳng (ABCD):",
            questionEn: "Determine the intersection between line SA and plane (ABCD):",
            options: [
                { label: "SA ⊂ (ABCD)", correct: false, explain: "Sai. Điểm S không thuộc (ABCD) nên đường thẳng SA không thể nằm trong (ABCD)." },
                { label: "SA // (ABCD)", correct: false, explain: "Sai. SA có điểm chung A với mặt phẳng đáy (ABCD)." },
                { label: "SA ∩ (ABCD) = {A} (SA cắt (ABCD) tại A)", correct: true, explain: "Chính xác! Line SA intersects plane (ABCD) at point A. Điểm A là điểm chung duy nhất giữa cạnh bên SA và mặt phẳng đáy." }
            ]
        },
        {
            id: 4,
            titleEn: "Center Point O and Planes (SAC), (SBD)",
            titleVi: "Điểm O (tâm đáy) với các mặt phẳng (SAC) và (SBD)",
            context: "Gọi O là giao điểm hai đường chéo AC và BD của đáy ABCD",
            question: "Điểm O có thuộc cả hai mặt phẳng (SAC) và (SBD) hay không?",
            questionEn: "Does point O belong to both planes (SAC) and (SBD)?",
            options: [
                { label: "O ∈ (SAC) và O ∈ (SBD) (O là điểm chung của hai mặt phẳng)", correct: true, explain: "Chính xác! Point O belongs to both planes. Do O ∈ AC ⊂ (SAC) và O ∈ BD ⊂ (SBD), nên O thuộc giao tuyến SO của (SAC) và (SBD)." },
                { label: "O chỉ thuộc (SAC), không thuộc (SBD)", correct: false, explain: "Sai. O là giao điểm của AC và BD nên O nằm trên cả đoạn AC lẫn đoạn BD." },
                { label: "O không thuộc cả hai mặt phẳng", correct: false, explain: "Sai. O nằm trên cả hai đường chéo thuộc hai mặt phẳng này." }
            ]
        },
        {
            id: 5,
            titleEn: "Intersection Line of (SAC) and (SBD)",
            titleVi: "Giao tuyến của mp (SAC) và mp (SBD)",
            context: "Hình chóp S.ABCD có hai mặt phẳng chéo (SAC) và (SBD)",
            question: "Giao tuyến của hai mặt phẳng (SAC) và (SBD) là đường thẳng nào?",
            questionEn: "What is the line of intersection between plane (SAC) and plane (SBD)?",
            options: [
                { label: "(SAC) ∩ (SBD) = AB", correct: false, explain: "Sai. AB thuộc đáy, không chứa đỉnh chung S." },
                { label: "(SAC) ∩ (SBD) = SO", correct: true, explain: "Chính xác! (SAC) ∩ (SBD) = SO. Hai mặt phẳng có 2 điểm chung phân biệt là đỉnh S và tâm O, nên giao tuyến là đường thẳng SO." },
                { label: "(SAC) ∩ (SBD) = SC", correct: false, explain: "Sai. Cạnh SC chỉ nằm trong (SAC), không nằm trong (SBD)." }
            ]
        }
    ],

    // =========================================================================
    // DỮ LIỆU LUYỆN TẬP (PRACTICE): DETERMINE THE INTERSECTION OF A LINE & PLANE
    // =========================================================================
    practiceProblems: [
        {
            id: 'prob1',
            titleVi: 'Bài tập 1: Giao điểm của đường thẳng AM và mp(SBD)',
            titleEn: 'Problem 1: Determine the intersection of line AM and plane (SBD)',
            figureType: 'pyramid',
            descriptionVi: 'Cho hình chóp <strong>S.ABCD</strong> có đáy ABCD là hình bình hành tâm O. Lấy điểm <strong>M</strong> trên cạnh SC (M khác S và C). Xác định giao điểm của đường thẳng <strong>AM</strong> và mặt phẳng <strong>(SBD)</strong>.',
            descriptionEn: 'Given pyramid S.ABCD with parallelogram base ABCD centered at O. Point M lies on edge SC (M distinct from S and C). Determine the intersection point of line AM and plane (SBD).',
            steps: [
                {
                    stepNum: 1,
                    nameVi: 'Bước 1: Chọn mặt phẳng phụ chứa đường thẳng AM',
                    nameEn: 'Step 1: Choose an auxiliary plane containing line AM',
                    question: 'Mặt phẳng nào tự nhiên nhất chứa đường thẳng AM và thuận tiện tìm giao tuyến với (SBD)?',
                    options: [
                        { text: 'Mặt phẳng (SCD)', correct: false, hint: 'Điểm A không nằm trong mp(SCD).' },
                        { text: 'Mặt phẳng (SAC)', correct: true, hint: 'Chính xác! Cả điểm A, M, C, S đều thuộc mp(SAC) vì M ∈ SC.' },
                        { text: 'Mặt phẳng (ABCD)', correct: false, hint: 'Điểm M không thuộc mặt phẳng đáy (ABCD).' }
                    ],
                    analysis: 'Ta chọn mặt phẳng phụ <strong>(SAC)</strong> chứa đường thẳng AM (vì A ∈ (SAC) và M ∈ SC ⊂ (SAC)).'
                },
                {
                    stepNum: 2,
                    nameVi: 'Bước 2: Tìm giao tuyến của mp phụ (SAC) và mp(SBD)',
                    nameEn: 'Step 2: Find the line of intersection between (SAC) and (SBD)',
                    question: 'Giao tuyến của mp(SAC) và mp(SBD) được xác định như thế nào?',
                    options: [
                        { text: 'Giao tuyến là đường thẳng SO (với O = AC ∩ BD)', correct: true, hint: 'Chính xác! S là điểm chung thứ nhất; O là điểm chung thứ hai trong mặt phẳng đáy.' },
                        { text: 'Giao tuyến là đường thẳng BD', correct: false, hint: 'BD chỉ nằm trong (SBD) và (ABCD), không nằm trong (SAC).' },
                        { text: 'Giao tuyến là đường thẳng SC', correct: false, hint: 'SC không thuộc mp(SBD).' }
                    ],
                    analysis: 'Ta có:<br>• Điểm S ∈ (SAC) ∩ (SBD) (điểm chung thứ nhất).<br>• Gọi O = AC ∩ BD. Vì O ∈ AC ⊂ (SAC) và O ∈ BD ⊂ (SBD) nên O ∈ (SAC) ∩ (SBD) (điểm chung thứ hai).<br>⟹ Giao tuyến là đường thẳng <strong>SO</strong>: <code>(SAC) ∩ (SBD) = SO</code>.'
                },
                {
                    stepNum: 3,
                    nameVi: 'Bước 3: Xác định giao điểm trong mặt phẳng phụ (SAC)',
                    nameEn: 'Step 3: Determine the intersection point in auxiliary plane (SAC)',
                    question: 'Trong mặt phẳng (SAC), điểm giao I được tìm bằng cách nào?',
                    options: [
                        { text: 'Lấy trung điểm của đoạn thẳng SO', correct: false, hint: 'Điểm giao phụ thuộc vào vị trí điểm M, không nhất thiết là trung điểm.' },
                        { text: 'Trong mp(SAC), gọi I là giao điểm của AM và SO: I = AM ∩ SO', correct: true, hint: 'Chính xác! Vì AM và SO cùng nằm trong mp(SAC) và không song song nên chúng cắt nhau tại I.' },
                        { text: 'Kẻ đường thẳng từ M vuông góc với đáy', correct: false, hint: 'Phương pháp giao điểm không yêu cầu hạ đường vuông góc.' }
                    ],
                    analysis: 'Trong mặt phẳng (SAC), xét tứ giác hoặc tam giác SAC: hai đường thẳng <strong>AM</strong> và <strong>SO</strong> cùng nằm trong (SAC) và không song song nên cắt nhau tại một điểm duy nhất, gọi là <strong>I</strong>.<br>Vì <code>I ∈ SO ⊂ (SBD)</code> nên <code>I ∈ (SBD)</code>.<br>Do đó: <strong>AM ∩ (SBD) = {I}</strong>.'
                }
            ],
            conclusionVi: 'Vậy giao điểm của đường thẳng AM và mặt phẳng (SBD) là điểm <strong>I = AM ∩ SO</strong>.',
            conclusionEn: 'Conclusion: The intersection of line AM and plane (SBD) is point <strong>I = AM ∩ SO</strong>.'
        },
        {
            id: 'prob2',
            titleVi: 'Bài tập 2: Giao điểm của đường thẳng MN và mặt phẳng (BCD) trong tứ diện',
            titleEn: 'Problem 2: Determine intersection of line MN and plane (BCD) in tetrahedron',
            figureType: 'tetrahedron',
            descriptionVi: 'Cho tứ diện <strong>ABCD</strong>. Trên các cạnh AB và AC lấy lần lượt các điểm <strong>M</strong> và <strong>N</strong> sao cho đường thẳng MN không song song với BC. Xác định giao điểm của đường thẳng <strong>MN</strong> và mặt phẳng <strong>(BCD)</strong>.',
            descriptionEn: 'Given tetrahedron ABCD. Points M and N lie on edges AB and AC respectively such that line MN is not parallel to BC. Determine the intersection point of line MN and plane (BCD).',
            steps: [
                {
                    stepNum: 1,
                    nameVi: 'Bước 1: Chọn mặt phẳng phụ chứa đường thẳng MN',
                    nameEn: 'Step 1: Choose auxiliary plane containing line MN',
                    question: 'Mặt phẳng nào của tứ diện ABCD chứa đường thẳng MN?',
                    options: [
                        { text: 'Mặt phẳng (ABC)', correct: true, hint: 'Chính xác! Do M ∈ AB và N ∈ AC nên MN ⊂ (ABC).' },
                        { text: 'Mặt phẳng (ACD)', correct: false, hint: 'Điểm M không nằm trong mp(ACD).' },
                        { text: 'Mặt phẳng (ABD)', correct: false, hint: 'Điểm N không nằm trong mp(ABD).' }
                    ],
                    analysis: 'Mặt phẳng phụ chứa đường thẳng MN là mặt phẳng <strong>(ABC)</strong>.'
                },
                {
                    stepNum: 2,
                    nameVi: 'Bước 2: Tìm giao tuyến của mp(ABC) và mp(BCD)',
                    nameEn: 'Step 2: Find intersection line between (ABC) and (BCD)',
                    question: 'Hai mặt phẳng (ABC) và (BCD) có chung đường thẳng nào?',
                    options: [
                        { text: 'Đường thẳng AB', correct: false, hint: 'AB không nằm trong mp(BCD).' },
                        { text: 'Đường thẳng BC', correct: true, hint: 'Chính xác! (ABC) ∩ (BCD) = BC vì cả hai mặt phẳng đều chứa cạnh chung BC.' },
                        { text: 'Đường thẳng CD', correct: false, hint: 'CD không nằm trong mp(ABC).' }
                    ],
                    analysis: 'Giao tuyến của mặt phẳng phụ (ABC) và mặt phẳng đích (BCD) chính là cạnh chung <strong>BC</strong>: <code>(ABC) ∩ (BCD) = BC</code>.'
                },
                {
                    stepNum: 3,
                    nameVi: 'Bước 3: Tìm giao điểm trong mặt phẳng phụ (ABC)',
                    nameEn: 'Step 3: Find intersection point in plane (ABC)',
                    question: 'Trong mp(ABC), ta xác định điểm giao P như thế nào?',
                    options: [
                        { text: 'Kéo dài MN cắt BC tại P (do MN không song song BC)', correct: true, hint: 'Chính xác! Hai đường thẳng cùng nằm trong mp(ABC) và không song song sẽ cắt nhau tại P.' },
                        { text: 'Hạ đường vuông góc từ A xuống BC', correct: false, hint: 'Không cần hạ đường cao.' },
                        { text: 'Lấy giao điểm của MN với cạnh CD', correct: false, hint: 'MN và CD chéo nhau trong không gian, không thể cắt nhau.' }
                    ],
                    analysis: 'Trong mp(ABC), vì MN không song song với BC nên kéo dài MN sẽ cắt đường thẳng BC tại điểm <strong>P</strong>.<br>Vì <code>P ∈ BC ⊂ (BCD)</code> nên <code>P ∈ (BCD)</code>.<br>Do đó: <strong>MN ∩ (BCD) = {P}</strong>.'
                }
            ],
            conclusionVi: 'Vậy giao điểm của đường thẳng MN và mặt phẳng (BCD) là điểm <strong>P = MN ∩ BC</strong>.',
            conclusionEn: 'Conclusion: The intersection of line MN and plane (BCD) is point <strong>P = MN ∩ BC</strong>.'
        },
        {
            id: 'prob3',
            titleVi: 'Bài tập 3: Giao điểm của đường thẳng DK và mp(SAC) (Đáy hình thang)',
            titleEn: 'Problem 3: Determine intersection of line DK and plane (SAC) (Trapezoid Base)',
            figureType: 'trapezoid',
            descriptionVi: 'Cho hình chóp <strong>S.ABCD</strong> có đáy ABCD là hình thang (AB // CD, AB > CD). Gọi <strong>K</strong> là trung điểm của cạnh SB. Xác định giao điểm của đường thẳng <strong>DK</strong> và mặt phẳng <strong>(SAC)</strong>.',
            descriptionEn: 'Given pyramid S.ABCD with trapezoid base ABCD (AB // CD, AB > CD). K is the midpoint of edge SB. Determine the intersection point of line DK and plane (SAC).',
            steps: [
                {
                    stepNum: 1,
                    nameVi: 'Bước 1: Chọn mặt phẳng phụ chứa đường thẳng DK',
                    nameEn: 'Step 1: Choose auxiliary plane containing line DK',
                    question: 'Mặt phẳng nào chứa cả điểm D và trung điểm K của SB?',
                    options: [
                        { text: 'Mặt phẳng (SAB)', correct: false, hint: 'Điểm D không thuộc mp(SAB).' },
                        { text: 'Mặt phẳng (SBD)', correct: true, hint: 'Chính xác! K ∈ SB ⊂ (SBD) và D ∈ (SBD) ⟹ DK ⊂ (SBD).' },
                        { text: 'Mặt phẳng (SCD)', correct: false, hint: 'Điểm K thuộc SB, không thuộc (SCD).' }
                    ],
                    analysis: 'Chọn mặt phẳng phụ là <strong>(SBD)</strong> chứa đường thẳng DK (do K ∈ SB ⊂ (SBD) và D ∈ (SBD)).'
                },
                {
                    stepNum: 2,
                    nameVi: 'Bước 2: Tìm giao tuyến của mp(SBD) và mp(SAC)',
                    nameEn: 'Step 2: Find intersection line between (SBD) and (SAC)',
                    question: 'Giao tuyến của (SBD) và (SAC) là đường thẳng nào?',
                    options: [
                        { text: 'Đường thẳng SO (với O = AC ∩ BD)', correct: true, hint: 'Chính xác! S là điểm chung thứ nhất; O là giao điểm hai đường chéo đáy nên O là điểm chung thứ hai.' },
                        { text: 'Đường thẳng SA', correct: false, hint: 'SA chỉ thuộc (SAC), không thuộc (SBD).' },
                        { text: 'Đường thẳng SC', correct: false, hint: 'SC không thuộc (SBD).' }
                    ],
                    analysis: 'Ta có:<br>• S là điểm chung của (SBD) và (SAC).<br>• Trong đáy ABCD, gọi O là giao điểm của AC và BD ⟹ O ∈ (SBD) ∩ (SAC).<br>⟹ Giao tuyến là đường thẳng <strong>SO</strong>: <code>(SBD) ∩ (SAC) = SO</code>.'
                },
                {
                    stepNum: 3,
                    nameVi: 'Bước 3: Xác định giao điểm trong mặt phẳng phụ (SBD)',
                    nameEn: 'Step 3: Determine intersection point in plane (SBD)',
                    question: 'Trong mp(SBD), đường thẳng DK cắt đường thẳng nào để tạo ra giao điểm cần tìm?',
                    options: [
                        { text: 'Đường thẳng DK cắt SO tại điểm E', correct: true, hint: 'Chính xác! Trong mp(SBD), DK cắt SO tại E vì chúng không song song. E ∈ SO ⊂ (SAC) nên E là giao điểm.' },
                        { text: 'Đường thẳng DK cắt SB tại K', correct: false, hint: 'K là điểm ban đầu trên cạnh SB.' },
                        { text: 'Đường thẳng DK cắt AC tại O', correct: false, hint: 'DK và AC chéo nhau trong không gian.' }
                    ],
                    analysis: 'Trong mặt phẳng (SBD), nối <strong>DK cắt SO tại điểm E</strong>.<br>Vì <code>E ∈ SO ⊂ (SAC)</code> nên <code>E ∈ (SAC)</code>.<br>Do đó: <strong>DK ∩ (SAC) = {E}</strong>.'
                }
            ],
            conclusionVi: 'Vậy giao điểm của đường thẳng DK và mặt phẳng (SAC) là điểm <strong>E = DK ∩ SO</strong>.',
            conclusionEn: 'Conclusion: The intersection of line DK and plane (SAC) is point <strong>E = DK ∩ SO</strong>.'
        }
    ],

    // =========================================================================
    // RENDER GIAO DIỆN CHÍNH BÀI 10 (FULL BILINGUAL ENVIRONMENT)
    // =========================================================================
    renderBai10(container) {
        container.innerHTML = `
            <div class="bilingual-wrapper">
                <!-- Header Banner -->
                <div class="bilingual-hero">
                    <div class="bilingual-hero-content">
                        <div class="bilingual-badge">
                            <i class="fas fa-graduation-cap"></i> CHUYÊN ĐỀ HÌNH HỌC KHÔNG GIAN SONG NGỮ (BILINGUAL GEOMETRY)
                        </div>
                        <h2>Học Toán Không Gian Qua Ngôn Ngữ Toán Học Quốc Tế</h2>
                        <p class="bilingual-hero-desc">
                            Giáo viên giới thiệu 6 thuật ngữ nền tảng bằng tiếng Anh & tiếng Việt. Học sinh rèn luyện tư duy không gian qua 2 nhiệm vụ trọng tâm: 
                            <strong>Khám phá quan hệ điểm - đường - mặt</strong> và <strong>Luyện tập xác định giao điểm đường thẳng và mặt phẳng</strong>.
                        </p>
                    </div>
                    <div class="bilingual-hero-stats">
                        <div class="stat-pill"><i class="fas fa-book"></i> 6 Thuật ngữ chuẩn</div>
                        <div class="stat-pill"><i class="fas fa-compass"></i> Hoạt động Khám phá</div>
                        <div class="stat-pill"><i class="fas fa-bullseye"></i> Hoạt động Luyện tập</div>
                    </div>
                </div>

                <!-- Navigation Tabs within Bilingual Panel -->
                <div class="bilingual-nav-pills">
                    <button class="bilingual-pill-btn active" data-bview="teacher">
                        <i class="fas fa-chalkboard-teacher"></i> 1. Giáo viên giới thiệu Thuật ngữ
                    </button>
                    <button class="bilingual-pill-btn" data-bview="exploration">
                        <i class="fas fa-binoculars"></i> 2. Hoạt động Khám phá (Exploration)
                    </button>
                    <button class="bilingual-pill-btn" data-bview="practice">
                        <i class="fas fa-pencil-ruler"></i> 3. Hoạt động Luyện tập (Practice)
                    </button>
                </div>

                <!-- VIEW 1: DÀNH CHO GIÁO VIÊN (TEACHER'S TERMINOLOGY) -->
                <div class="bilingual-view active" id="bilingual-view-teacher">
                    <div class="section-title-wrap">
                        <div class="section-badge-icon"><i class="fas fa-chalkboard-user"></i></div>
                        <div>
                            <h3>Giáo Viên Giới Thiệu Thuật Ngữ Toán Học Song Ngữ</h3>
                            <p>Nhấp vào nút loa <i class="fas fa-volume-high" style="color:var(--primary);"></i> để nghe phát âm tiếng Anh chuẩn. Bấm vào từng thẻ để xem chi tiết ký hiệu toán học.</p>
                        </div>
                        <div class="teacher-view-controls">
                            <button id="btn-listen-all" class="btn-voice-all" title="Nghe lần lượt cả 6 thuật ngữ">
                                <i class="fas fa-play-circle"></i> Đọc mẫu toàn bộ
                            </button>
                        </div>
                    </div>

                    <div class="terminology-grid">
                        ${this.termsData.map(term => `
                            <div class="term-card" id="term-card-${term.id}" style="border-top: 4px solid ${term.color};">
                                <div class="term-header">
                                    <div class="term-icon-circle" style="background:${term.color}22; color:${term.color};">
                                        <i class="fas ${term.icon}"></i>
                                    </div>
                                    <div class="term-titles">
                                        <div class="term-en">
                                            ${term.en}
                                            <button class="term-audio-btn" data-speak="${term.en}" title="Nghe phát âm '${term.en}'">
                                                <i class="fas fa-volume-high"></i>
                                            </button>
                                        </div>
                                        <div class="term-vi">${term.vi}</div>
                                        <div class="term-ipa">${term.ipa}</div>
                                    </div>
                                </div>
                                <div class="term-body">
                                    <div class="term-def-row">
                                        <span class="def-tag en">EN</span>
                                        <p>${term.definitionEn}</p>
                                    </div>
                                    <div class="term-def-row">
                                        <span class="def-tag vi">VI</span>
                                        <p>${term.definitionVi}</p>
                                    </div>
                                    <div class="term-math-box">
                                        <div class="math-box-title"><i class="fas fa-square-root-variable"></i> Ký hiệu & Mối quan hệ:</div>
                                        <div class="math-code">${term.mathRelation}</div>
                                        <div class="math-code-en">${term.mathRelationEn}</div>
                                    </div>
                                    <div class="term-example">
                                        <strong>Ví dụ trực quan:</strong> ${term.example}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Teacher Presentation Summary Table -->
                    <div class="teacher-summary-table-card">
                        <h4><i class="fas fa-table"></i> Bảng Tổng Hợp Thuật Ngữ Song Ngữ & Quy Ước Ký Hiệu Toán Học</h4>
                        <div class="table-responsive">
                            <table class="bilingual-table">
                                <thead>
                                    <tr>
                                        <th>Thuật ngữ tiếng Anh (English)</th>
                                        <th>Thuật ngữ tiếng Việt</th>
                                        <th>Phiên âm (IPA)</th>
                                        <th>Ký hiệu quy ước</th>
                                        <th>Mẫu câu học sinh thực hiện</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Point</strong></td>
                                        <td>Điểm</td>
                                        <td><code>/pɔɪnt/</code></td>
                                        <td>A, B, C, S, M...</td>
                                        <td><em>"Point A belongs to line d"</em> (A ∈ d)</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Line</strong></td>
                                        <td>Đường thẳng</td>
                                        <td><code>/laɪn/</code></td>
                                        <td>a, b, d, AB, SA...</td>
                                        <td><em>"Line AB lies in plane (ABCD)"</em> (AB ⊂ (ABCD))</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Plane</strong></td>
                                        <td>Mặt phẳng</td>
                                        <td><code>/pleɪn/</code></td>
                                        <td>(P), (Q), (α), (ABCD)...</td>
                                        <td><em>"Plane (SAC) and plane (SBD)"</em></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Space geometry</strong></td>
                                        <td>Hình học không gian</td>
                                        <td><code>/speɪs dʒiˈɒmətri/</code></td>
                                        <td>3D Geometry</td>
                                        <td><em>"Three-dimensional spatial reasoning"</em></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Intersection</strong></td>
                                        <td>Giao điểm / Giao tuyến</td>
                                        <td><code>/ˌɪntəˈsekʃn/</code></td>
                                        <td>∩</td>
                                        <td><em>"Line d intersects plane (P) at point I"</em> (d ∩ (P) = {I})</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Belong to</strong></td>
                                        <td>Thuộc</td>
                                        <td><code>/bɪˈlɒŋ tuː/</code></td>
                                        <td>∈ (thuộc), ∉ (không thuộc), ⊂ (nằm trong)</td>
                                        <td><em>"Point S does not belong to plane (ABCD)"</em> (S ∉ (ABCD))</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- VIEW 2: HOẠT ĐỘNG KHÁM PHÁ (EXPLORATION) -->
                <div class="bilingual-view" id="bilingual-view-exploration">
                    <div class="section-title-wrap">
                        <div class="section-badge-icon exploration"><i class="fas fa-compass"></i></div>
                        <div>
                            <span class="activity-stage-tag">HOẠT ĐỘNG KHÁM PHÁ (EXPLORATION ACTIVITY)</span>
                            <h3>Nhiệm vụ: “Identify the relationship between points, lines and planes”</h3>
                            <p>Xác định mối quan hệ giữa điểm, đường thẳng và mặt phẳng trong mô hình hình chóp 3D không gian S.ABCD.</p>
                        </div>
                    </div>

                    <div class="exploration-layout">
                        <!-- Left: Interactive Visual Diagram & Model Inspector -->
                        <div class="exploration-visual-card">
                            <div class="visual-header">
                                <span><i class="fas fa-cube"></i> Mô hình Không gian Hình Chóp S.ABCD</span>
                                <span class="badge-tag">Tương tác trực quan</span>
                            </div>
                            <div class="svg-diagram-wrapper">
                                <svg id="svg-pyramid-diagram" viewBox="0 0 500 400" width="100%" height="100%">
                                    <defs>
                                        <radialGradient id="skyGrad" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stop-color="#1e293b"/>
                                            <stop offset="100%" stop-color="#0f172a"/>
                                        </radialGradient>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                            <feMerge>
                                                <feMergeNode in="coloredBlur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <!-- Background -->
                                    <rect width="500" height="400" fill="url(#skyGrad)" rx="12"/>

                                    <!-- Plane ABCD (Shaded Base) -->
                                    <polygon points="120,290 350,290 440,220 210,220" fill="rgba(37, 99, 235, 0.15)" stroke="#3b82f6" stroke-width="1.5"/>
                                    <text x="135" y="275" fill="#93c5fd" font-size="12" font-style="italic">mp (ABCD)</text>

                                    <!-- Diagonal Lines of Base -->
                                    <!-- AC (continuous) -->
                                    <line x1="120" y1="290" x2="440" y2="220" stroke="#60a5fa" stroke-width="1.2" stroke-dasharray="4,4"/>
                                    <!-- BD (hidden) -->
                                    <line x1="210" y1="220" x2="350" y2="290" stroke="#60a5fa" stroke-width="1.2" stroke-dasharray="4,4"/>

                                    <!-- Intersection O of diagonals -->
                                    <circle cx="280" cy="255" r="4.5" fill="#f59e0b" filter="url(#glow)"/>
                                    <text x="275" y="275" fill="#fbbf24" font-weight="bold" font-size="14">O</text>

                                    <!-- Height / Axis SO -->
                                    <line x1="250" y1="70" x2="280" y2="255" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5,5"/>
                                    <text x="272" y="165" fill="#fbbf24" font-size="12" font-style="italic">SO</text>

                                    <!-- Edges of Pyramid -->
                                    <!-- Hidden Edges (AD, CD) -->
                                    <line x1="120" y1="290" x2="210" y2="220" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4"/>
                                    <line x1="210" y1="220" x2="440" y2="220" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4"/>
                                    <line x1="250" y1="70" x2="210" y2="220" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4"/>

                                    <!-- Visible Edges (AB, BC, SA, SB, SC) -->
                                    <line x1="120" y1="290" x2="350" y2="290" stroke="#38bdf8" stroke-width="2.5"/>
                                    <line x1="350" y1="290" x2="440" y2="220" stroke="#38bdf8" stroke-width="2.5"/>
                                    <line x1="250" y1="70" x2="120" y2="290" stroke="#38bdf8" stroke-width="2.5"/>
                                    <line x1="250" y1="70" x2="350" y2="290" stroke="#38bdf8" stroke-width="2.5"/>
                                    <line x1="250" y1="70" x2="440" y2="220" stroke="#38bdf8" stroke-width="2.5"/>

                                    <!-- Vertex Points with Labels -->
                                    <!-- Vertex S -->
                                    <circle cx="250" cy="70" r="6" fill="#ec4899" filter="url(#glow)"/>
                                    <text x="245" y="55" fill="#f472b6" font-weight="bold" font-size="16">S</text>

                                    <!-- Point A -->
                                    <circle cx="120" cy="290" r="5" fill="#38bdf8"/>
                                    <text x="98" y="305" fill="#bae6fd" font-weight="bold" font-size="15">A</text>

                                    <!-- Point B -->
                                    <circle cx="350" cy="290" r="5" fill="#38bdf8"/>
                                    <text x="355" y="310" fill="#bae6fd" font-weight="bold" font-size="15">B</text>

                                    <!-- Point C -->
                                    <circle cx="440" cy="220" r="5" fill="#38bdf8"/>
                                    <text x="450" y="225" fill="#bae6fd" font-weight="bold" font-size="15">C</text>

                                    <!-- Point D -->
                                    <circle cx="210" cy="220" r="5" fill="#94a3b8"/>
                                    <text x="190" y="215" fill="#cbd5e1" font-weight="bold" font-size="15">D</text>

                                    <!-- Point M on SC (for intersection practice) -->
                                    <circle cx="345" cy="145" r="5" fill="#a855f7" filter="url(#glow)"/>
                                    <text x="358" y="145" fill="#d8b4fe" font-weight="bold" font-size="14">M</text>
                                </svg>
                            </div>

                            <!-- Interactive Object Inspector -->
                            <div class="interactive-inspector-box">
                                <div class="inspector-label"><i class="fas fa-hand-pointer"></i> Bấm chọn đối tượng để xem quan hệ toán học:</div>
                                <div class="inspector-buttons">
                                    <button class="insp-btn" data-target="S">Điểm S</button>
                                    <button class="insp-btn" data-target="O">Điểm O</button>
                                    <button class="insp-btn" data-target="AB">Đường AB</button>
                                    <button class="insp-btn" data-target="SA">Đường SA</button>
                                    <button class="insp-btn" data-target="SO">Đường SO</button>
                                    <button class="insp-btn" data-target="ABCD">Mặt phẳng (ABCD)</button>
                                    <button class="insp-btn" data-target="SAC">Mặt phẳng (SAC)</button>
                                </div>
                                <div id="inspector-output" class="inspector-result-card">
                                    <em>Hãy nhấp vào một đối tượng bên trên để phân tích quan hệ Điểm - Đường - Mặt.</em>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Interactive Tasks & Questions -->
                        <div class="exploration-tasks-card">
                            <div class="tasks-header">
                                <div>
                                    <h4><i class="fas fa-clipboard-check"></i> Bộ Câu Hỏi Khám Phá Tương Tác</h4>
                                    <p>Học sinh trả lời để hoàn thành nhiệm vụ <strong>Identify the relationship</strong></p>
                                </div>
                                <div class="task-score-badge">
                                    Điểm: <span id="explore-score-num">0</span> / 5
                                </div>
                            </div>

                            <div class="tasks-accordion">
                                ${this.explorationTasks.map((t, idx) => `
                                    <div class="task-item" id="task-item-${t.id}">
                                        <div class="task-item-header">
                                            <span class="task-num-badge">Câu ${t.id}</span>
                                            <div class="task-header-titles">
                                                <strong>${t.titleVi}</strong>
                                                <span class="task-en-sub">${t.titleEn}</span>
                                            </div>
                                            <i class="fas fa-chevron-down task-toggle-icon"></i>
                                        </div>
                                        <div class="task-item-body">
                                            <p class="task-context"><i class="fas fa-info-circle"></i> ${t.context}</p>
                                            <p class="task-q"><strong>${t.question}</strong></p>
                                            <p class="task-q-en"><em>${t.questionEn}</em></p>
                                            <div class="task-options-list">
                                                ${t.options.map((opt, oIdx) => `
                                                    <button class="task-opt-btn" data-tid="${t.id}" data-oidx="${oIdx}">
                                                        ${opt.label}
                                                    </button>
                                                `).join('')}
                                            </div>
                                            <div class="task-feedback-box" id="task-feedback-${t.id}"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- VIEW 3: HOẠT ĐỘNG LUYỆN TẬP (PRACTICE) -->
                <div class="bilingual-view" id="bilingual-view-practice">
                    <div class="section-title-wrap">
                        <div class="section-badge-icon practice"><i class="fas fa-bullseye"></i></div>
                        <div>
                            <span class="activity-stage-tag practice">HOẠT ĐỘNG LUYỆN TẬP (PRACTICE ACTIVITY)</span>
                            <h3>Nhiệm vụ: “Determine the intersection of a line and a plane”</h3>
                            <p>Phương pháp 3 bước chuẩn SGK và bộ bài tập tương tác xác định giao điểm của đường thẳng và mặt phẳng trong không gian.</p>
                        </div>
                    </div>

                    <!-- Method Strategy Card -->
                    <div class="method-card">
                        <div class="method-card-header">
                            <i class="fas fa-lightbulb"></i>
                            <h4>Phương Pháp Chuẩn 3 Bước: Xác Định Giao Điểm Của Đường Thẳng d Và Mặt Phẳng (α)</h4>
                        </div>
                        <div class="method-steps-grid">
                            <div class="method-step-box">
                                <div class="step-badge">Bước 1</div>
                                <strong>Chọn Mặt Phẳng Phụ (β)</strong>
                                <span class="step-en-sub">Choose Auxiliary Plane</span>
                                <p>Tìm hoặc chọn một mặt phẳng <code>(β)</code> chứa đường thẳng <code>d</code> (thường là mặt phẳng có sẵn hoặc nối d với một đỉnh thuận lợi).</p>
                                <div class="step-formula">d ⊂ (β)</div>
                            </div>
                            <div class="method-step-arrow"><i class="fas fa-arrow-right"></i></div>
                            <div class="method-step-box">
                                <div class="step-badge">Bước 2</div>
                                <strong>Tìm Giao Tuyến a</strong>
                                <span class="step-en-sub">Find Line of Intersection</span>
                                <p>Xác định giao tuyến <code>a</code> giữa mặt phẳng phụ <code>(β)</code> và mặt phẳng mục tiêu <code>(α)</code> (tìm 2 điểm chung phân biệt).</p>
                                <div class="step-formula">a = (α) ∩ (β)</div>
                            </div>
                            <div class="method-step-arrow"><i class="fas fa-arrow-right"></i></div>
                            <div class="method-step-box">
                                <div class="step-badge">Bước 3</div>
                                <strong>Xác Định Giao Điểm I</strong>
                                <span class="step-en-sub">Determine Intersection Point</span>
                                <p>Trong mặt phẳng <code>(β)</code>, tìm giao điểm <code>I</code> giữa <code>d</code> và <code>a</code>. Khi đó <code>I</code> chính là giao điểm cần tìm.</p>
                                <div class="step-formula">I = d ∩ a ⟹ I = d ∩ (α)</div>
                            </div>
                        </div>
                    </div>

                    <!-- Practice Problems Studio -->
                    <div class="practice-studio">
                        <div class="practice-problem-tabs">
                            ${this.practiceProblems.map((prob, idx) => `
                                <button class="prob-tab-btn ${idx === 0 ? 'active' : ''}" data-pid="${prob.id}">
                                    <i class="fas fa-pencil"></i> Bài ${idx + 1}: ${prob.figureType === 'pyramid' ? 'Hình chóp' : (prob.figureType === 'tetrahedron' ? 'Tứ diện' : 'Hình thang')}
                                </button>
                            `).join('')}
                        </div>

                        ${this.practiceProblems.map((prob, pIdx) => `
                            <div class="practice-problem-panel ${pIdx === 0 ? 'active' : ''}" id="panel-prob-${prob.id}">
                                <div class="problem-intro-card">
                                    <div class="prob-header-title">
                                        <h4>${prob.titleVi}</h4>
                                        <p class="prob-en-title"><em>${prob.titleEn}</em></p>
                                    </div>
                                    <div class="prob-desc-vi">${prob.descriptionVi}</div>
                                    <div class="prob-desc-en"><em>${prob.descriptionEn}</em></div>
                                </div>

                                <div class="prob-steps-container">
                                    ${prob.steps.map(step => `
                                        <div class="prob-step-card" id="step-card-${prob.id}-${step.stepNum}">
                                            <div class="prob-step-header">
                                                <div class="prob-step-num">${step.stepNum}</div>
                                                <div class="prob-step-title-wrap">
                                                    <strong>${step.nameVi}</strong>
                                                    <span class="step-en">${step.nameEn}</span>
                                                </div>
                                            </div>
                                            <div class="prob-step-body">
                                                <p class="prob-step-q"><i class="fas fa-question-circle" style="color:var(--primary);"></i> ${step.question}</p>
                                                <div class="prob-step-options">
                                                    ${step.options.map((opt, optIdx) => `
                                                        <button class="prob-opt-btn" data-pid="${prob.id}" data-snum="${step.stepNum}" data-oidx="${optIdx}">
                                                            ${opt.text}
                                                        </button>
                                                    `).join('')}
                                                </div>
                                                <div class="prob-step-feedback" id="prob-fb-${prob.id}-${step.stepNum}"></div>
                                                <div class="prob-step-analysis" id="prob-ana-${prob.id}-${step.stepNum}" style="display:none;">
                                                    <div class="analysis-tag"><i class="fas fa-check-circle"></i> Phân tích giải thuật:</div>
                                                    <p>${step.analysis}</p>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}

                                    <!-- Problem Conclusion Card -->
                                    <div class="prob-conclusion-card" id="prob-conc-${prob.id}" style="display:none;">
                                        <div class="conc-header"><i class="fas fa-award"></i> KẾT LUẬN LỜI GIẢI HOÀN CHỈNH</div>
                                        <div class="conc-vi">${prob.conclusionVi}</div>
                                        <div class="conc-en">${prob.conclusionEn}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.bindEvents(container);
    },

    // Render cho các bài 11, 12, 13, 14 (Hỗ trợ chuyển tiếp thông minh)
    renderOtherLesson(container, lessonId) {
        const lessonInfo = {
            bai11: {
                title: 'Bài 11: Hai đường thẳng song song (Parallel Lines)',
                terms: [
                    { en: 'Parallel lines', vi: 'Hai đường thẳng song song', symbol: 'a // b', def: 'Cùng nằm trong một mặt phẳng và không có điểm chung.' },
                    { en: 'Intersecting lines', vi: 'Hai đường thẳng cắt nhau', symbol: 'a ∩ b = {O}', def: 'Cùng nằm trong một mặt phẳng và có đúng một điểm chung.' },
                    { en: 'Skew lines', vi: 'Hai đường thẳng chéo nhau', symbol: 'Không đồng phẳng', def: 'Không cùng nằm trong bất kỳ mặt phẳng nào.' }
                ]
            },
            bai12: {
                title: 'Bài 12: Đường thẳng và mặt phẳng song song (Line Parallel to Plane)',
                terms: [
                    { en: 'Line parallel to plane', vi: 'Đường thẳng song song với mặt phẳng', symbol: 'd // (α)', def: 'Đường thẳng d và mặt phẳng (α) không có điểm chung: d ∩ (α) = ∅.' },
                    { en: 'Parallel condition', vi: 'Điều kiện song song', symbol: 'd ∉ (α), d\' ⊂ (α), d // d\' ⟹ d // (α)', def: 'Nếu d song song với một đường thẳng nằm trong (α) thì d song song với (α).' }
                ]
            },
            bai13: {
                title: 'Bài 13: Hai mặt phẳng song song (Parallel Planes)',
                terms: [
                    { en: 'Parallel planes', vi: 'Hai mặt phẳng song song', symbol: '(α) // (β)', def: 'Hai mặt phẳng không có điểm chung: (α) ∩ (β) = ∅.' },
                    { en: 'Prism', vi: 'Hình lăng trụ', symbol: 'A1A2...An.A\'1A\'2...A\'n', def: 'Hình có hai đáy là hai đa giác bằng nhau nằm trên hai mặt phẳng song song.' }
                ]
            },
            bai14: {
                title: 'Bài 14: Phép chiếu song song (Parallel Projection)',
                terms: [
                    { en: 'Parallel projection', vi: 'Phép chiếu song song', symbol: 'M ↦ M\'', def: 'Phép biến điểm M thành hình chiếu M\' trên mặt phẳng theo phương chiếu l.' },
                    { en: 'Invariant property', vi: 'Tính chất bất biến', symbol: 'Giữ nguyên tỉ số', def: 'Bảo toàn tính thẳng hàng, thứ tự điểm và tỉ số độ dài các đoạn thẳng song song.' }
                ]
            }
        }[lessonId] || { title: 'Thuật ngữ song ngữ', terms: [] };

        container.innerHTML = `
            <div class="bilingual-wrapper">
                <div class="bilingual-hero">
                    <div class="bilingual-hero-content">
                        <div class="bilingual-badge"><i class="fas fa-globe"></i> THUẬT NGỮ TOÁN HỌC SONG NGỮ</div>
                        <h2>${lessonInfo.title}</h2>
                        <p class="bilingual-hero-desc">Mở rộng vốn từ vựng toán học chuẩn quốc tế cho chuyên đề này.</p>
                    </div>
                </div>

                <div class="terminology-grid" style="margin-top:20px;">
                    ${lessonInfo.terms.map(t => `
                        <div class="term-card" style="border-top: 4px solid var(--primary);">
                            <div class="term-header">
                                <div class="term-titles">
                                    <div class="term-en">
                                        ${t.en}
                                        <button class="term-audio-btn" data-speak="${t.en}" title="Nghe '${t.en}'"><i class="fas fa-volume-high"></i></button>
                                    </div>
                                    <div class="term-vi">${t.vi}</div>
                                </div>
                            </div>
                            <div class="term-body">
                                <div class="term-math-box">
                                    <div class="math-box-title">Ký hiệu:</div>
                                    <div class="math-code">${t.symbol}</div>
                                </div>
                                <div class="term-example"><strong>Định nghĩa:</strong> ${t.def}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top:24px; padding:20px; background:var(--surface); border-radius:var(--radius); border:1px solid var(--border); text-align:center;">
                    <h4><i class="fas fa-arrow-left"></i> Khám Phá Hoạt Động Trọng Tâm Tại Bài 10</h4>
                    <p style="margin:8px 0 16px; color:var(--text-secondary);">Các nhiệm vụ “Identify the relationship between points, lines and planes” và “Determine the intersection of a line and a plane” được tổ chức chuyên sâu tại Bài 10.</p>
                    <button class="btn-next" onclick="App.activateLesson('bai10'); App.activateSubTab('bilingual');">
                        <i class="fas fa-external-link-alt"></i> Mở Hoạt Động Khám Phá & Luyện Tập Bài 10
                    </button>
                </div>
            </div>
        `;

        this.bindEvents(container);
    },

    // Gắn sự kiện tương tác
    bindEvents(container) {
        // 1. Nút phát âm âm thanh (Audio Speech)
        container.querySelectorAll('.term-audio-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const word = btn.dataset.speak;
                this.speak(word);
            };
        });

        // 2. Nút đọc toàn bộ thuật ngữ
        const btnListenAll = container.querySelector('#btn-listen-all');
        if (btnListenAll) {
            btnListenAll.onclick = () => {
                const words = this.termsData.map(t => t.en);
                this.speak(words.join('. . . '));
            };
        }

        // 3. Tab chuyển đổi giữa các View trong phân hệ song ngữ
        container.querySelectorAll('.bilingual-pill-btn').forEach(btn => {
            btn.onclick = () => {
                container.querySelectorAll('.bilingual-pill-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const targetView = btn.dataset.bview;
                container.querySelectorAll('.bilingual-view').forEach(v => v.classList.remove('active'));
                const targetEl = container.querySelector(`#bilingual-view-${targetView}`);
                if (targetEl) targetEl.classList.add('active');
            };
        });

        // 4. Interactive Object Inspector (Khám phá mô hình)
        const inspectorOutput = container.querySelector('#inspector-output');
        container.querySelectorAll('.insp-btn').forEach(btn => {
            btn.onclick = () => {
                container.querySelectorAll('.insp-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.dataset.target;
                this.inspectObject(target, inspectorOutput);
            };
        });

        // 5. Thử thách Khám phá (Exploration Questions)
        container.querySelectorAll('.task-item-header').forEach(header => {
            header.onclick = () => {
                const item = header.closest('.task-item');
                item.classList.toggle('expanded');
            };
        });

        // Tự động mở câu đầu tiên
        const firstTask = container.querySelector('.task-item');
        if (firstTask) firstTask.classList.add('expanded');

        container.querySelectorAll('.task-opt-btn').forEach(btn => {
            btn.onclick = () => {
                const tid = parseInt(btn.dataset.tid, 10);
                const oidx = parseInt(btn.dataset.oidx, 10);
                this.handleExplorationAnswer(tid, oidx, container);
            };
        });

        // 6. Tabs chuyển bài tập Luyện tập
        container.querySelectorAll('.prob-tab-btn').forEach(btn => {
            btn.onclick = () => {
                container.querySelectorAll('.prob-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const pid = btn.dataset.pid;
                container.querySelectorAll('.practice-problem-panel').forEach(p => p.classList.remove('active'));
                const panel = container.querySelector(`#panel-prob-${pid}`);
                if (panel) panel.classList.add('active');
            };
        });

        // 7. Chọn phương án giải bài tập Luyện tập
        container.querySelectorAll('.prob-opt-btn').forEach(btn => {
            btn.onclick = () => {
                const pid = btn.dataset.pid;
                const snum = parseInt(btn.dataset.snum, 10);
                const oidx = parseInt(btn.dataset.oidx, 10);
                this.handlePracticeStepAnswer(pid, snum, oidx, container);
            };
        });
    },

    // Phân tích đối tượng trong Inspector
    inspectObject(target, outputEl) {
        const info = {
            'S': {
                title: 'Đỉnh S (Vertex S)',
                badge: 'Point (Điểm)',
                symbol: 'S ∉ (ABCD) · S ∈ SA, SB, SC, SD, SO · S ∈ (SAB), (SCD), (SAC)...',
                en: 'Point S does not belong to the base plane (ABCD). It is the apex of pyramid S.ABCD.',
                vi: 'Điểm S không thuộc mặt phẳng đáy (ABCD). Điểm S thuộc các cạnh bên SA, SB, SC, SD và trục SO.'
            },
            'O': {
                title: 'Tâm O (Center Point O)',
                badge: 'Point (Điểm) / Intersection',
                symbol: 'O = AC ∩ BD · O ∈ (ABCD) · O ∈ (SAC) ∩ (SBD) · O ∈ SO',
                en: 'Point O belongs to plane (ABCD). It is the intersection of diagonals AC and BD, and lies on intersection line SO.',
                vi: 'Điểm O thuộc mặt phẳng đáy (ABCD). O là giao điểm của AC và BD, đồng thời thuộc giao tuyến SO của mp(SAC) và mp(SBD).'
            },
            'AB': {
                title: 'Cạnh AB (Edge AB)',
                badge: 'Line (Đường thẳng)',
                symbol: 'AB ⊂ (ABCD) · AB ⊂ (SAB) · AB ∩ BC = {B}',
                en: 'Line AB is contained in base plane (ABCD) and side plane (SAB).',
                vi: 'Đường thẳng AB nằm trong mặt phẳng đáy (ABCD) và nằm trong mặt phẳng bên (SAB).'
            },
            'SA': {
                title: 'Cạnh bên SA (Lateral Edge SA)',
                badge: 'Line (Đường thẳng)',
                symbol: 'SA ⊂ (SAB), (SAC) · SA ∩ (ABCD) = {A} · SA ⊄ (ABCD)',
                en: 'Line SA intersects plane (ABCD) at point A. It lies in plane (SAB) and plane (SAC).',
                vi: 'Đường thẳng SA cắt mặt phẳng (ABCD) tại đúng 1 giao điểm là A. SA không nằm trong (ABCD).'
            },
            'SO': {
                title: 'Đường SO (Axis SO)',
                badge: 'Line of Intersection (Giao tuyến)',
                symbol: 'SO = (SAC) ∩ (SBD) · SO ∩ (ABCD) = {O}',
                en: 'Line SO is the line of intersection between plane (SAC) and plane (SBD). It intersects base (ABCD) at point O.',
                vi: 'Đường thẳng SO là giao tuyến chung của mp(SAC) và mp(SBD), cắt mặt phẳng đáy tại điểm O.'
            },
            'ABCD': {
                title: 'Mặt phẳng đáy (Base Plane ABCD)',
                badge: 'Plane (Mặt phẳng)',
                symbol: '(ABCD) ≡ (ABC) ≡ (ABD) · S ∉ (ABCD) · AB, BC, CD, DA ⊂ (ABCD)',
                en: 'The base plane extends infinitely in 3D space, containing points A, B, C, D and diagonals AC, BD.',
                vi: 'Mặt phẳng đáy kéo dài vô hạn trong không gian, chứa các điểm A, B, C, D và hai đường chéo AC, BD.'
            },
            'SAC': {
                title: 'Mặt phẳng chéo (Diagonal Plane SAC)',
                badge: 'Plane (Mặt phẳng)',
                symbol: '(SAC) ∩ (SBD) = SO · (SAC) ∩ (ABCD) = AC',
                en: 'Plane determined by three non-collinear points S, A, C. Contains apex S, edge SA, edge SC and diagonal AC.',
                vi: 'Mặt phẳng xác định bởi 3 điểm không thẳng hàng S, A, C. Chứa điểm M trên cạnh SC.'
            }
        }[target];

        if (!info) return;

        outputEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong style="color:var(--primary); font-size:16px;">${info.title}</strong>
                <span class="badge-tag" style="background:var(--primary); color:#fff; font-size:12px; padding:2px 8px; border-radius:12px;">${info.badge}</span>
            </div>
            <div class="math-code" style="margin-bottom:8px; font-weight:600;">${info.symbol}</div>
            <p style="margin-bottom:4px; font-size:13.5px;"><strong style="color:var(--text);">Tiếng Việt:</strong> ${info.vi}</p>
            <p style="font-size:13px; color:var(--text-secondary); font-style:italic;"><strong>English:</strong> ${info.en}</p>
        `;
    },

    // Xử lý câu trả lời Khám phá
    handleExplorationAnswer(tid, oidx, container) {
        const task = this.explorationTasks.find(t => t.id === tid);
        if (!task) return;

        const opt = task.options[oidx];
        const fbEl = container.querySelector(`#task-feedback-${tid}`);
        const itemEl = container.querySelector(`#task-item-${tid}`);
        const allBtns = itemEl.querySelectorAll('.task-opt-btn');

        allBtns.forEach((b, i) => {
            b.classList.remove('selected', 'correct', 'wrong');
            if (i === oidx) {
                b.classList.add(opt.correct ? 'correct' : 'wrong');
            }
        });

        this.playSound(opt.correct);

        if (fbEl) {
            fbEl.className = `task-feedback-box ${opt.correct ? 'correct' : 'wrong'}`;
            fbEl.innerHTML = `
                <div style="font-weight:700; margin-bottom:4px;">
                    <i class="fas ${opt.correct ? 'fa-check-circle' : 'fa-times-circle'}"></i> 
                    ${opt.correct ? 'Chính xác! (Correct)' : 'Chưa chính xác (Incorrect)'}
                </div>
                <div>${opt.explain}</div>
            `;
            fbEl.style.display = 'block';
        }

        if (opt.correct) {
            if (!this.exploreAnswers[tid]) {
                this.exploreAnswers[tid] = true;
                this.exploreScore++;
                const scoreEl = container.querySelector('#explore-score-num');
                if (scoreEl) scoreEl.innerText = this.exploreScore;
            }
        }
    },

    // Xử lý các bước giải bài tập Luyện tập (Determine Intersection)
    handlePracticeStepAnswer(pid, snum, oidx, container) {
        const prob = this.practiceProblems.find(p => p.id === pid);
        if (!prob) return;

        const step = prob.steps.find(s => s.stepNum === snum);
        if (!step) return;

        const opt = step.options[oidx];
        const stepCard = container.querySelector(`#step-card-${pid}-${snum}`);
        const fbEl = container.querySelector(`#prob-fb-${pid}-${snum}`);
        const anaEl = container.querySelector(`#prob-ana-${pid}-${snum}`);

        const btns = stepCard.querySelectorAll('.prob-opt-btn');
        btns.forEach((b, i) => {
            b.classList.remove('selected', 'correct', 'wrong');
            if (i === oidx) {
                b.classList.add(opt.correct ? 'correct' : 'wrong');
            }
        });

        this.playSound(opt.correct);

        if (fbEl) {
            fbEl.className = `prob-step-feedback ${opt.correct ? 'correct' : 'wrong'}`;
            fbEl.innerHTML = `
                <strong><i class="fas ${opt.correct ? 'fa-check-circle' : 'fa-circle-exclamation'}"></i> ${opt.correct ? 'Lựa chọn chính xác!' : 'Gợi ý suy nghĩ lại:'}</strong>
                <p style="margin-top:4px;">${opt.hint}</p>
            `;
            fbEl.style.display = 'block';
        }

        if (opt.correct) {
            if (anaEl) anaEl.style.display = 'block';

            // Lưu trạng thái bước
            if (!this.practiceCurrentStep[pid]) this.practiceCurrentStep[pid] = {};
            this.practiceCurrentStep[pid][snum] = true;

            // Kiểm tra xem đã hoàn thành cả 3 bước chưa
            const isCompleted = [1, 2, 3].every(n => this.practiceCurrentStep[pid][n]);
            if (isCompleted) {
                const concEl = container.querySelector(`#prob-conc-${pid}`);
                if (concEl) {
                    concEl.style.display = 'block';
                    this.speak(prob.conclusionEn);
                }
            }
        }
    }
};

window.Bilingual = Bilingual;
