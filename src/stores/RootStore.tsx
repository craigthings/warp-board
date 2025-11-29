import React, { createContext, useContext, ReactNode } from 'react'
import { model, Model, prop, modelAction, registerRootStore } from 'mobx-keystone'
import { DocumentStore } from './DocumentStore'
import { BoardStore } from './BoardStore'
import { NavigationStore } from './NavigationStore'
import { getMainAPI } from '../api/mainAPI'
import { UndoManager, undoMiddleware } from './UndoManager'

@model('warp/RootStore')
export class RootStore extends Model({
  documentStore: prop<DocumentStore>(() => new DocumentStore({})),
  boardStore: prop<BoardStore>(() => new BoardStore({})),
  navigationStore: prop<NavigationStore>(() => new NavigationStore({})),
  projectRoot: prop<string | null>(null),
  isProjectLoaded: prop<boolean>(false),
}) {
  undoManager?: UndoManager

  onInit() {
    // Register as root store for lifecycle hooks
    registerRootStore(this)
    
    // Setup undo manager
    this.undoManager = undoMiddleware(this)
  }

  @modelAction
  _setProjectRoot(path: string) {
    this.projectRoot = path
  }

  @modelAction
  _setProjectLoaded(loaded: boolean) {
    this.isProjectLoaded = loaded
  }

  getAbsolutePath(relativePath: string): string {
    if (!this.projectRoot) return relativePath
    return `${this.projectRoot}/${relativePath}`
  }

  getRelativePath(absolutePath: string): string {
    if (!this.projectRoot) return absolutePath
    const normalizedPath = absolutePath.replace(/\\/g, '/')
    return normalizedPath.replace(this.projectRoot + '/', '')
  }

  async openProject(boardJsonPath: string) {
    // Extract project root from the board.json path
    const pathParts = boardJsonPath.replace(/\\/g, '/').split('/')
    pathParts.pop()
    this._setProjectRoot(pathParts.join('/'))

    // Load the root board
    await this.boardStore.loadBoard(boardJsonPath)
    
    // Load the root markdown if it exists
    const board = this.boardStore.currentBoard
    if (board?.rootMarkdown) {
      const mdPath = `${this.projectRoot}/${board.rootMarkdown}`
      await this.documentStore.loadDocument(mdPath)
      this.navigationStore.setCurrentDocument(mdPath)
    }

    this._setProjectLoaded(true)
  }

  async createProject(projectName: string): Promise<boolean> {
    try {
      const api = getMainAPI()
      const boardJsonPath = await api.createProject(projectName)
      if (!boardJsonPath) {
        return false
      }
      
      await this.openProject(boardJsonPath)
      return true
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }
}

// Create context
const RootStoreContext = createContext<RootStore | null>(null)

// Provider component
export function RootStoreProvider({ children }: { children: ReactNode }) {
  const [store] = React.useState(() => new RootStore({}))
  return (
    <RootStoreContext.Provider value={store}>
      {children}
    </RootStoreContext.Provider>
  )
}

// Hook to use the store
export function useRootStore(): RootStore {
  const store = useContext(RootStoreContext)
  if (!store) {
    throw new Error('useRootStore must be used within a RootStoreProvider')
  }
  return store
}

// Convenience hooks for individual stores
export function useDocumentStore() {
  return useRootStore().documentStore
}

export function useBoardStore() {
  return useRootStore().boardStore
}

export function useNavigationStore() {
  return useRootStore().navigationStore
}
