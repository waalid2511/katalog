/**
 * AR Camera Logic
 * Implements getUserMedia to show a live camera feed and overlays curtain images.
 */

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('arVideo');
    const canvas = document.getElementById('arCanvas');
    const startOverlay = document.getElementById('arStartOverlay');
    const arControls = document.getElementById('arControls');
    const btnStartAR = document.getElementById('btnStartAR');
    const btnStopAR = document.getElementById('btnStopAR');
    const btnArScreenshot = document.getElementById('btnArScreenshot');
    const arModelBtns = document.querySelectorAll('.btn-ar-model');

    let stream = null;
    let ctx = null;
    let currentImage = null;
    let imgObj = new Image();
    let isArRunning = false;

    // Overlay position and size defaults
    let baseRect = { width: 300, height: 400 };
    let overlayRect = {
        x: 0,
        y: 0,
        width: 300,
        height: 400
    };
    
    // Sliders
    const widthSlider = document.getElementById('arWidthSlider');
    const heightSlider = document.getElementById('arHeightSlider');

    if (canvas) {
        ctx = canvas.getContext('2d');
    }

    // Initialize global onload for the curtain image
    imgObj.onload = () => {
        if (canvas && canvas.width && imgObj.width) {
            baseRect.height = (baseRect.width / imgObj.width) * imgObj.height;
            if (typeof updateScale === 'function') updateScale();
        }
    };

    // Initialize with first image
    if (arModelBtns.length > 0) {
        currentImage = arModelBtns[0].dataset.img;
        imgObj.src = currentImage;
    }

    // Function to start camera
    const startCamera = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment" // Use back camera if available
                }
            });
            
            // Show UI and video immediately so mobile browsers don't block video rendering
            startOverlay.style.display = 'none';
            video.style.display = 'block';
            arControls.style.display = 'flex';
            
            video.srcObject = stream;
            video.play().catch(e => console.warn("Auto-play prevented:", e));
            isArRunning = true;
            
            // Wait a moment for DOM to reflow and video to start streaming before resizing
            setTimeout(() => {
                resizeCanvas();
                // Start drawing loop if not already started
                requestAnimationFrame(drawLoop);
            }, 300);

            // Also resize perfectly once video metadata (dimensions) is loaded
            video.onloadedmetadata = () => {
                resizeCanvas();
            };
        } catch (err) {
            console.error("Error accessing camera: ", err);
            startOverlay.style.display = 'flex';
            video.style.display = 'none';
            arControls.style.display = 'none';
            alert("Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.");
        }
    };

    // Function to stop camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        isArRunning = false;
        
        // UI updates
        video.style.display = 'none';
        arControls.style.display = 'none';
        startOverlay.style.display = 'flex';
        
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const updateScale = () => {
        if (!baseRect.width) return;
        const oldW = overlayRect.width;
        const oldH = overlayRect.height;
        
        overlayRect.width = baseRect.width * (widthSlider ? widthSlider.value : 1);
        overlayRect.height = baseRect.height * (heightSlider ? heightSlider.value : 1);
        
        // keep it centered based on previous position
        overlayRect.x -= (overlayRect.width - oldW) / 2;
        overlayRect.y -= (overlayRect.height - oldH) / 2;
    };

    if (widthSlider) widthSlider.addEventListener('input', updateScale);
    if (heightSlider) heightSlider.addEventListener('input', updateScale);

    const resizeCanvas = () => {
        if (!video || !canvas) return;
        
        // Use container size or window size as fallback if video size is still 0
        const container = document.getElementById('arViewContainer');
        canvas.width = video.clientWidth || (container ? container.clientWidth : window.innerWidth) || 400;
        canvas.height = video.clientHeight || (container ? container.clientHeight : window.innerHeight) || 300;

        // Set initial overlay rect relative to canvas size
        baseRect.width = canvas.width * 0.6;
        
        // Prevent NaN if image hasn't loaded yet
        if (imgObj.width && imgObj.height) {
            baseRect.height = (baseRect.width / imgObj.width) * imgObj.height;
        } else {
            baseRect.height = canvas.height * 0.7; // fallback
        }
        
        overlayRect.width = baseRect.width;
        overlayRect.height = baseRect.height;
        overlayRect.x = (canvas.width - overlayRect.width) / 2;
        overlayRect.y = (canvas.height - overlayRect.height) / 2;
        
        // apply any active slider scale
        if (widthSlider) widthSlider.value = 1;
        if (heightSlider) heightSlider.value = 1;
        updateScale();
    };

    // Handle window resize
    window.addEventListener('resize', () => {
        if (isArRunning) {
            resizeCanvas();
        }
    });

    const drawLoop = () => {
        if (!isArRunning) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the curtain image
        if (imgObj.complete && imgObj.src) {
            // Memberikan sedikit transparansi (misal 0.95) agar terlihat lebih menyatu dengan pencahayaan sekitar (blending)
            ctx.globalAlpha = 0.92;
            ctx.drawImage(imgObj, overlayRect.x, overlayRect.y, overlayRect.width, overlayRect.height);
            ctx.globalAlpha = 1.0; // Reset
        }
        
        requestAnimationFrame(drawLoop);
    };

    // Events
    if (btnStartAR) {
        btnStartAR.addEventListener('click', startCamera);
    }

    if (btnStopAR) {
        btnStopAR.addEventListener('click', stopCamera);
    }

    // Model selection
    arModelBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            arModelBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            currentImage = e.target.dataset.img;
            // Note: imgObj.onload is now handled globally above
            imgObj.src = currentImage;
        });
    });

    // Touch/Mouse events for dragging the curtain
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let overlayStart = { x: 0, y: 0 };

    const getEventPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const isInsideOverlay = (pos) => {
        return pos.x >= overlayRect.x && pos.x <= overlayRect.x + overlayRect.width &&
               pos.y >= overlayRect.y && pos.y <= overlayRect.y + overlayRect.height;
    };

    const handlePointerDown = (e) => {
        if (!isArRunning) return;
        const pos = getEventPos(e);
        if (isInsideOverlay(pos)) {
            isDragging = true;
            dragStart = pos;
            overlayStart = { x: overlayRect.x, y: overlayRect.y };
            e.preventDefault();
        }
    };

    const handlePointerMove = (e) => {
        if (!isDragging || !isArRunning) return;
        const pos = getEventPos(e);
        const dx = pos.x - dragStart.x;
        const dy = pos.y - dragStart.y;
        
        overlayRect.x = overlayStart.x + dx;
        overlayRect.y = overlayStart.y + dy;
        e.preventDefault();
    };

    const handlePointerUp = () => {
        isDragging = false;
    };

    // Enable pointer events on canvas when AR is running
    canvas.style.pointerEvents = 'auto';

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    // Screenshot functionality
    if (btnArScreenshot) {
        btnArScreenshot.addEventListener('click', () => {
            if (!isArRunning) return;
            
            // Create a temporary canvas to combine video and overlay
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw video first
            tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
            // Draw overlay on top
            tempCtx.drawImage(canvas, 0, 0);
            
            // Download the image
            const dataUrl = tempCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `GordenKu-AR-${new Date().getTime()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }
});
