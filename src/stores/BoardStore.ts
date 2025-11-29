import { makeAutoObservable, runInAction } from 'mobx'
import type { RootStore } from './RootStore'
import { v4 as uuid } from 'uuid'
import slugify from 'slugify'
import { promoteDocumentToParent, needsPromotion } from '../utils/documentPromotion'
import { dirname, join } from '../utils/pathUtils'
import { getMainAPI } from '../api/mainAPI'
import { getRoot } from './storeUtils'

export interface CardConnection {
  targetId: string
  type: 'to' | 'from' | 'bidirectional'
}

export interface Card {
  id: string
  markdownPath: string
  x: number
  y: number
  width: number
  height: number
  connections: CardConnection[]
}

export interface Board {
  version: string
  projectName?: string
  rootMarkdown?: string
  defaultCardWidth: number
  defaultCardHeight: number
  cards: Card[]
}

export class BoardStore {
  boards: Map<string, Board> = new Map()
  currentBoardPath: string | null = null
  saveTimeout: NodeJS.Timeout | null = null

  constructor(readonly parent: RootStore) {
    makeAutoObservable(this, {
      parent: false,
      saveTimeout: false,
    })
  }

  get root(): RootStore {
    return getRoot(this)
  }

  get currentBoard(): Board | null {
    if (!this.currentBoardPath) return null
    return this.boards.get(this.currentBoardPath) || null
  }

  async loadBoard(absolutePath: string): Promise<Board | null> {
    // Return cached if available
    if (this.boards.has(absolutePath)) {
      runInAction(() => {
        this.currentBoardPath = absolutePath
      })
      return this.boards.get(absolutePath)!
    }

    try {
      const api = getMainAPI()
      const result = await api.readFile(absolutePath)
      
      if (!result.success || !result.content) {
        console.error(`Failed to load board: ${result.error}`)
        return null
      }

      const board: Board = JSON.parse(result.content)
      
      // Ensure cards array exists
      if (!board.cards) {
        board.cards = []
      }

      // Ensure connections array exists on each card
      board.cards.forEach(card => {
        if (!card.connections) {
          card.connections = []
        }
      })

      runInAction(() => {
        this.boards.set(absolutePath, board)
        this.currentBoardPath = absolutePath
      })

      return board
    } catch (error) {
      console.error('Error loading board:', error)
      return null
    }
  }

  async saveBoard(absolutePath: string): Promise<boolean> {
    const board = this.boards.get(absolutePath)
    if (!board) return false

    try {
      const api = getMainAPI()
      const content = JSON.stringify(board, null, 2)
      const result = await api.writeFile(absolutePath, content)
      
      if (!result.success) {
        console.error(`Failed to save board: ${result.error}`)
        return false
      }

      return true
    } catch (error) {
      console.error('Error saving board:', error)
      return false
    }
  }

