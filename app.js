/**
 * GordenKu main application logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 0. Images are loaded from assets/ folder (no procedural generation)

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
