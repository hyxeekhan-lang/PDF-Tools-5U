

/**
 * Neutral outline icons for PDF tools, with a restrained hover treatment.
 * Reduced-motion preferences are respected.
 */
import { useId, type ReactNode, type SVGProps } from "react";

export type PdfToolIconName =
  "merge-pdfs" |
  "split-pdf" |
  "rotate-pdf" |
  "delete-pages" |
  "extract-pages" |
  "reorder-pages" |
  "batch-processing" |
  "remove-pages" |
  "organize-pages" |
  "rearrange-pages" |
  "duplicate-pages" |
  "repair-pdf" |
  "flatten-pdf" |
  "optimize-pdf" |
  "remove-metadata" |
  "jpg-to-pdf" |
  "word-to-pdf" |
  "excel-to-pdf" |
  "powerpoint-to-pdf" |
  "png-to-pdf" |
  "txt-to-pdf" |
  "html-to-pdf" |
  "heic-to-pdf" |
  "pdf-to-jpg" |
  "pdf-to-word" |
  "pdf-to-excel" |
  "pdf-to-powerpoint" |
  "pdf-to-png" |
  "pdf-to-text" |
  "pdf-to-html" |
  "pdf-to-pdfa" |
  "compress-pdf" |
  "sign-pdf" |
  "add-page-numbers" |
  "add-watermark" |
  "pdf-ocr" |
  "pdf-page-editor" |
  "pdf-metadata-editor" |
  "add-images" |
  "add-text" |
  "header-footer" |
  "highlight-pdf" |
  "annotate-pdf" |
  "draw-on-pdf" |
  "crop-pdf" |
  "protect-pdf" |
  "unlock-pdf" |
  "compare-pdfs" |
  "digital-signature" |
  "redact-pdf" |
  "extract-images" |
  "extract-tables" |
  "extract-metadata" |
  "pdf-to-markdown" |
  "pdf-to-json" |
  "pdf-to-csv" |
  "pdf-translator" |
  "chat-with-pdf" |
  "ai-pdf-summarizer" |
  "ai-document-qa" |
  "ai-document-translator" |
  "ai-key-points" |
  "ai-report-generator";

type IconData = { label: string; glyph: ReactNode };

const CSS = `
.pdf-ico{display:block;flex:none;color:inherit;transform-origin:center;transition:transform .22s ease}
.pdf-ico:hover,.pdf-ico[data-active="true"],.group:hover .pdf-ico,.pdf-hover-trigger:hover .pdf-ico{transform:translateY(-1px) scale(1.04)}
@media (prefers-reduced-motion:reduce){.pdf-ico{transition:none}}
`;