  // Debounced save - waits 1s after last change
  scheduleSave(absolutePath: string) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    this.saveTimeout = setTimeout(() => {
      this.saveBoard(absolutePath)
    }, 1000)
  }

  updateCardPosition(cardId: string, x: number, y: number) {
    if (!this.currentBoard || !this.currentBoardPath) return

    const card = this.currentBoard.cards.find(c => c.id === cardId)
    if (card) {
      card.x = x
      card.y = y
      this.scheduleSave(this.currentBoardPath)
    }
  }

  async createCard(title: string, x: number, y: number): Promise<Card | null> {
    if (!this.currentBoard || !this.currentBoardPath || !this.root.projectRoot) {
      return null
    }

    // Get the current document path (the parent for this new card)
    const currentDocPath = this.root.navigationStore.currentDocumentPath
    let boardPath = this.currentBoardPath
    let parentDir: string

    // Check if the current document needs promotion (first child being added)
    if (currentDocPath) {
      const relativePath = this.root.getRelativePath(currentDocPath)
      const shouldPromote = await needsPromotion(this.root.projectRoot, relativePath)
      
      if (shouldPromote) {
        // Promote the document
        const result = await promoteDocumentToParent(this.root.projectRoot, relativePath)
        
        if (!result.success) {
          console.error('Failed to promote document:', result.error)
          return null
        }

        // Update navigation and board paths
        const newAbsoluteDocPath = join(this.root.projectRoot, result.newDocPath!)
        const newAbsoluteBoardPath = join(this.root.projectRoot, result.newBoardPath!)
        
        // Update document store cache
        this.root.documentStore.updatePath(currentDocPath, newAbsoluteDocPath)
        
        // Load the new board
        await this.loadBoard(newAbsoluteBoardPath)
        boardPath = newAbsoluteBoardPath
        
        // Update navigation
        this.root.navigationStore.setCurrentDocument(newAbsoluteDocPath)
        
        // Get parent directory for the new child
        parentDir = dirname(result.newDocPath!)
      } else {
        // No promotion needed, use the board's directory
        parentDir = dirname(this.root.getRelativePath(boardPath))
      }
    } else {
      parentDir = dirname(this.root.getRelativePath(boardPath))
    }

    // Generate filename from title
    const baseFilename = slugify(title, { lower: true, strict: true })
    let filename = baseFilename + '.md'
    let filePath = parentDir ? `${parentDir}/${filename}` : filename
    let absolutePath = join(this.root.projectRoot, filePath)
    
    // Handle filename collision
    const api = getMainAPI()
    let counter = 1
    while (await api.exists(absolutePath)) {
      filename = `${baseFilename}-${++counter}.md`
      filePath = parentDir ? `${parentDir}/${filename}` : filename
      absolutePath = join(this.root.projectRoot, filePath)
    }

    // Create the markdown file
    const success = await this.root.documentStore.createDocument(absolutePath, title)
    if (!success) return null

    // Create the card
    const card: Card = {
      id: uuid(),
      markdownPath: filePath,
      x,
      y,
      width: this.currentBoard?.defaultCardWidth || 300,
      height: this.currentBoard?.defaultCardHeight || 200,
      connections: [],
    }

    runInAction(() => {
      const board = this.boards.get(boardPath)
      if (board) {
        board.cards.push(card)
      }
    })

    this.scheduleSave(boardPath)

    return card
  }

  deleteCard(cardId: string) {
    if (!this.currentBoard || !this.currentBoardPath) return

    const index = this.currentBoard.cards.findIndex(c => c.id === cardId)
    if (index !== -1) {
      // Remove card
      this.currentBoard.cards.splice(index, 1)
      
      // Remove any connections pointing to this card
      this.currentBoard.cards.forEach(card => {
        card.connections = card.connections.filter(c => c.targetId !== cardId)
      })

      this.scheduleSave(this.currentBoardPath)
    }
  }

  addConnection(fromCardId: string, toCardId: string, type: CardConnection['type'] = 'to') {
    if (!this.currentBoard || !this.currentBoardPath) return

    const card = this.currentBoard.cards.find(c => c.id === fromCardId)
    if (card) {
      // Check if connection already exists
      const exists = card.connections.some(c => c.targetId === toCardId)
      if (!exists) {
        card.connections.push({ targetId: toCardId, type })
        this.scheduleSave(this.currentBoardPath)
      }
    }
  }

  removeConnection(fromCardId: string, toCardId: string) {
    if (!this.currentBoard || !this.currentBoardPath) return

    const card = this.currentBoard.cards.find(c => c.id === fromCardId)
    if (card) {
      card.connections = card.connections.filter(c => c.targetId !== toCardId)
      this.scheduleSave(this.currentBoardPath)
    }
  }

  // Find all board.json files in the project
  async findAllBoardFiles(): Promise<string[]> {
    if (!this.root.projectRoot) return []
    
    const boardFiles: string[] = []
    
    const api = getMainAPI()
    const scanDir = async (dir: string) => {
      const result = await api.readdir(dir)
      if (!result.success || !result.items) return

      for (const item of result.items) {
        const fullPath = `${dir}/${item.name}`
        if (item.isDirectory) {
          await scanDir(fullPath)
        } else if (item.name.endsWith('.board.json')) {
          boardFiles.push(fullPath)
        }
      }
    }

    await scanDir(this.root.projectRoot)
    return boardFiles
  }

  // Update all board files when a markdown path changes
  async updateAllReferences(oldPath: string, newPath: string) {
    const api = getMainAPI()
    const boardFiles = await this.findAllBoardFiles()
    
    for (const boardFile of boardFiles) {
      const result = await api.readFile(boardFile)
      if (!result.success || !result.content) continue

      let board: Board
      try {
        board = JSON.parse(result.content)
      } catch {
        continue
      }

      let modified = false
      if (board.cards) {
        for (const card of board.cards) {
          if (card.markdownPath === oldPath) {
            card.markdownPath = newPath
            modified = true
          }
        }
      }

      if (modified) {
        await api.writeFile(boardFile, JSON.stringify(board, null, 2))
        
        // Update local cache if this board is loaded
        if (this.boards.has(boardFile)) {
          this.boards.set(boardFile, board)
        }
      }
    }
  }
}

