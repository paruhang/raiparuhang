document.addEventListener('DOMContentLoaded', () => {
    // initialize PDF.js
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const JSZip = window.JSZip;

    // --- DOM ELEMENTS ---
    const pdfInput = document.getElementById('pdfInput');
    const processBtn = document.getElementById('processBtn');
    const downloadZipBtn = document.getElementById('downloadZipBtn');
    const resetBtn = document.getElementById('resetBtn');
    const downloadSingleImageBtn = document.getElementById('downloadSingleImageBtn'); 
    // NEW: Image format selector
    const imageFormatSelect = document.getElementById('imageFormat'); 
    
    const uploadStage = document.getElementById('upload-stage');
    const resultStage = document.getElementById('result-stage');
    
    const fileCountValue = document.getElementById('file-count-value'); 
    const uploadText = document.getElementById('upload-text');
    const uploadBox = document.querySelector('.tool-upload-box');
    const uploadPreviewArea = document.getElementById('upload-preview-area');

    // Preview Elements
    const previewContainer = document.getElementById('preview-container'); 
    const prevPreviewBtn = document.getElementById('prev-preview'); 
    const nextPreviewBtn = document.getElementById('next-preview'); 
    const successMessage = document.getElementById('success-message');
    const totalImagesCountSpan = document.getElementById('total-images-count');

    // Loader
    const processLoader = document.getElementById('process-loader');
    
    // --- STATE ---
    let selectedFiles = []; 
    let extractedImages = []; 
    let currentPreviewIndex = 0; 
    let selectedImageFormat = 'jpg'; // Default

    // Update state when format changes
    imageFormatSelect.addEventListener('change', (e) => {
        selectedImageFormat = e.target.value;
        // Update the download button text to reflect the selected format
        downloadSingleImageBtn.textContent = `Download Current Image (${selectedImageFormat.toUpperCase()})`;
    });

    // Initialize button text
    downloadSingleImageBtn.textContent = `Download Current Image (${selectedImageFormat.toUpperCase()})`;


    // --- UTILITIES ---
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

    // --- CAROUSEL LOGIC (UNCHANGED) ---
    function updateCarouselUI() {
        const thumbnails = previewContainer.querySelectorAll('.preview-thumbnail');
        if (thumbnails.length === 0) {
            prevPreviewBtn.disabled = true;
            nextPreviewBtn.disabled = true;
            downloadSingleImageBtn.disabled = true; 
            return;
        }
        if (currentPreviewIndex < 0) currentPreviewIndex = 0;
        if (currentPreviewIndex >= thumbnails.length) currentPreviewIndex = thumbnails.length - 1;

        const thumbnailWidth = thumbnails[0].offsetWidth;
        const scrollAmount = currentPreviewIndex * (thumbnailWidth + 10); 
        previewContainer.scrollTo({ left: scrollAmount, behavior: 'smooth' });

        prevPreviewBtn.disabled = currentPreviewIndex === 0;
        nextPreviewBtn.disabled = currentPreviewIndex === (thumbnails.length - 1);
        downloadSingleImageBtn.disabled = false;
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

    // --- STAGE 1: UPLOAD & PREVIEW LOGIC (UNCHANGED) ---

    pdfInput.addEventListener('change', handleFileSelect);

    function handleFileSelect(e) {
        if (pdfInput.files.length > 0) {
            selectedFiles = Array.from(pdfInput.files).filter(file => file.type === 'application/pdf');

            if (selectedFiles.length === 0) {
                alert("No valid PDF files selected. Please select files with the .pdf extension.");
                return;
            }

            fileCountValue.textContent = `${selectedFiles.length} PDF(s) Selected`;
            uploadText.textContent = 'CHANGE FILES';
            processBtn.disabled = false;

            // Show list of selected files (preview)
            uploadPreviewArea.innerHTML = selectedFiles.map(file => `
                <div class="file-preview-item" title="${file.name}">
                    <span>📄</span>
                    <span>${file.name}</span>
                </div>
            `).join('');
            
        } else {
            selectedFiles = [];
            fileCountValue.textContent = '0 PDF(s) Selected';
            uploadText.textContent = 'UPLOAD PDFs';
            processBtn.disabled = true;
            uploadPreviewArea.innerHTML = `<p id="upload-preview-placeholder">No PDF selected yet. Drag and drop or click UPLOAD.</p>`;
        }
    }

    // Drag and Drop implementation (UNCHANGED)
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
        let files = dt.files;
        
        pdfInput.files = files;
        const event = new Event('change', { bubbles: true });
        pdfInput.dispatchEvent(event);
        
    }, false);


    // --- STAGE 2: PROCESS LOGIC (FIXED FOR FORMAT SELECTION) ---

    processBtn.addEventListener('click', async function() {
        if (selectedFiles.length === 0) return;

        // Get the selected format and MIME type
        const format = selectedImageFormat;
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const extension = format === 'png' ? 'png' : 'jpg';

        // 1. UI Setup
        processBtn.disabled = true;
        processBtn.innerHTML = 'STARTING CONVERSION... <span id="process-loader" class="loader" style="display:inline-block"></span>';
        
        extractedImages = [];
        previewContainer.innerHTML = ''; 
        let totalImagesCount = 0;

        try {
            // Loop through each selected PDF file
            for (let fileIndex = 0; fileIndex < selectedFiles.length; fileIndex++) {
                const currentFile = selectedFiles[fileIndex];
                
                processBtn.innerHTML = `Loading PDF ${fileIndex + 1}/${selectedFiles.length}: ${currentFile.name}... <span class="loader" style="display:inline-block"></span>`;
                
                // 2. Load PDF Document
                const arrayBuffer = await currentFile.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                const totalPages = pdf.numPages;

                // 3. Iterate Pages for the current PDF
                for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                    totalImagesCount++;
                    processBtn.innerHTML = `[File ${fileIndex + 1}/${selectedFiles.length}] Page ${pageNum} of ${totalPages} converting to ${format.toUpperCase()}... <span class="loader" style="display:inline-block"></span>`;

                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = { canvasContext: context, viewport: viewport };
                    await page.render(renderContext).promise;

                    // FIX: Use selected MIME type and quality (0.9 for JPEG)
                    const dataUrl = canvas.toDataURL(mimeType, 0.9);
                    
                    const blob = await (await fetch(dataUrl)).blob();
                    // FIX: Use selected extension
                    const filename = `${currentFile.name.replace('.pdf', '')}_page_${pageNum}.${extension}`;

                    // Store Result
                    extractedImages.push({
                        dataUrl: dataUrl,
                        blob: blob,
                        filename: filename,
                        pageNum: pageNum,
                        sourceFile: currentFile.name
                    });

                    // Add to Carousel UI immediately
                    addThumbnailToCarousel(dataUrl, pageNum, currentFile.name);
                }
            }
            
            // 4. Final UI Update
            totalImagesCountSpan.textContent = totalImagesCount;
            processBtn.textContent = `CONVERSION COMPLETE! (${totalImagesCount} Images Extracted)`;

            // 5. Switch Stages
            uploadStage.style.display = 'none';
            resultStage.style.display = 'block';
            successMessage.style.display = 'block';
            
            currentPreviewIndex = 0;
            updateCarouselUI();

        } catch (error) {
            console.error("Error processing PDF:", error);
            alert("An error occurred while processing one or more PDF files. Please try again.");
            processBtn.disabled = false;
            processBtn.textContent = 'CONVERT TO IMAGES';
        }
    });

    function addThumbnailToCarousel(dataUrl, pageNum, sourceName) {
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('preview-thumbnail');
        
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = `Page ${pageNum} from ${sourceName}`;
        
        const label = document.createElement('div');
        label.classList.add('page-label');
        label.textContent = `${sourceName.substring(0, 10)}... (Pg ${pageNum})`;

        imgDiv.appendChild(img);
        imgDiv.appendChild(label);
        
        previewContainer.appendChild(imgDiv);
    }

    // --- SINGLE IMAGE DOWNLOAD (FIXED to use dynamic format in button text) ---
    downloadSingleImageBtn.addEventListener('click', function() {
        if (extractedImages.length === 0 || currentPreviewIndex < 0) return;
        const currentImage = extractedImages[currentPreviewIndex];
        if (currentImage) {
            triggerDownload(currentImage.blob, currentImage.filename);
        }
    });


    // --- ZIP DOWNLOAD (UNCHANGED) ---
    downloadZipBtn.addEventListener('click', function() {
        if (extractedImages.length === 0) return;

        downloadZipBtn.disabled = true;
        downloadZipBtn.textContent = 'Creating ZIP...';

        const zip = new JSZip();
        // Since all files are images now, rename folder to match image types
        const folder = zip.folder(`extracted_images_${selectedImageFormat}`); 

        extractedImages.forEach(imgData => {
            folder.file(imgData.filename, imgData.blob);
        });

        zip.generateAsync({type:"blob"})
        .then(function(content) {
            const zipName = selectedFiles.length === 1 
                ? `${selectedFiles[0].name.replace('.pdf', '')}_images_${selectedImageFormat}.zip` 
                : `extracted_images_${selectedImageFormat}.zip`;
                
            triggerDownload(content, zipName);
            
            downloadZipBtn.disabled = false;
            downloadZipBtn.textContent = 'Download All Images (ZIP)';
        });
    });

    // --- RESET ---
    resetBtn.addEventListener('click', () => {
        location.reload();
    });
});