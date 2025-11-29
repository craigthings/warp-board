import { model, Model, modelAction, getRoot } from 'mobx-keystone'
import { observable, computed } from 'mobx'
import type { RootStore } from './RootStore'
import { parseMarkdown, ParsedDocument } from '../utils/markdownParser'
import { getMainAPI } from '../api/mainAPI'

@model('warp/DocumentStore')
export class DocumentStore extends Model({}) {
  // Transient state (not part of keystone tree, no undo/redo)
  @observable.shallow
  documents: Map<string, ParsedDocument> = new Map()
  
  @observable
  loadingPaths: Set<string> = new Set()

  get root(): RootStore {
    return getRoot<RootStore>(this)
  }

  @computed
  get currentDocument(): ParsedDocument | null {
    const path = this.root.navigationStore.currentDocumentPath
    if (!path) return null
    return this.documents.get(path) || null
  }

  isLoading(path: string): boolean {
    return this.loadingPaths.has(path)
  }

  @modelAction
  _setDocument(absolutePath: string, doc: ParsedDocument) {
    this.documents.set(absolutePath, doc)
    this.loadingPaths.delete(absolutePath)
  }

  @modelAction
  _setLoading(absolutePath: string) {
    this.loadingPaths.add(absolutePath)
  }

  @modelAction
  _clearLoading(absolutePath: string) {
    this.loadingPaths.delete(absolutePath)
  }

  @modelAction
  invalidate(absolutePath: string) {
    this.documents.delete(absolutePath)
  }

  @modelAction
  updatePath(oldPath: string, newPath: string) {
    const doc = this.documents.get(oldPath)
    if (doc) {
      doc.path = newPath
      this.documents.delete(oldPath)
      this.documents.set(newPath, doc)
    }
  }

  async loadDocument(absolutePath: string): Promise<ParsedDocument | null> {
    // Return cached if available
    if (this.documents.has(absolutePath)) {
      return this.documents.get(absolutePath)!
    }

    this._setLoading(absolutePath)

    try {
      const api = getMainAPI()
      const result = await api.readFile(absolutePath)
      
      if (!result.success || !result.content) {
        console.error(`Failed to load document: ${result.error}`)
        this._clearLoading(absolutePath)
        return null
      }

      const parsed = parseMarkdown(result.content, absolutePath)
      this._setDocument(absolutePath, parsed)
      return parsed
    } catch (error) {
      console.error('Error loading document:', error)
      this._clearLoading(absolutePath)
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
      this._setDocument(absolutePath, parsed)
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
      this._setDocument(absolutePath, parsed)
      return true
    } catch (error) {
      console.error('Error creating document:', error)
      return false
    }
  }
}
