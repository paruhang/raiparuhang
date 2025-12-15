document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    // General
    const imageInput = document.getElementById('imageInput');
    const reducerCanvas = document.getElementById('reducerCanvas');
    const uploadText = document.getElementById('upload-text');
    const uploadBox = document.querySelector('.tool-upload-box');
    
    // Stage 1
    const stage1 = document.getElementById('stage1');
    const nextBtn = document.getElementById('nextBtn');
    const formatButtons = document.querySelectorAll('.format-button');

    // Stage 2
    const stage2 = document.getElementById('stage2');
    const inputImagePreview = document.getElementById('inputImagePreview');
    const originalDimensions = document.getElementById('originalDimensions');
    const originalFileSize = document.getElementById('originalFileSize');
    const qualityInput = document.getElementById('qualityInput');
    const qualityValueSpan = document.getElementById('qualityValue');
    const estimatedFileSize = document.getElementById('estimatedFileSize');
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
        
        stage1.style.display = 'block';
        stage2.style.display = 'none';
        uploadText.textContent = 'UPLOAD IMAGE';
        nextBtn.disabled = true;
        
        inputImagePreview.src = '';
        qualityInput.value = 70;
        qualityValueSpan.textContent = 70;
        estimatedFileSize.textContent = '-- KB';
    }

    function getMimeType(format) {
        return `image/${format === 'jpg' ? 'jpeg' : format}`;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 1; 
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    function updateFormat(format) {
        formatButtons.forEach(btn => btn.classList.remove('active'));
        currentFormat = format;
        document.getElementById(`format${format.charAt(0).toUpperCase() + format.slice(1)}`).classList.add('active');
    }


    // --- UPLOAD & INITIAL LOAD LOGIC (CRITICAL SECTION FIXED) ---

    // Function to handle a file once selected (from click or drop)
    function processSelectedFile(file) {
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
                
                originalWidth = originalImage.naturalWidth;
                originalHeight = originalImage.naturalHeight;
                
                uploadText.textContent = `UPLOADED (${originalWidth}x${originalHeight})`;
                nextBtn.disabled = false;
            };
        };
        reader.readAsDataURL(file);
    }
    
    // 1. File Input (Click) Handler
    imageInput.addEventListener('change', function() {
        if (imageInput.files.length) {
            processSelectedFile(imageInput.files[0]);
        }
    });

    // 2. Drag and Drop Handlers (FIXED)
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Optional: Add visual feedback for dragover
            if (eventName === 'dragover' || eventName === 'dragenter') {
                uploadBox.style.borderColor = '#007bff';
            } else {
                uploadBox.style.borderColor = '#ccc';
            }
        }, false);
    });

    uploadBox.addEventListener('drop', function(e) {
        uploadBox.style.borderColor = '#ccc'; // Reset border color
        let files = e.dataTransfer.files;
        
        if (files.length) {
            // FIX: Manually assign the file to the input and process it directly.
            // This is the most reliable way to handle dropped files.
            
            // Create a temporary FileList if needed, but direct processing is cleaner:
            processSelectedFile(files[0]);
        }
    }, false);


    // --- ESTIMATION LOGIC (NO CHANGES) ---

    function updateEstimatedSize() {
        if (!originalImage || currentFormat === 'png') {
            estimatedFileSize.textContent = 'N/A (Lossless)'; 
            return;
        }
        
        estimatedFileSize.textContent = 'Calculating...';

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = originalWidth;
        tempCanvas.height = originalHeight;
        tempCtx.drawImage(originalImage, 0, 0, originalWidth, originalHeight);

        const mimeType = getMimeType(currentFormat);
        const quality = parseFloat(qualityInput.value) / 100;

        tempCanvas.toBlob((blob) => {
            if (blob && originalFile) {
                const newSize = blob.size;
                const reduction = 1 - (newSize / originalFile.size);
                
                estimatedFileSize.innerHTML = 
                    `${formatFileSize(newSize)} 
                     <span style="color: #28a745; font-weight: normal;">(${(reduction * 100).toFixed(1)}% reduction)</span>`;
            } else {
                estimatedFileSize.textContent = 'Error';
            }
            tempCanvas.remove(); 
        }, mimeType, quality);
    }

    const debouncedUpdateSize = debounce(updateEstimatedSize, 300);

    // --- TRANSITION TO STAGE 2 ---
    
    nextBtn.addEventListener('click', function() {
        if (!originalImage) return;

        stage1.style.display = 'none';
        stage2.style.display = 'block';

        originalDimensions.textContent = `${originalWidth} x ${originalHeight}`;
        originalFileSize.textContent = formatFileSize(originalFile.size);
        
        updateEstimatedSize();
    });
    
    backBtn.addEventListener('click', function() {
        stage2.style.display = 'none';
        stage1.style.display = 'block';
    });
    
    // --- STAGE 2: COMPRESSION & DOWNLOAD CORE LOGIC ---

    qualityInput.addEventListener('input', function() {
        qualityValueSpan.textContent = this.value;
        debouncedUpdateSize();
    });
    
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            updateFormat(this.dataset.format);
            if (stage2.style.display !== 'none') {
                updateEstimatedSize();
            }
        });
    });

    downloadBtn.addEventListener('click', function() {
        if (!originalImage) return;

        downloadBtn.disabled = true;
        downloadBtn.textContent = 'PROCESSING...';

        try {
            const canvas = reducerCanvas;
            const ctx = canvas.getContext('2d');
            
            canvas.width = originalWidth;
            canvas.height = originalHeight;
            
            ctx.imageSmoothingQuality = 'high';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(originalImage, 0, 0, originalWidth, originalHeight); 

            const mimeType = getMimeType(currentFormat);
            const quality = parseFloat(qualityInput.value) / 100; 
            
            canvas.toBlob((blob) => {
                
                if (!blob) {
                    throw new Error("Failed to generate Blob from Canvas.");
                }
                
                const outputExtension = currentFormat === 'jpeg' ? 'jpg' : currentFormat;
                const originalFileName = originalFile.name.split('.').slice(0, -1).join('_');
                const fileName = `${originalFileName}_compressed.${outputExtension}`; 

                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                setTimeout(() => URL.revokeObjectURL(url), 100);
                
                downloadBtn.textContent = 'DOWNLOAD REDUCED';
                downloadBtn.disabled = false;

            }, mimeType, quality); 

        } catch (error) {
            console.error('Compression failed:', error);
            alert('Compression failed. Check console for details.');
            downloadBtn.textContent = 'ERROR!';
            downloadBtn.disabled = false;
        }
    });


    // Initialize state
    function initialize() {
        resetUI();
        updateFormat('jpeg');
    }
    
    initialize();
});