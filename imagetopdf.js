document.addEventListener('DOMContentLoaded', () => {
    // Make jsPDF and JSZip objects available
    const { jsPDF } = window.jspdf; 
    const JSZip = window.JSZip;

    // --- DOM ELEMENTS ---
    const imageInput = document.getElementById('imageInput');
    const processBtn = document.getElementById('processBtn');
    const convertBtn = document.getElementById('convertBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const downloadZipBtn = document.getElementById('downloadZipBtn');
    
    const uploadStage = document.getElementById('upload-stage');
    const resultStage = document.getElementById('result-stage');
    
    const pageCountValue = document.getElementById('page-count-value');
    const uploadText = document.getElementById('upload-text');
    const uploadBox = document.querySelector('.tool-upload-box');

    // Preview Elements
    const uploadPreviewArea = document.getElementById('upload-preview-area');
    const uploadPreviewPlaceholder = document.getElementById('upload-preview-placeholder');
    const previewContainer = document.getElementById('preview-container'); 
    const prevPreviewBtn = document.getElementById('prev-preview'); // New Carousel Buttons
    const nextPreviewBtn = document.getElementById('next-preview'); // New Carousel Buttons

    // Loader
    const processLoader = document.getElementById('process-loader');
    
    // --- STATE ---
    let selectedFiles = []; // Array to store File objects
    let currentPreviewIndex = 0; // State for carousel navigation

    // --- UTILITIES ---

    // Helper: Read a file and return its Data URL (Base64)
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Helper: Manually trigger a download (used for ZIP file)
    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // --- CAROUSEL LOGIC (FIXED) ---

    function updateCarouselUI() {
        const thumbnails = previewContainer.querySelectorAll('.preview-thumbnail');
        if (thumbnails.length === 0) {
            prevPreviewBtn.disabled = true;
            nextPreviewBtn.disabled = true;
            return;
        }

        // Ensure index is valid
        if (currentPreviewIndex < 0) currentPreviewIndex = 0;
        if (currentPreviewIndex >= thumbnails.length) currentPreviewIndex = thumbnails.length - 1;

        // 1. Scroll to the current thumbnail
        const thumbnailWidth = thumbnails[0].offsetWidth;
        const scrollAmount = currentPreviewIndex * (thumbnailWidth + 10); // +10 for gap
        previewContainer.scrollTo({ left: scrollAmount, behavior: 'smooth' });

        // 2. Update button states
        prevPreviewBtn.disabled = currentPreviewIndex === 0;
        nextPreviewBtn.disabled = currentPreviewIndex === (thumbnails.length - 1);
    }

    prevPreviewBtn.addEventListener('click', () => {
        if (currentPreviewIndex > 0) {
            currentPreviewIndex--;
            updateCarouselUI();
        }
    });

    nextPreviewBtn.addEventListener('click', () => {
        const thumbnails = previewContainer.querySelectorAll('.preview-thumbnail');
        if (currentPreviewIndex < thumbnails.length - 1) {
            currentPreviewIndex++;
            updateCarouselUI();
        }
    });


    // --- STAGE 1: UPLOAD & PREVIEW LOGIC ---

    imageInput.addEventListener('change', async function() {
        selectedFiles = Array.from(imageInput.files);
        
        // Clear previous previews
        uploadPreviewArea.innerHTML = '';
        
        if (selectedFiles.length > 0) {
            pageCountValue.textContent = selectedFiles.length;
            uploadText.textContent = `UPLOADED (${selectedFiles.length})`;
            processBtn.disabled = false;
            uploadPreviewPlaceholder.style.display = 'none';

            // Generate thumbnails for the upload preview area
            for (const file of selectedFiles) {
                if (file.type.startsWith('image/')) {
                    const dataUrl = await readFileAsDataURL(file);
                    
                    const imgDiv = document.createElement('div');
                    imgDiv.classList.add('preview-thumbnail');
                    const img = document.createElement('img');
                    img.src = dataUrl;
                    img.alt = file.name;
                    imgDiv.appendChild(img);
                    
                    uploadPreviewArea.appendChild(imgDiv);
                }
            }
        } else {
            pageCountValue.textContent = 0;
            uploadText.textContent = 'UPLOAD';
            processBtn.disabled = true;
            uploadPreviewPlaceholder.style.display = 'block';
        }
    });

    // Drag and Drop implementation (unchanged)
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadBox.addEventListener(eventName, () => uploadBox.classList.add('active-drag'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, () => uploadBox.classList.remove('active-drag'), false);
    });

    uploadBox.addEventListener('drop', function(e) {
        let dt = e.dataTransfer;
        imageInput.files = dt.files;
        imageInput.dispatchEvent(new Event('change'));
    }, false);


    // --- STAGE 2: PROCESS & CONVERSION LOGIC ---

    processBtn.addEventListener('click', function() {
        if (selectedFiles.length > 0) {
            // Copy upload preview to result stage preview container
            previewContainer.innerHTML = uploadPreviewArea.innerHTML;
            
            uploadStage.style.display = 'none';
            resultStage.style.display = 'block';
            
            // Initialize carousel state for the result stage
            currentPreviewIndex = 0;
            updateCarouselUI(); // Enable/disable buttons based on count
            
            // Reset convert button
            convertBtn.disabled = false;
            convertBtn.style.display = 'block';
            convertBtn.textContent = 'CONVERT TO PDF';
            downloadPdfBtn.style.display = 'none';
            downloadZipBtn.style.display = 'none';
            document.getElementById('pdf-ready-message').style.display = 'none';
        }
    });


    // --- PDF CONVERSION ---
    convertBtn.addEventListener('click', async function() {
        if (selectedFiles.length === 0) return;

        // UI Feedback
        convertBtn.disabled = true;
        convertBtn.textContent = 'CONVERTING...';
        processLoader.style.display = 'inline-block';

        // ... (PDF generation logic remains the same) ...
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        
        const A4_WIDTH = 210;
        const A4_HEIGHT = 297;
        const MARGIN = 10; 

        let firstImage = true;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            if (!file.type.startsWith('image/')) continue;
            
            const dataUrl = await readFileAsDataURL(file);
            const format = file.type.split('/')[1].toUpperCase();

            const img = new Image();
            img.src = dataUrl;

            await new Promise(resolve => img.onload = resolve);
            
            const imgWidth = img.width;
            const imgHeight = img.height;
            
            const MAX_WIDTH = A4_WIDTH - 2 * MARGIN;
            const MAX_HEIGHT = A4_HEIGHT - 2 * MARGIN;

            let scaleFactorX = MAX_WIDTH / imgWidth;
            let scaleFactorY = MAX_HEIGHT / imgHeight;
            const scaleFactor = Math.min(scaleFactorX, scaleFactorY);
            
            let targetWidth = imgWidth * scaleFactor;
            let targetHeight = imgHeight * scaleFactor;

            const x = (A4_WIDTH - targetWidth) / 2;
            const y = (A4_HEIGHT - targetHeight) / 2;
            
            if (!firstImage) {
                doc.addPage();
            } else {
                firstImage = false;
            }

            doc.addImage(dataUrl, format, x, y, targetWidth, targetHeight, null, 'FAST');
            
            convertBtn.textContent = `Processing ${i + 1} of ${selectedFiles.length}...`;
        }
        // ... (End of PDF generation logic) ...

        // Final PDF Blob
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Update UI for download
        processLoader.style.display = 'none';
        convertBtn.style.display = 'none';
        
        document.getElementById('pdf-ready-message').style.display = 'block';
        
        downloadPdfBtn.href = pdfUrl;
        downloadPdfBtn.style.display = 'block';
        downloadZipBtn.style.display = 'block'; 
    });


    // --- ZIP DOWNLOAD (UNCHANGED, fully functional) ---
    downloadZipBtn.addEventListener('click', async function() {
        if (selectedFiles.length === 0) return;

        downloadZipBtn.disabled = true;
        downloadZipBtn.textContent = 'Creating ZIP...';

        const zip = new JSZip();
        const folder = zip.folder("images"); 

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            const arrayBuffer = await file.arrayBuffer();
            
            folder.file(file.name, arrayBuffer);
            
            downloadZipBtn.textContent = `Adding file ${i + 1} of ${selectedFiles.length}...`;
        }

        zip.generateAsync({type:"blob"})
        .then(function(content) {
            triggerDownload(content, 'original_images.zip');
            
            downloadZipBtn.disabled = false;
            downloadZipBtn.textContent = 'Download Original Images as ZIP';
        });
    });
});