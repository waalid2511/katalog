/**
 * GordenKu 3D Visualizer & Pricing Engine
 * Built with Three.js
 */

class CurtainVisualizer {
    constructor() {
        this.container = document.getElementById('threejs-container');
        this.loader = document.getElementById('canvasLoader');
        if (!this.container) return;

        // Current customizer state
        this.state = {
            model: 'wavy', // wavy, roller, vertical, wooden
            material: 'linen', // linen, velvet, emerald, silk, blackout, cedar, walnut
            width: 2.0, // meters
            height: 2.5, // meters
            openness: 50, // percentage (0 = closed, 100 = open)
            zoom: 1.0
        };

        // Materials database
        this.materialsData = {
            // Curtains (Wavy)
            linen: {
                name: 'Linen Off-White',
                price: 95000,
                type: 'kain',
                color: '#ece8e1',
                roughness: 0.9,
                metalness: 0.1,
                desc: 'Bahan linen alami bertekstur lembut. Memberikan kesan kasual, bersih, dan membiarkan cahaya alami menyebar lembut.'
            },
            velvet: {
                name: 'Royal Velvet Navy',
                price: 220000,
                type: 'kain',
                color: '#1a2942',
                roughness: 0.4,
                metalness: 0.2,
                desc: 'Beludru tebal premium dengan kilau mewah. Penahan cahaya yang baik, meredam suara, cocok untuk ruang tidur dan bioskop keluarga.'
            },
            emerald: {
                name: 'Emerald Gold Premium',
                price: 180000,
                type: 'kain',
                color: '#0f382a',
                roughness: 0.5,
                metalness: 0.15,
                desc: 'Kain beludru sutra hijau zamrud dengan tenunan rapat. Memberikan nuansa elegan klasik standar hotel mewah.'
            },
            silk: {
                name: 'Silk Champagne Gold',
                price: 195000,
                type: 'kain',
                color: '#dfcfab',
                roughness: 0.3,
                metalness: 0.3,
                desc: 'Kain sutra satin dengan kilau jatuh yang licin. Memantulkan cahaya secara elegan dan menghadirkan kemegahan istana.'
            },
            blackout: {
                name: 'Mocha Blackout 100%',
                price: 145000,
                type: 'kain',
                color: '#4e3f35',
                roughness: 0.8,
                metalness: 0.05,
                desc: 'Kain berserat carbon padat yang menepis panas matahari 100%. Menjamin privasi total dan tidur siang yang nyenyak.'
            },
            // Blinds
            cedar: {
                name: 'Natural Cedar Wood',
                price: 350000,
                type: 'blind',
                color: '#c28c5f',
                roughness: 0.7,
                metalness: 0.1,
                desc: 'Bilah kayu cedar asli dengan warna cokelat jingga hangat dan urat kayu menawan. Sangat cocok untuk ruang kerja atau villa modern.'
            },
            walnut: {
                name: 'Dark Walnut Wood',
                price: 380000,
                type: 'blind',
                color: '#483424',
                roughness: 0.8,
                metalness: 0.1,
                desc: 'Kayu walnut tua berwarna gelap maskulin. Memberikan kesan kokoh, formal, dan kontras yang dramatis pada dinding terang.'
            },
            roller_white: {
                name: 'Roller Clean White',
                price: 185000,
                type: 'blind',
                color: '#f3f3f3',
                roughness: 0.9,
                metalness: 0.0,
                desc: 'Roller blind minimalis putih bersih berbahan polyester tahan air dan minyak. Cocok untuk dapur dan jendela minimalis.'
            },
            vertical_grey: {
                name: 'Vertical Slate Grey',
                price: 160000,
                type: 'blind',
                color: '#707379',
                roughness: 0.8,
                metalness: 0.1,
                desc: 'Vertical blind abu-abu gelap dengan slat flexibel. Pengatur pencahayaan kantor paling efisien dan berpenampilan modern.'
            }
        };

        this.initThree();
        this.createRoom();
        this.generateProceduralTextures();
        this.updateCurtains();
        this.bindEvents();
        this.calculatePrice();
        this.animate();

        // Hide loader once setup is done
        if (this.loader) {
            this.loader.classList.add('fade-out');
        }
    }

