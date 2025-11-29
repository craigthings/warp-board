import { model, Model, prop, modelAction, getRoot } from 'mobx-keystone'
import { computed } from 'mobx'
import type { RootStore } from './RootStore'
import { getMainAPI } from '../api/mainAPI'

export type SlideDirection = 'none' | 'left' | 'right'

interface NavigationState {
  documentPath: string
  boardPath: string
  scrollPosition: number
}

@model('warp/NavigationStore')
export class NavigationStore extends Model({
  currentDocumentPath: prop<string | null>(null),
  breadcrumb: prop<string[]>(() => []),
  slideDirection: prop<SlideDirection>('none'),
  isAnimating: prop<boolean>(false),
  navigationStack: prop<NavigationState[]>(() => []),
}) {
  get root(): RootStore {
    return getRoot<RootStore>(this)
  }

  @computed
  get canGoBack(): boolean {
    return this.navigationStack.length > 0
  }

  @computed
  get currentLevel(): number {
    return this.navigationStack.length
  }

  private buildBreadcrumb(relativePath: string): string[] {
    const parts = relativePath.replace(/\.md$/, '').split('/')
    return parts
  }

  @modelAction
  setCurrentDocument(absolutePath: string) {
    this.currentDocumentPath = absolutePath
    
    if (this.root.projectRoot) {
      const relativePath = absolutePath.replace(this.root.projectRoot + '/', '')
      this.breadcrumb = this.buildBreadcrumb(relativePath)
    }
  }

  @modelAction
  _pushNavigationState(state: NavigationState) {
    this.navigationStack.push(state)
  }

  @modelAction
  _setAnimating(direction: SlideDirection) {
    this.slideDirection = direction
    this.isAnimating = true
  }

  @modelAction
  _spliceNavigationStack(targetIndex: number): NavigationState[] {
    return this.navigationStack.splice(targetIndex)
  }

  @modelAction
  completeAnimation() {
    this.isAnimating = false
    this.slideDirection = 'none'
  }

  @modelAction
  navigateToRoot() {
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

  async navigateToCard(markdownPath: string) {
    if (!this.root.projectRoot) return

    // Save current state to stack
    if (this.currentDocumentPath) {
      this._pushNavigationState({
        documentPath: this.currentDocumentPath,
        boardPath: this.root.boardStore.currentBoardPath || '',
        scrollPosition: 0,
      })
    }

    this._setAnimating('left')

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

    let targetIndex = targetLevel === -1 
      ? this.navigationStack.length - 1 
      : targetLevel

    if (targetIndex < 0 || targetIndex >= this.navigationStack.length) return

    this._setAnimating('right')

    const states = this._spliceNavigationStack(targetIndex)
    const targetState = states[0]

    await this.root.documentStore.loadDocument(targetState.documentPath)
    await this.root.boardStore.loadBoard(targetState.boardPath)
    
    this.setCurrentDocument(targetState.documentPath)
  }
}
