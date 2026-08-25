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
    let overlayRect = {
        x: 0,
        y: 0,
        width: 300,
        height: 400
    };

    if (canvas) {
        ctx = canvas.getContext('2d');
    }

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
            
            video.srcObject = stream;
            
            video.onloadedmetadata = () => {
                video.play();
                isArRunning = true;
                
                // Adjust canvas size to match video
                resizeCanvas();
                
                // Start drawing loop
                requestAnimationFrame(drawLoop);

                // UI updates
                startOverlay.style.display = 'none';
                video.style.display = 'block';
                arControls.style.display = 'flex';
            };
        } catch (err) {
            console.error("Error accessing camera: ", err);
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

    const resizeCanvas = () => {
        if (!video || !canvas) return;
        
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        // Set initial overlay rect relative to canvas size
        overlayRect.width = canvas.width * 0.6;
        overlayRect.height = (overlayRect.width / imgObj.width) * imgObj.height;
        if (isNaN(overlayRect.height)) overlayRect.height = canvas.height * 0.7; // fallback
        
        overlayRect.x = (canvas.width - overlayRect.width) / 2;
        overlayRect.y = (canvas.height - overlayRect.height) / 2;
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
            ctx.drawImage(imgObj, overlayRect.x, overlayRect.y, overlayRect.width, overlayRect.height);
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
            imgObj.src = currentImage;
            
            // Re-adjust ratio when new image loads
            imgObj.onload = () => {
                if (canvas.width) {
                    overlayRect.height = (overlayRect.width / imgObj.width) * imgObj.height;
                }
            };
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
