import React, { createContext, useContext, ReactNode } from 'react'
import { makeAutoObservable } from 'mobx'
import { DocumentStore } from './DocumentStore'
import { BoardStore } from './BoardStore'
import { NavigationStore } from './NavigationStore'

export class RootStore {
  documentStore: DocumentStore
  boardStore: BoardStore
  navigationStore: NavigationStore

  // Project state
  projectRoot: string | null = null
  isProjectLoaded: boolean = false

  constructor() {
    this.documentStore = new DocumentStore(this)
    this.boardStore = new BoardStore(this)
    this.navigationStore = new NavigationStore(this)
    makeAutoObservable(this)
  }

  async openProject(boardJsonPath: string) {
    // Extract project root from the board.json path
    const pathParts = boardJsonPath.replace(/\\/g, '/').split('/')
    pathParts.pop() // Remove the filename
    this.projectRoot = pathParts.join('/')

    // Load the root board
    await this.boardStore.loadBoard(boardJsonPath)
    
    // Load the root markdown if it exists
    const board = this.boardStore.currentBoard
    if (board?.rootMarkdown) {
      const mdPath = `${this.projectRoot}/${board.rootMarkdown}`
      await this.documentStore.loadDocument(mdPath)
      this.navigationStore.setCurrentDocument(mdPath)
    }

    this.isProjectLoaded = true
  }

  getAbsolutePath(relativePath: string): string {
    if (!this.projectRoot) return relativePath
    return `${this.projectRoot}/${relativePath}`
  }

  getRelativePath(absolutePath: string): string {
    if (!this.projectRoot) return absolutePath
    return absolutePath.replace(this.projectRoot + '/', '')
  }
}

// Create context
const RootStoreContext = createContext<RootStore | null>(null)

// Provider component
export function RootStoreProvider({ children }: { children: ReactNode }) {
  const [store] = React.useState(() => new RootStore())
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

