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

    // 3. Simple Active Link Indicator (Adds 'active' class to current section link)
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let current = '';
        // Adjusted the buffer value (70) to be a constant
        const HEADER_HEIGHT_BUFFER = 70; 
        const scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - HEADER_HEIGHT_BUFFER;
            const sectionHeight = section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            // Check if the href (e.g., '#contact') contains the current section ID ('contact')
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // 4. Contact Form Submission (Simplified using promise-based fetch)
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // Stop the browser from navigating away
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            
            // Send the data using fetch
            fetch(contactForm.action, {
                method: 'POST', 
                body: formData, 
                headers: { 'Accept': 'application/json' } 
            })
            .then(response => {
                if (response.ok) {
                    alert('Thank you! Your message has been sent successfully.');
                    contactForm.reset(); // Clear form fields
                } else {
                    alert('Submission failed. Please check the form data.');
                }
            })
            .catch(error => {
                // Handle network errors
                console.error('Network Error:', error);
                alert('A connection error occurred. Please try again.');
            });
        });
    }
});