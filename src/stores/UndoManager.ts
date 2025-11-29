import { applyPatches, Patch, onPatches } from 'mobx-keystone'
import { makeAutoObservable } from 'mobx'

const PATCH_OP = {
  ADD: 'add' as const,
  REMOVE: 'remove' as const,
  REPLACE: 'replace' as const
}

interface PatchHistory {
  from: Patch[]
  to: Patch[]
  name?: string
}

export class UndoManager {
  private patchHistory: PatchHistory[] = []
  private historyIndex: number = 0
  private store: object
  private disposer: () => void
  private isUndoRedoOperation = false
  private batchName: string | null = null

  constructor(store: object) {
    this.store = store
    this.patchHistory[0] = { from: [], to: [] }
    
    this.disposer = onPatches(store, (toPatches, fromPatches) => {
      // Ignore patches from undo/redo operations
      if (this.isUndoRedoOperation) return

      // If we're making changes after an undo, trim off the future history
      if (this.historyIndex < this.patchHistory.length - 1) {
        this.patchHistory.length = this.historyIndex + 1
      }

      const currentHistory = this.patchHistory[this.historyIndex]
      
      toPatches.forEach(toPatch => {
        const pathKey = toPatch.path.join('.')
        
        if (toPatch.op === PATCH_OP.REMOVE) {
          // For removals, don't merge - always add as new patch
          currentHistory.to.push(toPatch)
        } else {
          const existingToPatchIndex = currentHistory.to.findIndex(
            p => p.path.join('.') === pathKey
          )
          
          if (existingToPatchIndex !== -1) {
            currentHistory.to[existingToPatchIndex] = toPatch
          } else {
            currentHistory.to.push(toPatch)
          }
        }
      })

      fromPatches.forEach(fromPatch => {
        const pathKey = fromPatch.path.join('.')
        
        if (fromPatch.op === PATCH_OP.ADD) {
          currentHistory.from.push(fromPatch)
        } else {
          const existingFromPatchIndex = currentHistory.from.findIndex(
            p => p.path.join('.') === pathKey
          )
          
          if (existingFromPatchIndex === -1) {
            currentHistory.from.push(fromPatch)
          }
        }
      })
    })
    
    makeAutoObservable(this)
  }

  /** 
   * Commit current pending patches as an undo checkpoint.
   */
  commit(name?: string) {
    // Don't commit if there are no pending patches
    if (this.patchHistory[this.historyIndex].to.length === 0) return

    // Move forward in history
    this.historyIndex++
    
    // Clear any future history
    this.patchHistory.length = this.historyIndex + 1
    
    // Initialize the new history point
    this.patchHistory[this.historyIndex] = { from: [], to: [] }
    
    // Name the previous history point (the one we just committed)
    if (name) {
      this.patchHistory[this.historyIndex - 1].name = name
    }
  }

  /**
   * Start a batch - patches will accumulate until endBatch is called.
   * Use for operations like drag where many actions should be one undo step.
   */
  startBatch(name: string) {
    this.batchName = name
  }

  /**
   * End a batch and commit all accumulated patches as one undo step.
   */
  endBatch() {
    if (this.batchName) {
      this.commit(this.batchName)
      this.batchName = null
    }
  }

  /**
   * Check if currently in a batch operation.
   */
  get inBatch(): boolean {
    return this.batchName !== null
  }

  undo() {
    if (!this.canUndo) return

    this.historyIndex--

    this.isUndoRedoOperation = true
    const patches = [...this.patchHistory[this.historyIndex].from].reverse()
    applyPatches(this.store, patches)
    this.isUndoRedoOperation = false
  }

  redo() {
    if (!this.canRedo) return

    this.isUndoRedoOperation = true
    const patches = [...this.patchHistory[this.historyIndex].to]
    applyPatches(this.store, patches)
    this.isUndoRedoOperation = false

    this.historyIndex++
  }

  get canUndo(): boolean {
    return this.historyIndex > 0
  }

  get canRedo(): boolean {
    return this.historyIndex < this.patchHistory.length - 1
  }

  /**
   * Check if there are uncommitted patches.
   */
  get hasPendingChanges(): boolean {
    return this.patchHistory[this.historyIndex].to.length > 0
  }

  /**
   * Discard any uncommitted patches.
   */
  discardPending() {
    if (this.hasPendingChanges) {
      // Undo the pending changes
      this.isUndoRedoOperation = true
      const patches = [...this.patchHistory[this.historyIndex].from].reverse()
      applyPatches(this.store, patches)
      this.isUndoRedoOperation = false
      
      // Clear the pending patches
      this.patchHistory[this.historyIndex] = { from: [], to: [] }
    }
    this.batchName = null
  }

  dispose() {
    this.disposer()
  }

  scrubToIndex(targetIndex: number) {
    if (targetIndex < 0 || targetIndex >= this.patchHistory.length) return

    while (this.historyIndex !== targetIndex) {
      if (targetIndex < this.historyIndex) {
        this.undo()
      } else if (targetIndex > this.historyIndex) {
        this.redo()
      }
    }
  }

  getPatchHistory(index: number): PatchHistory {
    return this.patchHistory[index]
  }

  get historyLength(): number {
    return this.patchHistory.length
  }

  get currentIndex(): number {
    return this.historyIndex
  }

  get currentPatchHistory(): PatchHistory {
    return this.patchHistory[this.historyIndex]
  }
}

export const undoMiddleware = (store: object) => {
  return new UndoManager(store)
}
