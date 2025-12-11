document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const imageInput = document.getElementById('imageInput');
    const previewArea = document.getElementById('previewArea');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const inputImagePreview = document.getElementById('inputImagePreview');
    const conversionCanvas = document.getElementById('conversionCanvas');
    const convertBtn = document.getElementById('convertBtn');
    const downloadLink = document.getElementById('downloadLink');
    // const convertAgainBtn is removed
    const outputFormatSelect = document.getElementById('outputFormat');
    const qualityControl = document.getElementById('jpegQualityControl');
    const qualityInput = document.getElementById('jpegQuality');
    const qualityValueSpan = document.getElementById('qualityValue');
    const uploadText = document.getElementById('upload-text');
    const uploadBox = document.querySelector('.tool-upload-box');
    
    // --- STATE ---
    let originalImage = null; // The loaded image object
    let currentFileExtension = ''; // To track the original extension for naming

    // --- UTILITIES ---

    // Helper: Reset the UI state
    function resetUI() {
        originalImage = null;
        currentFileExtension = '';
        inputImagePreview.style.display = 'none';
        inputImagePreview.src = '';
        previewPlaceholder.style.display = 'block';
        convertBtn.disabled = true;
        convertBtn.textContent = 'CONVERT';
        downloadLink.style.display = 'none';
        // convertAgainBtn logic removed
        uploadText.textContent = 'UPLOAD IMAGE';
    }

    // Helper: Gets the target extension for the download file name
    function getTargetExtension(mimeType) {
        if (mimeType.includes('jpeg')) return 'jpg';
        if (mimeType.includes('png')) return 'png';
        if (mimeType.includes('webp')) return 'webp';
        return 'dat';
    }
    
    // --- UPLOAD & PREVIEW LOGIC ---

    imageInput.addEventListener('change', function() {
        const file = imageInput.files[0];
        resetUI(); 

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            // Get original extension for naming the output file
            currentFileExtension = file.name.split('.').pop();
            
            reader.onload = function(e) {
                inputImagePreview.src = e.target.result;
                inputImagePreview.onload = function() {
                    originalImage = inputImagePreview;
                    inputImagePreview.style.display = 'block';
                    previewPlaceholder.style.display = 'none';
                    convertBtn.disabled = false;
                    uploadText.textContent = `UPLOADED (${currentFileExtension.toUpperCase()})`;
                };
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Add drag and drop logic (similar to your imagetopdf.js)
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


    // --- SETTINGS & QUALITY CONTROL ---
    outputFormatSelect.addEventListener('change', function() {
        // Show quality control only for JPEG output
        const isJpeg = this.value === 'image/jpeg';
        qualityControl.style.display = isJpeg ? 'block' : 'none';
    });

    qualityInput.addEventListener('input', function() {
        qualityValueSpan.textContent = this.value;
    });

    // --- CONVERSION LOGIC ---

    convertBtn.addEventListener('click', function() {
        if (!originalImage) return;

        convertBtn.disabled = true;
        convertBtn.textContent = 'CONVERTING...';

        try {
            // Set canvas size to the original image dimensions
            conversionCanvas.width = originalImage.naturalWidth;
            conversionCanvas.height = originalImage.naturalHeight;
            
            const ctx = conversionCanvas.getContext('2d');
            ctx.clearRect(0, 0, conversionCanvas.width, conversionCanvas.height);
            
            // 1. Draw the original image onto the canvas
            ctx.drawImage(originalImage, 0, 0);

            // 2. Get the selected output settings
            const mimeType = outputFormatSelect.value;
            // Quality is a decimal percentage (0.0 to 1.0)
            const quality = parseInt(qualityInput.value) / 100; 

            // 3. Convert Canvas to Blob/DataURL
            // The toDataURL() method is the core of the conversion
            const dataUrl = conversionCanvas.toDataURL(mimeType, quality);
            
            // 4. Update UI for Download
            const outputExtension = getTargetExtension(mimeType);
            const fileName = `converted_image.${outputExtension}`;

            downloadLink.href = dataUrl;
            downloadLink.download = fileName;
            downloadLink.style.display = 'block';
            // convertAgainBtn logic removed
            
            convertBtn.textContent = 'CONVERTED!';

        } catch (error) {
            console.error('Conversion failed:', error);
            convertBtn.textContent = 'ERROR!';
            alert('Conversion failed. Check console for details.');
        } finally {
            convertBtn.disabled = false;
        }
    });

    // --- CONVERT AGAIN LOGIC ---
    // Event listener for convertAgainBtn removed
    
    // Initialize state
    resetUI();
});