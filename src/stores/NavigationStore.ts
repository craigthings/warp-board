import { makeAutoObservable } from 'mobx'
import type { RootStore } from './RootStore'
import { getMainAPI } from '../api/mainAPI'

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

  constructor(
    private rootStore: RootStore,
    private parent: RootStore
  ) {
    makeAutoObservable(this, {
      rootStore: false,
      parent: false,
    })
  }

  setCurrentDocument(absolutePath: string) {
    this.currentDocumentPath = absolutePath
    
    // Build breadcrumb from path
    if (this.rootStore.projectRoot) {
      const relativePath = absolutePath.replace(this.rootStore.projectRoot + '/', '')
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
    if (!this.rootStore.projectRoot) return

    // Save current state to stack
    if (this.currentDocumentPath) {
      this.navigationStack.push({
        documentPath: this.currentDocumentPath,
        boardPath: this.rootStore.boardStore.currentBoardPath || '',
        scrollPosition: 0, // TODO: capture actual scroll position
      })
    }

    // Set animation direction
    this.slideDirection = 'left'
    this.isAnimating = true

    // Load the new document
    const absolutePath = this.rootStore.getAbsolutePath(markdownPath)
    await this.rootStore.documentStore.loadDocument(absolutePath)
    
    // Check if this document has a board
    const api = getMainAPI()
    const boardPath = absolutePath.replace('.md', '.board.json')
    const hasBoard = await api.exists(boardPath)
    
    if (hasBoard) {
      await this.rootStore.boardStore.loadBoard(boardPath)
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
    await this.rootStore.documentStore.loadDocument(targetState.documentPath)
    await this.rootStore.boardStore.loadBoard(targetState.boardPath)
    
    this.setCurrentDocument(targetState.documentPath)
  }

  navigateToRoot() {
    // Clear stack and go to root
    this.navigationStack = []
    
    if (this.rootStore.projectRoot) {
      const rootBoardPath = this.rootStore.boardStore.currentBoardPath
      if (rootBoardPath) {
        const board = this.rootStore.boardStore.boards.get(rootBoardPath)
        if (board?.rootMarkdown) {
          const rootDocPath = this.rootStore.getAbsolutePath(board.rootMarkdown)
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