export const PDF_TOOL_ICONS: Record<PdfToolIconName, IconData> = {
  "merge-pdfs": {
    label: "Merge PDFs",
    glyph: <><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" /></>,
  },
  "split-pdf": {
    label: "Split PDF",
    glyph: <><circle cx="6" cy="6" r="3" /><path d="M8.12 8.12 12 12" /><path d="M20 4 8.12 15.88" /><circle cx="6" cy="18" r="3" /><path d="M14.8 14.8 20 20" /></>,
  },
  "rotate-pdf": {
    label: "Rotate PDF",
    glyph: <><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></>,
  },
  "delete-pages": {
    label: "Delete Pages",
    glyph: <><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  },
  "extract-pages": {
    label: "Extract Pages",
    glyph: <><path d="M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="m5 11-3 3" /><path d="m5 17-3-3h10" /></>,
  },
  "reorder-pages": {
    label: "Reorder Pages",
    glyph: <><path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="m21 8-4-4-4 4" /><path d="M17 4v16" /></>,
  },
  "batch-processing": {
    label: "Batch Processing",
    glyph: <><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></>,
  },
  "remove-pages": {
    label: "Remove Pages",
    glyph: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M9 15h6" /></>,
  },
  "organize-pages": {
    label: "Organize Pages",
    glyph: <><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></>,
  },
  "rearrange-pages": {
    label: "Rearrange Pages",
    glyph: <><path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" /></>,
  },
  "duplicate-pages": {
    label: "Duplicate Pages",
    glyph: <><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></>,
  },
  "repair-pdf": {
    label: "Repair PDF",
    glyph: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" /></>,
  },
  "flatten-pdf": {
    label: "Flatten PDF",
    glyph: <><path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z" /><path d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845" /></>,
  },
  "optimize-pdf": {
    label: "Optimize PDF",
    glyph: <><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></>,
  },
  "remove-metadata": {
    label: "Remove Metadata",
    glyph: <><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" /><path d="m5.082 11.09 8.828 8.828" /></>,
  },
  "jpg-to-pdf": {
    label: "JPG To PDF",
    glyph: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
  },
  "word-to-pdf": {
    label: "Word To PDF",
    glyph: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></>,
  },
  "excel-to-pdf": {
    label: "Excel To PDF",
    glyph: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="3" x2="21" y1="15" y2="15" /><line x1="9" x2="9" y1="9" y2="21" /><line x1="15" x2="15" y1="9" y2="21" /></>,
  },
  "powerpoint-to-pdf": {
    label: "Powerpoint To PDF",
    glyph: <><path d="M2 3h20" /><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" /><path d="m7 21 5-5 5 5" /></>,
  },
  "png-to-pdf": {
    label: "PNG To PDF",
    glyph: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><circle cx="10" cy="12" r="2" /><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" /></>,
  },
  "txt-to-pdf": {
    label: "TXT To PDF",
    glyph: <><path d="M12 4v16" /><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" /><path d="M9 20h6" /></>,
  },
  "html-to-pdf": {
    label: "HTML To PDF",
    glyph: <><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></>,
  },
  "heic-to-pdf": {
    label: "HEIC To PDF",
    glyph: <><path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" /><circle cx="12" cy="13" r="3" /></>,
  },
  "pdf-to-jpg": {
    label: "PDF To JPG",
    glyph: <><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21" /><path d="m14 19 3 3v-5.5" /><path d="m17 22 3-3" /><circle cx="9" cy="9" r="2" /></>,
  },
  "pdf-to-word": {
    label: "PDF To Word",
    glyph: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></>,
  },
  "pdf-to-excel": {
    label: "PDF To Excel",
    glyph: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="3" x2="21" y1="15" y2="15" /><line x1="9" x2="9" y1="9" y2="21" /><line x1="15" x2="15" y1="9" y2="21" /></>,
  },
  "pdf-to-powerpoint": {
    label: "PDF To Powerpoint",
    glyph: <><path d="M2 3h20" /><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" /><path d="m7 21 5-5 5 5" /></>,
  },
  "pdf-to-png": {
    label: "PDF To PNG",
    glyph: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><circle cx="10" cy="12" r="2" /><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" /></>,
  },
  "pdf-to-text": {
    label: "PDF To Text",
    glyph: <><path d="M12 4v16" /><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" /><path d="M9 20h6" /></>,
  },
  "pdf-to-html": {
    label: "PDF To HTML",
    glyph: <><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></>,
  },
  "pdf-to-pdfa": {
    label: "PDF To PDF/A",
    glyph: <><rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></>,
  },
  "compress-pdf": {
    label: "Compress PDF",
    glyph: <><path d="m14 10 7-7" /><path d="M20 10h-6V4" /><path d="m3 21 7-7" /><path d="M4 14h6v6" /></>,
  },
  "sign-pdf": {
    label: "Sign PDF",
    glyph: <><path d="m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284" /><path d="M3 21h18" /></>,
  },
  "add-page-numbers": {
    label: "Add Page Numbers",
    glyph: <><path d="M11 5h10" /><path d="M11 12h10" /><path d="M11 19h10" /><path d="M4 4h1v5" /><path d="M4 9h2" /><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02" /></>,
  },
  "add-watermark": {
    label: "Add Watermark",
    glyph: <><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></>,
  },
  "pdf-ocr": {
    label: "PDF OCR",
    glyph: <><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M7 8h8" /><path d="M7 12h10" /><path d="M7 16h6" /></>,
  },
  "pdf-page-editor": {
    label: "PDF Page Editor",
    glyph: <><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" /></>,
  },
  "pdf-metadata-editor": {
    label: "PDF Metadata Editor",
    glyph: <><path d="M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z" /><path d="M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193" /><circle cx="10.5" cy="6.5" r=".5" fill="currentColor" /></>,
  },
  "add-images": {
    label: "Add Images",
    glyph: <><path d="M16 5h6" /><path d="M19 2v6" /><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /><circle cx="9" cy="9" r="2" /></>,
  },
  "add-text": {
    label: "Add Text",
    glyph: <><path d="M12 4v16" /><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" /><path d="M9 20h6" /></>,
  },
  "header-footer": {
    label: "Header Footer",
    glyph: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /></>,
  },
  "highlight-pdf": {
    label: "Highlight PDF",
    glyph: <><path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" /></>,
  },
  "annotate-pdf": {
    label: "Annotate PDF",
    glyph: <><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" /><path d="M7 11h10" /><path d="M7 15h6" /><path d="M7 7h8" /></>,
  },
  "draw-on-pdf": {
    label: "Draw On PDF",
    glyph: <><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></>,
  },
  "crop-pdf": {
    label: "Crop PDF",
    glyph: <><path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M18 22V8a2 2 0 0 0-2-2H2" /></>,
  },
  "protect-pdf": {
    label: "Protect PDF",
    glyph: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  },
  "unlock-pdf": {
    label: "Unlock PDF",
    glyph: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>,
  },
  "compare-pdfs": {
    label: "Compare PDFs",
    glyph: <><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M11 18H8a2 2 0 0 1-2-2V9" /></>,
  },
  "digital-signature": {
    label: "Digital Signature",
    glyph: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>,
  },
  "redact-pdf": {
    label: "Redact PDF",
    glyph: <><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></>,
  },
  "extract-images": {
    label: "Extract Images",
    glyph: <><path d="m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16" /><path d="M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2" /><circle cx="13" cy="7" r="1" fill="currentColor" /><rect x="8" y="2" width="14" height="14" rx="2" /></>,
  },
  "extract-tables": {
    label: "Extract Tables",
    glyph: <><path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></>,
  },
  "extract-metadata": {
    label: "Extract Metadata",
    glyph: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><circle cx="11.5" cy="14.5" r="2.5" /><path d="M13.3 16.3 15 18" /></>,
  },
  "pdf-to-markdown": {
    label: "PDF To Markdown",
    glyph: <><line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" /><line x1="10" x2="8" y1="3" y2="21" /><line x1="16" x2="14" y1="3" y2="21" /></>,
  },
  "pdf-to-json": {
    label: "PDF To JSON",
    glyph: <><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" /><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" /></>,
  },
  "pdf-to-csv": {
    label: "PDF To CSV",
    glyph: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M8 13h2" /><path d="M14 13h2" /><path d="M8 17h2" /><path d="M14 17h2" /></>,
  },
  "pdf-translator": {
    label: "PDF Translator",
    glyph: <><path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" /></>,
  },
  "chat-with-pdf": {
    label: "Chat With PDF",
    glyph: <><path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /><path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1" /></>,
  },
  "ai-pdf-summarizer": {
    label: "AI PDF Summarizer",
    glyph: <><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /><path d="M20 2v4" /><path d="M22 4h-4" /><circle cx="4" cy="20" r="2" /></>,
  },
  "ai-document-qa": {
    label: "AI Document Q&A",
    glyph: <><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" /><path d="M9 9.5a3 2.5 0 016 0c0 2-2 2-3 3.5" /><path d="M12 17h.01" /></>,
  },
  "ai-document-translator": {
    label: "AI Document Translator",
    glyph: <><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></>,
  },
  "ai-key-points": {
    label: "AI Key Points",
    glyph: <><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a2 2 0 0 1 1-1.586l.586-.586a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></>,
  },
  "ai-report-generator": {
    label: "AI Report Generator",
    glyph: <><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></>,
  },
};

