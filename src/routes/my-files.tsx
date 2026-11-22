import { Link, createFileRoute } from '@tanstack/react-router'
import { Download, FileText, Image as ImageIcon, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageShell } from '#/components/PageShell'
import { type StoredFile, clearFiles, deleteFile, listFiles } from '#/lib/files-store'
import { useI18n } from '#/lib/i18n'
import { downloadBlob, formatBytes } from '#/lib/pdf'
import { getTool } from '#/lib/tools'

export const Route = createFileRoute('/my-files')({
  staticData: { pageId: 'pg_mF2yUq7aZc4E', funnel: { next: [] } },
  head: () => ({
    meta: [
      { title: 'My Files — PDFTools' },
      { name: 'description', content: 'Recent results you created with PDFTools, stored only in this browser.' },
    ],
  }),
  component: MyFiles,
})

function MyFiles() {
  const { t, pick, lang } = useI18n()
  const [files, setFiles] = useState<StoredFile[] | null>(null)

  const refresh = () =>
    listFiles()
      .then(setFiles)
      .catch(() => setFiles([]))

  useEffect(() => {
    refresh()
  }, [])

  return (
    <PageShell eyebrow={t('nav.myFiles')} title={t('files.title')} intro={t('files.subtitle')}>
      {files === null ? null : files.length === 0 ? (
        <div className="rounded-card border border-dashed border-accent/40 bg-blush/50 px-6 py-14 text-center">
          <p className="text-muted">{t('files.empty')}</p>
          <Link to="/tools" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-semibold text-white hover:bg-accent-dark">
            {t('nav.allTools')}
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => clearFiles().then(refresh)}
              className="min-h-10 rounded-full border border-line px-4 text-sm font-semibold text-muted hover:border-accent hover:text-accent"
            >
              {t('files.clear')}
            </button>
          </div>
          <ul className="divide-y divide-line rounded-card border border-line bg-card">
            {files.map((f) => {
              const tool = getTool(f.tool)
              return (
                <li key={f.id} className="flex items-center gap-4 p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blush text-accent">
                    {f.type.startsWith('image/') ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold" dir="ltr">
                      {f.name}
                    </p>
                    <p className="text-sm text-muted">
                      {formatBytes(f.size)} · {tool ? pick(tool.name) : f.tool} ·{' '}
                      {new Date(f.createdAt).toLocaleString(lang === 'ur' ? 'ur-PK' : undefined)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadBlob({ name: f.name, blob: f.blob })}
                    aria-label={`${t('page.download')} ${f.name}`}
                    className="grid size-11 place-items-center rounded-full bg-accent text-white hover:bg-accent-dark"
                  >
                    <Download className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFile(f.id).then(refresh)}
                    aria-label={`${t('files.delete')} ${f.name}`}
                    className="grid size-11 place-items-center rounded-full border border-line text-muted hover:text-accent"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </PageShell>
  )
}
