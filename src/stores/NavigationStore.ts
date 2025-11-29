import { makeAutoObservable } from 'mobx'
import type { RootStore } from './RootStore'
import { getMainAPI } from '../api/mainAPI'
import { getRoot } from './storeUtils'

export type SlideDirection = 'none' | 'left' | 'right'

interface NavigationState {
  documentPath: string
  boardPath: string
  scrollPosition: number
}

export class NavigationStore {
  currentDocumentPath: string | null = null
  breadcrumb: string[] = []
  slideDirection: SlideDirection = 'none'
  isAnimating: boolean = false
  
  // Stack of view states for back navigation
  navigationStack: NavigationState[] = []

  constructor(readonly parent: RootStore) {
    makeAutoObservable(this, { parent: false })
  }

  get root(): RootStore {
    return getRoot(this)
  }

  setCurrentDocument(absolutePath: string) {
    this.currentDocumentPath = absolutePath
    
    // Build breadcrumb from path
    if (this.root.projectRoot) {
      const relativePath = absolutePath.replace(this.root.projectRoot + '/', '')
      this.breadcrumb = this.buildBreadcrumb(relativePath)
    }
  }

  private buildBreadcrumb(relativePath: string): string[] {
    // Convert path to breadcrumb items
    // e.g., "architecture/api-gateway/load-balancer.md" -> ["architecture", "api-gateway", "load-balancer"]
    const parts = relativePath.replace(/\.md$/, '').split('/')
    return parts
  }

  async navigateToCard(markdownPath: string) {
    if (!this.root.projectRoot) return

    // Save current state to stack
    if (this.currentDocumentPath) {
      this.navigationStack.push({
        documentPath: this.currentDocumentPath,
        boardPath: this.root.boardStore.currentBoardPath || '',
        scrollPosition: 0, // TODO: capture actual scroll position
      })
    }

    // Set animation direction
    this.slideDirection = 'left'
    this.isAnimating = true

    // Load the new document
    const absolutePath = this.root.getAbsolutePath(markdownPath)
    await this.root.documentStore.loadDocument(absolutePath)
    
    // Check if this document has a board
    const api = getMainAPI()
    const boardPath = absolutePath.replace('.md', '.board.json')
    const hasBoard = await api.exists(boardPath)
    
    if (hasBoard) {
      await this.root.boardStore.loadBoard(boardPath)
    }

    this.setCurrentDocument(absolutePath)
  }

  async navigateUp(targetLevel: number = -1) {
    if (this.navigationStack.length === 0) return

    // If targetLevel is -1, go back one level
    // Otherwise, go to the specific level
    let targetIndex = targetLevel === -1 
      ? this.navigationStack.length - 1 
      : targetLevel

    if (targetIndex < 0 || targetIndex >= this.navigationStack.length) return

    // Set animation direction
    this.slideDirection = 'right'
    this.isAnimating = true

    // Pop states until we reach the target
    const states = this.navigationStack.splice(targetIndex)
    const targetState = states[0]

    // Load the target state
    await this.root.documentStore.loadDocument(targetState.documentPath)
    await this.root.boardStore.loadBoard(targetState.boardPath)
    
    this.setCurrentDocument(targetState.documentPath)
  }

  navigateToRoot() {
    // Clear stack and go to root
    this.navigationStack = []
    
    if (this.root.projectRoot) {
      const rootBoardPath = this.root.boardStore.currentBoardPath
      if (rootBoardPath) {
        const board = this.root.boardStore.boards.get(rootBoardPath)
        if (board?.rootMarkdown) {
          const rootDocPath = this.root.getAbsolutePath(board.rootMarkdown)
          this.setCurrentDocument(rootDocPath)
        }
      }
    }
  }

  completeAnimation() {
    this.isAnimating = false
    this.slideDirection = 'none'
  }

  get canGoBack(): boolean {
    return this.navigationStack.length > 0
  }

  get currentLevel(): number {
    return this.navigationStack.length
  }
}