export const PDF_TOOL_ICON_NAMES = Object.keys(PDF_TOOL_ICONS) as PdfToolIconName[];

const TOOL_ICON_ALIASES: Record<string, PdfToolIconName> = {
  "merge-pdf": "merge-pdfs",
  "scan-to-pdf": "jpg-to-pdf",
  "add-link-preview": "add-text",
  "pdf-compare": "compare-pdfs",
  "pdf-metadata": "pdf-metadata-editor",
  "draw-pdf": "draw-on-pdf",
  "pdf-accessibility-checker": "pdf-ocr",
  "pdf-form-creator": "add-text",
};

function isPdfToolIconName(name: string): name is PdfToolIconName {
  return Object.prototype.hasOwnProperty.call(PDF_TOOL_ICONS, name);
}

export function resolvePdfToolIconName(toolSlug: string): PdfToolIconName {
  const iconName = TOOL_ICON_ALIASES[toolSlug] ?? toolSlug;
  if (!isPdfToolIconName(iconName)) throw new Error(`Missing SVG icon for PDF tool "${toolSlug}".`);
  return iconName;
}

export type PdfToolIconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  /** Which tool icon to show, e.g. "merge-pdfs" */
  name: PdfToolIconName;
  /** Width and height in pixels (default 64) */
  size?: number | string;
  /** Force the hover look, e.g. while the parent card is hovered or selected */
  active?: boolean;
  /** Accessible label (defaults to the tool name) */
  title?: string;
};

export function PdfToolIcon({ name, size = 64, active = false, title, className, ...rest }: PdfToolIconProps) {
  const icon = PDF_TOOL_ICONS[name];
  const iconId = `pdf-ico-${useId().replace(/:/g, "")}`;
  if (!icon) return null;
  const label = title ?? icon.label;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      data-active={active ? "true" : undefined}
      className={className ? `pdf-ico ${className}` : "pdf-ico"}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <title>{label}</title>
      <style>{CSS}</style>
      <g id={iconId}>{icon.glyph}</g>
    </svg>
  );
}

export default PdfToolIcon;

