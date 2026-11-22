export type StoredFile = {
  id: string
  name: string
  size: number
  type: string
  tool: string
  createdAt: number
  blob: Blob
}

const DB_NAME = 'pdftools'
const STORE = 'results'
const MAX_ITEMS = 30
const MAX_TOTAL_BYTES = 300 * 1024 * 1024

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = run(t.objectStore(STORE))
        t.oncomplete = () => {
          db.close()
          resolve(req.result)
        }
        t.onerror = () => {
          db.close()
          reject(t.error)
        }
      }),
  )
}

export async function listFiles(): Promise<StoredFile[]> {
  const all = await tx<StoredFile[]>('readonly', (s) => s.getAll() as IDBRequest<StoredFile[]>)
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteFile(id: string) {
  await tx('readwrite', (s) => s.delete(id))
}

export async function clearFiles() {
  await tx('readwrite', (s) => s.clear())
}

/** Saves results; silently skips if IndexedDB is unavailable (private mode, quota). */
export async function saveFiles(items: { name: string; blob: Blob }[], tool: string): Promise<boolean> {
  try {
    const now = Date.now()
    for (const [i, item] of items.entries()) {
      if (item.blob.size > MAX_TOTAL_BYTES) continue
      const record: StoredFile = {
        id: `${now}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        name: item.name,
        size: item.blob.size,
        type: item.blob.type,
        tool,
        createdAt: now + i,
        blob: item.blob,
      }
      await tx('readwrite', (s) => s.put(record))
    }
    const all = await listFiles()
    let total = 0
    for (const [i, f] of all.entries()) {
      total += f.size
      if (i >= MAX_ITEMS || total > MAX_TOTAL_BYTES) await deleteFile(f.id)
    }
    return true
  } catch {
    return false
  }
}

let pending: File[] = []

export function setPendingFiles(files: File[]) {
  pending = files
}

export function takePendingFiles(): File[] {
  const f = pending
  pending = []
  return f
}
