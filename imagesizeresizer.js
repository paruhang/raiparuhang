document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    // General
    const imageInput = document.getElementById('imageInput');
    const resizerCanvas = document.getElementById('resizerCanvas');
    const uploadText = document.getElementById('upload-text');
    const uploadBox = document.querySelector('.tool-upload-box');
    
    // Stage 1
    const stage1 = document.getElementById('stage1');
    const nextBtn = document.getElementById('nextBtn');
    const formatJpeg = document.getElementById('formatJpeg');
    const formatPng = document.getElementById('formatPng');
    const formatButtons = document.querySelectorAll('.format-button');
    const qualityControl = document.getElementById('jpegQualityControl');
    const qualityInput = document.getElementById('jpegQuality');
    const qualityValueSpan = document.getElementById('qualityValue');

    // Stage 2
    const stage2 = document.getElementById('stage2');
    const inputImagePreview = document.getElementById('inputImagePreview');
    const originalDimensions = document.getElementById('originalDimensions');
    const originalFileSize = document.getElementById('originalFileSize');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const aspectRatioCheck = document.getElementById('aspectRatioCheck');
    const downloadBtn = document.getElementById('downloadBtn');
    const backBtn = document.getElementById('backBtn');
    
    // --- STATE ---
    let originalImage = null; // The Image object
    let originalFile = null;  // The original File object (for size)
    let originalWidth = 0;
    let originalHeight = 0;
    let currentFormat = 'jpeg'; // Default output format


    // --- UTILITIES ---

    function resetUI() {
        originalImage = null;
        originalFile = null;
        originalWidth = 0;
        originalHeight = 0;
        
        // Reset Stage 1
        stage1.style.display = 'block';
        stage2.style.display = 'none';
        uploadText.textContent = 'UPLOAD IMAGE';
        nextBtn.disabled = true;
        
        // Reset Inputs
        widthInput.value = 0;
        heightInput.value = 0;
        inputImagePreview.src = '';
    }

    function getMimeType(format) {
        return `image/${format === 'jpg' ? 'jpeg' : format}`;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 1; // 1 decimal place
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // --- STAGE 1: UPLOAD & FORMAT SELECTION ---

    imageInput.addEventListener('change', function() {
        const file = imageInput.files[0];
        if (!file || !file.type.startsWith('image/')) {
            resetUI();
            return;
        }

        originalFile = file;
        const reader = new FileReader();
        
        reader.onload = function(e) {
            inputImagePreview.src = e.target.result;
            inputImagePreview.onload = function() {
                originalImage = inputImagePreview;
                
                // Store original dimensions
                originalWidth = originalImage.naturalWidth;
                originalHeight = originalImage.naturalHeight;
                
                uploadText.textContent = `UPLOADED (${originalWidth}x${originalHeight})`;
                nextBtn.disabled = false;
            };
        };
        reader.readAsDataURL(file);
    });
    
    // Drag and drop logic
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    uploadBox.addEventListener('drop', function(e) {
        let dt = e.dataTransfer;
        imageInput.files = dt.files;
        imageInput.dispatchEvent(new Event('change'));
    }, false);
    
    // Format Button Selection
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            formatButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFormat = this.dataset.format;
            
            // Show/Hide Quality Control
            const isJpeg = currentFormat === 'jpeg';
            qualityControl.style.display = isJpeg ? 'block' : 'none';
        });
    });

    // Quality Slider Update
    qualityInput.addEventListener('input', function() {
        qualityValueSpan.textContent = this.value;
    });

    // --- TRANSITION TO STAGE 2 ---
    
    nextBtn.addEventListener('click', function() {
        if (!originalImage) return;

        // Display Stage 2 and hide Stage 1
        stage1.style.display = 'none';
        stage2.style.display = 'block';

        // Populate Stage 2 data
        originalDimensions.textContent = `${originalWidth} x ${originalHeight}`;
        originalFileSize.textContent = formatFileSize(originalFile.size);

        // Set default resize inputs to original size
        widthInput.value = originalWidth; 
        heightInput.value = originalHeight;
    });
    
    backBtn.addEventListener('click', function() {
        stage2.style.display = 'none';
        stage1.style.display = 'block';
    });
    
    // --- STAGE 2: RESIZING & DOWNLOAD CORE LOGIC ---

    // Aspect Ratio Synchronization
    function syncDimensions(changedInput) {
        if (!originalImage || !aspectRatioCheck.checked) return;

        const ratio = originalWidth / originalHeight;

        if (changedInput === widthInput) {
            const newWidth = parseInt(widthInput.value) || 1;
            heightInput.value = Math.max(1, Math.round(newWidth / ratio));
        } else if (changedInput === heightInput) {
            const newHeight = parseInt(heightInput.value) || 1;
            widthInput.value = Math.max(1, Math.round(newHeight * ratio));
        }
    }

    widthInput.addEventListener('input', () => syncDimensions(widthInput));
    heightInput.addEventListener('input', () => syncDimensions(heightInput));
    aspectRatioCheck.addEventListener('change', () => {
        if (aspectRatioCheck.checked) {
            syncDimensions(widthInput);
        }
    });


    // Main Download Handler
    downloadBtn.addEventListener('click', function() {
        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);

        if (isNaN(newWidth) || isNaN(newHeight) || newWidth < 1 || newHeight < 1) {
            alert('Please enter valid width and height values greater than 0.');
            return;
        }

        downloadBtn.disabled = true;
        downloadBtn.textContent = 'PROCESSING...';

        try {
            const canvas = resizerCanvas;
            const ctx = canvas.getContext('2d');
            
            // 1. Set canvas size to the new dimensions
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            ctx.imageSmoothingQuality = 'high';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 2. Draw and scale the image onto the canvas
            // drawImage(image, dx, dy, dw, dh)
            ctx.drawImage(originalImage, 0, 0, newWidth, newHeight); 

            // 3. Get output settings
            const mimeType = getMimeType(currentFormat);
            // Convert quality from 10-100 range to 0.1-1.0 required by toBlob
            const quality = parseFloat(qualityInput.value) / 100; 
            
            // 4. Convert Canvas to Blob and trigger download
            canvas.toBlob((blob) => {
                
                if (!blob) {
                    throw new Error("Failed to generate Blob from Canvas.");
                }
                
                // 5. Trigger Download
                const outputExtension = currentFormat === 'jpeg' ? 'jpg' : currentFormat;
                const originalFileName = originalFile.name.split('.').slice(0, -1).join('_');
                const fileName = `${originalFileName}_${newWidth}x${newHeight}.${outputExtension}`; 

                const url = URL.createObjectURL(blob);
                
                // Create and click the temporary link
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // Clean up the temporary URL object
                setTimeout(() => URL.revokeObjectURL(url), 100);
                
                downloadBtn.textContent = 'DOWNLOAD RESIZED';
                downloadBtn.disabled = false;

            }, mimeType, quality); 

        } catch (error) {
            console.error('Resizing failed:', error);
            alert('Resizing failed. Check console for details.');
            downloadBtn.textContent = 'ERROR!';
            downloadBtn.disabled = false;
        }
    });


    // Initialize state
    resetUI();
});