# PDF Pilot 5U Implementation Checklist

Status key: **Complete**, **Partial**, or **Not configured**. Catalog and dispatch coverage do not mean every tool has been executed end-to-end. “Production Ready” remains “Not verified” until the relevant browser/device, provider, security, and deployment checks are completed.

| Feature group | UI Complete | Backend Complete | Integration Complete | Tested | Production Ready |
|---|---|---|---|---|---|
| Original blog guides | Six original articles, each over 1,500 words, with previews, reading times, contents links, and related tools | N/A | Canonical article routes and sitemap generation | All six prerendered pages checked for HTTP 200 and visible text above 1,500 words | Not verified |
| Cookie and privacy notice | Offers Accept all, Accept only essential, and an X that means essential-only; choices can be reopened | Firebase Analytics is gated behind Accept all; no ads are loaded | Consent choice is stored locally; Google OAuth uses Neon Auth | Essential-only and reopen behavior checked; Firebase rejected the supplied key locally and needs console verification | Not a certified consent-management platform |
| PDF organize: merge, split, delete/remove, extract, reorder, duplicate, rotate | Complete | Complete | Complete | Partial | Not verified |
| PDF optimize/edit: compress, optimize, flatten forms, crop, metadata, repair | Complete | Complete | Complete | Partial | Not verified |
| Images and text: JPG/PNG/HEIC to PDF; PDF to JPG/PNG/text/HTML/Markdown/JSON/CSV | Complete | Complete | Complete | Partial | Not verified |
| Office/text conversions: DOCX/XLSX/PPTX/HTML to basic text-based PDF; PDF text to DOCX/XLSX; PDF pages to raster PPTX slides | Complete | Complete | Complete | Partial | Not verified |
| PDF editing: add text/images, watermark, page numbers, header/footer, visible signature, selected-page notes, searchable-text highlights, freehand drawing | Complete | Complete | Complete | Partial | Not verified |
| Password protection/unlock: AES-256 encryption and password-authorized decryption | Complete | Complete | Complete | AES-256 round-trip, wrong-password rejection | Not verified |
| English OCR and selectable-text redaction via rasterized output | Complete | Complete | External language model download | Partial | Not verified |
| PDF compare, metadata extraction, page thumbnails and batch operations | Complete | Complete | Complete | Partial | Not verified |
| Local validation, progress, result downloads, ZIP downloads and browser file history | Complete | Complete | Complete | Partial | Not verified |
| Embedded image extraction to PNG with per-page progress and safe export limits | Complete | Complete | Complete | Live browser smoke test (PNG output and no-image error) | Not verified |
| Contact, legal policies, help, blog and footer links | Complete | N/A | Contact email supplied; policies updated for Neon/AI; footer destinations checked | Static routes covered by production smoke test pending | Not verified |
| Tool catalog and duplicate aliases | Complete | Complete | Hidden provider-dependent tools; duplicate URLs permanently redirected | Catalog assertions pending | Not verified |
| SEO titles/descriptions, sitemap, robots, canonical links and custom 404 | Complete | N/A | Sitemap now includes canonical working tools, guides and legal pages; Search Console is external | Sitemap/404 HTTP checks pending | Not verified |
| PWA install entry and red-branded SVG identity | Complete | N/A | Manifest configured; Chrome/Apple installation pending browser verification | Pending | Not verified |
| Neon email auth, password reset, optional Google OAuth, history/favorites schema | Complete | Partial | Versioned migration is ready, but Vercel's connected production branch lacks `auth.user_id()` and the `authenticated` role | Enable Neon Auth/Data API on the correct branch, then confirm migration and signup/login/history | Blocked |
| Gemini chat, summarization, Q&A, translation, key points and reports | Complete | Complete | Server-only `GEMINI_API_KEY` configured in Vercel Production; `gemini-3.5-flash-lite` provider verified | 20 automated tests cover migration gating, a no-login request, and the per-IP limit; production guest flow still needs manual verification | Not fully verified |
| AdSense disclosure, ads.txt generation and consent readiness | Ads are not enabled and no empty ad placeholders are rendered | Publisher ID/approved account missing | No publisher ID supplied; ads.txt is not fabricated; certified CMP required where applicable | Not submitted | Not ready |
| PDF/A, certificate-backed signatures, high-fidelity Office conversion, billing | Catalog only | Provider/engine required | Not configured | Not tested | Not ready |

