document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Menu Toggle (Copied from main script.js for this page) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-list a');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('open');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
            }
        });
    });

    // --- 2. JPG to PDF Converter Logic ---
    
    const fileInput = document.getElementById('jpgFile');
    const convertBtn = document.getElementById('convertBtn');
    const statusText = document.getElementById('status');
    // window.jspdf is available because we loaded it via CDN in converter.html
    const { jsPDF } = window.jspdf; 

    fileInput.addEventListener('change', () => {
        const fileCount = fileInput.files.length;
        convertBtn.disabled = fileCount === 0;
        statusText.textContent = fileCount > 0 ? `${fileCount} file(s) selected, ready to convert.` : 'No files selected.';
    });

    convertBtn.addEventListener('click', async () => {
        if (fileInput.files.length === 0) return;

        statusText.textContent = 'Converting... Please wait. This may take a moment for large files.';
        convertBtn.disabled = true;

        const doc = new jsPDF();
        const files = Array.from(fileInput.files);
        
        // Asynchronously process all files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Read the file as a Data URL (Base64)
            const imgData = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.readAsDataURL(file);
            });

            // Load the image to get actual dimensions
            await new Promise(resolve => {
                const img = new Image();
                img.onload = function () {
                    const imgWidth = img.width;
                    const imgHeight = img.height;
                    
                    // PDF page dimensions
                    const pdfWidth = doc.internal.pageSize.getWidth();
                    const pdfHeight = doc.internal.pageSize.getHeight();
                    
                    // Calculate ratio to fit image inside the PDF page
                    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                    const finalWidth = imgWidth * ratio;
                    const finalHeight = imgHeight * ratio;
                    
                    // Center the image
                    const x = (pdfWidth - finalWidth) / 2;
                    const y = (pdfHeight - finalHeight) / 2;

                    // Add a new page for all images except the first one
                    if (i > 0) {
                        doc.addPage();
                    }

                    // Add the image to the PDF
                    doc.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
                    
                    statusText.textContent = `Converting file ${i + 1} of ${files.length}...`;
                    resolve();
                };
                img.src = imgData;
            });
        }

        // Final step: Save and download the PDF
        doc.save('raiparuhang_converter_output.pdf');
        
        statusText.textContent = `Conversion successful! ${files.length} image(s) combined into one PDF.`;
        convertBtn.disabled = false;
        fileInput.value = ''; // Reset file input
    });
});