export type BlogSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
  steps?: string[]
}

export type Post = {
  slug: string
  title: string
  summary: string
  preview: string
  date: string
  icon: 'privacy' | 'merge' | 'compress' | 'ocr' | 'redact' | 'word'
  sections: BlogSection[]
  relatedTools: { slug: string; label: string }[]
}

export const POSTS: Post[] = [
  {
    slug: 'why-browser-based-pdf-tools',
    title: 'What “processed in your browser” means for a PDF',
    summary: 'A practical guide to local file processing, browser storage, AI exceptions, and the limits of online privacy claims.',
    preview: 'Learn what happens to a document when a web tool runs locally, what information can still leave a device, and how to check a workflow before using it for sensitive files.',
    date: 'November 2026',
    icon: 'privacy',
    relatedTools: [{ slug: 'merge-pdf', label: 'Merge PDFs' }, { slug: 'pdf-to-text', label: 'PDF to Text' }],
    sections: [
      {
        heading: 'Start with a precise definition',
        paragraphs: [
          'A browser-based PDF tool is a web page that uses code running in your browser tab to read and modify a document. In a local workflow, the selected file is opened by the device, processed in memory, and turned into a downloadable result without sending the document bytes to the application server. “Local” describes that file-processing step; it is not a promise that a browser, operating system, network, or every optional feature sends no information at all.',
          'That distinction matters because a modern website still needs to download its page, scripts, fonts, and sometimes processing libraries. The browser makes network requests for those assets before or while a tool runs. A request for a script is different from uploading the PDF itself, but both are network activity. A careful privacy explanation separates the file from ordinary site requests instead of using a broad phrase such as “nothing ever leaves your device.”',
        ],
      },
      {
        heading: 'What happens after you choose a file',
        paragraphs: [
          'When a user chooses a file through a file picker, the browser gives the page temporary access to that selected file. JavaScript can read its bytes after the user action, parse the PDF structure, and draw pages for a preview. Libraries can then copy pages, extract selectable text, or render page images. The file usually remains in the tab’s memory while the operation runs; the page does not automatically gain access to other files on the device.',
          'After processing, a tool can create a Blob, which is an in-memory object representing the output bytes. A download link asks the browser to save that result. The application may also store a result in local browser storage if a “My Files” feature is enabled. That is different from server storage: the data remains in that browser profile until the user deletes it or clears browser data, and it may not be available on another device.',
        ],
      },
      {
        heading: 'Local processing is not the same as a security guarantee',
        paragraphs: [
          'Keeping the document out of an application upload endpoint reduces one category of exposure, but it does not make every device safe. A compromised computer, a browser extension with broad permissions, screen sharing, malware, or an account shared with another person can still expose what is on screen or stored locally. Users should follow their organization’s rules for confidential files and should not rely on a web page as a substitute for endpoint security or access control.',
          'A PDF may also contain personal information in visible text, annotations, form values, links, metadata, or hidden layers. A local tool does not decide whether the user is allowed to edit or share that material. Before sharing an output, inspect the pages and the document properties. If the file contains regulated, legal, health, or financial information, confirm the applicable policy with the responsible organization before processing it.',
        ],
      },
      {
        heading: 'Know which features need a network',
        paragraphs: [
          'Some browser tools can work after their scripts and models have loaded, while other features call a separate service. Optical character recognition may download a language model the first time it is used. A translation or document-question feature may send extracted text to an AI provider after the user signs in and gives explicit permission. These are separate data flows and should be described beside the feature, not hidden behind the general description of local PDF processing.',
          'PDF Pilot 5U’s optional AI workflow uses selectable text extracted in the browser and sends that text to Google Gemini only after the user gives consent. A registered account is not required; requests are rate-limited by IP. The source PDF is not sent by that workflow, but the selected text is. Scanned pages need OCR before they have selectable text. Users should review the provider’s terms and avoid sending information they are not authorized to disclose.',
        ],
      },
      {
        heading: 'What a network check can and cannot tell you',
        paragraphs: [
          'A browser’s developer tools can show requests made by a page. For a simple local conversion, a user can open the Network panel, clear the existing list, run the conversion, and look for requests that occur during processing. A request list can help identify obvious uploads, but interpreting it takes care: background refreshes, authentication checks, fonts, crash reporting, and model downloads may happen at the same time.',
          'A useful check is to compare the requests before and after the file is selected, then repeat with a small non-sensitive sample. The absence of a large request is not proof that no data was sent, and a request’s size alone does not establish its purpose. For organizations with stricter requirements, use a security review or a controlled test environment rather than treating a quick browser inspection as an audit.',
        ],
      },
      {
        heading: 'Browser memory and performance',
        paragraphs: [
          'PDF rendering can use substantial memory, especially for long documents, high-resolution scans, and image-heavy pages. A page may need to hold the original bytes, parsed structures, rendered canvases, and the output at the same time. A tool that works smoothly on a short sample may slow down or fail on a much larger file, particularly on a phone or an older computer.',
          'For a large job, close unnecessary tabs, keep the original file safe, and test a few pages first. If a browser reports that a page is unresponsive, wait briefly before reloading; reloading discards in-memory progress. Avoid uploading a very large or irreplaceable file until you understand the tool’s limits. A trustworthy interface should explain file-size limits and report processing errors rather than pretending that every document will succeed.',
        ],
      },
      {
        heading: 'Browser storage and shared devices',
        paragraphs: [
          'Local storage and IndexedDB persist data in a browser profile after the tab closes. A language choice or theme can be stored there as a small preference. A file-history feature may store generated results in IndexedDB so they can be downloaded again later. This can be convenient, but it also means that someone using the same profile may see those results unless the user deletes them or clears the browser’s site data.',
          'On a public or shared device, do not save sensitive outputs in browser history. Download the file only to a location controlled by you, remove any result saved by the site, sign out of accounts, and close the browser session. Private browsing can reduce some persistence but is not a guarantee against device monitoring or network logging. Check the actual browser and operating-system behavior rather than assuming a private window erases every trace.',
        ],
      },
      {
        heading: 'Accessibility and editable content',
        paragraphs: [
          'The kind of output matters as much as the processing location. Converting a page to a JPEG can make a file smaller or easier to preview, but it can remove selectable text, links, form controls, and screen-reader access. A flattened signature or note is visible content, not an interactive annotation. A repair operation that rebuilds rendered pages can also lose structure. Tool descriptions should make these differences clear before a user starts.',
          'When accessibility or later editing is important, keep an original and prefer an operation that preserves text and structure. Open the result in a PDF reader and try selecting text, following links, using search, and navigating headings or form fields. If the output is intended for assistive technology or publication, run the appropriate accessibility checks; visual similarity alone does not demonstrate that the document remains accessible.',
        ],
      },
      {
        heading: 'Choosing between local and server tools',
        paragraphs: [
          'Local processing is a good fit for common page operations, simple conversions, and users who prefer not to upload their source file to an application server. Server-based systems may be better suited to very large files, complex office rendering, batch jobs, or workflows that require managed storage and collaboration. Those benefits come with different questions about accounts, retention periods, access control, and provider contracts.',
          'There is no universally best architecture. Compare the exact operation, supported file types, output quality, file limits, retention behavior, and whether a provider receives the source or extracted content. Avoid choosing a service solely because it calls itself private or secure. Look for an accurate description of the data path and a way to test a representative document before committing a production workflow.',
        ],
      },
      {
        heading: 'A practical privacy checklist',
        paragraphs: [
          'Before working with an important PDF, identify what the document contains and what the intended output must preserve. Confirm that the tool supports the file type, that the operation runs where the product says it does, and that any optional AI or OCR service is clearly identified. Keep a safe original copy. Use a short sample for large or unusual documents, then verify the output in a separate viewer.',
          'After processing, check the page count, reading order, visible text, metadata, links, and any sensitive regions relevant to the task. Delete browser-stored results when they are no longer needed, especially on shared computers. Read the site’s privacy and cookie information for the application’s actual behavior. If a statement is vague or conflicts with the feature’s behavior, ask the provider rather than guessing.',
          'A useful privacy habit is to separate the questions “where is the file processed?” and “what data does the website otherwise receive?” The first concerns document bytes and conversion code; the second can include sign-in data, page requests, and optional feature inputs. Ask for a clear answer to each question. If the answer changes when you enable an integration, treat that integration as a separate workflow and review its permissions before providing information.',
        ],
        bullets: [
          'Local document processing does not mean that no website resources or optional services use the network.',
          'A visible overlay is not necessarily a permanent redaction, and a page image is not equivalent to editable text.',
          'Keep the original, inspect outputs, and remove locally stored results when appropriate.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-merge-pdfs',
    title: 'How to merge PDF files and verify the combined document',
    summary: 'A step-by-step guide to combining PDFs, controlling order, avoiding common errors, and checking the output.',
    preview: 'Plan the page sequence, merge only files you are allowed to use, and check the new PDF before you send or archive it.',
    date: 'November 2026',
    icon: 'merge',
    relatedTools: [{ slug: 'merge-pdf', label: 'Merge PDFs' }, { slug: 'reorder-pages', label: 'Reorder Pages' }, { slug: 'rotate-pdf', label: 'Rotate PDF' }],
    sections: [
      {
        heading: 'When combining files is useful',
        paragraphs: [
          'Merging puts pages from several PDF files into one document. People use it to assemble a packet, combine an application with supporting pages, place a cover sheet before a report, or keep related records together. The operation is about page sequence; it does not automatically reconcile different page sizes, update a table of contents, combine form fields, or make every source document look identical.',
          'Before you begin, decide whether the files belong together and whether you have permission to combine and share them. Create a short list of the intended order. If a packet needs page numbers, bookmarks, or a specific paper size, note those requirements separately because a basic merge may not add or harmonize them. Planning reduces mistakes that are easy to miss in a long output.',
        ],
      },
      {
        heading: 'Prepare the source PDFs',
        paragraphs: [
          'Open each source file once and confirm that it is the correct document, not an earlier draft with a similar name. Check that the pages display, that the file is not damaged, and that any password protection can be opened with a password you are authorized to use. PDF Pilot 5U’s other tools do not automatically bypass passwords; an encrypted document must be unlocked with the correct password before a merge can read it.',
          'If the documents contain pages in the wrong orientation, rotate them before or after merging and inspect the result. If you need only a portion of a source file, extract those pages first rather than adding the entire document and trying to remove pages later. Keep the originals in a separate folder so that a mistake in the combined file does not destroy your source material.',
        ],
      },
      {
        heading: 'Step-by-step merge workflow',
        paragraphs: [
          'In PDF Pilot 5U, open the Merge PDFs page and select two or more PDF files. The file picker lets you choose multiple files; the page also accepts files through its drop area. Confirm that every selected filename appears in the list. If one file is missing, add it before processing instead of assuming the tool inferred it from a folder or a previous session.',
          'The order displayed in the file list controls the combined sequence: pages from the first file come first, followed by pages from the next file. Use the available ordering controls to move files until the list matches your plan. Then start processing and wait for the completion state. Download the resulting PDF and give it a clear name that distinguishes it from the individual source documents.',
        ],
        steps: [
          'Write down the intended order before choosing files.',
          'Select the source PDFs and check the displayed names and order.',
          'Process the files, download the result, and open it in a PDF reader.',
        ],
      },
      {
        heading: 'Check the page sequence',
        paragraphs: [
          'Do not rely only on the first page of the output. Compare the page count with the sum of the source page counts, then inspect the first and last pages of each source section. For a critical packet, use thumbnails or page navigation to review the transition points. A file can be structurally valid but still have a missing attachment or an unexpected page in the middle.',
          'Remember that printed page numbers may restart in each source document. The PDF viewer’s page number is the position in the merged file, while a footer printed on the page may show a different number. A merge usually preserves the page content rather than renumbering it. If a unified sequence is needed, add page numbers afterward and check that they do not cover existing text.',
        ],
      },
      {
        heading: 'Page size, orientation, and visual differences',
        paragraphs: [
          'Merged PDFs can contain letter, A4, legal, portrait, and landscape pages in the same file. That is not automatically an error: the merge keeps each page’s dimensions rather than forcing everything onto one sheet size. Review the document in a viewer that displays page boundaries. If the file will be printed, confirm the printer’s scaling and paper settings before producing a full copy.',
          'Source files may use different fonts, margins, colors, or scan quality. A merge does not standardize these choices. It also does not improve the readability of a blurry scan. If a section is sideways, rotate it; if it is too faint, use a suitable image or scan workflow and compare the result against the original. Avoid changing visual content when the exact original appearance is important.',
          'Mixed page sizes can also change the way a recipient scrolls through or prints the packet. A desktop viewer may fit each page independently, while a printer may shrink a larger sheet to fit the selected paper. If uniform printing matters, test a copy using the intended print settings and verify that no page is clipped. Do not silently crop or scale legal, technical, or signed material just to make the thumbnail grid look consistent.',
        ],
      },
      {
        heading: 'Bookmarks, forms, and document features',
        paragraphs: [
          'A basic page merge should not be assumed to combine every navigation feature. Bookmarks, named destinations, interactive forms, signatures, or document-level settings can behave differently depending on how the source PDFs were made and how the merge library handles them. If a workflow depends on a particular form field or bookmark, test a copy first and verify that feature in the final output.',
          'A digital signature applied to a source PDF may no longer validate after the file is modified or combined. A visible signature image and a certificate-backed digital signature are not the same thing. If legal or compliance rules require a verifiable signature, consult the responsible signer or records team before editing the signed file. Keep the untouched signed original as the authoritative source.',
        ],
      },
      {
        heading: 'Common problems and practical fixes',
        paragraphs: [
          'If a file is rejected, confirm that it is a genuine PDF rather than a renamed Word document or image. If a PDF opens in a reader but fails in a browser tool, it may use encryption, unusual features, or damaged internal data. Try opening a copy in a trusted PDF reader and exporting a repaired copy only if your organization permits that change. Never use a repair step on the only copy of an important record.',
          'If the merged result has fewer pages than expected, check the source page counts and the selected files again. If pages are out of sequence, repeat the operation with a written order and inspect the list immediately before processing. If the browser runs out of memory, close other tabs and try a smaller set. For a very large packet, merging smaller groups and then combining the group outputs can be easier to diagnose.',
        ],
      },
      {
        heading: 'Privacy and handling the output',
        paragraphs: [
          'PDF Pilot 5U’s merge operation processes the selected PDF bytes in the browser; it does not upload the source documents to an application server. The website still needs to load its code, and ordinary hosting requests can include technical information such as the requested page. If you use an account feature, account information is handled by Neon Auth. Read the privacy policy for the current details and do not infer that every part of a website is offline.',
          'Generated results may be listed in My Files using browser storage until you delete them or clear site data. On a shared computer, download only to a location you control, remove the browser-stored result, and sign out. Before sending the merged file, review every page for private material that should not be included. Combining documents can unintentionally bring together data that was previously kept in separate files.',
        ],
      },
      {
        heading: 'A final quality-control checklist',
        paragraphs: [
          'A good merge is one that contains the expected pages in the expected order and can be opened by the next person who needs it. Compare the document against your source list, check the page transitions, and confirm the filename. If the recipient expects a specific format or maximum size, verify those requirements using the final file rather than relying on the settings from a source PDF.',
          'Keep the originals until the recipient has confirmed the file is usable or your retention policy says otherwise. If you discover an error, rebuild the output from those originals instead of repeatedly editing an uncertain copy. For routine work, a short checklist can prevent repeated mistakes: correct source files, correct order, correct page count, readable output, and a deliberate final destination.',
          'For a packet with a cover page, exhibits, and appendices, label the source list with section names as well as filenames. This makes it easier to spot a misplaced file when two documents have similar names. If a recipient needs a table of contents or bookmarks, create and review those separately; do not assume that putting pages together automatically creates navigation. A final page-by-page comparison is worth the extra minute for a submission or record set.',
          'When several people contribute documents, agree on one person who assembles and verifies the final packet. Ask contributors to send complete, final PDFs rather than screenshots or temporary exports. If a replacement page arrives after the merge, start from the preserved originals and replace the intended section deliberately. This avoids stacking duplicate pages into a packet and keeps a simple record of which source version was used.',
        ],
        bullets: [
          'Page count matches the sources and every section appears in the planned order.',
          'Orientation, page dimensions, printed numbering, forms, and bookmarks are reviewed where relevant.',
          'The output opens in a separate PDF reader and contains no pages that should have been excluded.',
        ],
      },
    ],
  },
  {
    slug: 'compress-pdf-honestly',
    title: 'PDF compression explained: image compression versus optimization',
    summary: 'Understand what a browser compressor changes, why file size may not always shrink, and how to check quality.',
    preview: 'Compression is a trade-off, not a magic setting. Learn when image-based compression helps and when a structure-preserving optimization is a better first choice.',
    date: 'November 2026',
    icon: 'compress',
    relatedTools: [{ slug: 'compress-pdf', label: 'Compress PDF' }, { slug: 'optimize-pdf', label: 'Optimize PDF' }, { slug: 'pdf-to-jpg', label: 'PDF to JPG' }],
    sections: [
      {
        heading: 'Two different meanings of “compress”',
        paragraphs: [
          'People often use “compress a PDF” to mean any operation that makes a document smaller, but PDF tools can achieve that in different ways. One approach rewrites internal objects more compactly without intentionally converting pages to pictures. Another renders pages as images, compresses those images, and builds a new PDF from them. The file-size change and the effect on text are different, so a clear tool description should say which approach it uses.',
          'PDF Pilot 5U’s Compress PDF tool redraws pages as JPEG images at the quality selected by the user. This can reduce the size of scan-heavy or photo-heavy documents, but it is lossy: text becomes part of a page image and may no longer be selectable or searchable. PDF Pilot 5U’s Optimize PDF tool rewrites PDF objects without rasterizing pages. That can preserve page content but is not guaranteed to reduce file size.',
        ],
      },
      {
        heading: 'When image-based compression can help',
        paragraphs: [
          'A document made mostly from large color scans or photographs may contain image data that dominates the total size. Re-encoding those page images at a lower quality or resolution can produce a smaller result. The method is most useful when the document will be viewed or printed and searchable text, links, forms, and accessibility structure are not required.',
          'The result depends on the source. A scan that is already highly compressed may not shrink much, and the new image encoding can introduce visible artifacts. Small type, thin lines, signatures, stamps, and faint marks can become harder to read. Compare representative pages at the size people will actually use rather than judging only by the file-size number.',
        ],
      },
      {
        heading: 'When to choose object optimization first',
        paragraphs: [
          'If the PDF contains selectable text, vector diagrams, forms, and links, an object-level optimizer is a reasonable first experiment because it does not rasterize the visible pages. It may reorganize internal objects or remove inefficiencies while keeping the page content in its original form. The output should still be checked in a separate reader because any editing operation can have compatibility effects.',
          'An object rewrite is not a promise of a smaller file. Some PDFs are already optimized, some contain content that cannot be reduced by the available rewrite, and some may become slightly larger because of new structural data. Compare the actual before-and-after sizes and confirm that the file still opens and behaves as expected. Keep the original if size is the only goal and the result does not improve.',
        ],
      },
      {
        heading: 'Choose quality for the actual purpose',
        paragraphs: [
          'There is no single image quality that is right for every document. A page containing large headings and photographs may remain readable at a setting that damages a page with dense footnotes or a small table. Decide whether the file is for on-screen reading, quick review, ordinary printing, or long-term archiving. Archival, legal, or accessibility workflows may require preserving the original instead of using a lossy copy.',
          'Test one or two representative pages first. Inspect small print, diagonal lines, light gray text, and image boundaries at normal zoom and at a larger zoom. If people will print the PDF, print a test page on the intended device. A screen preview can hide problems caused by printer scaling or low resolution. When a document has mixed page content, use the most demanding page to judge the result.',
        ],
      },
      {
        heading: 'What may change in a rasterized output',
        paragraphs: [
          'After page content is flattened into an image, text search and copy usually stop working because letters are pixels rather than text objects. Screen readers may no longer have a text layer to read. Hyperlinks, interactive form fields, bookmarks, and annotations may also be removed or cease to work. A rasterized document can look similar to the original while behaving very differently.',
          'If searchability matters, perform OCR on the raster output and verify the recognized text, or choose a workflow that preserves the selectable text when possible. OCR is not guaranteed to recognize every word correctly, especially in handwriting, low-quality scans, mixed languages, or complex tables. Keep an accessible source file when it exists and do not treat a visual match as proof that the document’s structure survived.',
          'Image-based output can also increase storage or printing requirements when the chosen resolution is high. A lower resolution may reduce size but make small writing unreadable. Check whether each page has been rendered at an appropriate scale for its intended use. The correct balance depends on the source and on how the recipient will view or print it; a single quality setting cannot be assumed to suit every page in a mixed document.',
        ],
      },
      {
        heading: 'Why a smaller file is not always better',
        paragraphs: [
          'A smaller file can be easier to email or store, but it is not automatically a better record. Lossy compression can remove detail that matters later, and a flattened page can make future editing or accessibility work harder. If the current PDF already meets the delivery limit, additional compression may add risk without a practical benefit.',
          'Some organizations need an original, a signed copy, or an archival version with specific preservation characteristics. Do not overwrite those originals with a compressed version. Save a separate copy with a descriptive filename, such as a “review” or “email” variant, and record which settings or workflow produced it when traceability is important.',
        ],
      },
      {
        heading: 'A careful workflow for reducing size',
        paragraphs: [
          'Start by measuring the source file and determining the actual target size. Check whether the file contains oversized images, unnecessary pages, or embedded content that should be removed for another reason. If you only need a subset of pages, extract them instead of recompressing every page. If the document has searchable text and no need for rasterization, try object optimization first.',
          'If you use image-based compression, choose a conservative setting for a test copy, compare quality, and adjust only after inspecting the output. Name the result separately from the original. Check the final file size, page count, orientation, readability, and text selection. If the result is not adequate, return to the original and choose a different workflow instead of repeatedly degrading the same copy.',
        ],
        steps: [
          'Keep a copy of the original and note the required maximum size.',
          'Try structure-preserving optimization when text and page behavior must remain intact.',
          'Use lossy image compression only after reviewing a representative output page.',
        ],
      },
      {
        heading: 'Privacy and browser performance',
        paragraphs: [
          'PDF Pilot 5U’s compression runs in the browser and creates the result on the user’s device. The page must still load its application code, and browser processing can use a meaningful amount of memory because pages are rendered before the new file is assembled. Large PDFs may take longer or fail on devices with limited resources. Close unrelated tabs and try a short sample before processing an irreplaceable large document.',
          'A download may be saved by the browser and a generated result may appear in the local My Files history if that feature is used. Those are different from a server-side archive. Delete stored results when they are no longer needed, especially on shared devices. Review the site privacy policy for how account services and infrastructure requests work; local conversion does not mean the entire website has no network activity.',
        ],
      },
      {
        heading: 'Verify the output, not just the percentage',
        paragraphs: [
          'A compression percentage can be useful, but the document is only successful if it remains fit for its purpose. Reopen the result in a PDF reader, inspect every page when the document is short, and sample the most detailed pages when it is long. Check that page edges are not cut off, that small labels are still readable, and that important colors or marks have not disappeared.',
          'Also test the behaviors that matter: select or search for text, follow a link, fill a form, or use a screen reader if those functions are part of the task. If any expected feature is missing, do not send the result as though nothing changed. Select a non-rasterizing workflow or keep the original. A good decision may be to deliver the larger file.',
        ],
      },
      {
        heading: 'Questions to ask before compressing',
        paragraphs: [
          'Before using a compressor, ask who will use the file and what they need to do with it. Is it merely for quick viewing, or must the recipient search, copy, print, sign, or fill out forms? Does a retention rule require an original? Is there a specific size cap from an email system or upload portal? Answers to these questions point toward the right method more reliably than choosing the strongest compression setting.',
          'If you are unsure, make two test copies from the original and compare them: one optimized structurally and one rasterized at a conservative quality. Ask the intended recipient to verify the result when their workflow has special requirements. Keep clear filenames so that a smaller review copy is not mistaken for the authoritative source. This simple separation makes later corrections easier.',
          'Also check whether the size limit applies to one attachment, a whole message, or a web form upload. Those limits are not always the same, and splitting a file into volumes may be more appropriate than reducing every page to a low-resolution image. If a portal rejects a valid PDF for a reason unrelated to size, compression may not solve the problem. Read the error message and use the portal’s supported file requirements.',
        ],
      },
    ],
  },
  {
    slug: 'make-a-scanned-pdf-searchable',
    title: 'How OCR makes a scanned PDF searchable',
    summary: 'Prepare scan pages, run browser OCR, and evaluate recognition quality before relying on extracted text.',
    preview: 'A scanned page is often only an image. This guide explains OCR, language and image-quality limits, practical verification, and the difference between recognition and proofreading.',
    date: 'November 2026',
    icon: 'ocr',
    relatedTools: [{ slug: 'pdf-ocr', label: 'PDF OCR' }, { slug: 'pdf-to-text', label: 'PDF to Text' }, { slug: 'extract-tables', label: 'Extract Tables' }],
    sections: [
      {
        heading: 'What makes a PDF searchable',
        paragraphs: [
          'A PDF can contain text objects, scanned page images, or a mixture of both. If a page is only an image, a viewer has no underlying characters to select or search. Optical character recognition, usually shortened to OCR, analyzes the visual shapes in an image and creates a text layer that can be searched or copied. The recognized text is an interpretation, not a perfect transcription.',
          'OCR often places invisible text behind the visible scan so the page keeps its appearance while gaining a searchable layer. That can make a large archive easier to navigate, but it does not repair every document. Recognition quality depends on the image, the language model, page layout, and the typeface. A person should review critical values, names, and passages against the original image.',
        ],
      },
      {
        heading: 'Identify the source document first',
        paragraphs: [
          'Try selecting a sentence in the PDF before running OCR. If the text can already be selected, the document may have a text layer and OCR may be unnecessary. If selection returns nothing or only a large rectangle, the page may be a scan. Some files mix scanned pages with digital text, so a single test page does not prove that every page has the same structure.',
          'Make a copy of the original before processing. Note the number of pages, the language or languages present, and whether the file contains handwriting, tables, stamps, or rotated pages. If the source is password protected, use the password you are authorized to use before starting an OCR workflow. A clear inventory helps distinguish a tool issue from a source that is not supported.',
        ],
      },
      {
        heading: 'Prepare pages for better recognition',
        paragraphs: [
          'OCR usually works better with straight, sharply focused pages that have strong contrast between letters and background. A skewed scan, heavy shadow near the binding, faded ink, compression blocks, or a low-resolution phone photograph can make letters difficult to distinguish. If the page is sideways, rotate it before OCR. If a page is badly cropped, obtain a better scan rather than expecting the software to reconstruct missing content.',
          'Avoid aggressive cleanup that removes punctuation, decimal points, accents, or light marks. Those details may change the meaning of a date, account number, or measurement. For multi-page work, start with a short sample that includes the most difficult page, not only the cleanest one. If the sample is unreliable, improve the scan or use a workflow with a language model and tools suited to the document.',
        ],
      },
      {
        heading: 'Run OCR in PDF Pilot 5U',
        paragraphs: [
          'Open the PDF OCR tool and select the PDF copy. PDF Pilot 5U’s current browser OCR uses an English language model. The first run may need to download that model from its configured content service, so an internet connection is needed for model setup. The selected PDF pages are processed in the browser; the model download is a separate network request from sending the document.',
          'Start the operation and allow the browser to finish rendering and recognizing the pages. A long document or a high-resolution scan can take time and use memory. Do not close the tab while processing is underway. When the result is ready, download it and open it in a PDF reader. Search for several words from different pages, then copy sample text and compare it with the visible scan.',
        ],
        steps: [
          'Make a working copy and check that pages are upright and readable.',
          'Run OCR on a representative sample, including a difficult page.',
          'Search, copy, and compare the resulting text with the original scan.',
        ],
      },
      {
        heading: 'Language and handwriting limitations',
        paragraphs: [
          'A language model is tuned to the characters and word patterns of a language. PDF Pilot 5U currently provides an English OCR model, so non-English text, mixed-language documents, and scripts that use different alphabets can be misrecognized or left without useful text. Even within English, uncommon names, technical vocabulary, abbreviations, and historical spellings can confuse a recognizer.',
          'Handwriting is particularly variable. Joined letters, personal writing styles, marginal notes, and signatures may not be recognized consistently. Tables and multi-column pages add another challenge because the software must decide which text belongs together and in what order. If a document’s content has legal or financial significance, do not use OCR output as the sole source of truth.',
          'A useful test is to compare characters that look alike in the document, such as the number one and a lowercase letter, or a decimal point and a speck on the scan. Use a short passage with known wording to see whether the output is generally reliable. If one page has a different language or handwriting style, evaluate it on its own rather than assuming that a clean typed page predicts the quality of the entire file.',
        ],
      },
      {
        heading: 'Read text and layout separately',
        paragraphs: [
          'A page can look unchanged after OCR while its extracted text has errors. Conversely, the recognized text may be mostly correct even when line breaks or reading order are imperfect. Check text accuracy and page appearance as separate properties. Search for words near column boundaries, footnotes, headers, and tables, then compare the reading order with the original layout.',
          'Tables need special attention because OCR can recognize every number but associate it with the wrong row or column. A searchable text layer does not automatically create a spreadsheet or structured database. Use a table extraction tool only as a starting point and compare values against the scan. Verify totals and identifiers independently before using the data for a decision.',
        ],
      },
      {
        heading: 'Check and correct important output',
        paragraphs: [
          'Create a short review list for each document: confirm page count, search for important names and dates, test the first and last page, and inspect unusual pages such as receipts or forms. If a phrase is not found, zoom into the original image and check whether it is visible and legible. OCR may omit faint text or interpret a mark as a character.',
          'For a document that will be published, relied upon, or shared as an official record, have a person proofread the recognized text against the image. Keep the source scan alongside the OCR version so readers can resolve uncertainty. If a correction changes content, document the correction rather than silently treating machine recognition as an exact copy.',
        ],
      },
      {
        heading: 'Privacy, model downloads, and large files',
        paragraphs: [
          'The OCR model and the PDF are different items. PDF Pilot 5U downloads the English model from its configured CDN when needed, while it processes the selected PDF in the browser. The browser must still request the application and model resources. Users with strict offline or network controls should verify that those downloads are permitted before starting.',
          'Rendering many large pages can consume substantial memory. Work in smaller batches if the browser slows down, and keep the original unchanged. Generated results may be retained in browser storage by the My Files feature until deleted or until site data is cleared. On a shared device, remove the result and sign out when finished. Do not use a public computer for sensitive scans unless your organization approves it.',
        ],
      },
      {
        heading: 'When OCR is not the right next step',
        paragraphs: [
          'If the source page is too blurry to distinguish letters, OCR cannot reliably infer what was printed. If the document is in a language not supported by the installed model, use a suitable language-specific tool. If the goal is to rebuild a complex table, layout-aware document processing may be needed. If a document is already digitally generated and searchable, preserve its existing text layer rather than rasterizing it unnecessarily.',
          'OCR also does not verify that a person had authority to create or alter the source. It changes what text can be selected and searched; it does not certify authenticity, establish the meaning of ambiguous marks, or replace proofreading. Treat it as an assistive conversion step and choose a more appropriate workflow when the output needs exact structure, official validation, or specialized language support.',
        ],
      },
      {
        heading: 'A responsible OCR checklist',
        paragraphs: [
          'The best time to catch recognition errors is before the output is used downstream. Check the scan quality, confirm the language model, run a representative sample, compare recognized text against the visible page, and record any pages that need manual review. Preserve both the source and converted copy. If the output is for another person, tell them that OCR was used when that context affects how they should interpret it.',
          'A successful OCR job is not measured only by whether a download appeared. It is measured by whether the searchable layer is useful for the intended task and whether its limitations are understood. For casual searching, occasional errors may be acceptable. For evidence, compliance, numbers, or public-facing documents, require human verification and use the original scan as the reference.',
          'If several people will review the document, agree on how to mark uncertain text so a correction is visible and attributable. Keep a list of pages where OCR output differs from the scan, and make corrections in a clearly identified working copy. Do not silently replace the source image with a transcription when the original needs to remain authoritative. A traceable review is especially useful when the text will be imported into another system.',
        ],
        bullets: [
          'Check selectable text before running OCR so you do not repeat work unnecessarily.',
          'Verify language, page orientation, image quality, and the first output sample.',
          'Proofread names, numbers, tables, and any content that will inform a decision.',
        ],
      },
    ],
  },
  {
    slug: 'redact-pdf-before-sharing',
    title: 'How to redact text in a PDF and verify the result',
    summary: 'Understand the difference between a black overlay and content removal, then review the output before sharing.',
    preview: 'A mark that looks covered may still leave text underneath. Use a deliberate workflow, understand OCR and text-matching limits, and check the exported pages.',
    date: 'November 2026',
    icon: 'redact',
    relatedTools: [{ slug: 'redact-pdf', label: 'Redact PDF' }, { slug: 'pdf-ocr', label: 'PDF OCR' }, { slug: 'remove-metadata', label: 'Remove Metadata' }],
    sections: [
      {
        heading: 'Redaction is removal, not decoration',
        paragraphs: [
          'A black rectangle drawn over a name is a visual overlay. In many PDFs the original text still exists underneath and can be selected, copied, searched, or revealed by removing the overlay. Changing the rectangle’s color or flattening only the appearance does not automatically prove that the underlying information has been removed. A redaction workflow needs to address the source content, not just its visible cover.',
          'Before sharing a document, decide exactly which information must be removed and whether the surrounding context should remain. Redacting too little can expose a private detail; redacting too much can make the record useless or misleading. Use a copy of the original, make a list of the sensitive items, and ask the responsible reviewer to confirm that the scope is appropriate.',
        ],
      },
      {
        heading: 'How PDF Pilot 5U’s text redaction works',
        paragraphs: [
          'PDF Pilot 5U’s redaction tool searches selectable text for a phrase and rasterizes the pages while masking matching text runs. Rasterizing means that the output pages are rebuilt as images rather than preserving the original text objects. This removes the source text from the rebuilt pages, but it also removes selectable text and interactive page content such as links and forms.',
          'This method has important limits. Matching works on selectable text runs and may not recognize a phrase split into unusual fragments or formatted in a way that changes the underlying sequence. Text in a scanned image is not selectable and will not be matched unless it has an OCR text layer. Any redaction result must be inspected; the tool cannot determine whether every relevant occurrence has been found.',
        ],
      },
      {
        heading: 'Prepare a working copy and a search list',
        paragraphs: [
          'Keep the source file unchanged in an access-controlled location. Create a working copy and list every item to redact, including alternate spellings, initials, account-number formats, and repeated references if applicable. Consider whether a phrase appears in a header, footer, attachment, or page image. The visible page alone may not reveal every occurrence in the document.',
          'If the source is scanned, run OCR first and inspect the recognized text before attempting a text match. OCR can introduce errors, so a sensitive name might be recognized differently from how it appears visually. For non-English text, handwriting, or low-quality scans, the current English OCR model may be unsuitable. A specialist review or a different redaction workflow may be necessary.',
        ],
      },
      {
        heading: 'Step-by-step workflow',
        paragraphs: [
          'Open Redact PDF and choose the working copy. Enter the exact selectable phrase that should be hidden, then run the operation. For multiple terms, process and review them deliberately rather than assuming a single phrase catches related identifiers. If the page contains several similar strings, be precise about what should be removed and keep notes for the reviewer.',
          'Download the output under a new filename so it cannot be confused with the original. Open it in a separate PDF viewer and inspect every page where sensitive material might appear. Check normal and high zoom, repeated headers, page edges, and any region near the matched text. Search for the redacted phrase and attempt to select or copy text from the output.',
        ],
        steps: [
          'Make a separate working copy and inventory all information to remove.',
          'Run redaction on selectable text; OCR scanned pages first only when suitable.',
          'Inspect every relevant page and test search/copy behavior in another reader.',
        ],
      },
      {
        heading: 'Verify more than the black mark',
        paragraphs: [
          'Look for visible remnants such as a partially covered word, a matching value in a caption, or a repeat of the same name elsewhere. Page images can be cropped or shifted, so check the output boundaries. A redaction mark should be opaque and large enough to cover the intended visual area, but visual coverage is only one part of review.',
          'Use a separate PDF reader to search for the phrase and attempt to copy text from the redacted area. Because PDF Pilot 5U rasterizes the pages, selectable content is not preserved in the resulting pages. Still, verify the exported file rather than assuming the process ran correctly. If any target remains visible or searchable, do not share the output; return to the source copy and repeat with a corrected phrase or a different method.',
          'Review surrounding context for indirect identifiers as well. A job title, location, date, or combination of otherwise ordinary details may identify the person whose name was removed. Whether such context should be redacted depends on the purpose of the disclosure and applicable rules. When there is uncertainty, seek a second review from someone authorized to make that decision instead of expanding or narrowing the redactions on your own.',
        ],
      },
      {
        heading: 'Look for information beyond visible page text',
        paragraphs: [
          'A PDF can contain metadata such as author, title, subject, and keywords. It may also contain form data, comments, attachments, links, hidden layers, or bookmarks. Rasterizing all pages removes many interactive objects from the rebuilt pages, but users should still inspect the actual exported file and check document properties. Do not assume that one redaction tool removes every kind of embedded information.',
          'If a workflow requires removing metadata, use a metadata-removal operation on an appropriate copy and verify the properties afterward. If the file contains embedded attachments or content that is not visible on a page, inspect it with a suitable document-analysis tool. Organizations handling sensitive records should use an approved redaction process and review checklist rather than relying on a single automated match.',
        ],
      },
      {
        heading: 'Accessibility and evidence concerns',
        paragraphs: [
          'Since the output is rasterized, screen readers and text-search features may not have the same access to the page content. This can make the redacted copy less accessible even when it looks correct. If an accessible document is required, ask how the organization should provide an accessible version without reintroducing protected information. Do not recreate the hidden content in alternative text, a transcript, or an attachment.',
          'Redaction changes a document and can affect authenticity or evidentiary value. Keep the original under appropriate access controls, record which copy was processed, and follow any rules for audit trails and retention. A visual signature or a redaction mark does not certify the document. For legal, regulatory, or formal disclosure work, have the appropriate records or legal team approve the process.',
        ],
      },
      {
        heading: 'Privacy and secure handling',
        paragraphs: [
          'PDF Pilot 5U’s redaction processing runs in the browser, but that does not remove the need to protect the device, browser profile, downloaded output, or source file. Generated results may be saved in local browser history by the My Files feature. Delete unneeded results and avoid leaving sensitive files on a shared computer. Do not send an output through an unapproved channel after taking care to redact it.',
          'If an organization requires a managed service, audit logging, retention controls, or a validated redaction engine, confirm those requirements before using a consumer browser tool. A locally processed document can still be visible to someone with access to the same device or account. Review PDF Pilot 5U’s privacy policy for account data and optional services, and do not send document contents to AI unless you separately choose that feature and are allowed to do so.',
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        paragraphs: [
          'Do not cover text with a shape and assume the data is gone. Do not check only the first matching page, because the same value may appear later. Do not search only for one spelling when a number or name has multiple formats. Do not use OCR output without comparing it to the scan, and do not use the redacted file as the sole copy of a record that must be retained.',
          'Another mistake is treating successful processing as proof of complete redaction. Automated tools can only apply their matching rules to content they can read. A PDF may contain an image, alternate encoding, unusual layout, or another representation of the same data. The person responsible for disclosure must make a careful review and decide whether the result meets the applicable requirement.',
        ],
      },
      {
        heading: 'Final pre-sharing checklist',
        paragraphs: [
          'Before sending the file, have a second person review the list of required redactions and the exported pages when the sensitivity warrants it. Compare the visible output against the source to ensure that only intended content changed. Test search and copy behavior in a separate viewer, inspect document properties, and confirm that the output filename clearly identifies it as the reviewed copy.',
          'If there is any uncertainty about an item, pause distribution. Re-run the workflow from the untouched source, not from an already rasterized draft, and repeat the full review. Redaction protects people only when the right information is removed and the remaining document is handled safely. This article describes the tool’s behavior, not legal advice or a guarantee of compliance.',
          'Plan the release path as carefully as the editing step. Decide who may receive the redacted version, whether it can be placed in a shared folder, and how the unredacted source will be protected. If a recipient asks for a correction, confirm the request through an authorized channel before changing the scope. A redacted document can still reveal identity through surrounding details, so review context as well as the literal characters that were masked.',
        ],
        bullets: [
          'Check all occurrences, headers, footers, scans, attachments, and metadata that are relevant.',
          'Search and copy from the exported file in a separate viewer.',
          'Retain the original securely and follow the organization’s approved redaction procedure.',
        ],
      },
    ],
  },
  {
    slug: 'convert-pdf-text-to-word',
    title: 'PDF to Word conversion: what transfers and what needs review',
    summary: 'Learn how text extraction differs from layout conversion and how to verify an editable DOCX result.',
    preview: 'A PDF page describes positioned content, while a Word file uses paragraphs and styles. Understand why conversion can change structure and how to review the result.',
    date: 'November 2026',
    icon: 'word',
    relatedTools: [{ slug: 'pdf-to-word', label: 'PDF to Word' }, { slug: 'pdf-ocr', label: 'PDF OCR' }, { slug: 'pdf-to-excel', label: 'PDF to Excel' }],
    sections: [
      {
        heading: 'Why a PDF is not a Word document',
        paragraphs: [
          'A PDF is designed to describe pages consistently across viewers and printers. It records text and graphics at positions on a page; it does not necessarily preserve the paragraph structure, styles, or logical reading order that a word processor uses. Two PDFs that look similar can have very different internal representations, which is why there is no universal one-click conversion that perfectly reconstructs every source.',
          'A Word document is an editable flow of paragraphs, tables, styles, and other objects. Converting between the formats requires software to infer which pieces belong together. A simple extractor can recover selectable text and place it into a new DOCX, but it may not infer columns, headings, tables, footnotes, or exact page breaks. The result should be treated as a starting point for editing, not a facsimile.',
        ],
      },
      {
        heading: 'What PDF Pilot 5U’s conversion produces',
        paragraphs: [
          'PDF Pilot 5U’s PDF to Word tool exports selectable text page by page into an editable DOCX document. It aims to make the text available for editing without claiming to reproduce the original layout. Text remains associated with source pages, but the output can differ in spacing, styling, and reading order. Scanned pages do not contain selectable text until an OCR workflow has added a text layer.',
          'This approach can be useful when the main need is to reuse or edit words from a straightforward document. It is not designed to recreate a complex brochure, preserve a precise letterhead, rebuild a multi-column report, or guarantee an identical page count. If exact visual fidelity is essential, use a conversion engine designed for layout reconstruction and still inspect the result.',
        ],
      },
      {
        heading: 'Prepare the PDF',
        paragraphs: [
          'Before converting, open the source in a PDF reader and test whether a sentence can be selected. If the page is only a scan, OCR is needed first; verify the recognized text before relying on the conversion. If the PDF is password protected, unlock it using the correct password and only when you have authority to do so. Save a copy so the source remains unchanged.',
          'Identify the content that matters most: a title, table, column, list, page number, or footnote. These elements are useful checkpoints after conversion. For a long report, choose a representative page that contains the most difficult structure. A short test can reveal whether the basic text export is appropriate before you spend time reviewing a large output.',
        ],
      },
      {
        heading: 'Convert and open the DOCX',
        paragraphs: [
          'Open PDF to Word, select the PDF, and run the conversion. When the output is ready, download the DOCX with a new filename. Open it in a compatible word processor rather than judging the file only from the download notification. Confirm that the document opens without a repair warning and that the expected pages or sections contain text.',
          'Use the word processor’s navigation and search features to find a few phrases from the source. Compare their spelling, punctuation, and sequence. If text is missing, duplicated, or in the wrong order, determine whether the PDF’s text layer is unusual or whether the output structure is too simple for the document. Keep the original open side by side while reviewing.',
        ],
        steps: [
          'Check that the source has selectable text, or OCR a copy and review it first.',
          'Convert a representative document and open the DOCX in a word processor.',
          'Compare headings, paragraphs, tables, columns, and critical values to the PDF.',
        ],
      },
      {
        heading: 'Reading order, columns, and page breaks',
        paragraphs: [
          'A two-column page can be stored as positioned text rather than as two explicitly defined columns. An extractor may read across the page, finish one column first, or place a sidebar in the middle of a paragraph. Headers and footers may appear between body paragraphs because their coordinates are independent of the reading flow. These are common structural differences, not proof that the source PDF is corrupt.',
          'Inspect headings and transitions between pages. A paragraph that continues on another page may be split or joined differently in the DOCX. Page breaks may not match the original because Word repaginates content according to its fonts, margins, and software version. If page alignment matters, use the document editor to apply styles and breaks after checking the extracted text.',
        ],
      },
      {
        heading: 'Tables, numbers, and formulas',
        paragraphs: [
          'Text extraction does not automatically reconstruct a real Word table. In a PDF, each cell may be represented as separate text positioned on a page, and the conversion may return the cell values as a sequence rather than a grid. Financial totals, dates, decimal separators, and identifiers should be compared carefully because a single omitted character can change meaning.',
          'If the goal is spreadsheet analysis, a spreadsheet-oriented extraction tool may be a better starting point, although it also may not infer table columns correctly. Verify row and column alignment and recalculate totals in the destination application. Do not assume that text appearing next to another value in the output belongs to the same row or field without checking the source page.',
        ],
      },
      {
        heading: 'Scanned pages and OCR',
        paragraphs: [
          'A scan is made of pixels, not text objects. A PDF-to-Word extractor cannot recover characters that are not present in the PDF’s text layer. OCR can recognize image text and make it selectable, but recognition errors can carry into the DOCX. PDF Pilot 5U’s browser OCR currently uses an English model and may need to download that model before it can process the document.',
          'OCR is less dependable on handwriting, low-resolution scans, multiple languages, tables, and pages with shadows or skew. Search for important words after OCR and compare the output against the visible source. If a field is ambiguous, keep the image as the reference and have a person transcribe or verify it. Do not rely on OCR alone for a legal name, amount, or other high-impact value.',
        ],
      },
      {
        heading: 'Fonts, images, and visual styling',
        paragraphs: [
          'A text-focused DOCX export may not include the original page images, logos, charts, font choices, colors, or exact margins. Even when some visual content is present, the Word application may substitute fonts or wrap paragraphs differently. These changes are expected when the operation prioritizes editable text over page appearance.',
          'If you need to create a polished document, treat the conversion as a content extraction step. Apply styles in the word processor, recreate approved visuals from their original assets, and verify that charts and tables are accurate. Do not use the converted file as a design proof until it has been formatted and reviewed. If appearance is the priority, keeping the PDF may be more appropriate.',
        ],
      },
      {
        heading: 'Privacy and file handling',
        paragraphs: [
          'PDF Pilot 5U’s basic conversion processes the selected file in the browser. The site still downloads application code, and account features can involve Neon Auth. The resulting DOCX is downloaded to the browser and may be saved in local My Files history when that feature is used. Local storage can persist after the tab closes, so delete results that are no longer needed.',
          'On a shared device, save the output only in a location you control, remove local browser history entries, and sign out. Do not convert a document if your organization prohibits the use of an unapproved web application. AI features are separate from this conversion; PDF-to-Word does not require sending text to an AI provider. Read the site privacy policy for current details about account services and any optional feature.',
        ],
      },
      {
        heading: 'Troubleshooting a poor conversion',
        paragraphs: [
          'If the DOCX is blank, first check whether the source has selectable text. If it is a scan, try OCR on a copy and validate the recognized layer. If the text is present but scrambled, examine the source layout and compare a representative page. Complex columns, unusual font encodings, rotated content, and tables can make a basic extraction lose reading order.',
          'If the file will not open, download it again and confirm that the download completed. Try a current office application or compatible editor. If a particular document consistently produces an unusable result, use a dedicated conversion service that explains its data handling and supports the needed layout features. Avoid uploading sensitive content to a third party without authorization.',
        ],
      },
      {
        heading: 'A careful review checklist',
        paragraphs: [
          'Review the output in the application where it will be edited. Check names, amounts, dates, punctuation, headings, bullets, and the order of paragraphs. Compare tables and multi-column sections against the PDF, and confirm that scanned pages were recognized accurately. A visually simple document can still contain an unnoticed text error, so use search and side-by-side review for important content.',
          'Keep the source PDF until the DOCX has been checked and accepted. Save a new version after making corrections and use a descriptive filename that distinguishes it from the original. If the DOCX will be sent to another person, state that it was converted and may need formatting review when that context is important. This sets realistic expectations and helps prevent an extracted draft from being mistaken for a faithful reproduction.',
          'When a DOCX will be edited by a team, choose a single copy as the working version and apply the organization’s normal change-tracking practice. Avoid comparing a converted document with the PDF only by page count because reflow changes pagination. Review the content in sequence, restore any required headings or table structure, and check that comments or tracked changes do not expose information that should not be shared. Conversion is a starting point, so plan time for this editing pass.',
        ],
        bullets: [
          'Selectable text can be edited; scanned image pages require OCR first.',
          'Page layout, columns, tables, fonts, and images may need manual reconstruction.',
          'Check important names and numbers against the source before sharing.',
        ],
      },
    ],
  },
]

export function getPostWordCount(post: Post) {
  const content = post.sections.flatMap((section) => [
    section.heading,
    ...section.paragraphs,
    ...(section.bullets ?? []),
    ...(section.steps ?? []),
  ])
  return content.join(' ').trim().split(/\s+/).filter(Boolean).length
}

export function getReadingMinutes(post: Post) {
  return Math.max(1, Math.ceil(getPostWordCount(post) / 220))
}
