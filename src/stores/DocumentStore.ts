import { makeAutoObservable, runInAction } from 'mobx'
import type { RootStore } from './RootStore'
import { parseMarkdown, ParsedDocument } from '../utils/markdownParser'
import { getMainAPI } from '../api/mainAPI'

export class DocumentStore {
  documents: Map<string, ParsedDocument> = new Map()
  loadingPaths: Set<string> = new Set()

  constructor(
    private rootStore: RootStore,
    private parent: RootStore
  ) {
    makeAutoObservable(this, {
      rootStore: false,
      parent: false,
    })
  }

  get currentDocument(): ParsedDocument | null {
    const path = this.rootStore.navigationStore.currentDocumentPath
    if (!path) return null
    return this.documents.get(path) || null
  }

  isLoading(path: string): boolean {
    return this.loadingPaths.has(path)
  }

  async loadDocument(absolutePath: string): Promise<ParsedDocument | null> {
    // Return cached if available
    if (this.documents.has(absolutePath)) {
      return this.documents.get(absolutePath)!
    }

    // Mark as loading
    this.loadingPaths.add(absolutePath)

    try {
      const api = getMainAPI()
      const result = await api.readFile(absolutePath)
      
      if (!result.success || !result.content) {
        console.error(`Failed to load document: ${result.error}`)
        return null
      }

      const parsed = parseMarkdown(result.content, absolutePath)

      runInAction(() => {
        this.documents.set(absolutePath, parsed)
        this.loadingPaths.delete(absolutePath)
      })

      return parsed
    } catch (error) {
      console.error('Error loading document:', error)
      runInAction(() => {
        this.loadingPaths.delete(absolutePath)
      })
      return null
    }
  }

  async saveDocument(absolutePath: string, content: string): Promise<boolean> {
    try {
      const api = getMainAPI()
      const result = await api.writeFile(absolutePath, content)
      
      if (!result.success) {
        console.error(`Failed to save document: ${result.error}`)
        return false
      }

      // Re-parse and update cache
      const parsed = parseMarkdown(content, absolutePath)
      runInAction(() => {
        this.documents.set(absolutePath, parsed)
      })

      return true
    } catch (error) {
      console.error('Error saving document:', error)
      return false
    }
  }

  async createDocument(absolutePath: string, title: string): Promise<boolean> {
    const content = `# ${title}\n\n---\n\n`
    
    try {
      const api = getMainAPI()
      const result = await api.writeFile(absolutePath, content)
      
      if (!result.success) {
        console.error(`Failed to create document: ${result.error}`)
        return false
      }

      // Parse and cache
      const parsed = parseMarkdown(content, absolutePath)
      runInAction(() => {
        this.documents.set(absolutePath, parsed)
      })

      return true
    } catch (error) {
      console.error('Error creating document:', error)
      return false
    }
  }

  // Invalidate cache for a document (e.g., after external changes)
  invalidate(absolutePath: string) {
    this.documents.delete(absolutePath)
  }

  // Update path in cache after a file move
  updatePath(oldPath: string, newPath: string) {
    const doc = this.documents.get(oldPath)
    if (doc) {
      doc.path = newPath
      this.documents.delete(oldPath)
      this.documents.set(newPath, doc)
    }
  }
}

