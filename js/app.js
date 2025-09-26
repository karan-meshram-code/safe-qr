// Main application JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Handle navigation active states
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentLocation.endsWith(linkPath)) {
            link.classList.add('active');
        } else if (currentLocation.endsWith('/') && linkPath === 'index.html') {
            link.classList.add('active');
        }
    });
    
    // Add animation to feature cards on home page
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length > 0) {
        // Use Intersection Observer to trigger animations when cards are in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        featureCards.forEach(card => {
            observer.observe(card);
        });
    }

    // Check if SVG illustration needs to be loaded on home page
    if (document.querySelector('.hero-image')) {
        // Create fallback image if SVG loading fails
        const heroImage = document.querySelector('.hero-image');
        heroImage.onerror = function() {
            this.src = 'assets/hero-image-fallback.png';
        };
        
        // Load actual SVG if one doesn't exist yet
        if (!heroImage.getAttribute('src') || heroImage.getAttribute('src').includes('hero-image.svg')) {
            heroImage.src = createQRSvgDataUrl();
        }
    }
});

// Generate an SVG for the hero image on the home page
function createQRSvgDataUrl() {
    // Create a simple QR code-like SVG as a data URL
    const qrSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <rect x="0" y="0" width="300" height="300" fill="#4361ee" rx="15" ry="15" />
        <g fill="#ffffff">
            <!-- QR Code style pattern -->
            <rect x="30" y="30" width="60" height="60" rx="5" ry="5" />
            <rect x="40" y="40" width="40" height="40" fill="#4361ee" rx="5" ry="5" />
            <rect x="50" y="50" width="20" height="20" fill="#ffffff" rx="2" ry="2" />
            
            <rect x="210" y="30" width="60" height="60" rx="5" ry="5" />
            <rect x="220" y="40" width="40" height="40" fill="#4361ee" rx="5" ry="5" />
            <rect x="230" y="50" width="20" height="20" fill="#ffffff" rx="2" ry="2" />
            
            <rect x="30" y="210" width="60" height="60" rx="5" ry="5" />
            <rect x="40" y="220" width="40" height="40" fill="#4361ee" rx="5" ry="5" />
            <rect x="50" y="230" width="20" height="20" fill="#ffffff" rx="2" ry="2" />
            
            <!-- Medical cross in center -->
            <rect x="130" y="110" width="40" height="80" rx="5" ry="5" />
            <rect x="110" y="130" width="80" height="40" rx="5" ry="5" />
            
            <!-- Random QR code-like patterns -->
            <rect x="110" y="30" width="20" height="20" rx="3" ry="3" />
            <rect x="170" y="50" width="20" height="20" rx="3" ry="3" />
            <rect x="30" y="110" width="20" height="20" rx="3" ry="3" />
            <rect x="70" y="150" width="20" height="20" rx="3" ry="3" />
            <rect x="210" y="170" width="20" height="20" rx="3" ry="3" />
            <rect x="250" y="130" width="20" height="20" rx="3" ry="3" />
            <rect x="170" y="210" width="20" height="20" rx="3" ry="3" />
            <rect x="210" y="230" width="20" height="20" rx="3" ry="3" />
        </g>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(qrSvg)}`;
} 