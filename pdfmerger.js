// Global variable to store files
let uploadedFiles = [];

// --- UPDATED: Function to update the file list with Preview button ---
function updateFileList() {
    const fileListElement = document.getElementById('file-list');
    const mergeBtn = document.getElementById('merge-btn');
    
    if (uploadedFiles.length === 0) {
        fileListElement.innerHTML = '<p style="color: #64748b; text-align: center;">No files selected.</p>';
        mergeBtn.disabled = true;
        return;
    }

    mergeBtn.disabled = uploadedFiles.length < 2;

    let html = `
        <div style="text-align: right; margin-bottom: 10px;">
            <button onclick="clearAllFiles()" style="background: #64748b; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                <i class="fas fa-eraser"></i> Clear All
            </button>
        </div>
        <ul style="list-style: none; padding: 0;">`;

    uploadedFiles.forEach((file, index) => {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        const isFirst = index === 0;
        const isLast = index === uploadedFiles.length - 1;

        html += `
            <li style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 12px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="display: flex; flex-direction: column; overflow: hidden; margin-right: 10px;">
                    <span style="font-weight: 600; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; cursor: pointer; color: #2563eb;" onclick="previewFile(${index})">
                        ${index + 1}. ${file.name}
                    </span>
                    <small style="color: #94a3b8;">${fileSizeMB} MB</small>
                </div>
                <div style="display: flex; gap: 5px; flex-shrink: 0;">
                    <button onclick="previewFile(${index})" title="Preview" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 5px 8px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="moveFile(${index}, -1)" ${isFirst ? 'disabled' : ''} style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 5px 8px; border-radius: 4px; cursor: pointer; opacity: ${isFirst ? '0.3' : '1'};">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button onclick="moveFile(${index}, 1)" ${isLast ? 'disabled' : ''} style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 5px 8px; border-radius: 4px; cursor: pointer; opacity: ${isLast ? '0.3' : '1'};">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button onclick="removeFile(${index})" style="background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; padding: 5px 8px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>`;
    });
    html += '</ul>';
    fileListElement.innerHTML = html;
}

// --- NEW: Preview functionality ---
function previewFile(index) {
    const file = uploadedFiles[index];
    const fileURL = URL.createObjectURL(file);
    
    // Create a simple modal overlay if it doesn't exist
    let modal = document.getElementById('preview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'preview-modal';
        modal.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000;";
        modal.innerHTML = `
            <div style="width: 90%; height: 80%; background: white; border-radius: 8px; position: relative;">
                <button onclick="closePreview()" style="position: absolute; top: -40px; right: 0; background: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">CLOSE ✕</button>
                <iframe id="preview-iframe" style="width: 100%; height: 100%; border: none; border-radius: 8px;"></iframe>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('preview-iframe').src = fileURL;
    modal.style.display = 'flex';
}

function closePreview() {
    const modal = document.getElementById('preview-modal');
    if (modal) modal.style.display = 'none';
    document.getElementById('preview-iframe').src = '';
}

// --- Support Functions (Move, Remove, Clear) ---
function moveFile(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= uploadedFiles.length) return;
    [uploadedFiles[index], uploadedFiles[newIndex]] = [uploadedFiles[newIndex], uploadedFiles[index]];
    updateFileList();
    resetStatus();
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFileList();
    resetStatus();
}

function clearAllFiles() {
    if (confirm("Clear all selected files?")) {
        uploadedFiles = [];
        document.getElementById('pdf-files').value = "";
        updateFileList();
        resetStatus();
    }
}

function resetStatus() {
    document.getElementById('status-message').textContent = '';
    document.getElementById('download-area').classList.add('hidden');
}

// --- Merge Logic ---
async function mergePdfs() {
    const statusMessage = document.getElementById('status-message');
    const downloadArea = document.getElementById('download-area');
    const mergeBtn = document.getElementById('merge-btn');

    mergeBtn.disabled = true;
    statusMessage.textContent = 'Merging...';

    try {
        const mergedPdf = await PDFLib.PDFDocument.create();
        for (const file of uploadedFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            pages.forEach(p => mergedPdf.addPage(p));
        }
        const bytes = await mergedPdf.save();
        const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));

        statusMessage.className = 'status-message success';
        statusMessage.textContent = 'Done!';
        downloadArea.innerHTML = `<a href="${url}" download="merged.pdf" style="display:inline-block; background:#16a34a; color:white; padding:12px 24px; border-radius:6px; text-decoration:none;">Download PDF</a>`;
        downloadArea.classList.remove('hidden');
    } catch (e) {
        statusMessage.textContent = "Error: " + e.message;
    } finally {
        mergeBtn.disabled = false;
    }
}

// --- Event Listeners ---
function handleNewFiles(fileList) {
    const newPdfs = Array.from(fileList).filter(f => f.type === 'application/pdf');
    if (newPdfs.length > 0) {
        newPdfs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        uploadedFiles = newPdfs;
        updateFileList();
        resetStatus();
    }
}

document.getElementById('select-files-btn').addEventListener('click', () => document.getElementById('pdf-files').click());
document.getElementById('pdf-files').addEventListener('change', e => handleNewFiles(e.target.files));
document.getElementById('merge-btn').addEventListener('click', mergePdfs);

const dropZone = document.getElementById('drop-zone');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(n => dropZone.addEventListener(n, e => { e.preventDefault(); e.stopPropagation(); }));
dropZone.addEventListener('drop', e => handleNewFiles(e.dataTransfer.files));

document.addEventListener('DOMContentLoaded', () => {
    const initialFiles = document.getElementById('pdf-files').files;
    if (initialFiles.length > 0) handleNewFiles(initialFiles);
    else updateFileList();
});