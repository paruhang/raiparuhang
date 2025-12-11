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
    contactForm.addEventListener('submit', async (e) => {
        // 1. Stop the browser from navigating away
        e.preventDefault();
        
        // 2. Collect all the form fields and values
        const formData = new FormData(contactForm);
        
        // 3. Optional: Add a visual loading state here (e.g., disable the button)
        // contactForm.querySelector('button[type="submit"]').disabled = true;

        // 4. Send the data to Getform
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST', 
                body: formData, 
                // Setting 'Accept' header for JSON response from Getform
                headers: { 'Accept': 'application/json' } 
            });

            // 5. Handle the response and provide feedback
            if (response.ok) {
                alert('Thank you! Your message has been sent successfully.');
                contactForm.reset(); // Clear form fields
            } else {
                // If Getform rejected the submission (e.g., due to configuration)
                alert('Submission failed. Please check the form data and your Getform settings.');
            }
        } catch (error) {
            // Handle network errors (user offline, server unreachable)
            console.error('Network Error:', error);
            alert('A connection error occurred. Please try again.');
        } 
        // 6. Optional: Re-enable the button if you added a loading state
        // finally {
        //     contactForm.querySelector('button[type="submit"]').disabled = false;
        // }
    });
}





});
