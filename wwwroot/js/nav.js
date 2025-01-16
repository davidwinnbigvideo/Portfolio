document.addEventListener('DOMContentLoaded', () => {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    mobileNavToggle?.addEventListener('click', () => {
        const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
        mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
        mobileNavToggle.classList.toggle('active');
        navLinks.classList.toggle('active');

        // Prevent body scrolling when menu is open
        document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
    });

    // Close menu when clicking a link
    navLinks?.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            mobileNavToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
            mobileNavToggle.setAttribute('aria-expanded', 'false');
        }
    });
});