import { applyPatches, Patch, onPatches } from "mobx-keystone";
import { makeAutoObservable } from "mobx";

// Define constants for patch operations
const PATCH_OP = {
  ADD: 'add' as const,
  REMOVE: 'remove' as const,
  REPLACE: 'replace' as const
};

interface PatchHistory {
  from: Patch[];
  to: Patch[];
  name?: string;
}

export class ManualUndoManager {
  private patchHistory: PatchHistory[] = [];
  private historyIndex: number = 0;
  private store: any;
  private disposer: () => void;
  private isUndoRedoOperation = false;

  constructor(store: any) {
    this.store = store;
    this.patchHistory[0] = { from: [], to: [] };
    
    this.disposer = onPatches(store, (toPatches, fromPatches) => {
      // Ignore patches from undo/redo operations
      if (this.isUndoRedoOperation) return;

      // // If we're making changes after an undo, trim off the future history
      if (this.historyIndex < this.patchHistory.length - 1) {
        // console.log('Trimming future history from index:', this.historyIndex + 1);
        this.patchHistory.length = this.historyIndex + 1;
      }

      const currentHistory = this.patchHistory[this.historyIndex];
      
      toPatches.forEach(toPatch => {
        const pathKey = toPatch.path.join('.');
        
        // For array operations, we need special handling
        if (toPatch.op === PATCH_OP.REMOVE) {
          // For removals, don't merge - always add as new patch
          currentHistory.to.push(toPatch);
        } else {
          // For other operations, continue with existing merge logic
          const existingToPatchIndex = currentHistory.to.findIndex(
            p => p.path.join('.') === pathKey
          );
          
          if (existingToPatchIndex !== -1) {
            // Update existing 'to' patch with new value
            currentHistory.to[existingToPatchIndex] = toPatch;
          } else {
            // Add new 'to' patch
            currentHistory.to.push(toPatch);
          }
        }
      });

      fromPatches.forEach(fromPatch => {
        const pathKey = fromPatch.path.join('.');
        
        // For array operations, we need special handling
        if (fromPatch.op === PATCH_OP.ADD) {
          // For additions in the 'from' patches (which represent removals), don't merge
          currentHistory.from.push(fromPatch);
        } else {
          // For other operations, continue with existing merge logic
          const existingFromPatchIndex = currentHistory.from.findIndex(
            p => p.path.join('.') === pathKey
          );
          
          if (existingFromPatchIndex === -1) {
            // This is a new path we're tracking, add its original value
            currentHistory.from.push(fromPatch);
          }
        }
      });

    //   console.log('Current patch history:', JSON.stringify(this.patchHistory[this.historyIndex], null, 2));
    });
    
    makeAutoObservable(this);
  }

  commit(name?: string) {    
    // Log the patches being committed
    console.log('Committing patches:', JSON.stringify(this.patchHistory[this.historyIndex], null, 2));
    
    // Move forward in history
    this.historyIndex++;
    
    // Clear any future history if we're committing after an undo
    this.patchHistory.length = this.historyIndex + 1;
    
    // Initialize the new history point
    this.patchHistory[this.historyIndex] = { from: [], to: [] };
    if(name) this.patchHistory[this.historyIndex].name = name;

    console.log('Committed history point:', name, 'at index:', this.historyIndex - 1);
    console.log('New history index:', this.historyIndex);
  }

  undo() {
    if (!this.canUndo) return;

    this.historyIndex--;

    this.isUndoRedoOperation = true;
    const patches = [...this.patchHistory[this.historyIndex].from].reverse();
    console.log('Undoing with patches:', JSON.stringify(patches, null, 2));
    applyPatches(this.store, patches);
    this.isUndoRedoOperation = false;
  }

  redo() {
    if (!this.canRedo) return;

    this.isUndoRedoOperation = true;
    const patches = [...this.patchHistory[this.historyIndex].to];
    console.log('Redoing with patches:', JSON.stringify(patches, null, 2));
    applyPatches(this.store, patches);
    this.isUndoRedoOperation = false;

    this.historyIndex++;
  }

  get canUndo(): boolean {
    return this.historyIndex > 0;
  }

  get canRedo(): boolean {
    return this.historyIndex < this.patchHistory.length - 1;
  }

  dispose() {
    this.disposer();
  }

  scrubToIndex(targetIndex: number) {
    if (targetIndex < 0 || targetIndex >= this.patchHistory.length) return;
    console.log('Scrubbing to index:', targetIndex, 'from index:', this.historyIndex);

    while (this.historyIndex !== targetIndex) {
        if (targetIndex < this.historyIndex) {
            this.undo();
        } else if (targetIndex > this.historyIndex) {
            this.redo();
        }
    }
  }

  getPatchHistory(index: number): PatchHistory {
    return this.patchHistory[index];
  }

  get historyLength(): number {
    return this.patchHistory.length;
  }

  get currentIndex(): number {
    return this.historyIndex;
  }

  get currentPatchHistory(): PatchHistory {
    return this.patchHistory[this.historyIndex];
  }
}

export const manualUndoMiddleware = (store: any) => {
  return new ManualUndoManager(store);
}; 