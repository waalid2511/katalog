/**
 * GordenKu main application logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 0. Procedural Image Placeholders Generator
    const generateProceduralImages = () => {
        const imagesToGenerate = document.querySelectorAll('img[data-prod], img[data-port], img[data-blog]');
        
        imagesToGenerate.forEach(img => {
            const canvas = document.createElement('canvas');
            let w = 600, h = 450;
            
            if (img.dataset.blog) {
                w = 800;
                h = 500;
            }
            
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            
            // Draw background gradient
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            
            // Determine styling based on type
            if (img.dataset.prod) {
                const prod = img.dataset.prod;
                if (prod === 'minimalis') {
                    // Linen cream
                    grad.addColorStop(0, '#fbfaf7');
                    grad.addColorStop(1, '#e8e2d5');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, w, h);
                    
                    // Draw light curtains draping
                    ctx.strokeStyle = 'rgba(197, 168, 128, 0.4)';
                    ctx.lineWidth = 2;
                    for (let x = 50; x < w - 50; x += 30) {
                        ctx.beginPath();
                        ctx.moveTo(x, 40);
                        ctx.quadraticCurveTo(x + 10, h/2, x, h - 40);
                        ctx.stroke();
                        // Shade
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                        ctx.fillRect(x - 5, 40, 10, h - 80);
                    }
                } else if (prod === 'blackout') {
                    // Dark warm mocha
                    grad.addColorStop(0, '#2d2520');
                    grad.addColorStop(1, '#130e0b');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, w, h);
                    
                    // Heavy deep pleats
                    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
                    ctx.lineWidth = 4;
                    for (let x = 60; x < w - 60; x += 40) {
                        ctx.beginPath();
                        ctx.moveTo(x, 30);
                        ctx.quadraticCurveTo(x - 15, h/2, x, h - 30);
                        ctx.stroke();
                        // Shadows
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                        ctx.fillRect(x, 30, 20, h - 60);
                    }
                } else if (prod === 'premium') {
                    // Gold + dark velvet green
                    grad.addColorStop(0, '#10261f');
                    grad.addColorStop(1, '#050a08');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, w, h);
                    
                    // Draw luxurious drapes with golden borders
                    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
                    ctx.lineWidth = 3;
                    for (let x = 80; x < w - 80; x += 50) {
                        ctx.beginPath();
                        ctx.moveTo(x, 30);
                        ctx.bezierCurveTo(x + 20, h/3, x - 20, h*2/3, x, h - 30);
                        ctx.stroke();
                    }
                    // Gold border at the bottom
                    ctx.fillStyle = '#d4af37';
                    ctx.fillRect(40, h - 45, w - 80, 5);
                } else if (prod === 'roller') {
                    // Modern grey
                    grad.addColorStop(0, '#ececec');
                    grad.addColorStop(1, '#cfcfcf');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, w, h);
                    
                    // Window outline
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
                    ctx.lineWidth = 10;
                    ctx.strokeRect(80, 60, w - 160, h - 120);
                    
                    // Roller blind cassette and sheet
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(75, 55, w - 150, 25); // Top housing
                    ctx.fillStyle = '#fdfdfd';
                    ctx.fillRect(90, 80, w - 180, h * 0.45); // Blind pulled down
                    ctx.fillStyle = '#e6e6e6';
                    ctx.fillRect(90, 80 + h * 0.45, w - 180, 10); // Bottom weight bar
                } else if (prod === 'vertical') {
                    // Slate background
                    grad.addColorStop(0, '#e3e4e6');
                    grad.addColorStop(1, '#bebfcc');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, w, h);
                    
                    // Track
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(80, 50, w - 160, 15);
                    
                    // Vertical slats
                    ctx.fillStyle = 'rgba(100, 105, 115, 0.85)';
                    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                    ctx.lineWidth = 1;
                    const slatW = 22;
                    for (let x = 90; x < w - 90; x += 28) {
                        ctx.fillRect(x, 65, slatW, h - 130);
                        ctx.strokeRect(x, 65, slatW, h - 130);
                    }
                } else if (prod === 'wooden') {
                    // Warm background
                    grad.addColorStop(0, '#fdfbf7');
                    grad.addColorStop(1, '#eae5db');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, w, h);
                    
                    // Horizontal wooden slats
                    ctx.fillStyle = '#bd885c';
                    ctx.strokeStyle = '#916139';
                    ctx.lineWidth = 1;
                    for (let y = 60; y < h - 60; y += 22) {
                        ctx.fillRect(80, y, w - 160, 12);
                        ctx.strokeRect(80, y, w - 160, 12);
                        // Wood grain highlights
                        ctx.fillStyle = '#cf9d72';
                        ctx.fillRect(100, y + 2, w - 200, 2);
                        ctx.fillStyle = '#bd885c'; // reset
                    }
                    // Blinds ropes
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(w/3, 50); ctx.lineTo(w/3, h - 50);
                    ctx.moveTo(w*2/3, 50); ctx.lineTo(w*2/3, h - 50);
                    ctx.stroke();
                } else if (prod === 'hotel') {
                    // Hotel deep warm gold room
                    grad.addColorStop(0, '#2b221a');
                    grad.addColorStop(1, '#110d0a');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, w, h);
                    
                    // White sheer overlay in center
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.fillRect(120, 40, w - 240, h - 80);
                    
                    // Golden heavy curtain on sides
                    const gGrad = ctx.createLinearGradient(0, 0, w, 0);
                    gGrad.addColorStop(0, '#dfcfab');
                    gGrad.addColorStop(0.5, '#bda574');
                    gGrad.addColorStop(1, '#8f7748');
                    ctx.fillStyle = gGrad;
                    // Left curtain bunch
                    ctx.fillRect(40, 40, 80, h - 80);
                    // Right curtain bunch
                    ctx.fillRect(w - 120, 40, 80, h - 80);
                } else if (prod === 'office') {
                    // Zebra blinds
                    grad.addColorStop(0, '#f5f5f5');
                    grad.addColorStop(1, '#dbdbdb');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, w, h);
                    
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
                    ctx.lineWidth = 8;
                    ctx.strokeRect(70, 50, w - 140, h - 100);
                    
                    // Zebra stripes
                    ctx.fillStyle = '#ffffff'; // light stripe
                    ctx.fillRect(80, 60, w - 160, h - 120);
                    
                    ctx.fillStyle = 'rgba(60, 62, 68, 0.85)'; // solid stripes
                    for (let y = 70; y < h - 70; y += 40) {
                        ctx.fillRect(80, y, w - 160, 20);
                    }
                }
            } else if (img.dataset.port) {
                const port = img.dataset.port;
                // Dark slate luxury theme for portfolio vectors
                grad.addColorStop(0, '#1c1f24');
                grad.addColorStop(1, '#0e1013');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
                
                // Draw decorative room outlines
                ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
                ctx.lineWidth = 1;
                
                if (port.includes('rumah')) {
                    // Living room outline
                    ctx.strokeRect(100, 80, w - 200, h - 160);
                    // Sofa silhouette
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
                    ctx.fillRect(150, h - 160, w - 300, 80);
                    // Curtains framing
                    ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
                    ctx.fillRect(70, 60, 50, h - 120);
                    ctx.fillRect(w - 120, 60, 50, h - 120);
                } else if (port.includes('villa')) {
                    // Tropical pool view
                    const sky = ctx.createLinearGradient(0, 80, 0, h - 120);
                    sky.addColorStop(0, '#2a4d69');
                    sky.addColorStop(1, '#4b86b4');
                    ctx.fillStyle = sky;
                    ctx.fillRect(120, 80, w - 240, h - 160);
                    // Palm tree silhouette
                    ctx.fillStyle = '#adcbe3';
                    ctx.font = '70px serif';
                    ctx.fillText('🌴', 140, h - 100);
                    // Floating sheer curtains
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(90, 60, 60, h - 120);
                    ctx.fillRect(w - 150, 60, 60, h - 120);
                } else if (port.includes('hotel')) {
                    // Bed outline
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.strokeRect(120, 60, w - 240, h - 120);
                    ctx.fillStyle = 'rgba(212, 175, 55, 0.03)';
                    ctx.fillRect(180, h - 180, w - 360, 100);
                    // Large curtains
                    ctx.fillStyle = 'rgba(74, 85, 104, 0.4)';
                    ctx.fillRect(70, 40, 80, h - 80);
                    ctx.fillRect(w - 150, 40, 80, h - 80);
                } else if (port.includes('kantor')) {
                    // Conference table
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.strokeRect(100, 60, w - 200, h - 120);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                    ctx.beginPath();
                    ctx.ellipse(w/2, h - 100, 120, 30, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Wooden blinds drawing
                    ctx.fillStyle = 'rgba(189, 136, 92, 0.3)';
                    for (let y = 80; y < h - 140; y += 15) {
                        ctx.fillRect(110, y, w - 220, 8);
                    }
                } else if (port.includes('toko')) {
                    // Cafe shop coffee cups
                    ctx.strokeRect(120, 60, w - 240, h - 120);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                    ctx.font = '80px serif';
                    ctx.fillText('☕', w/2 - 40, h/2 + 20);
                    // Roller shade pulled down slightly
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillRect(100, 45, w - 200, 15);
                    ctx.fillStyle = 'rgba(240, 240, 240, 0.2)';
                    ctx.fillRect(110, 60, w - 220, 80);
                }
            } else if (img.dataset.blog) {
                const blog = img.dataset.blog;
                // Modern architectural blueprints style
                grad.addColorStop(0, '#101726');
                grad.addColorStop(1, '#080c14');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
                
                ctx.strokeStyle = '#1e2d4a';
                ctx.lineWidth = 1;
                // Draw grid lines
                for (let x = 0; x < w; x += 40) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
                }
                for (let y = 0; y < h; y += 40) {
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
                }
                
                ctx.strokeStyle = '#d4af37';
                ctx.lineWidth = 2;
                
                if (blog === 'blog1') {
                    // Room floor plan or layout grids
                    ctx.strokeRect(160, 100, w - 320, h - 200);
                    ctx.strokeRect(200, 130, w - 400, h - 260);
                    // Dimension lines
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.beginPath();
                    ctx.moveTo(160, 75); ctx.lineTo(w - 160, 75);
                    ctx.moveTo(160, 70); ctx.lineTo(160, 80);
                    ctx.moveTo(w - 160, 70); ctx.lineTo(w - 160, 80);
                    ctx.stroke();
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '14px sans-serif';
                    ctx.fillText('LEBAR JENDELA (W)', w/2 - 60, 70);
                } else if (blog === 'blog2') {
                    // Color swatches palettes diagram
                    const colors = ['#c28c5f', '#1a2942', '#dfcfab', '#0f382a', '#f3f3f3'];
                    colors.forEach((col, idx) => {
                        ctx.fillStyle = col;
                        ctx.fillRect(120 + (idx * 110), 150, 90, 180);
                        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                        ctx.strokeRect(120 + (idx * 110), 150, 90, 180);
                        // Shade code
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '12px Courier';
                        ctx.fillText(col, 130 + (idx * 110), 310);
                    });
                } else if (blog === 'blog3') {
                    // Light transmission curves diagram
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.strokeRect(160, 100, w - 320, h - 200);
                    
                    // Sheer, Dimout, Blackout graphs
                    ctx.lineWidth = 3;
                    // Blackout (Flat zero line)
                    ctx.strokeStyle = '#4e3f35';
                    ctx.beginPath();
                    ctx.moveTo(180, h/2 + 80);
                    ctx.lineTo(w - 180, h/2 + 80);
                    ctx.stroke();
                    
                    // Dimout (Half bell curve)
                    ctx.strokeStyle = '#c28c5f';
                    ctx.beginPath();
                    ctx.moveTo(180, h/2 + 80);
                    ctx.bezierCurveTo(w/2 - 50, h/2 + 80, w/2 + 50, h/2 - 20, w - 180, h/2 - 20);
                    ctx.stroke();
                    
                    // Sheer (High light curve)
                    ctx.strokeStyle = '#dfcfab';
                    ctx.beginPath();
                    ctx.moveTo(180, h/2 + 30);
                    ctx.bezierCurveTo(w/2 - 50, h/2 - 40, w/2 + 50, h/2 - 70, w - 180, h/2 - 70);
                    ctx.stroke();
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '12px sans-serif';
                    ctx.fillText('100% Light', 170, 120);
                    ctx.fillText('0% Light (Blackout)', 170, h - 120);
                }
            }
            
            // Assign as DataURL
            img.src = canvas.toDataURL('image/jpeg', 0.9);
        });
    };

    // Run graphics generator
    generateProceduralImages();

    // 1. Initialize Icons
    lucide.createIcons();

    // 2. Mobile Nav Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            // Toggle icon menu / x
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });

        // Close menu when link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                const icon = navToggle.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }

    // 3. Scroll Header Class & Active Link Highlighting
    const header = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        // Change header look on scroll
        if (scrollPos > 50) {
            document.body.classList.add('dark-header');
        } else {
            document.body.classList.remove('dark-header');
        }

        // Active link tracking
        let currentSectionId = 'home';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                currentSectionId = id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // 4. Before & After Split Image Slider
    const sliderContainer = document.getElementById('sliderContainer');
    const afterImageContainer = document.getElementById('afterImageContainer');
    const sliderHandle = document.getElementById('sliderHandle');

    if (sliderContainer && afterImageContainer && sliderHandle) {
        let isSliding = false;

        // Function to update the split position based on page coordinates
        const updateSlider = (clientX) => {
            const rect = sliderContainer.getBoundingClientRect();
            // Calculate relative offset within the container bounds
            let offsetX = clientX - rect.left;
            
            // Constrain within container bounds
            if (offsetX < 0) offsetX = 0;
            if (offsetX > rect.width) offsetX = rect.width;

            // Percentage value
            const percent = (offsetX / rect.width) * 100;

            // Set styles
            afterImageContainer.style.width = `${percent}%`;
            sliderHandle.style.left = `${percent}%`;
        };

        // Align inner "after" image size with the outer container size dynamically
        const adjustAfterImgSize = () => {
            const rect = sliderContainer.getBoundingClientRect();
            const afterImg = afterImageContainer.querySelector('img');
            if (afterImg) {
                afterImg.style.width = `${rect.width}px`;
            }
        };

        // Run initially and on resize
        adjustAfterImgSize();
        window.addEventListener('resize', adjustAfterImgSize);

        // Mouse Events
        sliderContainer.addEventListener('mousedown', (e) => {
            isSliding = true;
            updateSlider(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            isSliding = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isSliding) return;
            updateSlider(e.clientX);
        });

        // Touch Events (for Mobile devices)
        sliderContainer.addEventListener('touchstart', (e) => {
            isSliding = true;
            updateSlider(e.touches[0].clientX);
        });

        window.addEventListener('touchend', () => {
            isSliding = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isSliding) return;
            updateSlider(e.touches[0].clientX);
        });
    }

    // 5. Catalog Category Tab Filter
    const catalogTabs = document.querySelectorAll('.tab-btn');
    const productGrid = document.getElementById('productGrid');
    
    if (catalogTabs.length > 0 && productGrid) {
        const products = productGrid.querySelectorAll('.product-card');

        catalogTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;

                catalogTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                products.forEach(prod => {
                    const category = prod.dataset.category;
                    if (filter === 'all' || category === filter) {
                        prod.style.display = 'flex';
                    } else {
                        prod.style.display = 'none';
                    }
                });
            });
        });
    }

    // 6. Portfolio Category Filter
    const portfolioTabs = document.querySelectorAll('.portfolio-filter-btn');
    const portfolioGrid = document.getElementById('portfolioGrid');

    if (portfolioTabs.length > 0 && portfolioGrid) {
        const cards = portfolioGrid.querySelectorAll('.portfolio-card');

        portfolioTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;

                portfolioTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                cards.forEach(card => {
                    const category = card.dataset.category;
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // 7. Catalog & Button Click WhatsApp Direct Order
    const catalogOrderBtns = document.querySelectorAll('.btn-order-product');
    catalogOrderBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = e.target.dataset.name;
            const message = `Halo GordenKu, saya melihat katalog di website Anda dan tertarik untuk bertanya/memesan produk: *${productName}*. Mohon informasi lebih lanjut.`;
            window.open(`https://wa.me/6287862235401?text=${encodeURIComponent(message)}`, '_blank');
        });
    });

    // 8. Survey Booking Form Handler
    const surveyForm = document.getElementById('surveyForm');
    if (surveyForm) {
        surveyForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const date = document.getElementById('date').value;
            const address = document.getElementById('address').value.trim();

            // Format date to local readable format (e.g. DD-MM-YYYY)
            let formattedDate = date;
            if (date) {
                const parts = date.split('-');
                if (parts.length === 3) {
                    formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            // Create WhatsApp message string
            const message = `Halo GordenKu, saya ingin menjadwalkan *Survey Pengukuran Gorden Gratis* melalui website:%0A%0A` +
                            `- *Nama Lengkap:* ${name}%0A` +
                            `- *No. WhatsApp:* ${phone}%0A` +
                            `- *Tanggal Survey:* ${formattedDate}%0A` +
                            `- *Alamat Lengkap:* ${address}%0A%0A` +
                            `Mohon konfirmasi ketersediaan jadwal tim survei Anda. Terima kasih!`;

            // Redirect to WhatsApp API
            window.open(`https://wa.me/6287862235401?text=${message}`, '_blank');
        });
    }
    
    // Set default date for survey picker to tomorrow
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
        dateInput.min = `${yyyy}-${mm}-${dd}`; // Restrict picking past dates
    }
});
