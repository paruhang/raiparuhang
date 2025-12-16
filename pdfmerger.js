// Global variable to store files (allows for drag-and-drop file collection)
let uploadedFiles = [];

// Function to update the file list display
function updateFileList() {
    const fileListElement = document.getElementById('file-list');
    const mergeBtn = document.getElementById('merge-btn');
    
    if (uploadedFiles.length === 0) {
        fileListElement.innerHTML = 'No files selected.';
        mergeBtn.disabled = true;
        return;
    }

    // Enable the button if 2 or more files are selected
    mergeBtn.disabled = uploadedFiles.length < 2;

    let html = '<ul>';
    uploadedFiles.forEach((file, index) => {
        // Display files with a sequential number and size
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        html += `<li><span>${index + 1}. ${file.name}</span><span>(${fileSizeMB} MB)</span></li>`;
    });
    html += '</ul>';
    fileListElement.innerHTML = html;
}

// Function to handle the merging process (Uses the global uploadedFiles array)
async function mergePdfs() {
    const statusMessage = document.getElementById('status-message');
    const downloadArea = document.getElementById('download-area');
    const mergeBtn = document.getElementById('merge-btn');

    if (uploadedFiles.length < 2) {
        statusMessage.className = 'status-message error';
        statusMessage.textContent = 'Please select at least two PDF files to merge.';
        downloadArea.classList.add('hidden');
        return;
    }

    // Disable button and show loading status
    mergeBtn.disabled = true;
    statusMessage.className = 'status-message';
    statusMessage.textContent = 'Merging PDFs... Please wait.';
    downloadArea.innerHTML = ''; // Clear previous download link
    downloadArea.classList.add('hidden');

    try {
        // 1. Create a new, blank PDF document
        const mergedPdf = await PDFLib.PDFDocument.create();

        // 2. Iterate through uploadedFiles and merge them
        for (const file of uploadedFiles) {
            const arrayBuffer = await file.arrayBuffer();
            // This is a memory-intensive operation for large files
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            // Get all pages from the current document
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            
            // Add all pages to the new merged document (main merging step)
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }

        // 3. Serialize the merged PDF document to bytes
        const mergedPdfBytes = await mergedPdf.save();

        // 4. Create a Blob and a download link
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Update status and create the download link
        statusMessage.className = 'status-message success';
        statusMessage.textContent = 'PDFs successfully merged! Download your file below.';

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'raiparuhang_merged_document.pdf';
        downloadLink.innerHTML = '<i class="fas fa-download"></i> Download Merged PDF';

        downloadArea.appendChild(downloadLink);
        downloadArea.classList.remove('hidden');

    } catch (error) {
        statusMessage.className = 'status-message error';
        statusMessage.textContent = `Error during merging: ${error.message}. Check the console for details.`;
        console.error("PDF Merging Error:", error);
    } finally {
        // Re-enable the button after operation is complete
        mergeBtn.disabled = false;
    }
}


// --- Event Handlers for File Upload ---

// Central function to handle files from input or drop
function handleNewFiles(fileList) {
    const newPdfs = Array.from(fileList).filter(file => file.type === 'application/pdf');

    if (newPdfs.length > 0) {
        // Overwrite the global list with the new selection
        uploadedFiles = newPdfs; 
        updateFileList();
        
        // Clear status/download area
        document.getElementById('status-message').textContent = '';
        document.getElementById('download-area').innerHTML = '';
        document.getElementById('download-area').classList.add('hidden');
    }
}

// 1. Handle "Select Files" button click (delegates to hidden input)
document.getElementById('select-files-btn').addEventListener('click', () => {
    document.getElementById('pdf-files').click();
});

// 2. Handle files selected via the hidden input
document.getElementById('pdf-files').addEventListener('change', (event) => {
    handleNewFiles(event.target.files);
});

// 3. Handle the Merge button click
document.getElementById('merge-btn').addEventListener('click', mergePdfs);


// --- DRAG AND DROP LOGIC ---
const dropZone = document.getElementById('drop-zone');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop zone when item is dragged over
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('dragover');
    }, false);
});

// Remove highlight when item leaves
['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('dragover');
    }, false);
});

// Handle dropped files
dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    // Pass the dropped files to our central handler
    handleNewFiles(files);
}, false);


// 4. Handle mobile navigation toggle
document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.main-nav').classList.toggle('open');
});

// Initial call to set button state on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if files were already in the input (browser history)
    const initialFiles = document.getElementById('pdf-files').files;
    if (initialFiles.length > 0) {
        uploadedFiles = Array.from(initialFiles);
    }
    updateFileList();
});