    initThree() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#131317');

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        // Position camera looking at the window
        this.camera.position.set(0, 1.8, 5.0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Orbit Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2.5;
        this.controls.maxDistance = 7.0;
        // Limit camera rotation so user stays inside the virtual room
        this.controls.minPolarAngle = Math.PI / 3.5; // Look slightly down
        this.controls.maxPolarAngle = Math.PI / 1.9; // Avoid clipping below floor
        this.controls.minAzimuthAngle = -Math.PI / 4; // Max rotate left
        this.controls.maxAzimuthAngle = Math.PI / 4;  // Max rotate right
        this.controls.target.set(0, 1.5, 0);

        // Lighting
        // Ambient soft fill light
        const ambientLight = new THREE.AmbientLight('#ffffff', 0.6);
        this.scene.add(ambientLight);

        // Sun light coming from outside the window (z < 0)
        this.sunLight = new THREE.DirectionalLight('#ffeeb0', 1.2);
        this.sunLight.position.set(3, 3, -4);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 15;
        this.sunLight.shadow.camera.left = -3;
        this.sunLight.shadow.camera.right = 3;
        this.sunLight.shadow.camera.top = 3;
        this.sunLight.shadow.camera.bottom = -3;
        this.sunLight.shadow.bias = -0.0005;
        this.scene.add(this.sunLight);

        // Indoor soft light illuminating the curtain face
        this.indoorLight = new THREE.DirectionalLight('#ffffff', 0.5);
        this.indoorLight.position.set(-2, 3, 4);
        this.scene.add(this.indoorLight);

        // Holder for interactive curtain meshes
        this.curtainGroup = new THREE.Group();
        this.scene.add(this.curtainGroup);
    }

