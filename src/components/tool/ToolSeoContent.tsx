import type { Tool } from '#/lib/tools'
import { CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react'
import { DownloadArt, ProcessArt, StepArrow, UploadArt } from '#/components/Illustrations'

const featureBySlug: Record<string, string[]> = {
  'merge-pdf': ['Combines selected PDFs in the order shown in the workspace.', 'Keeps the operation in your browser.', 'Lets you review the combined file before downloading.'],
  'split-pdf': ['Supports page ranges and individual page extraction.', 'Creates separate PDF outputs without uploading the source.', 'Makes it easy to verify each resulting file.'],
  'compress-pdf': ['Rewrites the PDF with the selected compression settings.', 'Reports the before-and-after size for comparison.', 'Keeps the original file available for a safe retry.'],
  'pdf-ocr': ['Recognizes English text from rendered PDF pages.', 'Adds a searchable text layer to the output.', 'Keeps OCR processing local after the language model is available.'],
  'redact-pdf': ['Finds matching selectable text before masking it.', 'Rasterizes the result so the matched text is not left selectable.', 'Encourages a final visual review before sharing.'],
  'pdf-compare': ['Compares selectable text and page counts across two PDFs.', 'Produces a readable comparison report.', 'Clearly excludes visual and image-only differences.'],
  'protect-pdf': ['Encrypts the document with an AES-256 opening password.', 'Processes the file in the browser.', 'Leaves password responsibility with you; lost passwords cannot be recovered.'],
  'unlock-pdf': ['Uses a password you already know to decrypt the PDF.', 'Does not attempt password recovery or bypass protection.', 'Lets you inspect and download the unlocked result locally.'],
}

function fileLabel(tool: Tool) {
  return tool.accepts === 'pdf' ? 'PDF' : tool.accepts.toUpperCase()
}

export function ToolStepPreview({ tool }: { tool: Tool }) {
  const file = fileLabel(tool)
  const steps = [
    { number: '01', title: 'Upload', body: `Choose ${tool.multiple ? `one or more ${file} files` : `a ${file} file`} from your device.`, art: <UploadArt /> },
    { number: '02', title: 'Process', body: `Review the preview and options, then run ${tool.name.en}.`, art: <ProcessArt /> },
    { number: '03', title: 'Download', body: 'Inspect the result and save it directly to your device.', art: <DownloadArt /> },
  ]
  return (
    <section className="mt-12 border-t border-line pt-10" aria-labelledby="tool-step-preview-heading">
      <h2 id="tool-step-preview-heading" className="sr-only">How {tool.name.en} works</h2>
      <div className="grid items-start gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-3">
        {steps.flatMap((step, index) => [
          <div key={step.number} className="text-center">
            <div className="flex justify-center">{step.art}</div>
            <p className="mt-2 text-sm font-bold text-accent">{step.number}</p>
            <h3 className="mt-1 font-display text-xl font-bold">{step.title}</h3>
            <p className="mx-auto mt-2 max-w-xs leading-relaxed text-muted">{step.body}</p>
            {index < steps.length - 1 && <div className="my-3 flex justify-center md:hidden"><StepArrow /></div>}
          </div>,
          ...(index < steps.length - 1 ? [<div key={`arrow-${step.number}`} className="hidden items-center justify-center pt-16 md:flex"><StepArrow /></div>] : []),
        ])}
      </div>
    </section>
  )
}

export function ToolSeoIntro({ tool }: { tool: Tool }) {
  const useCase = tool.category === 'ai'
    ? `Use ${tool.name.en} when you need a focused answer or transformation from selectable PDF text and are comfortable reviewing an AI-generated result.`
    : tool.category === 'convert-to' || tool.category === 'convert-from'
      ? `Use ${tool.name.en} for a quick browser-based conversion when you need a shareable document in a different format.`
      : `Use ${tool.name.en} when you need to prepare, review, organize, or secure a PDF without changing the original file.`
  return (
    <section className="mt-12 border-t border-line pt-8" aria-labelledby="tool-explanation-heading">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">User guide</p>
        <h2 id="tool-explanation-heading" className="mt-2 font-display text-2xl font-bold">About {tool.name.en}</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">{tool.desc.en}</p>
        <p className="mt-4 leading-relaxed text-muted">
          {useCase} Upload {tool.multiple ? `one or more ${fileLabel(tool)} files` : `a ${fileLabel(tool)} file`} using the workspace above, then compare the output with your original before sharing it.
        </p>
      </div>
    </section>
  )
}

export function ToolSeoDetails({ tool }: { tool: Tool }) {
  const features = featureBySlug[tool.slug] ?? [
    `Works with ${tool.multiple ? 'multiple files when selected together' : `one ${fileLabel(tool)} file at a time`}.`,
    tool.category === 'ai' ? 'Uses extracted text only after you approve the AI request.' : 'Processes the selected file in the browser where supported.',
    `Designed for the ${tool.category.replace('-', ' ')} workflow described above.`,
  ]
  const ai = tool.category === 'ai' || tool.slug === 'pdf-translator'
  return (
    <>
      <section className="mt-12 border-t border-line pt-8" aria-labelledby="tool-features-heading">
        <h2 id="tool-features-heading" className="font-display text-2xl font-bold">Key features</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = index === 0 ? FileCheck2 : index === 1 ? CheckCircle2 : ShieldCheck
            return (
              <li key={feature} className="rounded-xl border border-line bg-card p-4 text-sm leading-relaxed text-muted">
                <span className="mb-4 grid size-10 place-items-center rounded-xl bg-accent text-white" aria-hidden="true">
                  <Icon className="size-5" />
                </span>
                {feature}
              </li>
            )
          })}
        </ul>
        {tool.note && <p className="mt-5 rounded-xl bg-blush px-4 py-3 text-sm leading-relaxed">{tool.note.en}</p>}
      </section>
      <section className="mt-12 border-t border-line pt-8" aria-labelledby="tool-use-cases-heading">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-accent text-white" aria-hidden="true"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16M4 12h16M4 19h10" /></svg></span><h2 id="tool-use-cases-heading" className="font-display text-2xl font-bold text-accent">Common use cases</h2></div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          <li className="rounded-xl border border-accent/25 bg-blush p-4 text-sm leading-relaxed text-muted"><span className="mb-3 block text-accent" aria-hidden="true">◆</span>Prepare a document for email, review, or archiving.</li>
          <li className="rounded-xl border border-accent/25 bg-blush p-4 text-sm leading-relaxed text-muted"><span className="mb-3 block text-accent" aria-hidden="true">◆</span>Check a result before sending it to another person or service.</li>
          <li className="rounded-xl border border-accent/25 bg-blush p-4 text-sm leading-relaxed text-muted"><span className="mb-3 block text-accent" aria-hidden="true">◆</span>Repeat the same {tool.name.en.toLowerCase()} workflow on a later document.</li>
        </ul>
      </section>
      <section className="mt-12 border-t border-line pt-8" aria-labelledby="tool-limitations-heading">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl border-2 border-accent text-accent" aria-hidden="true"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 3 7l9 4 9-4-9-4Z" /><path d="m3 12 9 4 9-4M3 17l9 4 9-4" /></svg></span><h2 id="tool-limitations-heading" className="font-display text-2xl font-bold text-accent">Supported formats and limitations</h2></div>
        <p className="mt-4 rounded-2xl border border-accent/20 bg-blush p-5 leading-relaxed text-muted">Accepted input: {fileLabel(tool)}{tool.multiple ? ' files can be selected together.' : '.'} {tool.desc.en} Large or complex files may depend on available browser memory. Keep the source file and inspect the downloaded output.</p>
      </section>
      <section className="mt-12 border-t border-line pt-8" aria-labelledby="tool-faq-heading">
        <h2 id="tool-faq-heading" className="font-display text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-5 divide-y divide-line border-y border-line">
          <details className="group py-4">
            <summary className="cursor-pointer font-semibold">What does {tool.name.en} do?</summary>
            <p className="mt-2 leading-relaxed text-muted">{tool.desc.en}</p>
          </details>
          <details className="group py-4">
            <summary className="cursor-pointer font-semibold">What files can I use?</summary>
            <p className="mt-2 leading-relaxed text-muted">Upload {tool.multiple ? `one or more ${fileLabel(tool)} files` : `one ${fileLabel(tool)} file`} using the existing tool interface. The accepted format and file-size checks are applied before processing.</p>
          </details>
          <details className="group py-4">
            <summary className="cursor-pointer font-semibold">Where is my file processed?</summary>
            <p className="mt-2 leading-relaxed text-muted">{ai ? 'The PDF stays in your browser while selectable text is extracted. Text is sent to Google Gemini only after your explicit consent; review the response before relying on it.' : 'The operation runs in your browser. Keep your original and inspect the generated download, especially for complex layouts or scanned pages.'}</p>
          </details>
          <details className="group py-4">
            <summary className="cursor-pointer font-semibold">What should I check before using the result?</summary>
            <p className="mt-2 leading-relaxed text-muted">Check page count, visible content, reading order, links, forms, and text quality that matter for {tool.name.en.toLowerCase()}. Processing does not overwrite your source file.</p>
          </details>
          <details className="group py-4">
            <summary className="cursor-pointer font-semibold">Can I use the output for an official document?</summary>
            <p className="mt-2 leading-relaxed text-muted">Only after you review it against the original and any requirements from the receiving organization. This tool does not certify legal, accessibility, archival, or regulatory compliance.</p>
          </details>
        </div>
      </section>
    </>
  )
}
