// Use an IIFE (Immediately Activated Function Expression) for code encapsulation.
(function() {
    
    // --- Configuration and State ---
    const QR_OPTIONS = {
        width: 400, // Generated image size for high quality
        margin: 2,  // Margin around the QR code
        errorCorrectionLevel: 'H' // High correction level for better reliability
    };

    let debounceTimer; // Used to prevent excessive QR generation while typing

    // Cache DOM elements
    const elements = {
        qrTextarea: document.getElementById('qr-text'),
        darkColorInput: document.getElementById('dark-color'),
        lightColorInput: document.getElementById('light-color'),
        darkColorLabel: document.getElementById('dark-color-label'),
        lightColorLabel: document.getElementById('light-color-label'),
        qrBox: document.getElementById('qr-box'),
        emptyMessage: document.getElementById('empty-message'),
        errorMessage: document.getElementById('error-message'),
        charCount: document.getElementById('char-count'),
        downloadBtn: document.getElementById('download-btn'),
        copyBtn: document.getElementById('copy-btn'),
        copyIcon: document.querySelector('#copy-btn .copy-icon'),
        checkIcon: document.querySelector('#copy-btn .check-icon'),
        btnTextSpan: document.querySelector('#copy-btn .btn-text'),
        mainNav: document.querySelector('.main-nav'),
        menuToggle: document.querySelector('.menu-toggle')
    };
    
    // --- Utility Functions ---

    /**
     * Toggles the mobile navigation menu.
     */
    function toggleMobileMenu() {
        elements.mainNav.classList.toggle('open');
    }

    /**
     * Sets the loading state on the UI elements.
     * @param {boolean} isLoading 
     */
    function setLoading(isLoading) {
        // Disable buttons if loading or if no text is entered
        elements.downloadBtn.disabled = isLoading || elements.qrTextarea.value.trim() === '';
        elements.copyBtn.disabled = isLoading || elements.qrTextarea.value.trim() === '';
    }

    /**
     * Displays a specific UI state (Empty, Image, Error).
     * @param {'empty' | 'image' | 'error'} state 
     * @param {string} [message] - Message for the error state.
     */
    function setUIState(state, message = '') {
        const isImage = state === 'image';
        const isError = state === 'error';
        const isEmpty = state === 'empty';

        elements.emptyMessage.classList.toggle('hidden', !isEmpty);
        elements.errorMessage.classList.toggle('hidden', !isError);
        
        if (isError) {
            elements.errorMessage.textContent = message;
            elements.qrBox.innerHTML = ''; // Clear QR code on error
        } else if (isEmpty) {
            elements.qrBox.innerHTML = '';
        }

        // The download/copy buttons are enabled only if an image is visible (isImage is true)
        setLoading(!isImage); 
    }
    
    // --- Core QR Generation Logic ---

    /**
     * Handles all input events and triggers the debounced generation.
     */
    function handleInput() {
        // Update labels and counts immediately
        const text = elements.qrTextarea.value.trim();
        elements.charCount.textContent = text.length;
        elements.darkColorLabel.textContent = elements.darkColorInput.value.toUpperCase();
        elements.lightColorLabel.textContent = elements.lightColorInput.value.toUpperCase();

        // Debounce: clear existing timer and set a new one
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generateQR, 300);
    }

    /**
     * Generates the QR code based on current input and color settings.
     */
    async function generateQR() {
        const text = elements.qrTextarea.value.trim();
        const darkColor = elements.darkColorInput.value;
        const lightColor = elements.lightColorInput.value;

        if (!text) {
            setUIState('empty');
            return;
        }

        setLoading(true);

        try {
            // Use QRCode.toDataURL to get a Base64 image string
            const dataUrl = await QRCode.toDataURL(text, {
                ...QR_OPTIONS,
                color: {
                    dark: darkColor,
                    light: lightColor
                }
            });

            elements.qrBox.innerHTML = `<img src="${dataUrl}" alt="Generated QR Code for ${text.substring(0, 50)}">`;
            setUIState('image');

        } catch (err) {
            console.error("QR Generation Error:", err);
            setUIState('error', "Generation failed. Try shorter content or different colors.");
        } finally {
            setLoading(false);
        }
    }

    // --- Action Functions ---

    /**
     * Downloads the QR code image as a PNG file.
     */
    function downloadQR() {
        // The QR code is the first image element inside the qr-box
        const qrImage = elements.qrBox.querySelector('img');
        if (!qrImage) return;

        const link = document.createElement('a');
        link.href = qrImage.src;
        link.download = `qr-code-${Date.now()}.png`; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Copies the QR code image to the clipboard.
     */
    async function copyQR() {
        const qrImage = elements.qrBox.querySelector('img');
        if (!qrImage) return;
        
        const dataUrl = qrImage.src;
        setLoading(true);

        try {
            // Fetch the image as a Blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            
            // Use Clipboard API
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob }),
            ]);

            // Success UI Feedback
            elements.copyIcon.classList.add('hidden');
            elements.checkIcon.classList.remove('hidden');
            elements.btnTextSpan.textContent = 'Copied!';
            elements.copyBtn.classList.add('success-feedback'); // Using a temporary class for visual feedback

            setTimeout(() => {
                // Reset UI
                elements.copyIcon.classList.remove('hidden');
                elements.checkIcon.classList.add('hidden');
                elements.btnTextSpan.textContent = 'Copy Image';
                elements.copyBtn.classList.remove('success-feedback');
                setLoading(false);
            }, 2000);

        } catch (err) {
            console.error('Copy Image Failed:', err);
            
            // Show custom error message on the UI
            elements.errorMessage.textContent = 'Copy failed. Browser security restrictions sometimes prevent direct image copying. Please use the Download button instead.';
            elements.errorMessage.classList.remove('hidden');
            
            setTimeout(() => elements.errorMessage.classList.add('hidden'), 5000);
            setLoading(false);
        }
    }

    // --- Initialization ---

    document.addEventListener('DOMContentLoaded', () => {
        // Attach all event listeners
        elements.qrTextarea.addEventListener('input', handleInput);
        elements.darkColorInput.addEventListener('input', handleInput);
        elements.lightColorInput.addEventListener('input', handleInput);
        elements.downloadBtn.addEventListener('click', downloadQR);
        elements.copyBtn.addEventListener('click', copyQR);

        // Mobile menu toggle
        elements.menuToggle.addEventListener('click', toggleMobileMenu);

        // Initial generation of the default content (or empty state)
        // Set default text to generate an initial QR code on load
        elements.qrTextarea.value = "https://raiparuhang.com.np";
        handleInput();
    });

})();