    createRoom() {
        // Room Dimensions: Width 6m, Height 4m, Depth 6m.
        // We render the front wall (facing us) where the window resides, and the floor/ceiling.

        // Floor
        const floorGeo = new THREE.PlaneGeometry(8, 8);
        this.floorMat = new THREE.MeshStandardMaterial({
            color: '#c29a76',
            roughness: 0.4,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeo, this.floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Main Back Wall (with cutout for window)
        // We will build this wall using simple box meshes surrounding the window area.
        // Let's create left wall segment, right wall segment, top wall segment, bottom wall segment.
        const wallMat = new THREE.MeshStandardMaterial({
            color: '#e7e5e0',
            roughness: 0.95
        });

        const wallThickness = 0.1;
        const roomHeight = 3.6;

        // Left wall segment
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(2, roomHeight, wallThickness), wallMat);
        leftWall.position.set(-3.0, roomHeight/2, -0.05);
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);

        // Right wall segment
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(2, roomHeight, wallThickness), wallMat);
        rightWall.position.set(3.0, roomHeight/2, -0.05);
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);

        // Top wall segment
        const topWall = new THREE.Mesh(new THREE.BoxGeometry(4, 0.6, wallThickness), wallMat);
        topWall.position.set(0, roomHeight - 0.3, -0.05);
        topWall.receiveShadow = true;
        this.scene.add(topWall);

        // Bottom wall segment
        const bottomWall = new THREE.Mesh(new THREE.BoxGeometry(4, 0.8, wallThickness), wallMat);
        bottomWall.position.set(0, 0.4, -0.05);
        bottomWall.receiveShadow = true;
        this.scene.add(bottomWall);

        // Window Frame (Outer size: 4.0m width, 2.2m height, located vertically at y = 0.8m to 3.0m)
        const frameMat = new THREE.MeshStandardMaterial({
            color: '#2b2a2e',
            roughness: 0.5,
            metalness: 0.5
        });

        // Horizontal frame pieces
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(4.02, 0.08, 0.15), frameMat);
        frameTop.position.set(0, 3.0, -0.03);
        this.scene.add(frameTop);

        const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(4.02, 0.08, 0.15), frameMat);
        frameBottom.position.set(0, 0.8, -0.03);
        this.scene.add(frameBottom);

        // Vertical frame pieces
        const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.28, 0.15), frameMat);
        frameLeft.position.set(-2.0, 1.9, -0.03);
        this.scene.add(frameLeft);

        const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.28, 0.15), frameMat);
        frameRight.position.set(2.0, 1.9, -0.03);
        this.scene.add(frameRight);

        // Center window divider
        const frameCenter = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.2, 0.12), frameMat);
        frameCenter.position.set(0, 1.9, -0.03);
        this.scene.add(frameCenter);

        // Window glass panes (transparent blueish sheen)
        const glassMat = new THREE.MeshStandardMaterial({
            color: '#c4e0e5',
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.35
        });
        const glassLeft = new THREE.Mesh(new THREE.PlaneGeometry(1.94, 2.12), glassMat);
        glassLeft.position.set(-0.97, 1.9, -0.04);
        this.scene.add(glassLeft);

        const glassRight = new THREE.Mesh(new THREE.PlaneGeometry(1.94, 2.12), glassMat);
        glassRight.position.set(0.97, 1.9, -0.04);
        this.scene.add(glassRight);

        // Outdoor Background Plane (shows nice sky view through window)
        const bgGeo = new THREE.PlaneGeometry(12, 8);
        this.bgMat = new THREE.MeshBasicMaterial({
            color: '#b5d6e6'
        });
        const bgPlane = new THREE.Mesh(bgGeo, this.bgMat);
        bgPlane.position.set(0, 2.2, -2.5);
        this.scene.add(bgPlane);
    }

    generateProceduralTextures() {
        // We will generate floor, background sky, wood grain and fabric textures on standard HTML canvases
        // and upload them to GPU as WebGL textures. This makes the project completely zero-asset-load!

        // 1. Floor texture (Wood Planks)
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 512;
        floorCanvas.height = 512;
        const fCtx = floorCanvas.getContext('2d');
        // Planks base fill
        fCtx.fillStyle = '#b1895f';
        fCtx.fillRect(0, 0, 512, 512);
        // Draw planks
        fCtx.strokeStyle = '#8d633c';
        fCtx.lineWidth = 4;
        for (let i = 0; i <= 512; i += 64) {
            fCtx.beginPath();
            fCtx.moveTo(i, 0);
            fCtx.lineTo(i, 512);
            fCtx.stroke();
        }
        // Draw some grain lines
        fCtx.strokeStyle = 'rgba(117, 83, 50, 0.3)';
        fCtx.lineWidth = 1;
        for (let i = 0; i < 512; i += 8) {
            fCtx.beginPath();
            for (let y = 0; y < 512; y += 40) {
                const x = i + Math.sin(y / 20) * 8;
                if (y === 0) fCtx.moveTo(x, y);
                else fCtx.lineTo(x, y);
            }
            fCtx.stroke();
        }
        const floorTex = new THREE.CanvasTexture(floorCanvas);
        floorTex.wrapS = THREE.RepeatWrapping;
        floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(2, 2);
        this.floorMat.map = floorTex;
        this.floorMat.needsUpdate = true;

        // 2. Outdoor view background (Blue Sky with simple sunset gradient)
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = 256;
        bgCanvas.height = 512;
        const bCtx = bgCanvas.getContext('2d');
        const grad = bCtx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#5390e3'); // High sky blue
        grad.addColorStop(0.5, '#9bc5f2'); // Soft sky
        grad.addColorStop(0.75, '#f7d292'); // Sunset orange
        grad.addColorStop(1, '#e89e78'); // Sunset horizon
        bCtx.fillStyle = grad;
        bCtx.fillRect(0, 0, 256, 512);
        const bgTex = new THREE.CanvasTexture(bgCanvas);
        this.bgMat.map = bgTex;
        this.bgMat.needsUpdate = true;

        // 3. Fabric texture canvas for Bump mapping (adds fine weave details to standard materials)
        this.fabricCanvas = document.createElement('canvas');
        this.fabricCanvas.width = 128;
        this.fabricCanvas.height = 128;
        const fbCtx = this.fabricCanvas.getContext('2d');
        fbCtx.fillStyle = '#888888';
        fbCtx.fillRect(0, 0, 128, 128);
        fbCtx.fillStyle = '#ffffff';
        // Alternating dots simulating woven threads
        for (let x = 0; x < 128; x += 4) {
            for (let y = 0; y < 128; y += 4) {
                if ((x + y) % 8 === 0) {
                    fbCtx.fillRect(x, y, 2, 2);
                }
            }
        }
        this.fabricBumpTex = new THREE.CanvasTexture(this.fabricCanvas);
        this.fabricBumpTex.wrapS = THREE.RepeatWrapping;
        this.fabricBumpTex.wrapT = THREE.RepeatWrapping;
        this.fabricBumpTex.repeat.set(30, 30);

        // 4. Wood grain texture canvas (for wooden blinds)
        this.woodCanvas = document.createElement('canvas');
        this.woodCanvas.width = 256;
        this.woodCanvas.height = 256;
        const wCtx = this.woodCanvas.getContext('2d');
        wCtx.fillStyle = '#d7a15c';
        wCtx.fillRect(0, 0, 256, 256);
        // Draw faint horizontal lines representing grain
        wCtx.fillStyle = 'rgba(74, 46, 17, 0.15)';
        for (let y = 0; y < 256; y += 4) {
            wCtx.fillRect(0, y + Math.floor(Math.sin(y)*2), 256, 1 + Math.random()*2);
        }
        this.woodTex = new THREE.CanvasTexture(this.woodCanvas);
    }

    updateCurtains() {
        // Clear previous meshes
        while (this.curtainGroup.children.length > 0) {
            this.curtainGroup.remove(this.curtainGroup.children[0]);
        }

        const width = this.state.width;
        const height = this.state.height;
        const openness = this.state.openness / 100;
        const matKey = this.state.material;
        const matInfo = this.materialsData[matKey];

        // Create Three.js Material
        const baseColor = new THREE.Color(matInfo.color);
        let curtainMat;

        if (this.state.model === 'wooden') {
            // Wooden Blind Material
            curtainMat = new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: matInfo.roughness,
                metalness: matInfo.metalness,
                map: this.woodTex
            });
        } else {
            // Fabric & Roller Materials
            curtainMat = new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: matInfo.roughness,
                metalness: matInfo.metalness,
                bumpMap: this.fabricBumpTex,
                bumpScale: 0.008,
                side: THREE.DoubleSide
            });
        }

        // Window is centered horizontally at x = 0.
        // The curtain rod hangs above the window. 
        // Bottom of window is at y = 0.8. Height of window is 2.2 (ends at y = 3.0).
        // Let's assume the curtain is mounted at y_top = 3.1.
        const yTop = 3.1;
        const yBottom = yTop - height; // Curtain ends at bottom

        if (this.state.model === 'wavy') {
            // CLASSIC WAVY CURTAINS
            // Render left and right curtain parts
            const folds = 5;
            const waveDepth = 0.08;
            const segmentsW = 40;
            const segmentsH = 20;

            // Width of a single curtain is half of window width plus a small overlap overlay
            const singleWidth = (width / 2) * 1.15;
            // When curtain opens, it gathers on the outer side.
            // Left curtain bunches left (x starts at -width/2 and goes right).
            // Right curtain bunches right (x starts at +width/2 and goes left).
            const openScale = 1 - (openness * 0.85); // Minimum bunch size is 15% width

            // Generate Left Curtain Geometry
            const leftGeo = new THREE.PlaneGeometry(singleWidth, height, segmentsW, segmentsH);
            this.deformCurtainGeometry(leftGeo, singleWidth, height, openScale, folds, waveDepth, 'left');
            const leftMesh = new THREE.Mesh(leftGeo, curtainMat);
            leftMesh.position.set(-width / 2, yBottom + height/2, 0.08); // Float slightly in front of window (z = 0.08)
            leftMesh.castShadow = true;
            leftMesh.receiveShadow = true;
            this.curtainGroup.add(leftMesh);

            // Generate Right Curtain Geometry
            const rightGeo = new THREE.PlaneGeometry(singleWidth, height, segmentsW, segmentsH);
            this.deformCurtainGeometry(rightGeo, singleWidth, height, openScale, folds, waveDepth, 'right');
            const rightMesh = new THREE.Mesh(rightGeo, curtainMat);
            rightMesh.position.set(width / 2, yBottom + height/2, 0.08);
            rightMesh.castShadow = true;
            rightMesh.receiveShadow = true;
            this.curtainGroup.add(rightMesh);

            // Add Curtain Rod (a simple cylinder above the window frame)
            const rodMat = new THREE.MeshStandardMaterial({
                color: '#bfa06a', // Gold metal rod
                roughness: 0.2,
                metalness: 0.8
            });
            const rodGeo = new THREE.CylinderGeometry(0.018, 0.018, width + 0.3, 16);
            rodGeo.rotateZ(Math.PI / 2);
            const rodMesh = new THREE.Mesh(rodGeo, rodMat);
            rodMesh.position.set(0, yTop + 0.02, 0.12);
            this.curtainGroup.add(rodMesh);

            // Rod supports (ends)
            const capGeo = new THREE.SphereGeometry(0.035, 16, 16);
            const leftCap = new THREE.Mesh(capGeo, rodMat);
            leftCap.position.set(-(width + 0.3)/2, yTop + 0.02, 0.12);
            this.curtainGroup.add(leftCap);

            const rightCap = new THREE.Mesh(capGeo, rodMat);
            rightCap.position.set((width + 0.3)/2, yTop + 0.02, 0.12);
            this.curtainGroup.add(rightCap);

        } else if (this.state.model === 'roller') {
            // ROLLER BLIND
            // Spans the full window width, rolls down from top
            const currentHeight = height * (1 - openness);

            // Top casing (cylinder representing rolled sheet)
            const casingMat = new THREE.MeshStandardMaterial({
                color: '#ffffff',
                roughness: 0.5,
                metalness: 0.3
            });
            const rollCasingGeo = new THREE.CylinderGeometry(0.035, 0.035, width + 0.04, 24);
            rollCasingGeo.rotateZ(Math.PI / 2);
            const rollCasing = new THREE.Mesh(rollCasingGeo, casingMat);
            rollCasing.position.set(0, yTop - 0.02, 0.05);
            this.curtainGroup.add(rollCasing);

            // Hanging flat sheet plane
            if (currentHeight > 0.01) {
                const sheetGeo = new THREE.PlaneGeometry(width, currentHeight);
                const sheetMesh = new THREE.Mesh(sheetGeo, curtainMat);
                // Position centered horizontally, y shifted down from top casing
                sheetMesh.position.set(0, yTop - 0.02 - currentHeight/2, 0.04);
                sheetMesh.castShadow = true;
                this.curtainGroup.add(sheetMesh);

                // Bottom bar
                const barGeo = new THREE.CylinderGeometry(0.01, 0.01, width, 16);
                barGeo.rotateZ(Math.PI / 2);
                const barMesh = new THREE.Mesh(barGeo, casingMat);
                barMesh.position.set(0, yTop - 0.02 - currentHeight, 0.04);
                this.curtainGroup.add(barMesh);
            }

        } else if (this.state.model === 'vertical') {
            // VERTICAL BLIND
            // Slat count depends on width (e.g. 1 slat every 15cm)
            const slatWidth = 0.12;
            const spacing = 0.10; // Overlapping spacing
            const slatCount = Math.ceil(width / spacing);
            
            // Top mounting track
            const trackMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
            const trackGeo = new THREE.BoxGeometry(width + 0.04, 0.04, 0.06);
            const trackMesh = new THREE.Mesh(trackGeo, trackMat);
            trackMesh.position.set(0, yTop - 0.02, 0.05);
            this.curtainGroup.add(trackMesh);

            // Draw slats
            // Slat rotate angle based on openness (closed: 0, open: perpendicular to window = PI/2)
            const rotationAngle = (openness) * (Math.PI / 2);

            for (let i = 0; i < slatCount; i++) {
                // Slat index position from center of window (-width/2 to +width/2)
                const startX = -width / 2 + (i + 0.5) * (width / slatCount);
                
                // Stack towards sides: as openness increases, slats stack together towards the left & right sides
                // Left half of slats stack left, right half stack right
                let targetX = startX;
                if (openness > 0.1) {
                    const isLeftHalf = i < (slatCount / 2);
                    const centerFactor = isLeftHalf ? (i / (slatCount / 2)) : ((slatCount - 1 - i) / (slatCount / 2));
                    // Slats stack closely on sides
                    const stackDestX = isLeftHalf ? (-width / 2 + (i * 0.015)) : (width / 2 - ((slatCount - 1 - i) * 0.015));
                    targetX = THREE.MathUtils.lerp(startX, stackDestX, openness);
                }

                // If fully open, they are compressed together. We hide or render them stacked.
                const slatGeo = new THREE.BoxGeometry(slatWidth, height - 0.05, 0.002);
                const slatMesh = new THREE.Mesh(slatGeo, curtainMat);
                
                slatMesh.position.set(targetX, yTop - 0.02 - (height - 0.05)/2, 0.05);
                // Tilt the slat based on openness
                slatMesh.rotation.y = rotationAngle;
                slatMesh.castShadow = true;
                
                this.curtainGroup.add(slatMesh);
            }

        } else if (this.state.model === 'wooden') {
            // WOODEN BLIND
            // Spans the full width, horizontal slats rising and tilting
            const slatHeight = 0.045; // Width of horizontal wooden slat
            const spacing = 0.038; // Slat vertical spacing when closed
            const slatCount = Math.ceil(height / spacing);

            // Slat tilt angle (0 when closed, up to ~70deg when open)
            // But wood blinds also gather (lift up). Let's simulate both:
            // 0% open: flat closed (slats spaced out, tilt = 0)
            // 20% open: tilt opens (slats spaced out, tilt = 75deg)
            // 20%-100% open: slats gather at the top, lifting from bottom
            let tilt = 0;
            let liftProgress = 0;

            if (openness <= 0.25) {
                // Tilt phase
                tilt = (openness / 0.25) * 1.3; // max tilt around 75 deg (1.3 rad)
                liftProgress = 0;
            } else {
                // Lift phase
                tilt = 1.3;
                liftProgress = (openness - 0.25) / 0.75; // 0 to 1
            }

            // Top casing box
            const casingMat = new THREE.MeshStandardMaterial({ color: '#523d2e', roughness: 0.6 });
            const topCase = new THREE.Mesh(new THREE.BoxGeometry(width + 0.02, 0.05, 0.07), casingMat);
            topCase.position.set(0, yTop - 0.025, 0.05);
            this.curtainGroup.add(topCase);

            for (let i = 0; i < slatCount; i++) {
                // Slat starts from top down
                const startY = yTop - 0.05 - (i * spacing);
                
                // Lift calculation: slats stack upwards one by one
                // As liftProgress increases, we pack all slats at the top
                const stackY = yTop - 0.05 - (i * 0.006); // Closely stacked height (6mm thickness)
                const currentY = THREE.MathUtils.lerp(startY, stackY, liftProgress);

                // If a slat would be lower than the window floor bottom, we don't draw it (it's lifted)
                if (currentY < yBottom) continue;

                const slatGeo = new THREE.BoxGeometry(width, 0.003, slatHeight);
                const slatMesh = new THREE.Mesh(slatGeo, curtainMat);
                slatMesh.position.set(0, currentY, 0.05);
                
                // Tilt around the horizontal axis X
                slatMesh.rotation.x = tilt;
                slatMesh.castShadow = true;
                this.curtainGroup.add(slatMesh);
            }
        }
    }

    /**
     * Procedurally deforms flat plane geometry to look like a wavy pleated curtain
     */
    deformCurtainGeometry(geo, width, height, openScale, folds, waveDepth, side) {
        const posAttr = geo.attributes.position;
        const uvAttr = geo.attributes.uv;

        // PlaneGeometry has vertices arranged in rows and cols
        // Vertex x coordinates span from -width/2 to +width/2
        // y spans from -height/2 to +height/2
        // We modify x and z to make pleats
        for (let i = 0; i < posAttr.count; i++) {
            let x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const u = uvAttr.getX(i); // Normalized horizontal coordinate [0, 1]

            // Calculate compressed X coordinates towards the outer anchors
            // Left curtain anchors on left side (outer edge)
            // Right curtain anchors on right side (outer edge)
            let newX;
            if (side === 'left') {
                // Anchor at outer edge (left-most point = -width/2)
                const outerEdge = -width / 2;
                // Span is scaled by openScale
                newX = outerEdge + (u * width * openScale);
            } else {
                // Anchor at outer edge (right-most point = +width/2)
                const outerEdge = width / 2;
                // Span is scaled by openScale and grows leftwards
                newX = outerEdge - ((1 - u) * width * openScale);
            }

            // Wave factor (sine wave along u, bunching up as scale shrinks)
            // When curtain is closed, it's wavy. When fully open (bunching),
            // the waves compress to look tighter. We model this by keeping folds fixed relative to U.
            const waveOffset = Math.sin(u * folds * Math.PI * 2) * waveDepth * Math.min(1.0, openScale * 1.5);

            posAttr.setX(i, newX);
            posAttr.setZ(i, waveOffset);
        }

        // Recompute normals so shading is correct for the wavy surface
        geo.computeVertexNormals();
        geo.attributes.position.needsUpdate = true;
    }

    bindEvents() {
        // Handle sliders updates
        const widthSlider = document.getElementById('input-width');
        const heightSlider = document.getElementById('input-height');
        const openSlider = document.getElementById('input-open');

        const valWidth = document.getElementById('val-width');
        const valHeight = document.getElementById('val-height');
        const valOpen = document.getElementById('val-open');

        widthSlider.addEventListener('input', (e) => {
            this.state.width = parseFloat(e.target.value);
            valWidth.textContent = `${this.state.width.toFixed(1)} m`;
            this.updateCurtains();
            this.calculatePrice();
        });

        heightSlider.addEventListener('input', (e) => {
            this.state.height = parseFloat(e.target.value);
            valHeight.textContent = `${this.state.height.toFixed(1)} m`;
            this.updateCurtains();
            this.calculatePrice();
        });

        openSlider.addEventListener('input', (e) => {
            this.state.openness = parseInt(e.target.value);
            valOpen.textContent = `${this.state.openness}%`;
            this.updateCurtains();
        });

        // Model selector buttons
        const modelBtns = document.querySelectorAll('.select-btn');
        modelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnClicked = e.currentTarget;
                modelBtns.forEach(b => b.classList.remove('active'));
                btnClicked.classList.add('active');

                this.state.model = btnClicked.dataset.model;
                
                // Select appropriate initial material for the model
                if (this.state.model === 'wooden') {
                    this.state.material = 'cedar';
                } else if (this.state.model === 'roller') {
                    this.state.material = 'roller_white';
                } else if (this.state.model === 'vertical') {
                    this.state.material = 'vertical_grey';
                } else {
                    // Wavy model
                    this.state.material = 'linen';
                }

                this.renderMaterialSwatches();
                this.updateCurtains();
                this.calculatePrice();
            });
        });

        // Zoom & Cam buttons
        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            this.camera.position.z = Math.max(2.5, this.camera.position.z - 0.4);
        });
        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            this.camera.position.z = Math.min(7.0, this.camera.position.z + 0.4);
        });
        document.getElementById('btn-reset-cam').addEventListener('click', () => {
            this.camera.position.set(0, 1.8, 5.0);
            this.controls.target.set(0, 1.5, 0);
            this.controls.update();
        });

        // Resize handler
        window.addEventListener('resize', () => {
            if (!this.container) return;
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });

        // Load initial swatches
        this.renderMaterialSwatches();
    }

    renderMaterialSwatches() {
        const swatchesContainer = document.getElementById('materialSwatches');
        if (!swatchesContainer) return;
        swatchesContainer.innerHTML = '';

        const currentModel = this.state.model;

        // Filter materials matching model type
        Object.keys(this.materialsData).forEach(key => {
            const mat = this.materialsData[key];
            const isBlindModel = currentModel === 'roller' || currentModel === 'vertical' || currentModel === 'wooden';
            
            // Match curtains to fabric ('kain') and blinds to 'blind'
            const isMatch = (isBlindModel && mat.type === 'blind') || (!isBlindModel && mat.type === 'kain');

            if (isMatch) {
                const button = document.createElement('button');
                button.className = `swatch-btn ${this.state.material === key ? 'active' : ''}`;
                button.style.backgroundColor = mat.color;
                button.title = mat.name;
                button.dataset.mat = key;

                button.addEventListener('click', (e) => {
                    const btns = swatchesContainer.querySelectorAll('.swatch-btn');
                    btns.forEach(b => b.classList.remove('active'));
                    button.classList.add('active');

                    this.state.material = key;
                    
                    // Update desc label
                    const descEl = document.getElementById('materialDesc');
                    descEl.innerHTML = `<strong>${mat.name}:</strong> ${mat.desc}`;

                    this.updateCurtains();
                    this.calculatePrice();
                });

                swatchesContainer.appendChild(button);
            }
        });

        // Set initial description text
        const activeMat = this.materialsData[this.state.material];
        const descEl = document.getElementById('materialDesc');
        if (activeMat && descEl) {
            descEl.innerHTML = `<strong>${activeMat.name}:</strong> ${activeMat.desc}`;
        }
    }

    calculatePrice() {
        const width = this.state.width;
        const height = this.state.height;
        const matKey = this.state.material;
        const mat = this.materialsData[matKey];
        if (!mat) return;

        let fabricLength = 0;
        let trackLength = 0;
        let totalPrice = 0;

        const estKainLabel = document.getElementById('est-kain');
        const estRelLabel = document.getElementById('est-rel');
        const estHargaLabel = document.getElementById('est-harga');

        if (this.state.model === 'wavy') {
            // Curtains fabric requirement: Fullness factor = 2.4x width
            // Plus header hem allowances, rounded up to next 10cm
            fabricLength = Math.ceil(width * 2.4 * 10) / 10;
            // Curtain track extends 15cm on each side of the window
            trackLength = Math.ceil((width + 0.3) * 10) / 10;

            // Fabric price + track rod cost + ring rings cost
            const fabricCost = fabricLength * mat.price;
            const trackCost = trackLength * 75000; // Track is Rp 75.000 per meter
            const ringsAndHooks = width * 10 * 3000; // ~10 hooks/m at Rp 3.000 each

            totalPrice = fabricCost + trackCost + ringsAndHooks;

            estKainLabel.parentNode.style.display = 'flex';
            estKainLabel.textContent = `${fabricLength.toFixed(1)} meter`;
            
            estRelLabel.parentNode.style.display = 'flex';
            estRelLabel.textContent = `${trackLength.toFixed(1)} meter`;

        } else {
            // Blinds pricing: calculated by Square Meters (m2)
            // Rounded up: minimum billing is 1.0 m2 per blind unit
            const area = width * height;
            const billingArea = Math.ceil(Math.max(1.0, area) * 10) / 10;

            totalPrice = billingArea * mat.price;

            // Hide fabric yardage, show Area estimation instead
            estKainLabel.parentNode.style.display = 'flex';
            estKainLabel.previousElementSibling.textContent = 'Estimasi Luas Area:';
            estKainLabel.textContent = `${billingArea.toFixed(1)} m²`;

            // Hide track length row (blinds have built-in cassette mechanism included in m2 price)
            estRelLabel.parentNode.style.display = 'none';
        }

        // Format to Indonesian Rupiah (IDR) currency format
        const formattedPrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(totalPrice);

        estHargaLabel.textContent = formattedPrice.replace('IDR', 'Rp');

        // Dynamically update checkout booking CTA with configurations details
        const ctaBtn = document.getElementById('btn-pesan-visualizer');
        if (ctaBtn) {
            ctaBtn.onclick = () => {
                const messageText = `Halo GordenKu, saya ingin memesan Gorden dari simulasi 3D website:%0A- Jenis: ${this.state.model.toUpperCase()}%0A- Bahan: ${mat.name}%0A- Lebar: ${width} m%0A- Tinggi: ${height} m%0A- Estimasi Harga: ${formattedPrice}`;
                window.open(`https://wa.me/6287862235401?text=${messageText}`, '_blank');
            };
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update controls
        this.controls.update();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
    window.curtainVisualizer = new CurtainVisualizer();
});
