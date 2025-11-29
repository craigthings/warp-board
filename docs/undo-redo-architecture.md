# Undo/Redo Architecture: Smart Patch Handlers

## Overview

This document describes a hybrid approach to undo/redo that combines the simplicity of patch-based state management with the flexibility of the Command Pattern for handling side effects.

## The Problem

### Pure Patch-Based Undo
- ✅ Automatic state reversal
- ✅ Minimal code per operation
- ❌ Only handles state - no side effects (files, API calls, etc.)

### Full Command Pattern
- ✅ Total control over undo logic
- ✅ Can handle any side effect
- ❌ Must write explicit `execute()` and `undo()` for every operation
- ❌ Lots of boilerplate

## The Solution: Smart Patch Handlers

Keep patches for state management, but add **patch handlers** that respond to specific patch patterns and handle associated side effects.

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Code                          │
│                                                             │
│   @modelAction                                              │
│   addImageToCard(cardId, imagePath) {                       │
│     this.card.image = imagePath  // Just mutate state       │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Patch System                             │
│                                                             │
│   Patch: { op: "replace", path: ["card","image"],           │
│            value: "photo.png" }                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Patch Handler Registry                      │
│                                                             │
│   "Does this patch match any registered handlers?"          │
│                                                             │
│   ✓ ImagePatchHandler: matches path containing "image"      │
│     → onUndo: delete orphaned file                          │
│     → onRedo: restore file from trash                       │
└─────────────────────────────────────────────────────────────┘
```

## Proposed API

### Registering Handlers

```typescript
interface PatchHandler {
  // Determine if this handler applies to a patch
  match: (patch: Patch) => boolean
  
  // Called when this patch is undone
  onUndo?: (patch: Patch, reversePatch: Patch) => void | Promise<void>
  
  // Called when this patch is redone
  onRedo?: (patch: Patch) => void | Promise<void>
  
  // Optional: human-readable name for debugging
  name?: string
}

// Register handlers at app initialization
undoManager.registerPatchHandler({
  name: 'ImageHandler',
  match: (patch) => patch.path.includes('image'),
  onUndo: async (patch, reversePatch) => {
    // When image is removed (undo add), clean up file
    if (reversePatch.value === null && patch.value) {
      await moveToTrash(patch.value)
    }
  },
  onRedo: async (patch) => {
    // When image is re-added (redo), restore from trash
    if (patch.value) {
      await restoreFromTrash(patch.value)
    }
  }
})
```

### Example Handlers

#### Image/File Handler
```typescript
undoManager.registerPatchHandler({
  name: 'FileResourceHandler',
  match: (patch) => {
    // Match any patch that adds/removes file references
    return patch.path.some(p => 
      ['image', 'attachment', 'file'].includes(String(p))
    )
  },
  onUndo: async (patch, reversePatch) => {
    if (patch.op === 'replace' && patch.value && !reversePatch.value) {
      // File reference was added, now being removed
      await fileManager.moveToTrash(patch.value)
    }
  },
  onRedo: async (patch) => {
    if (patch.op === 'replace' && patch.value) {
      // File reference being restored
      await fileManager.restoreFromTrash(patch.value)
    }
  }
})
```

#### External API Sync Handler
```typescript
undoManager.registerPatchHandler({
  name: 'APISyncHandler',
  match: (patch) => patch.path[0] === 'cards',
  onUndo: async (patch) => {
    // Sync deletion/update to server
    await api.syncCardChange(patch, 'undo')
  },
  onRedo: async (patch) => {
    await api.syncCardChange(patch, 'redo')
  }
})
```

#### Board Thumbnail Handler
```typescript
undoManager.registerPatchHandler({
  name: 'ThumbnailHandler',
  match: (patch) => patch.path.includes('cards'),
  onUndo: () => {
    // Regenerate board thumbnail after card changes
    thumbnailService.scheduleRegeneration()
  },
  onRedo: () => {
    thumbnailService.scheduleRegeneration()
  }
})
```

## Integration with UndoManager

```typescript
class UndoManager {
  private patchHandlers: PatchHandler[] = []
  
  registerPatchHandler(handler: PatchHandler) {
    this.patchHandlers.push(handler)
    return () => {
      // Return unregister function
      this.patchHandlers = this.patchHandlers.filter(h => h !== handler)
    }
  }
  
  async undo() {
    if (!this.canUndo) return
    
    this.historyIndex--
    const history = this.patchHistory[this.historyIndex]
    
    // Apply state patches
    this.isUndoRedoOperation = true
    const patches = [...history.from].reverse()
    applyPatches(this.store, patches)
    this.isUndoRedoOperation = false
    
    // Run patch handlers
    for (const patch of history.to) {
      const reversePatch = history.from.find(p => 
        p.path.join('.') === patch.path.join('.')
      )
      for (const handler of this.patchHandlers) {
        if (handler.match(patch) && handler.onUndo) {
          await handler.onUndo(patch, reversePatch)
        }
      }
    }
  }
  
  async redo() {
    if (!this.canRedo) return
    
    const history = this.patchHistory[this.historyIndex]
    
    // Apply state patches
    this.isUndoRedoOperation = true
    applyPatches(this.store, history.to)
    this.isUndoRedoOperation = false
    
    this.historyIndex++
    
    // Run patch handlers
    for (const patch of history.to) {
      for (const handler of this.patchHandlers) {
        if (handler.match(patch) && handler.onRedo) {
          await handler.onRedo(patch)
        }
      }
    }
  }
}
```

## Comparison

| Aspect | Pure Patches | Command Pattern | Smart Patch Handlers |
|--------|--------------|-----------------|---------------------|
| State undo | Automatic | Manual | Automatic |
| Side effects | ❌ None | ✅ Full control | ✅ Pattern-based |
| Code per operation | None | Lots | None |
| Setup cost | None | None | Register handlers once |
| Flexibility | Low | High | Medium-High |
| Developer experience | Great for state | Tedious | Great for everything |

## When to Use Each Approach

### Use Pure Patches When:
- All operations are pure state mutations
- No external resources (files, APIs)
- Simple CRUD operations

### Use Smart Patch Handlers When:
- You have categories of operations with similar side effects
- File/image management
- API synchronization
- Cache invalidation
- Thumbnail generation

### Use Full Command Pattern When:
- Each operation has unique, complex undo logic
- You need transaction-like behavior
- Operations aren't easily categorized

## Benefits of This Approach

1. **Declarative** - Describe what side effects go with patch patterns, not how to undo each operation
2. **DRY** - Register once, applies everywhere
3. **Composable** - Multiple handlers can respond to the same patch
4. **Transparent** - Developer writes normal `@modelAction` code
5. **Incremental** - Add handlers as needs arise, no upfront architecture
6. **Testable** - Handlers are isolated, easy to unit test

## Future Considerations

### Async Handler Ordering
If handlers have dependencies, may need priority or sequential execution.

### Handler Errors
What happens if a handler fails? Options:
- Ignore and continue
- Rollback the undo/redo
- Queue for retry

### Trash/Recovery System
For file handlers, implement a trash system rather than permanent deletion:
```typescript
class TrashManager {
  async moveToTrash(path: string) { /* ... */ }
  async restoreFromTrash(path: string) { /* ... */ }
  async emptyTrash() { /* ... */ }
}
```

### Debugging
Add logging/devtools for patch handler execution:
```typescript
undoManager.onPatchHandled((handler, patch, action) => {
  console.log(`[${action}] ${handler.name} handled`, patch)
})
```

