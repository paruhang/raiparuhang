// Tool catalog — single source of truth for landing + tools pages.
const BASE = "https://raiparuhang.com.np";
const toolUrl = (slug) => `${BASE}/${slug}`;

const ICONS = {
  qr: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/></svg>',
  barcode: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 5v14M7 5v14M10 5v14M13 5v14M16 5v14M19 5v14"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>',
  wheel: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5 5l14 14M19 5L5 19"/></svg>',
  percent: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M19 5L5 19"/></svg>',
  image: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-7 7"/></svg>',
  resize: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/></svg>',
  ratio: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M9 6v12M15 6v12" stroke-dasharray="2 2"/></svg>',
  compress: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5M9 9l-5-5M15 9l5-5M9 15l-5 5M15 15l5 5"/></svg>',
  svg: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7l3 3v13H4z"/><path d="M11 4v3h3M8 14h2v3M14 14h2v3M11 14v3"/></svg>',
  pdfImg: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 14l3-3 5 5"/></svg>',
  imgPdf: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M21 7v12a2 2 0 0 1-2 2H8"/></svg>',
  merge: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v6a5 5 0 0 0 5 5h0a5 5 0 0 0 5-5V3M12 14v7M9 18l3 3 3-3"/></svg>',
  word: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13l1.5 5L11 14l1.5 4L14 13"/></svg>',
  csv: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h7M6 5l-3 3 3 3M21 16h-7M18 13l3 3-3 3"/></svg>',
  text: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  case: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18l4-12 4 12M5.5 14h5M14 12a3 3 0 1 1 6 0v6M14 18h6"/></svg>',
  code: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/></svg>',
  braces: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4c-2 0-3 1-3 3v3c0 1.5-.5 2-2 2 1.5 0 2 .5 2 2v3c0 2 1 3 3 3M16 4c2 0 3 1 3 3v3c0 1.5.5 2 2 2-1.5 0-2 .5-2 2v3c0 2-1 3-3 3"/></svg>'
};

const TOOLS = [
  { name: "QR Code Generator", slug: "qr-code-generator", description: "Create QR codes for URLs, WiFi, text, email, and more instantly.", category: "Generators", icon: "qr", featured: true },
  { name: "Barcode Generator", slug: "bar-code-generator", description: "Generate EAN, UPC, Code 128 barcodes instantly in your browser.", category: "Generators", icon: "barcode" },
  { name: "Password Generator", slug: "password-generator", description: "Generate strong, secure random passwords instantly in your browser.", category: "Generators", icon: "lock", featured: true },
  { name: "Wheel of Names", slug: "wheel-of-names", description: "Spin a wheel to randomly pick a name from your list.", category: "Generators", icon: "wheel" },
  { name: "Percentage Calculator", slug: "percentage-calculator", description: "Percentage between values, increase / decrease, and more.", category: "Generators", icon: "percent" },

  { name: "Image Converter", slug: "image-converter", description: "Convert images between JPG, PNG, WebP and more formats instantly.", category: "Image", icon: "image", featured: true, span: "wide" },
  { name: "Image Resizer", slug: "image-size-resizer", description: "Resize images with custom dimensions directly in your browser.", category: "Image", icon: "resize" },
  { name: "Aspect Ratio Calculator", slug: "aspect-ratio-calculator", description: "Calculate image dimensions and aspect ratios instantly.", category: "Image", icon: "ratio" },
  { name: "Image Compressor", slug: "image-compressor", description: "Compress JPG, PNG and WebP with before/after preview and batch support.", category: "Image", icon: "compress" },
  { name: "SVG to PNG", slug: "svg-to-png", description: "Rasterize SVG into PNG — upload a file, paste code, or load from URL.", category: "Image", icon: "svg" },

  { name: "PDF to Image", slug: "pdf-to-image", description: "Convert PDF pages into high-quality images instantly in browser.", category: "PDF", icon: "pdfImg" },
  { name: "Image to PDF", slug: "image-to-pdf", description: "Combine multiple images into a single PDF instantly and securely.", category: "PDF", icon: "imgPdf" },
  { name: "PDF Merger", slug: "pdf-merger", description: "Merge multiple PDF files into a single document.", category: "PDF", icon: "merge", featured: true },

  { name: "PDF to Word", slug: "pdf-to-word", description: "Convert PDF files into editable Word documents instantly in browser.", category: "Converters", icon: "word" },
  { name: "CSV ↔ JSON", slug: "csv-to-json", description: "Convert CSV to JSON instantly with live preview in your browser.", category: "Converters", icon: "csv" },

  { name: "Word Counter", slug: "word-counter", description: "Count words, characters, sentences, reading time and keyword density.", category: "Text", icon: "text" },
  { name: "Case Converter", slug: "case-converter", description: "Convert text to UPPER, lower, Title Case, camelCase and more.", category: "Text", icon: "case" },

  { name: "Base64 Encoder", slug: "base-64-encoder", description: "Encode text or files to Base64 and decode back to text or binary.", category: "Developer", icon: "code" },
  { name: "JSON Formatter", slug: "json-formatter", description: "Format, validate and process JSON entirely in your browser.", category: "Developer", icon: "braces", featured: true }
];

const CATEGORIES = ["Generators", "Image", "PDF", "Converters", "Text", "Developer"];

function cardHTML(tool) {
  const wide = tool.span === "wide" ? " wide" : "";
  return `
  <article class="card${wide}" data-category="${tool.category}" data-name="${tool.name.toLowerCase()}" data-desc="${tool.description.toLowerCase()}">
    <div>
      <div class="card-top">
        <div class="card-icon" aria-hidden="true">${ICONS[tool.icon] || ICONS.code}</div>
        <span class="card-cat">${tool.category}</span>
      </div>
      <h3>${tool.name}</h3>
      <p class="card-desc">${tool.description}</p>
    </div>
    <span class="card-cta">Open tool
      <svg class="arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
    </span>
    <a class="card-link" href="${toolUrl(tool.slug)}" aria-label="Open ${tool.name}"></a>
  </article>`;
}

window.SITE = { TOOLS, CATEGORIES, cardHTML, toolUrl };
