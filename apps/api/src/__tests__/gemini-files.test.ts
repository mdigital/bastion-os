import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prepareFiles, type SourceRow, type PrepareProgress } from '../lib/gemini-files.js'

function makeSource(overrides: Partial<SourceRow> = {}): SourceRow {
  return {
    id: 'src-1',
    file_name: 'report.pdf',
    file_path: 'org-1/c1/report.pdf',
    file_type: 'application/pdf',
    gemini_file_uri: null,
    gemini_file_name: null,
    gemini_file_uploaded_at: null,
    ...overrides,
  }
}

const updateChain = { eq: vi.fn().mockReturnValue({ then: (r: (v: unknown) => void) => r({ error: null }) }) }

const supabaseMock = {
  storage: {
    from: vi.fn(() => ({
      download: vi.fn().mockResolvedValue({ data: new Blob(['pdf-bytes']), error: null }),
    })),
  },
  from: vi.fn(() => ({
    update: vi.fn(() => updateChain),
  })),
} as any

const geminiMock = {
  files: {
    get: vi.fn(),
    upload: vi.fn(),
  },
} as any

const logger = {
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
} as any

beforeEach(() => {
  vi.clearAllMocks()
  geminiMock.files.get.mockResolvedValue({ state: 'ACTIVE' })
  geminiMock.files.upload.mockResolvedValue({ uri: 'https://genai.example.com/files/new', name: 'files/new' })
})

describe('prepareFiles', () => {
  it('uses cached URI when file is ACTIVE', async () => {
    const source = makeSource({
      gemini_file_uri: 'https://genai.example.com/files/cached',
      gemini_file_name: 'files/cached',
      gemini_file_uploaded_at: new Date().toISOString(),
    })

    const progress: PrepareProgress[] = []
    const parts = await prepareFiles([source], supabaseMock, geminiMock, logger, (p) => progress.push(p))

    expect(parts).toHaveLength(1)
    expect(parts[0]!.fileData.fileUri).toBe('https://genai.example.com/files/cached')
    expect(geminiMock.files.get).toHaveBeenCalledWith({ name: 'files/cached' })
    expect(geminiMock.files.upload).not.toHaveBeenCalled()
    expect(progress.some((p) => p.status === 'checking')).toBe(true)
    expect(progress.some((p) => p.status === 'ready')).toBe(true)
  })

  it('re-uploads when cached file is not ACTIVE', async () => {
    const source = makeSource({
      gemini_file_uri: 'https://genai.example.com/files/old',
      gemini_file_name: 'files/old',
    })
    geminiMock.files.get.mockResolvedValueOnce({ state: 'PROCESSING' })

    const progress: PrepareProgress[] = []
    const parts = await prepareFiles([source], supabaseMock, geminiMock, logger, (p) => progress.push(p))

    expect(parts).toHaveLength(1)
    expect(parts[0]!.fileData.fileUri).toBe('https://genai.example.com/files/new')
    expect(geminiMock.files.upload).toHaveBeenCalledTimes(1)
    expect(progress.some((p) => p.status === 'uploading')).toBe(true)
  })

  it('re-uploads when files.get throws (file expired/deleted)', async () => {
    const source = makeSource({
      gemini_file_uri: 'https://genai.example.com/files/gone',
      gemini_file_name: 'files/gone',
    })
    geminiMock.files.get.mockRejectedValueOnce(new Error('NOT_FOUND'))

    const parts = await prepareFiles([source], supabaseMock, geminiMock, logger, vi.fn())

    expect(parts).toHaveLength(1)
    expect(parts[0]!.fileData.fileUri).toBe('https://genai.example.com/files/new')
    expect(geminiMock.files.upload).toHaveBeenCalledTimes(1)
  })

  it('uploads from scratch when no cached name', async () => {
    const source = makeSource()

    const parts = await prepareFiles([source], supabaseMock, geminiMock, logger, vi.fn())

    expect(parts).toHaveLength(1)
    expect(geminiMock.files.get).not.toHaveBeenCalled()
    expect(geminiMock.files.upload).toHaveBeenCalledTimes(1)
  })

  it('skips failed files gracefully', async () => {
    const good = makeSource({ id: 'good', file_name: 'good.pdf' })
    const bad = makeSource({ id: 'bad', file_name: 'bad.pdf', file_path: 'org-1/c1/bad.pdf' })

    // Override storage download for the bad file
    let downloadCallCount = 0
    supabaseMock.storage.from.mockImplementation(() => ({
      download: vi.fn().mockImplementation(() => {
        downloadCallCount++
        if (downloadCallCount === 2) {
          return Promise.resolve({ data: null, error: { message: 'not found' } })
        }
        return Promise.resolve({ data: new Blob(['pdf-bytes']), error: null })
      }),
    }))

    const progress: PrepareProgress[] = []
    const parts = await prepareFiles([good, bad], supabaseMock, geminiMock, logger, (p) => progress.push(p))

    // One succeeds, one fails — we get 1 part back
    expect(parts).toHaveLength(1)
    expect(logger.warn).toHaveBeenCalled()
  })

  it('processes multiple files in parallel', async () => {
    const sources = [
      makeSource({ id: 's1', file_name: 'a.pdf' }),
      makeSource({ id: 's2', file_name: 'b.pdf' }),
      makeSource({ id: 's3', file_name: 'c.pdf' }),
    ]

    // Reset download mock
    supabaseMock.storage.from.mockImplementation(() => ({
      download: vi.fn().mockResolvedValue({ data: new Blob(['pdf-bytes']), error: null }),
    }))

    const progress: PrepareProgress[] = []
    const parts = await prepareFiles(sources, supabaseMock, geminiMock, logger, (p) => progress.push(p))

    expect(parts).toHaveLength(3)
    expect(geminiMock.files.upload).toHaveBeenCalledTimes(3)
    // Each file should have emitted uploading + ready
    expect(progress.filter((p) => p.status === 'uploading')).toHaveLength(3)
    expect(progress.filter((p) => p.status === 'ready')).toHaveLength(3)
  })

  it('reports correct progress indices', async () => {
    const sources = [
      makeSource({ id: 's1', file_name: 'first.pdf' }),
      makeSource({ id: 's2', file_name: 'second.pdf' }),
    ]

    supabaseMock.storage.from.mockImplementation(() => ({
      download: vi.fn().mockResolvedValue({ data: new Blob(['pdf-bytes']), error: null }),
    }))

    const progress: PrepareProgress[] = []
    await prepareFiles(sources, supabaseMock, geminiMock, logger, (p) => progress.push(p))

    const uploading = progress.filter((p) => p.status === 'uploading')
    expect(uploading).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ current: 1, total: 2, fileName: 'first.pdf' }),
        expect.objectContaining({ current: 2, total: 2, fileName: 'second.pdf' }),
      ]),
    )
  })
})
