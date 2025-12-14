document.addEventListener('DOMContentLoaded', function() {
    console.log("On main index page");
    // Handle main dashboard functionality
    const statusBtn = document.getElementById('status-btn');
    const formBtn = document.getElementById('form-btn');
    
    if (statusBtn && formBtn) {
        statusBtn.addEventListener('click', function(e) {
            // Already using href for navigation, just add a small delay for ripple effect
            const href = this.getAttribute('href');
            if (href) {
                e.preventDefault();
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
        
        formBtn.addEventListener('click', function(e) {
            // Already using href for navigation, just add a small delay for ripple effect
            const href = this.getAttribute('href');
            if (href) {
                e.preventDefault();
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
    }
});