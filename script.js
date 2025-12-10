document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-list a');

    // 1. Mobile Menu Toggle Functionality
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('open');
    });

    // 2. Close menu when a link is clicked (important for mobile UX)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Check if the menu is open before closing
            if (mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
            }
        });
    });

    // 3. Simple Active Link Indicator (Optional: Adds 'active' class to current section link)
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY;

        sections.forEach(section => {
            // Get the top offset of the section, minus a fixed header height for accuracy
            const sectionTop = section.offsetTop - 70;
            const sectionHeight = section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // 4. Contact Form Submission (Prevent default behavior for demonstration)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Form submitted successfully! (This is a placeholder action.)');
            // In a real application, you would add AJAX/Fetch API code here 
            // to send the form data to a server (e.g., using a service like Formspree, Netlify Forms, or your own backend).
            contactForm.reset();
        });
    }





});
