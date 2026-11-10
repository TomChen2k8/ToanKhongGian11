/**
 * TOÁN HÌNH KHÔNG GIAN 11 - THREE.JS 3D SCENES
 * Quản lý mô hình 3D tương tác cho 5 bài học Chương IV
 * Hỗ trợ kéo di chuyển điểm, xoay 360 độ (trên xuống, dưới lên), phóng to thu nhỏ
 */

const ThreeScenes = {
    scenes: {},
    renderers: {},
    cameras: {},
    controls: {},
    animFrames: {},
    activeLesson: 'bai10',
    dragControls: {},

    // Khởi tạo scene cho bài học
    init(lessonId) {
        const container = document.getElementById(`scene-${lessonId}`);
        if (!container) return;

        // Dọn dẹp scene cũ nếu đã tồn tại
        this.cleanup(lessonId);

        const width = container.clientWidth || 600;
        const height = container.clientHeight || 450;

        // 1. Tạo Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a); // Nền tối hiện đại
        this.scenes[lessonId] = scene;

        // 2. Tạo Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(12, 14, 18);
        this.cameras[lessonId] = camera;

        // 3. Tạo Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Xoá canvas cũ nếu có
        const oldCanvas = container.querySelector('canvas');
        if (oldCanvas) oldCanvas.remove();
        container.appendChild(renderer.domElement);
        this.renderers[lessonId] = renderer;

        // 4. Tạo OrbitControls (xoay trên dưới, trái phải, zoom)
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 50;
        controls.minDistance = 5;
        controls.target.set(0, 0, 0);
        this.controls[lessonId] = controls;

        // 5. Ánh sáng
        this.setupLights(scene);

        // 6. Lưới tọa độ thẩm mỹ
        const gridHelper = new THREE.GridHelper(20, 20, 0x3b82f6, 0x1e293b);
        gridHelper.position.y = -0.01;
        scene.add(gridHelper);

        // 7. Tạo nội dung cụ thể cho từng bài
        switch (lessonId) {
            case 'bai10':
                this.createScene10(scene, container, camera, controls);
                break;
            case 'bai11':
                this.createScene11(scene, container, camera, controls);
                break;
            case 'bai12':
                this.createScene12(scene, container, camera, controls);
                break;
            case 'bai13':
                this.createScene13(scene, container, camera, controls);
                break;
            case 'bai14':
                this.createScene14(scene, container, camera, controls);
                break;
        }

        // 8. Vòng lặp animation
        const animate = () => {
            this.animFrames[lessonId] = requestAnimationFrame(animate);
            controls.update();

            // Cập nhật nhãn xoay về phía camera (billboard)
            scene.traverse((child) => {
                if (child.isSprite && child.userData.isLabel) {
                    // Sprite tự động quay mặt về camera
                }
            });

            // Tùy chọn chuyển động riêng từng bài
            if (scene.userData.update) {
                scene.userData.update();
            }

            renderer.render(scene, camera);
        };
        animate();

        // 9. Gắn sự kiện nút Reset & Fullscreen
        this.bindContainerControls(container, lessonId);
    },

    // Cài đặt ánh sáng
    setupLights(scene) {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
        dirLight1.position.set(15, 25, 15);
        dirLight1.castShadow = true;
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4);
        dirLight2.position.set(-15, -10, -15);
        scene.add(dirLight2);

        const pointLight = new THREE.PointLight(0xa855f7, 0.6, 30);
        pointLight.position.set(0, 10, 0);
        scene.add(pointLight);
    },

    // Tạo chữ Sprite 3D chất lượng cao
    createLabel(text, position, color = '#ffffff', bgColor = 'rgba(15, 23, 42, 0.75)', scale = 1.0) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Vẽ nền bo góc
        ctx.fillStyle = bgColor;
        this.roundRect(ctx, 16, 16, 224, 96, 24);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = color;
        ctx.stroke();

        // Chữ
        ctx.font = 'bold 52px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(2.2 * scale, 1.1 * scale, 1);
        sprite.userData.isLabel = true;
        return sprite;
    },

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    },

    // Tạo điểm cầu tương tác
    createPoint(x, y, z, color = 0xef4444, radius = 0.35, name = '') {
        const geo = new THREE.SphereGeometry(radius, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.2,
            metalness: 0.5,
            emissive: color,
            emissiveIntensity: 0.25
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.userData.draggable = true;
        mesh.userData.pointName = name;
        return mesh;
    },

    // Tạo texture nét đứt 3D (alpha pattern) cho các ống trụ
    createDashedTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 64, 16);
        // 50% nét đậm, 50% khoảng ngắt quãng
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 32, 16);
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    },

    // Tạo đoạn ống trụ 3D nối 2 điểm (hỗ trợ chuyển đổi nét liền / nét đứt động)
    createTubeLine(p1, p2, color = 0x38bdf8, radius = 0.08, dashed = false) {
        const v1 = (p1 instanceof THREE.Vector3) ? p1 : p1.position;
        const v2 = (p2 instanceof THREE.Vector3) ? p2 : p2.position;
        const len = v1.distanceTo(v2);
        const path = new THREE.LineCurve3(v1, v2);
        const geo = new THREE.TubeGeometry(path, 20, radius, 8, false);

        // Vật liệu nét liền (Solid)
        const solidMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.25,
            metalness: 0.2,
            emissive: color,
            emissiveIntensity: 0.25
        });

        // Vật liệu nét đứt 3D (Dashed)
        const dashTex = this.createDashedTexture();
        dashTex.repeat.set(Math.max(2, Math.round(len / 0.55)), 1);

        const dashedMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.35,
            metalness: 0.1,
            emissive: color,
            emissiveIntensity: 0.2,
            map: dashTex,
            transparent: true,
            alphaTest: 0.45
        });

        const mesh = new THREE.Mesh(geo, dashed ? dashedMat : solidMat);
        mesh.userData.p1 = p1;
        mesh.userData.p2 = p2;
        mesh.userData.radius = radius;
        mesh.userData.solidMat = solidMat;
        mesh.userData.dashedMat = dashedMat;
        mesh.userData.dashTex = dashTex;
        mesh.userData.isDashed = dashed;

        // Phương thức chuyển đổi giữa nét liền và nét đứt
        mesh.setDashed = function(isDashed) {
            if (this.userData.isDashed !== isDashed) {
                this.userData.isDashed = isDashed;
                this.material = isDashed ? this.userData.dashedMat : this.userData.solidMat;
                this.material.needsUpdate = true;
            }
        };

        return mesh;
    },

    // Cập nhật hình học của TubeLine khi điểm di chuyển
    updateTubeLine(tubeMesh) {
        if (!tubeMesh || !tubeMesh.userData.p1 || !tubeMesh.userData.p2) return;
        const v1 = tubeMesh.userData.p1.position || tubeMesh.userData.p1;
        const v2 = tubeMesh.userData.p2.position || tubeMesh.userData.p2;
        const len = v1.distanceTo(v2);
        const path = new THREE.LineCurve3(v1, v2);
        const newGeo = new THREE.TubeGeometry(path, 20, tubeMesh.userData.radius || 0.08, 8, false);
        tubeMesh.geometry.dispose();
        tubeMesh.geometry = newGeo;

        if (tubeMesh.userData.dashTex) {
            tubeMesh.userData.dashTex.repeat.set(Math.max(2, Math.round(len / 0.55)), 1);
            tubeMesh.userData.dashTex.needsUpdate = true;
        }
    },

    // Hệ thống tự động xác định nét đứt cho khối đa diện khi xoay góc nhìn 3D
    setupPolyhedronOcclusion(scene, camera, config) {
        const { vertices, faces, edges } = config;

        const updateOcclusion = () => {
            // 1. Tính tâm O của khối đa diện
            const center = new THREE.Vector3();
            let count = 0;
            for (const k in vertices) {
                const pos = vertices[k].position || vertices[k];
                center.add(pos);
                count++;
            }
            if (count > 0) center.divideScalar(count);

            // 2. Tính hướng nhìn tới từng mặt
            const faceVis = {};
            for (const f of faces) {
                const p0 = vertices[f.verts[0]].position || vertices[f.verts[0]];
                const p1 = vertices[f.verts[1]].position || vertices[f.verts[1]];
                const p2 = vertices[f.verts[2]].position || vertices[f.verts[2]];

                const vA = new THREE.Vector3().subVectors(p1, p0);
                const vB = new THREE.Vector3().subVectors(p2, p0);
                const norm = new THREE.Vector3().crossVectors(vA, vB);

                // Hướng pháp tuyến ra ngoài
                const toCenter = new THREE.Vector3().subVectors(p0, center);
                if (norm.dot(toCenter) < 0) {
                    norm.negate();
                }
                norm.normalize();

                // Tính tâm mặt
                const faceCenter = new THREE.Vector3();
                for (const vName of f.verts) {
                    const vPos = vertices[vName].position || vertices[vName];
                    faceCenter.add(vPos);
                }
                faceCenter.divideScalar(f.verts.length);

                // Vector từ tâm mặt đến camera
                const toCam = new THREE.Vector3().subVectors(camera.position, faceCenter);
                faceVis[f.name] = (norm.dot(toCam) > 0);
            }

            // 3. Với mỗi cạnh: Nếu cả 2 mặt kề đều quay lưng với camera -> NÉT ĐỨT
            for (const e of edges) {
                const f1Vis = faceVis[e.face1];
                const f2Vis = faceVis[e.face2];
                const isOccluded = (!f1Vis) && (!f2Vis);
                if (e.mesh && e.mesh.setDashed) {
                    e.mesh.setDashed(isOccluded);
                }
            }
        };

        const existingUpdate = scene.userData.update;
        scene.userData.update = () => {
            if (existingUpdate) existingUpdate();
            updateOcclusion();
        };

        updateOcclusion();
        return updateOcclusion;
    },

    // Hỗ trợ kéo di chuyển các điểm 3D bằng Raycaster và Mouse Plane
    enableDragging(scene, container, camera, controls, onPointDrag) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const dragPlane = new THREE.Plane();
        const planeIntersect = new THREE.Vector3();
        let selectedPoint = null;

        const getMousePos = (e) => {
            const rect = container.getBoundingClientRect();
            return {
                x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                y: -((e.clientY - rect.top) / rect.height) * 2 + 1
            };
        };

        const onPointerDown = (e) => {
            const pos = getMousePos(e);
            mouse.x = pos.x;
            mouse.y = pos.y;
            raycaster.setFromCamera(mouse, camera);

            // Tìm các điểm có thể kéo
            const draggables = [];
            scene.traverse(obj => {
                if (obj.userData && obj.userData.draggable) draggables.push(obj);
            });

            const intersects = raycaster.intersectObjects(draggables, false);
            if (intersects.length > 0) {
                selectedPoint = intersects[0].object;
                controls.enabled = false; // Tạm khoá xoay camera khi kéo điểm

                // Tạo mặt phẳng kéo vuông góc với camera tại vị trí điểm
                const camDir = new THREE.Vector3();
                camera.getWorldDirection(camDir);
                dragPlane.setFromNormalAndCoplanarPoint(camDir.negate(), selectedPoint.position);

                container.style.cursor = 'grabbing';
            }
        };

        const onPointerMove = (e) => {
            const pos = getMousePos(e);
            mouse.x = pos.x;
            mouse.y = pos.y;
            raycaster.setFromCamera(mouse, camera);

            if (selectedPoint) {
                if (raycaster.ray.intersectPlane(dragPlane, planeIntersect)) {
                    // Giới hạn trong vùng làm việc (-10 đến 10)
                    planeIntersect.clamp(new THREE.Vector3(-10, -2, -10), new THREE.Vector3(10, 12, 10));
                    selectedPoint.position.copy(planeIntersect);

                    // Cập nhật nhãn đi theo điểm
                    if (selectedPoint.userData.label) {
                        selectedPoint.userData.label.position.set(
                            planeIntersect.x,
                            planeIntersect.y + 0.8,
                            planeIntersect.z
                        );
                    }

                    if (onPointDrag) onPointDrag(selectedPoint);
                }
            } else {
                // Hover highlight
                const draggables = [];
                scene.traverse(obj => {
                    if (obj.userData && obj.userData.draggable) draggables.push(obj);
                });
                const intersects = raycaster.intersectObjects(draggables, false);
                container.style.cursor = intersects.length > 0 ? 'grab' : 'default';
            }
        };

        const onPointerUp = () => {
            selectedPoint = null;
            controls.enabled = true;
            container.style.cursor = 'default';
        };

        container.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        // Lưu listener để dọn dẹp
        scene.userData.cleanupDrag = () => {
            container.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    },

    // =========================================================================
    // BÀI 10: ĐƯỜNG THẲNG VÀ MẶT PHẲNG TRONG KHÔNG GIAN
    // =========================================================================
    createScene10(scene, container, camera, controls) {
        camera.position.set(10, 12, 16);

        // 1. Mặt phẳng (α) mờ trong suốt
        const planeGeo = new THREE.PlaneGeometry(14, 10);
        const planeMat = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            roughness: 0.1,
            metalness: 0.1
        });
        const planeMesh = new THREE.Mesh(planeGeo, planeMat);
        planeMesh.rotation.x = -Math.PI / 2;
        planeMesh.position.y = 0;
        scene.add(planeMesh);

        // Khung viền mặt phẳng
        const edges = new THREE.EdgesGeometry(planeGeo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, linewidth: 2 });
        const wireframe = new THREE.LineSegments(edges, lineMat);
        wireframe.rotation.x = -Math.PI / 2;
        scene.add(wireframe);

        // Nhãn mặt phẳng (α)
        const planeLabel = this.createLabel('(α)', new THREE.Vector3(5.5, 0.4, 4), '#93c5fd', 'rgba(30, 58, 138, 0.7)');
        scene.add(planeLabel);

        // 2. Điểm A, B, C thuộc mp(α) (không thẳng hàng)
        const ptA = this.createPoint(-3, 0, 1.5, 0xef4444, 0.35, 'A');
        const ptB = this.createPoint(3, 0, 2, 0xef4444, 0.35, 'B');
        const ptC = this.createPoint(0, 0, -2.5, 0xef4444, 0.35, 'C');

        // Điểm D không thuộc mp(α) (nằm phía trên)
        const ptD = this.createPoint(0.5, 5, 0, 0x10b981, 0.4, 'D');

        scene.add(ptA);
        scene.add(ptB);
        scene.add(ptC);
        scene.add(ptD);

        // Nhãn các điểm
        const lblA = this.createLabel('A', new THREE.Vector3(-3, 0.8, 1.5), '#ef4444');
        const lblB = this.createLabel('B', new THREE.Vector3(3, 0.8, 2), '#ef4444');
        const lblC = this.createLabel('C', new THREE.Vector3(0, 0.8, -2.5), '#ef4444');
        const lblD = this.createLabel('D (∉ α)', new THREE.Vector3(0.5, 5.8, 0), '#10b981');

        ptA.userData.label = lblA;
        ptB.userData.label = lblB;
        ptC.userData.label = lblC;
        ptD.userData.label = lblD;

        scene.add(lblA);
        scene.add(lblB);
        scene.add(lblC);
        scene.add(lblD);

        // 3. Đường thẳng d đi qua A và B (kéo dài hai đầu)
        const dirAB = new THREE.Vector3().subVectors(ptB.position, ptA.position).normalize();
        const p1Ext = new THREE.Vector3().copy(ptA.position).addScaledVector(dirAB, -2.5);
        const p2Ext = new THREE.Vector3().copy(ptB.position).addScaledVector(dirAB, 2.5);

        const lineAB = this.createTubeLine(p1Ext, p2Ext, 0xfacc15, 0.08);
        scene.add(lineAB);

        // 4. Các cạnh của tứ diện D.ABC (minh họa tính chất T4: tồn tại 4 điểm không đồng phẳng)
        const lineDA = this.createTubeLine(ptD, ptA, 0x34d399, 0.08);
        const lineDB = this.createTubeLine(ptD, ptB, 0x34d399, 0.08);
        const lineDC = this.createTubeLine(ptD, ptC, 0x34d399, 0.08);
        const lineAB_seg = this.createTubeLine(ptA, ptB, 0x60a5fa, 0.07);
        const lineBC = this.createTubeLine(ptB, ptC, 0x60a5fa, 0.07);
        const lineAC = this.createTubeLine(ptC, ptA, 0x60a5fa, 0.07);

        scene.add(lineDA);
        scene.add(lineDB);
        scene.add(lineDC);
        scene.add(lineAB_seg);
        scene.add(lineBC);
        scene.add(lineAC);

        // Mặt bán trong suốt của tứ diện D.ABC tạo khối thể tích trực quan
        const tetraGeo = new THREE.BufferGeometry();
        const updateTetraFaces = () => {
            const vD = ptD.position, vA = ptA.position, vB = ptB.position, vC = ptC.position;
            const verts = new Float32Array([
                // Mặt DAB
                vD.x, vD.y, vD.z,  vA.x, vA.y, vA.z,  vB.x, vB.y, vB.z,
                // Mặt DBC
                vD.x, vD.y, vD.z,  vB.x, vB.y, vB.z,  vC.x, vC.y, vC.z,
                // Mặt DCA
                vD.x, vD.y, vD.z,  vC.x, vC.y, vC.z,  vA.x, vA.y, vA.z,
                // Mặt đáy ABC
                vA.x, vA.y, vA.z,  vB.x, vB.y, vB.z,  vC.x, vC.y, vC.z
            ]);
            tetraGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
            tetraGeo.computeVertexNormals();
        };
        updateTetraFaces();
        const tetraMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const tetraMesh = new THREE.Mesh(tetraGeo, tetraMat);
        scene.add(tetraMesh);

        // Thiết lập hệ thống tự động nhận diện cạnh khuất -> chuyển thành NÉT ĐỨT khi xoay
        const occlusion10 = this.setupPolyhedronOcclusion(scene, camera, {
            vertices: { 'D': ptD, 'A': ptA, 'B': ptB, 'C': ptC },
            faces: [
                { name: 'DAB', verts: ['D', 'A', 'B'] },
                { name: 'DBC', verts: ['D', 'B', 'C'] },
                { name: 'DCA', verts: ['D', 'C', 'A'] },
                { name: 'ABC', verts: ['A', 'B', 'C'] }
            ],
            edges: [
                { mesh: lineDA, face1: 'DAB', face2: 'DCA' },
                { mesh: lineDB, face1: 'DAB', face2: 'DBC' },
                { mesh: lineDC, face1: 'DBC', face2: 'DCA' },
                { mesh: lineAB_seg, face1: 'DAB', face2: 'ABC' },
                { mesh: lineBC, face1: 'DBC', face2: 'ABC' },
                { mesh: lineAC, face1: 'DCA', face2: 'ABC' }
            ]
        });

        // Kích hoạt kéo điểm
        this.enableDragging(scene, container, camera, controls, (movedPoint) => {
            // Cập nhật các đường thẳng nối
            this.updateTubeLine(lineDA);
            this.updateTubeLine(lineDB);
            this.updateTubeLine(lineDC);
            this.updateTubeLine(lineAB_seg);
            this.updateTubeLine(lineBC);
            this.updateTubeLine(lineAC);

            // Cập nhật đường d qua AB
            const dAB = new THREE.Vector3().subVectors(ptB.position, ptA.position).normalize();
            lineAB.userData.p1 = new THREE.Vector3().copy(ptA.position).addScaledVector(dAB, -2.5);
            lineAB.userData.p2 = new THREE.Vector3().copy(ptB.position).addScaledVector(dAB, 2.5);
            this.updateTubeLine(lineAB);

            // Cập nhật mặt khối
            updateTetraFaces();
            if (occlusion10) occlusion10();
        });
    },

    // =========================================================================
    // BÀI 11: HAI ĐƯỜNG THẲNG SONG SONG
    // =========================================================================
    createScene11(scene, container, camera, controls) {
        camera.position.set(12, 11, 15);

        // Mặt phẳng chuẩn (P)
        const planeGeo = new THREE.PlaneGeometry(14, 10);
        const planeMat = new THREE.MeshStandardMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);

        const planeEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(planeGeo),
            new THREE.LineBasicMaterial({ color: 0x818cf8 })
        );
        planeEdges.rotation.x = -Math.PI / 2;
        scene.add(planeEdges);

        const lblP = this.createLabel('(P)', new THREE.Vector3(5.5, 0.3, 4), '#a5b4fc');
        scene.add(lblP);

        // Nhóm đường thẳng theo 3 chế độ: Song song, Cắt nhau, Chéo nhau
        const groupParallel = new THREE.Group();
        const groupIntersect = new THREE.Group();
        const groupSkew = new THREE.Group();

        // --- 1. SONG SONG ---
        const pA1 = new THREE.Vector3(-5, 0.05, -2);
        const pA2 = new THREE.Vector3(5, 0.05, -2);
        const lineA = this.createTubeLine(pA1, pA2, 0x06b6d4, 0.1);
        const lblLineA = this.createLabel('đường thẳng a', new THREE.Vector3(5.5, 0.6, -2), '#06b6d4');

        const pB1 = new THREE.Vector3(-5, 0.05, 2);
        const pB2 = new THREE.Vector3(5, 0.05, 2);
        const lineB = this.createTubeLine(pB1, pB2, 0xec4899, 0.1);
        const lblLineB = this.createLabel('đường thẳng b // a', new THREE.Vector3(5.5, 0.6, 2), '#ec4899');

        groupParallel.add(lineA, lblLineA, lineB, lblLineB);

        // --- 2. CẮT NHAU ---
        const pC1 = new THREE.Vector3(-4.5, 0.05, -3);
        const pC2 = new THREE.Vector3(4.5, 0.05, 3);
        const lineC = this.createTubeLine(pC1, pC2, 0x10b981, 0.1);

        const pD1 = new THREE.Vector3(-4.5, 0.05, 3);
        const pD2 = new THREE.Vector3(4.5, 0.05, -3);
        const lineD = this.createTubeLine(pD1, pD2, 0xf59e0b, 0.1);

        const ptM = this.createPoint(0, 0.1, 0, 0xef4444, 0.35, 'M');
        const lblM = this.createLabel('M = a ∩ b', new THREE.Vector3(0, 0.9, 0), '#ef4444');

        groupIntersect.add(lineC, lineD, ptM, lblM);

        // --- 3. CHÉO NHAU ---
        const pE1 = new THREE.Vector3(-5, 0.05, 0);
        const pE2 = new THREE.Vector3(5, 0.05, 0);
        const lineE = this.createTubeLine(pE1, pE2, 0x3b82f6, 0.1);
        const lblLineE = this.createLabel('a nằm trong (P)', new THREE.Vector3(5.5, 0.6, 0), '#3b82f6');

        const pF1 = new THREE.Vector3(0, 4.5, -4);
        const pF2 = new THREE.Vector3(0, 4.5, 4);
        const lineF = this.createTubeLine(pF1, pF2, 0xf43f5e, 0.1);
        const lblLineF = this.createLabel('b không đồng phẳng với a', new THREE.Vector3(0, 5.2, 4.5), '#f43f5e');

        // Đoạn vuông góc chung nối 2 đường
        const distLine = this.createTubeLine(new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(0, 4.5, 0), 0x94a3b8, 0.04);

        groupSkew.add(lineE, lblLineE, lineF, lblLineF, distLine);

        scene.add(groupParallel);
        scene.add(groupIntersect);
        scene.add(groupSkew);

        groupIntersect.visible = false;
        groupSkew.visible = false;

        // Bắt sự kiện chuyển nút chế độ
        const modeButtons = container.parentElement.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.onclick = () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const mode = btn.dataset.mode;
                groupParallel.visible = (mode === 'parallel');
                groupIntersect.visible = (mode === 'intersect');
                groupSkew.visible = (mode === 'skew');
            };
        });
    },

    // =========================================================================
    // BÀI 12: ĐƯỜNG THẲNG VÀ MẶT PHẲNG SONG SONG
    // =========================================================================
    createScene12(scene, container, camera, controls) {
        camera.position.set(12, 13, 16);

        // 1. Mặt phẳng (α)
        const planeGeo = new THREE.PlaneGeometry(15, 10);
        const planeMat = new THREE.MeshStandardMaterial({
            color: 0x059669,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);

        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(planeGeo),
            new THREE.LineBasicMaterial({ color: 0x34d399 })
        );
        edges.rotation.x = -Math.PI / 2;
        scene.add(edges);

        const lblAlpha = this.createLabel('(α)', new THREE.Vector3(6, 0.3, 4), '#6ee7b7');
        scene.add(lblAlpha);

        // 2. Đường thẳng d' nằm trong (α)
        const ptD1 = new THREE.Vector3(-5, 0.05, 0);
        const ptD2 = new THREE.Vector3(5, 0.05, 0);
        const lineDPrime = this.createTubeLine(ptD1, ptD2, 0x10b981, 0.1);
        const lblDPrime = this.createLabel("d' ⊂ (α)", new THREE.Vector3(5.8, 0.6, 0), '#34d399');
        scene.add(lineDPrime, lblDPrime);

        // 3. Đường thẳng d lơ lửng bên trên song song d'
        const pt1 = this.createPoint(-5, 4.5, 0, 0x38bdf8, 0.3, 'd_start');
        const pt2 = this.createPoint(5, 4.5, 0, 0x38bdf8, 0.3, 'd_end');
        scene.add(pt1, pt2);

        const lineD = this.createTubeLine(pt1, pt2, 0x38bdf8, 0.12);
        const lblD = this.createLabel('d // d\' ⟹ d // (α)', new THREE.Vector3(0, 5.5, 0), '#38bdf8', 'rgba(12, 74, 110, 0.85)', 1.2);
        scene.add(lineD, lblD);

        // 4. Các tia chiếu gióng khoảng cách vuông góc (nét đứt theo quy ước hình học)
        const drop1 = this.createTubeLine(new THREE.Vector3(-3, 4.5, 0), new THREE.Vector3(-3, 0.05, 0), 0xfacc15, 0.04, true);
        const drop2 = this.createTubeLine(new THREE.Vector3(3, 4.5, 0), new THREE.Vector3(3, 0.05, 0), 0xfacc15, 0.04, true);
        scene.add(drop1, drop2);

        // Kéo thả d để cảm nhận tính song song
        this.enableDragging(scene, container, camera, controls, (movedPoint) => {
            // Giữ cho d luôn thẳng hàng khi kéo một đầu
            this.updateTubeLine(lineD);
            lblD.position.set((pt1.position.x + pt2.position.x) / 2, (pt1.position.y + pt2.position.y) / 2 + 1, (pt1.position.z + pt2.position.z) / 2);
        });
    },

    // =========================================================================
    // BÀI 13: HAI MẶT PHẲNG SONG SONG
    // =========================================================================
    createScene13(scene, container, camera, controls) {
        camera.position.set(13, 14, 17);

        // Mặt phẳng (α) bên dưới
        const p1Geo = new THREE.PlaneGeometry(14, 10);
        const p1Mat = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const plane1 = new THREE.Mesh(p1Geo, p1Mat);
        plane1.rotation.x = -Math.PI / 2;
        plane1.position.y = 0;
        scene.add(plane1);

        const p1Edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(p1Geo),
            new THREE.LineBasicMaterial({ color: 0x60a5fa })
        );
        p1Edges.rotation.x = -Math.PI / 2;
        scene.add(p1Edges);

        const lbl1 = this.createLabel('(α)', new THREE.Vector3(5.5, 0.3, 4), '#93c5fd');
        scene.add(lbl1);

        // Mặt phẳng (β) bên trên song song (α)
        const p2Mat = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const plane2 = new THREE.Mesh(p1Geo, p2Mat);
        plane2.rotation.x = -Math.PI / 2;
        plane2.position.y = 5.5;
        scene.add(plane2);

        const p2Edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(p1Geo),
            new THREE.LineBasicMaterial({ color: 0xa78bfa })
        );
        p2Edges.rotation.x = -Math.PI / 2;
        p2Edges.position.y = 5.5;
        scene.add(p2Edges);

        const lbl2 = this.createLabel('(β) // (α)', new THREE.Vector3(5.5, 5.8, 4), '#c4b5fd');
        scene.add(lbl2);

        // Mô hình Hình lăng trụ đứng tam giác ABC.A'B'C' nằm giữa 2 mặt phẳng
        const A = new THREE.Vector3(-2.5, 0, 2);
        const B = new THREE.Vector3(2.5, 0, 2);
        const C = new THREE.Vector3(0, 0, -2);

        const A1 = new THREE.Vector3(-2.5, 5.5, 2);
        const B1 = new THREE.Vector3(2.5, 5.5, 2);
        const C1 = new THREE.Vector3(0, 5.5, -2);

        // Vẽ các đỉnh
        const pts = [A, B, C, A1, B1, C1];
        const names = ['A', 'B', 'C', "A'", "B'", "C'"];
        const colors = [0xef4444, 0xef4444, 0xef4444, 0x10b981, 0x10b981, 0x10b981];

        pts.forEach((p, idx) => {
            const mesh = this.createPoint(p.x, p.y, p.z, colors[idx], 0.28, names[idx]);
            scene.add(mesh);
            const lbl = this.createLabel(names[idx], new THREE.Vector3(p.x, p.y + (p.y > 0 ? 0.6 : -0.6), p.z), '#f8fafc', 'rgba(0,0,0,0.6)', 0.8);
            scene.add(lbl);
        });

        // Các cạnh đáy dưới
        const lineAB = this.createTubeLine(A, B, 0x38bdf8, 0.08);
        const lineBC = this.createTubeLine(B, C, 0x38bdf8, 0.08);
        const lineCA = this.createTubeLine(C, A, 0x38bdf8, 0.08);
        scene.add(lineAB, lineBC, lineCA);

        // Các cạnh đáy trên
        const lineA1B1 = this.createTubeLine(A1, B1, 0xa855f7, 0.08);
        const lineB1C1 = this.createTubeLine(B1, C1, 0xa855f7, 0.08);
        const lineC1A1 = this.createTubeLine(C1, A1, 0xa855f7, 0.08);
        scene.add(lineA1B1, lineB1C1, lineC1A1);

        // Các cạnh bên song song và bằng nhau
        const lineAA1 = this.createTubeLine(A, A1, 0xfacc15, 0.08);
        const lineBB1 = this.createTubeLine(B, B1, 0xfacc15, 0.08);
        const lineCC1 = this.createTubeLine(C, C1, 0xfacc15, 0.08);
        scene.add(lineAA1, lineBB1, lineCC1);

        // Mặt bán trong suốt của lăng trụ tam giác
        const prismGeo = new THREE.BufferGeometry();
        const prismVerts = new Float32Array([
            // Đáy dưới ABC
            A.x, A.y, A.z,  B.x, B.y, B.z,  C.x, C.y, C.z,
            // Đáy trên A1B1C1
            A1.x, A1.y, A1.z,  B1.x, B1.y, B1.z,  C1.x, C1.y, C1.z,
            // Mặt bên ABB1A1
            A.x, A.y, A.z,  B.x, B.y, B.z,  B1.x, B1.y, B1.z,
            A.x, A.y, A.z,  B1.x, B1.y, B1.z,  A1.x, A1.y, A1.z,
            // Mặt bên BCC1B1
            B.x, B.y, B.z,  C.x, C.y, C.z,  C1.x, C1.y, C1.z,
            B.x, B.y, B.z,  C1.x, C1.y, C1.z,  B1.x, B1.y, B1.z,
            // Mặt bên CAA1C1
            C.x, C.y, C.z,  A.x, A.y, A.z,  A1.x, A1.y, A1.z,
            C.x, C.y, C.z,  A1.x, A1.y, A1.z,  C1.x, C1.y, C1.z
        ]);
        prismGeo.setAttribute('position', new THREE.BufferAttribute(prismVerts, 3));
        prismGeo.computeVertexNormals();
        const prismMat = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const prismMesh = new THREE.Mesh(prismGeo, prismMat);
        scene.add(prismMesh);

        // Thiết lập tự động nhận diện nét đứt cho hình lăng trụ khi xoay
        this.setupPolyhedronOcclusion(scene, camera, {
            vertices: { 'A': A, 'B': B, 'C': C, 'A1': A1, 'B1': B1, 'C1': C1 },
            faces: [
                { name: 'bot', verts: ['A', 'B', 'C'] },
                { name: 'top', verts: ['A1', 'B1', 'C1'] },
                { name: 'sideAB', verts: ['A', 'B', 'B1'] },
                { name: 'sideBC', verts: ['B', 'C', 'C1'] },
                { name: 'sideCA', verts: ['C', 'A', 'A1'] }
            ],
            edges: [
                { mesh: lineAA1, face1: 'sideAB', face2: 'sideCA' },
                { mesh: lineBB1, face1: 'sideAB', face2: 'sideBC' },
                { mesh: lineCC1, face1: 'sideBC', face2: 'sideCA' },
                { mesh: lineAB, face1: 'sideAB', face2: 'bot' },
                { mesh: lineBC, face1: 'sideBC', face2: 'bot' },
                { mesh: lineCA, face1: 'sideCA', face2: 'bot' },
                { mesh: lineA1B1, face1: 'sideAB', face2: 'top' },
                { mesh: lineB1C1, face1: 'sideBC', face2: 'top' },
                { mesh: lineC1A1, face1: 'sideCA', face2: 'top' }
            ]
        });
    },

    // =========================================================================
    // BÀI 14: PHÉP CHIẾU SONG SONG
    // =========================================================================
    createScene14(scene, container, camera, controls) {
        camera.position.set(13, 14, 17);

        // Mặt phẳng chiếu (P)
        const planeGeo = new THREE.PlaneGeometry(16, 12);
        const planeMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);

        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(planeGeo),
            new THREE.LineBasicMaterial({ color: 0x94a3b8 })
        );
        edges.rotation.x = -Math.PI / 2;
        scene.add(edges);

        const lblP = this.createLabel('Mặt phẳng chiếu (P)', new THREE.Vector3(5.5, 0.3, 5), '#cbd5e1');
        scene.add(lblP);

        // Phương chiếu l (Vector chỉ hướng lệch nghiêng)
        const dirProjection = new THREE.Vector3(1.5, -4.5, 1.2).normalize();

        // Mũi tên minh họa phương chiếu l
        const dirArrowStart = new THREE.Vector3(-6, 7, -3);
        const arrowHelper = new THREE.ArrowHelper(dirProjection, dirArrowStart, 3.5, 0xf59e0b, 0.8, 0.5);
        scene.add(arrowHelper);
        const lblL = this.createLabel('Phương chiếu l', new THREE.Vector3(-5, 7.5, -3), '#f59e0b');
        scene.add(lblL);

        // Nhóm 1: CHIẾU ĐIỂM (Mode: project)
        const groupPoint = new THREE.Group();

        // Nhóm 2: CHIẾU TAM GIÁC (Mode: triangle)
        const groupTriangle = new THREE.Group();

        // Hàm tính tọa độ hình chiếu trên mp(P) (y = 0) theo phương l
        const projectPoint = (pt) => {
            const py = pt.y !== undefined ? pt.y : pt[1];
            const px = pt.x !== undefined ? pt.x : pt[0];
            const pz = pt.z !== undefined ? pt.z : pt[2];
            const t = -py / dirProjection.y;
            return new THREE.Vector3(
                px + t * dirProjection.x,
                0.05,
                pz + t * dirProjection.z
            );
        };

        // -------------------------------------------------------------
        // XÂY DỰNG CHẾ ĐỘ 1: CHIẾU ĐIỂM
        // -------------------------------------------------------------
        const ptM_coord = new THREE.Vector3(0, 6, 0);
        const ptM = this.createPoint(ptM_coord.x, ptM_coord.y, ptM_coord.z, 0xef4444, 0.4, 'M');
        const lblM = this.createLabel('Điểm M', new THREE.Vector3(0, 6.8, 0), '#ef4444');
        ptM.userData.label = lblM;

        const ptM_prime_coord = projectPoint(ptM_coord);
        const ptM_prime = this.createPoint(ptM_prime_coord.x, ptM_prime_coord.y, ptM_prime_coord.z, 0x10b981, 0.35, "M'");
        const lblM_prime = this.createLabel("M' (Hình chiếu của M)", new THREE.Vector3(ptM_prime_coord.x, 0.8, ptM_prime_coord.z), '#10b981');

        const rayM = this.createTubeLine(ptM, ptM_prime, 0xfacc15, 0.045, true);

        groupPoint.add(ptM, lblM, ptM_prime, lblM_prime, rayM);

        // -------------------------------------------------------------
        // XÂY DỰNG CHẾ ĐỘ 2: CHIẾU TAM GIÁC
        // -------------------------------------------------------------
        const A = new THREE.Vector3(-2.5, 6, -1);
        const B = new THREE.Vector3(2.5, 6.5, 0);
        const C = new THREE.Vector3(-0.5, 7.5, -3);

        const ptA = this.createPoint(A.x, A.y, A.z, 0xef4444, 0.32, 'A');
        const ptB = this.createPoint(B.x, B.y, B.z, 0xef4444, 0.32, 'B');
        const ptC = this.createPoint(C.x, C.y, C.z, 0xef4444, 0.32, 'C');

        const lblA = this.createLabel('A', new THREE.Vector3(A.x, A.y + 0.6, A.z), '#ef4444', 'rgba(0,0,0,0.6)', 0.8);
        const lblB = this.createLabel('B', new THREE.Vector3(B.x, B.y + 0.6, B.z), '#ef4444', 'rgba(0,0,0,0.6)', 0.8);
        const lblC = this.createLabel('C', new THREE.Vector3(C.x, C.y + 0.6, C.z), '#ef4444', 'rgba(0,0,0,0.6)', 0.8);

        ptA.userData.label = lblA;
        ptB.userData.label = lblB;
        ptC.userData.label = lblC;

        const lineAB = this.createTubeLine(ptA, ptB, 0xf87171, 0.08);
        const lineBC = this.createTubeLine(ptB, ptC, 0xf87171, 0.08);
        const lineCA = this.createTubeLine(ptC, ptA, 0xf87171, 0.08);

        // Mặt tam giác gốc mờ
        const triGeo = new THREE.BufferGeometry();
        const triVerts = new Float32Array([
            A.x, A.y, A.z,  B.x, B.y, B.z,  C.x, C.y, C.z
        ]);
        triGeo.setAttribute('position', new THREE.BufferAttribute(triVerts, 3));
        triGeo.computeVertexNormals();
        const triMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
        const triMesh = new THREE.Mesh(triGeo, triMat);

        // Hình chiếu của tam giác trên mp(P)
        const A_prime = projectPoint(A);
        const B_prime = projectPoint(B);
        const C_prime = projectPoint(C);

        const ptAp = this.createPoint(A_prime.x, A_prime.y, A_prime.z, 0x10b981, 0.32, "A'");
        const ptBp = this.createPoint(B_prime.x, B_prime.y, B_prime.z, 0x10b981, 0.32, "B'");
        const ptCp = this.createPoint(C_prime.x, C_prime.y, C_prime.z, 0x10b981, 0.32, "C'");

        const lblAp = this.createLabel("A'", new THREE.Vector3(A_prime.x, 0.7, A_prime.z), '#10b981', 'rgba(0,0,0,0.6)', 0.8);
        const lblBp = this.createLabel("B'", new THREE.Vector3(B_prime.x, 0.7, B_prime.z), '#10b981', 'rgba(0,0,0,0.6)', 0.8);
        const lblCp = this.createLabel("C'", new THREE.Vector3(C_prime.x, 0.7, C_prime.z), '#10b981', 'rgba(0,0,0,0.6)', 0.8);

        const lineApBp = this.createTubeLine(ptAp, ptBp, 0x34d399, 0.08);
        const lineBpCp = this.createTubeLine(ptBp, ptCp, 0x34d399, 0.08);
        const lineCpAp = this.createTubeLine(ptCp, ptAp, 0x34d399, 0.08);

        // Mặt tam giác chiếu mờ
        const triProjGeo = new THREE.BufferGeometry();
        const triProjVerts = new Float32Array([
            A_prime.x, A_prime.y, A_prime.z,  B_prime.x, B_prime.y, B_prime.z,  C_prime.x, C_prime.y, C_prime.z
        ]);
        triProjGeo.setAttribute('position', new THREE.BufferAttribute(triProjVerts, 3));
        triProjGeo.computeVertexNormals();
        const triProjMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
        const triProjMesh = new THREE.Mesh(triProjGeo, triProjMat);

        // Các tia chiếu (quy ước luôn vẽ bằng nét đứt)
        const rayA = this.createTubeLine(ptA, ptAp, 0xfacc15, 0.04, true);
        const rayB = this.createTubeLine(ptB, ptBp, 0xfacc15, 0.04, true);
        const rayC = this.createTubeLine(ptC, ptCp, 0xfacc15, 0.04, true);

        groupTriangle.add(
            ptA, ptB, ptC, lblA, lblB, lblC, lineAB, lineBC, lineCA, triMesh,
            ptAp, ptBp, ptCp, lblAp, lblBp, lblCp, lineApBp, lineBpCp, lineCpAp, triProjMesh,
            rayA, rayB, rayC
        );

        scene.add(groupPoint);
        scene.add(groupTriangle);

        // Mặc định ở chế độ "Chiếu điểm"
        groupPoint.visible = true;
        groupTriangle.visible = false;

        // BẮT SỰ KIỆN CLICK CHUYỂN NÚT "Chiếu điểm" & "Chiếu tam giác"
        const modeButtons = container.parentElement.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.onclick = () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const mode = btn.dataset.mode;
                groupPoint.visible = (mode === 'project');
                groupTriangle.visible = (mode === 'triangle');
            };
        });

        // Hỗ trợ kéo di chuyển điểm
        this.enableDragging(scene, container, camera, controls, (movedPoint) => {
            if (groupPoint.visible && movedPoint === ptM) {
                const newProj = projectPoint(ptM.position);
                ptM_prime.position.copy(newProj);
                lblM_prime.position.set(newProj.x, 0.8, newProj.z);
                this.updateTubeLine(rayM);
            } else if (groupTriangle.visible) {
                // Cập nhật tam giác gốc
                this.updateTubeLine(lineAB);
                this.updateTubeLine(lineBC);
                this.updateTubeLine(lineCA);

                // Cập nhật tọa độ chiếu
                const newAp = projectPoint(ptA.position);
                const newBp = projectPoint(ptB.position);
                const newCp = projectPoint(ptC.position);

                ptAp.position.copy(newAp);
                ptBp.position.copy(newBp);
                ptCp.position.copy(newCp);

                lblAp.position.set(newAp.x, 0.7, newAp.z);
                lblBp.position.set(newBp.x, 0.7, newBp.z);
                lblCp.position.set(newCp.x, 0.7, newCp.z);

                this.updateTubeLine(lineApBp);
                this.updateTubeLine(lineBpCp);
                this.updateTubeLine(lineCpAp);

                this.updateTubeLine(rayA);
                this.updateTubeLine(rayB);
                this.updateTubeLine(rayC);
            }
        });
    },

    // =========================================================================
    // NÚT ĐIỀU KHIỂN & HỖ TRỢ
    // =========================================================================
    bindContainerControls(container, lessonId) {
        const btnReset = container.querySelector('[data-action="reset"]');
        if (btnReset) {
            btnReset.onclick = () => {
                const controls = this.controls[lessonId];
                const camera = this.cameras[lessonId];
                if (controls && camera) {
                    controls.reset();
                    camera.position.set(12, 14, 18);
                    controls.target.set(0, 0, 0);
                    controls.update();
                }
            };
        }

        const btnFullscreen = container.querySelector('[data-action="fullscreen"]');
        if (btnFullscreen) {
            btnFullscreen.onclick = () => {
                if (!document.fullscreenElement) {
                    container.requestFullscreen().catch(err => alert(`Lỗi: ${err.message}`));
                } else {
                    document.exitFullscreen();
                }
            };
        }
    },

    // Dọn dẹp bộ nhớ WebGL khi chuyển tab
    cleanup(lessonId) {
        if (this.animFrames[lessonId]) {
            cancelAnimationFrame(this.animFrames[lessonId]);
            delete this.animFrames[lessonId];
        }
        if (this.scenes[lessonId] && this.scenes[lessonId].userData.cleanupDrag) {
            this.scenes[lessonId].userData.cleanupDrag();
        }
        if (this.renderers[lessonId]) {
            this.renderers[lessonId].dispose();
            delete this.renderers[lessonId];
        }
        if (this.controls[lessonId]) {
            this.controls[lessonId].dispose();
            delete this.controls[lessonId];
        }
        delete this.scenes[lessonId];
        delete this.cameras[lessonId];
    },

    // Cập nhật lại kích thước canvas khi resize cửa sổ
    handleResize() {
        const lessonId = this.activeLesson;
        const container = document.getElementById(`scene-${lessonId}`);
        if (!container) return;

        const camera = this.cameras[lessonId];
        const renderer = this.renderers[lessonId];
        if (camera && renderer) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
    }
};

window.addEventListener('resize', () => ThreeScenes.handleResize());
