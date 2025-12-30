/* --- NAVIGATION LOGIC --- */
// --- 1. MOBILE MENU TOGGLE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const siteSidebar = document.getElementById('siteSidebar');

    if (menuToggle && siteSidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate closing
            siteSidebar.classList.toggle('active');
        });

        // Close sidebar when clicking anywhere else on the screen
        document.addEventListener('click', (e) => {
            if (!siteSidebar.contains(e.target) && siteSidebar.classList.contains('active')) {
                siteSidebar.classList.remove('active');
            }
        });
    }
});

// 2. Global Tool Search & "/" Shortcut
const toolSearch = document.getElementById('toolSearch');
window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== toolSearch) {
        e.preventDefault();
        toolSearch.focus();
    }
});

if (toolSearch) {
    toolSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const isMatch = link.textContent.toLowerCase().includes(term);
            link.style.display = isMatch ? 'flex' : 'none';
        });
    });
}

/* --- YOUR ORIGINAL QR LOGIC (UNCHANGED) --- */

let activeTab = 'url';
let logoImage = "";

const qrCode = new QRCodeStyling({
    width: 260,
    height: 260,
    type: "svg",
    data: "https://raiparuhang.com.np",
    dotsOptions: { color: "#6366f1", type: "rounded" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 10 }
});

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("canvas-container");
    if (container) qrCode.append(container);
});

// --- 2. UPDATED TAB SWITCHING LOGIC ---
window.switchTab = function(event, tabId) {
    // Prevent page jump
    if (event) event.preventDefault();
    
    activeTab = tabId;

    // Update Button UI
    document.querySelectorAll('.tab-link').forEach(btn => {
        btn.classList.remove('active');
    });
    // Support both mobile and desktop buttons if they share the class
    document.querySelectorAll(`.tab-link[data-tab="${tabId}"]`).forEach(btn => {
        btn.classList.add('active');
    });

    // Update Panel Visibility
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none'; // Ensure it's hidden
    });
    
    const activePanel = document.getElementById(tabId);
    if (activePanel) {
        activePanel.classList.add('active');
        activePanel.style.display = 'block';
    }

    // Refresh QR Code
    updateQR();
};

window.updateQR = function() {
    let qrData = "";
    if (activeTab === 'url') qrData = document.getElementById('qr-url').value || "https://raiparuhang.com.np";
    else if (activeTab === 'wifi') {
        const ssid = document.getElementById('wifi-ssid').value || "WiFi";
        const pass = document.getElementById('wifi-pass').value || "";
        const enc = document.getElementById('wifi-type').value;
        qrData = `WIFI:S:${ssid};T:${enc};P:${pass};;`;
    } 
    else if (activeTab === 'text') qrData = document.getElementById('qr-text').value || "Hello!";

    qrCode.update({
        data: qrData,
        dotsOptions: { color: document.getElementById('qr-color').value, type: document.getElementById('dot-style').value },
        image: logoImage
    });
};

window.handleLogo = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { logoImage = e.target.result; updateQR(); };
    reader.readAsDataURL(file);
};

window.downloadQR = function(format) {
    qrCode.download({ name: "qr-code-" + activeTab, extension: format });
};