## Important capability boundaries

- Office-to-PDF conversion extracts text only; it does not preserve the original layout, images, formulas, or formatting.
- PDF-to-DOCX/XLSX exports selectable text with simplified structure. Scanned pages require OCR, and PDF-to-XLSX does not reconstruct table columns.
- PDF-to-PPTX creates one full-slide image per page. It preserves rendered appearance but does not make the page contents editable.
- OCR currently uses the English model only, downloaded by Tesseract.js from its configured CDN. OCR/raster redaction can consume substantial memory on large files; OCR also rasterizes pages and rebuilds an English invisible text layer.
- Redaction matches selectable text runs; text broken across runs and text in scanned images may not match. It rasterizes every page and masks full matching text runs, removing text objects, links, forms, and other PDF interactivity. Inspect every result before sharing; scanned text needs OCR first.
- Annotation notes are visible flattened page content, not interactive PDF annotations. Highlighting matches complete selectable text runs only. Freehand drawing currently places a signature-like mark at a fixed page location.
- “Repair PDF” can only rebuild pages that PDF.js can render. It rasterizes pages and does not preserve selectable text, forms, or links.
- The visible signature tool is not a certificate-backed digital signature.
- Image extraction exports decoded embedded raster images as PNGs; it does not extract vector artwork or full-page backgrounds. Per-image and aggregate limits protect browser memory.
- Gemini AI extracts selectable text on-device and sends it only after explicit consent; the source PDF stays local. Scanned documents require OCR first. AI works without login and uses a best-effort per-IP rate limit per server instance.
- PDF-to-Word exports selectable text as a downloadable DOCX with simplified structure; it does not reconstruct the source layout.
- Compression rasterizes pages and is lossy; optimization rewrites PDF objects without promising a smaller file.
- Protect PDF uses AES-256; Unlock PDF requires a user-supplied password and does not attempt password recovery or bypass. Password-protected inputs remain unsupported in other tools until unlocked first.
- PDF processing runs in the user's browser. The app uses Neon Auth and Neon Data API for account data. Gemini calls use a server-only API key and do not log document contents.
- AdSense is not currently active. Search Console submission, AdSense application/approval, publisher ID, and any required certified consent-management platform require access to the owner's Google accounts.
- Firebase Analytics is initialized only when valid configuration is present and the visitor chooses “Accept all”; without configuration it remains unavailable. “Accept only essential” and the X keep analytics disabled. The site does not currently run ads. This notice is not a certified consent-management platform; configure one where required before serving ads.
- The current automated suite covers file validation, page ranges, merge/split, page operations, metadata removal, AES-256 protect/unlock round-trip and wrong-password rejection, text-to-PDF, Office archive validation, PPTX package/image structure, HEIC signatures, note annotations, and redaction input validation. End-to-end OCR, HEIC decoding, rendered PPTX output, redaction masks, and the other Office conversions still need browser-level tests.

## Remaining verification and setup

- [ ] Browser-level tests for each working tool, including actual OCR, HEIC decoding, PDF-to-PPTX rendering, redaction masks, and Office conversion output validity.
- [ ] Large-file, corrupted-file, password-protected, mobile, and cross-browser testing.
- [ ] Enable Neon Auth/Data API on the Vercel-linked production branch, redeploy and confirm the schema migration; verify trusted domains, email delivery, and Google OAuth if offered.
- [ ] Verify production guest AI with a user-approved, non-sensitive PDF; confirm explicit consent and per-IP limits.
- [ ] Verify Neon signup/login/session/history and production redirect URLs.
- [ ] Submit the sitemap in Google Search Console using the owner's Google account.
- [ ] Supply the AdSense publisher ID after account approval, verify generated `ads.txt`, and configure a Google-certified CMP where required before enabling ads.
- [ ] Configure providers/engines for additional OCR languages, payments, PDF/A, PKI signatures, or high-fidelity Office conversion.
- [ ] Review retention, privacy, rate limits, and production deployment configuration.
