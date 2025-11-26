# Hierarchical Markdown Board - Development Plan

## Project Overview

A spatial, hierarchical documentation system where each markdown document can have an associated board of child cards. Users navigate by drilling down: click a card to see its full markdown content on the left, and its child cards on the right.

**Git-native**: All content lives in your repository as markdown + JSON files that can be committed and versioned.

### Core Concept

- **Entry Point**: `myboard.board.json` - the root board for your project
- **Left Panel**: Full markdown document content (or root board metadata)
- **Right Panel**: Canvas of connected cards (title + description from markdown)
- **Separator**: `---` divides preview content (title + description) from full document body
  - If no separator: first paragraph after title becomes description
- **Navigation**: Clicking a card loads its markdown left, its child cards right
- **Persistence**: Markdown files for content, JSON files for spatial layout (all git-committable)

---

## Technical Stack

- **Platform**: Electron (desktop app)
- **Framework**: React
- **Bundler**: Vite (fast dev experience, good Electron integration)
- **State Management**: 
  - MobX for central store tree
  - `localObservable` named `state` for component-level state
- **Styling**: Linaria (CSS-in-JS) via `@linaria/vite`
- **Canvas**: Custom implementation (draggable divs + SVG lines)
  - Canvas size: 4000×4000px with scrollbars
- **File System**: Node.js fs module via Electron
- **Testing**: Vitest (when needed)
- **TypeScript**: Relaxed strict mode (practical balance)

---

## Data Model

### Markdown File Structure

```markdown
# Architecture Overview

High-level system architecture showing major components and their relationships.

---

## Components

- API Gateway
- Authentication Service
- Database Layer
- Cache Layer

## Deployment

Current deployment uses Docker containers on AWS ECS...
```

**Parsing Rules**:
- **Title**: First `#` heading
- **Description**: 
  - If `---` separator exists: all content between title and separator
  - If no separator: first paragraph after title
- **Body**: Everything after first `---` (or entire content after first paragraph if no separator)

### Board JSON Structure

**Entry Point**: `myboard.board.json` (root board for the entire project)
**Associated Document**: `myboard.md` (displayed in left panel at root level)

**File naming for sub-boards**: `{document-name}.board.json`

```json
{
  "version": "1.0",
  "projectName": "My Product Design",
  "rootMarkdown": "myboard.md",  // The markdown document for this board
  "defaultCardWidth": 300,
  "defaultCardHeight": 200,
  "cards": [
    {
      "id": "card-uuid-001",
      "markdownPath": "architecture/api-gateway.md",
      "x": 100,
      "y": 50,
      "width": 300,
      "height": 220,  // Auto-calculated based on content
      "connections": [
        {
          "targetId": "card-uuid-002",
          "type": "to" // "to", "from", "bidirectional" (visual only)
        }
      ]
    },
    {
      "id": "card-uuid-002",
      "markdownPath": "architecture/auth-service.md",
      "x": 450,
      "y": 150,
      "width": 300,
      "height": 200
    }
  ]
}
```

**Extended Properties** (can be added to any board JSON):
- `projectName`: Display name for the board
- `rootMarkdown`: The markdown document associated with this board level
- `theme`: Custom color scheme
- `defaultCardWidth`, `defaultCardHeight`: Default dimensions for new cards

**Relationship**: 
- `myboard.board.json` ↔ `myboard.md` (root level)
- `architecture.board.json` ↔ `architecture.md` (nested level)
- Each board JSON represents the cards that appear when viewing its associated markdown document

---

## MobX Store Architecture

### Root Store

```javascript
class RootStore {
  documentStore: DocumentStore
  boardStore: BoardStore
  navigationStore: NavigationStore
}
```

### DocumentStore

**Responsibilities**:
- Load and parse markdown files
- Cache parsed documents
- Extract title, description, body

```javascript
class DocumentStore {
  @observable documents = new Map() // path -> ParsedDocument
  
  @action
  async loadDocument(path) {
    // Load markdown, parse into title/description/body
  }
}
```

### BoardStore

**Responsibilities**:
- Load and save board JSON files
- Manage card positions and connections
- CRUD operations on cards
- Handle document promotion when first child added
- Update all board references when paths change

```javascript
class BoardStore {
  @observable boards = new Map() // path -> Board
  
  @action
  async loadBoard(path) {
    // Load board.json for given document path
  }
  
  @action
  async createCard(parentDocPath, cardTitle) {
    // Check if parent needs promotion
    // If yes: promote document, update path
    // Create child markdown file
    // Add card to board JSON
  }
  
  @action
  updateCardPosition(boardPath, cardId, x, y) {}
  
  @action
  addConnection(boardPath, fromCardId, toCardId, type) {}
  
  @action
  async promoteDocumentToParent(docPath) {
    // Call DocumentPromotion service
    // Update local cache with new paths
  }
}
```

### NavigationStore

**Responsibilities**:
- Track current document path
- Manage navigation history (breadcrumb trail)
- Handle drill-down/drill-up navigation
- Determine slide animation direction
- Maintain view state stack for back navigation

```javascript
class NavigationStore {
  @observable currentDocumentPath = 'myboard.md'
  @observable breadcrumb = ['myboard.md']
  @observable slideDirection = 'none' | 'left' | 'right'
  @observable isAnimating = false
  
  // Stack of view states for back navigation
  @observable navigationStack = [
    { documentPath: 'myboard.md', boardPath: 'myboard.board.json', scrollPosition: 0 }
  ]
  
  @action
  navigateToCard(cardId) {
    // Find markdown path for card
    // Push current state to stack
    // Update current document
    // Set slideDirection = 'left' (forward)
    // Trigger animation
  }
  
  @action
  navigateUp(targetLevel) {
    // Pop states from stack to target level
    // Update current document
    // Set slideDirection = 'right' (backward)
    // Trigger animation
  }
  
  @action
  completeAnimation() {
    // Called when CSS transition ends
    this.isAnimating = false
    this.slideDirection = 'none'
  }
}
```

---

## Card Creation Flow (Detailed)

This is a critical UX interaction that needs careful design:

### User Action Sequence

1. **User clicks "Create Card" button** (or keyboard shortcut)
   
2. **Modal/Dialog appears** with:
   - Input field: "Card Title"
   - Optional: "Card Color" picker
   - Buttons: "Create" / "Cancel"

3. **User enters title** (e.g., "API Gateway")
   - Real-time validation: no special chars that break filenames
   - Show preview of markdown filename (e.g., `api-gateway.md`)

4. **User clicks "Create"**
   
5. **System actions** (synchronous):
   - **Check if parent document needs promotion**:
     - Does parent's `.board.json` exist?
     - If NO → promotion needed
   - **If promotion needed**:
     - Create folder `{parent-name}/` in parent's directory
     - Move parent `.md` file into new folder
     - Create parent's `.board.json` in new folder
     - Update ALL board JSON files that reference old parent path
     - Update NavigationStore with new path
     - Show notification: "Promoted {parent} to parent folder"
   - Generate child markdown filename from title using slugify (kebab-case)
     - "API Gateway Strategy" → `api-gateway-strategy.md`
   - Handle filename collision (append `-2`, `-3` if exists)
   - Create child markdown file in parent's folder
   - Write initial content with separator:
     ```markdown
     # API Gateway
     
     ---
     
     [cursor positioned here for body content]
     ```
   - Calculate position: center of current viewport
   - Add card to parent's board JSON at calculated position (default size: 300x200)
   - Save board JSON (debounced)

6. **UI updates**:
   - New card appears on board canvas at center of viewport
   - Card shows title "API Gateway"
   - Description area is empty
   - **Left panel switches to Edit mode** (Milkdown WYSIWYG editor)
   - Editor loads `api-gateway.md` content
   - Cursor auto-focuses at description line (line 3)

7. **User types description**
   - Live update to markdown file (debounced 1s)
   - Card description updates in real-time when user navigates away

8. **User exits edit mode** (Esc, Cmd+E, or clicks "Done")
   - Left panel returns to Read mode
   - Card on board now displays with title + description

### Alternative Flow: Quick Create

- Right-click on canvas → "New Card Here"
- Card created at click position instead of viewport center
- Same modal and flow as above

### Technical Considerations

- **Filename Collision**: If `api-gateway.md` exists, append number: `api-gateway-2.md`
- **Undo**: First action should be undoable (remove card + delete file + rollback promotion)
- **Auto-save**: Description changes saved on blur or with debounce (1s)
- **Document Promotion**:
  - Atomic operation: all steps succeed or all rollback
  - Lock file system during promotion to prevent concurrent edits
  - Update ALL board JSONs, not just immediate parent
  - Root document (`myboard.md`) never gets promoted
  - Show clear user notification when promotion happens
  - Handle rollback if promotion fails partway through
- **Card Height Calculation**:
  - Use CSS `line-clamp: 4` or JavaScript measurement
  - Calculate height based on: title height + description (max 4 lines) + padding
  - Store calculated height in board JSON
  - Recalculate on description update
  - Show expand button when `scrollHeight > clientHeight`
- **Slide Animation Performance**:
  - Use `transform: translateX()` instead of `left/right` for GPU acceleration
  - Use `will-change: transform` for smoother animations
  - Debounce rapid navigation to prevent animation stacking

---

## WYSIWYG Markdown Editor Selection

A critical component of the system is the markdown editor with undo/redo support. Here are the top options:

### Recommended Option: **Milkdown**
- Modern WYSIWYG markdown editor built on ProseMirror
- **Built-in undo/redo** via ProseMirror history plugin
- Plugin architecture for customization
- Excellent React integration
- Active development, good documentation
- Supports CommonMark and GFM

**Pros**:
- ProseMirror's history management is industry-standard
- No need for mobx-keystone for editor undo/redo
- Clean separation between editor state and app state
- Lightweight and performant

**Installation**:
```bash
npm install @milkdown/core @milkdown/react @milkdown/preset-commonmark @milkdown/plugin-history
```

### Alternative Option: **Lexical** (Meta/Facebook)
- Modern framework-agnostic editor
- Built-in undo/redo via history plugin
- Used in production at Meta
- React bindings available

**Pros**: Very performant, highly customizable
**Cons**: More complex setup, markdown isn't the primary format

### Alternative Option: **TipTap**
- Built on ProseMirror (like Milkdown)
- Built-in undo/redo
- Vue-focused but has React support
- Very popular and well-maintained

**Cons**: Markdown support via extension, not native

### Alternative Option: **CodeMirror 6**
- Code editor with markdown support
- Built-in undo/redo
- Less WYSIWYG, more code-like

**Cons**: Not true WYSIWYG, more for developers than content creators

### Recommendation

**Start with Milkdown** because:
1. Designed specifically for markdown WYSIWYG editing
2. Built-in undo/redo eliminates need for mobx-keystone initially
3. ProseMirror foundation is battle-tested
4. Clean React integration
5. Can maintain separation: editor handles its own history, MobX handles app state

**Migration Path**: If we later need document-level undo (e.g., undo card moves, board changes), then consider mobx-keystone for app state, while keeping Milkdown's editor history independent.

**Undo/Redo Integration**: Milkdown is built on ProseMirror, which has a flexible history plugin that can be integrated with external state management systems. If we add mobx-keystone for global undo/redo later, we can potentially:
- Hook into ProseMirror's transaction system
- Synchronize editor history with app-level history
- Create a unified undo/redo experience across both editor and board operations

For now, keeping them separate (Milkdown handles its own undo/redo) is simpler and sufficient.

---

## Component Architecture

### App Layout

```
<AppLayout>
  <NavigationStack>
    <NavigationView>
      <Breadcrumb />
      <SplitView>
        <DocumentPanel />
        <BoardPanel />
      </SplitView>
    </NavigationView>
  </NavigationStack>
  <QuickView />  {/* Modal overlay */}
</AppLayout>
```

**Layout Structure**:
- `<NavigationStack>`: Handles slide animations between views
- `<NavigationView>`: Individual view state (slides in/out)
- `<SplitView>`: Resizable split between document and board
- `<QuickView>`: Modal overlay (rendered via portal)

### Key Components

#### `<DocumentPanel />`

**Modes**:
- **Read Mode**: Displays rendered markdown as HTML
- **Edit Mode**: Shows WYSIWYG markdown editor (Milkdown)

**Behavior**:
- Default: Read mode when navigating to a document via card click
- Switches to Edit mode when clicking a card that was just created
- Toggle between modes via button or keyboard shortcut
- Uses `observer` to react to `navigationStore.currentDocumentPath`

**Read Mode**:
- Renders markdown to HTML using `marked` or `remark`
- Syntax highlighting for code blocks (via `prism` or `highlight.js`)
- Click to enter Edit mode

**Edit Mode**:
- Milkdown WYSIWYG editor
- Built-in undo/redo (Cmd+Z / Cmd+Shift+Z)
- Auto-save changes to markdown file (debounced 1s)
- Ctrl+E or "Done" button to return to Read mode

**Local State** (via `localObservable`):
- `mode`: 'read' | 'edit'
- `isLoading`: boolean
- Scroll position (preserved when switching modes)

#### `<BoardPanel />`

- Renders cards for current document's board
- Handles card drag and drop
- Renders connection lines (SVG)
- "Create Card" button

**Local State**:
- Currently selected card(s)
- Drag state (isDragging, dragOffset)
- Temporary connection being drawn

#### `<Card />`

**Dimensions**:
- Width: 300px (fixed)
- Height: Auto-calculated based on description length
  - Min height: 200px
  - Max visible lines for description: 4 lines
  - If description exceeds 4 lines, card shows first 4 lines + expand button

**Display**:
- Title (truncated if too long)
- Description (up to 4 lines)
- Expand button (if description > 4 lines)
- Drag handle or drag-anywhere to reposition

**Interactions**:
- **Drag**: Reposition card on canvas
- **Expand button**: Opens Quick View modal
- **Click card (non-button area)**: Focus/select card (for connections)
- **Double-click**: Open/drill down (same as Quick View "Open" button)

**Props**:
- `cardData`: { id, markdownPath, x, y, width, height }
- `onNavigate`: callback for drill-down
- `onExpand`: callback for Quick View
- `onDragEnd`: callback for position update

**Local State**:
- `isHovered`: boolean
- `isDragging`: boolean
- `descriptionOverflow`: boolean (calculated on mount/content change)

#### `<ConnectionLine />`

- SVG line connecting two cards
- Arrow indicator for direction
- Click to edit connection type

#### `<Breadcrumb />`

- Shows navigation path from root to current document
- Click any level to navigate back to that parent
- Updates on navigation with slide animation

#### `<QuickView />`

**Purpose**: Modal overlay for quickly viewing full document without navigating

**Display**:
- Large card-style container (e.g., 800px × 90vh, centered)
- Full document content rendered as HTML (scrollable)
- Dark backdrop behind (rgba(0,0,0,0.7))
- Title at top
- Full markdown content below
- Action buttons at bottom:
  - "Open" button - Drill down to document (triggers navigation)
  - "Close" button or ESC/click backdrop to dismiss

**Behavior**:
- Appears on card expand button click
- Scrollable content area
- Click backdrop or press ESC to close
- "Open" button triggers drill-down navigation with slide animation
- Smooth fade-in/scale-in animation (300ms)

**Props**:
- `markdownPath`: string
- `onClose`: callback
- `onNavigate`: callback for drill-down

**Local State**:
- `isLoading`: boolean
- `scrollPosition`: number
- `documentContent`: string (loaded markdown)

---

## Navigation Animation System

### Sliding View Transitions

The app uses iOS-style slide transitions when navigating between levels:

**Architecture**:
```
<AppLayout>
  <NavigationStack>  {/* Container that handles slide animations */}
    <NavigationView key={currentPath} direction={slideDirection}>
      <Breadcrumb />
      <SplitView>
        <DocumentPanel />
        <BoardPanel />
      </SplitView>
    </NavigationView>
  </NavigationStack>
  <QuickView />  {/* Portal/modal, rendered outside navigation */}
</AppLayout>
```

**Animation Details**:
- **Drill Down** (forward navigation):
  - Current view slides out to the left: `translateX(-100%)`
  - New view slides in from the right: `translateX(100%)` → `translateX(0)`
- **Navigate Back** (breadcrumb click):
  - Current view slides out to the right: `translateX(100%)`
  - Previous view slides in from the left: `translateX(-100%)` → `translateX(0)`
- **Timing**: 300ms ease-out transition
- **Z-index**: Forward view on top during drill-down, backward view on top during back navigation

**Implementation Approach**:
- Use CSS transforms for performance (GPU-accelerated)
- Maintain navigation history stack in NavigationStore
- Each view state includes: documentPath, boardPath, scroll position
- Views can be preloaded for smoother transitions

**CSS Example**:
```css
.navigation-view {
  transition: transform 300ms ease-out;
  will-change: transform;
}

.navigation-view.slide-out-left {
  transform: translateX(-100%);
}

.navigation-view.slide-in-from-right {
  transform: translateX(100%);
}

.navigation-view.slide-out-right {
  transform: translateX(100%);
}

.navigation-view.slide-in-from-left {
  transform: translateX(-100%);
}

.navigation-view.active {
  transform: translateX(0);
}
```

**React Implementation Pattern**:
```jsx
const NavigationView = observer(({ children, isActive, direction }) => {
  const getClassName = () => {
    if (isActive) return 'navigation-view active';
    if (direction === 'forward') return 'navigation-view slide-out-left';
    if (direction === 'back') return 'navigation-view slide-out-right';
    return 'navigation-view';
  };
  
  return <div className={getClassName()}>{children}</div>;
});
```

---

## Electron & File System Integration

### Project Structure on Disk

```
my-product-design/
├── myboard.board.json          # Root board (entry point, never moves)
├── myboard.md                  # Root document (never moves)
└── architecture/
    ├── architecture.md         # Parent document (moved here when first child added)
    ├── architecture.board.json
    ├── database.md             # Leaf document (no children yet)
    └── api-gateway/            # Nested folder (api-gateway promoted when got children)
        ├── api-gateway.md
        ├── api-gateway.board.json
        ├── load-balancer.md
        └── auth/               # Deep nesting possible
            ├── auth.md
            └── auth.board.json
```

**Folder Structure Rules**:
1. **Root is special**: `myboard.board.json` and `myboard.md` always stay at project root
2. **Auto-promotion**: When adding first child to a document, the app automatically:
   - Creates folder named `{document-name}/`
   - Moves `{document-name}.md` into that folder
   - Creates `{document-name}.board.json` in that folder
   - Updates all board JSON references to new path
3. **True nesting**: This promotion rule applies recursively at any depth
4. **Leaf documents**: Documents without children remain in parent's folder (no promotion)
5. **Relative paths**: All paths in board JSON are relative to project root

**Example Evolution**:
```
# Initially
├── myboard.board.json
├── myboard.md
└── architecture.md        # No children yet

# After adding first child to architecture
├── myboard.board.json
├── myboard.md
└── architecture/
    ├── architecture.md    # MOVED here automatically
    ├── architecture.board.json
    └── api-gateway.md     # First child created here

# After adding first child to api-gateway  
└── architecture/
    ├── architecture.md
    ├── architecture.board.json
    └── api-gateway/
        ├── api-gateway.md # MOVED here automatically
        ├── api-gateway.board.json
        └── load-balancer.md
```

**Key Points**:
- User manages version control externally (git, svn, etc.)
- Promotion is automatic and atomic (all or nothing)
- All board JSON files updated when paths change

### Electron Main Process Responsibilities

- **File Operations**: Read/write markdown and JSON files
- **File Watching**: Watch for external changes to files (optional feature)
- **IPC**: Communicate with renderer process

### Electron IPC Channels

```javascript
// Main → Renderer
'file:loaded' - File content loaded
'file:changed' - External file change detected (optional)

// Renderer → Main
'file:read' - Request file read
'file:write' - Request file write
'file:watch' - Start watching file (optional)
'project:open' - Open myboard.board.json
'document:promote' - Promote document to parent folder
```

---

## Document Promotion System

### Overview

When a user creates the first child card for a document, the system automatically "promotes" that document to be a parent by:
1. Creating a folder for the document
2. Moving the document into that folder
3. Creating its board JSON
4. Updating all references across all board files

### The Promotion Algorithm

```javascript
class DocumentPromotion {
  /**
   * Promotes a document to parent status by creating folder and moving file
   * @param {string} documentPath - Relative path from project root (e.g., "architecture.md")
   * @returns {Object} { newPath, boardPath }
   */
  async promoteToParent(documentPath) {
    // 1. Skip if root document
    if (documentPath === 'myboard.md') {
      throw new Error('Cannot promote root document');
    }
    
    // 2. Parse paths
    const { dir, name } = path.parse(documentPath);
    const folderPath = path.join(dir, name);
    const newDocPath = path.join(folderPath, `${name}.md`);
    const boardPath = path.join(folderPath, `${name}.board.json`);
    
    // 3. Validate folder doesn't exist
    if (await fs.exists(folderPath)) {
      throw new Error(`Folder ${folderPath} already exists`);
    }
    
    // 4. Execute atomic operation
    try {
      // Create folder
      await fs.mkdir(folderPath, { recursive: true });
      
      // Move document
      await fs.rename(
        path.join(projectRoot, documentPath),
        path.join(projectRoot, newDocPath)
      );
      
      // Create board JSON
      await fs.writeJSON(path.join(projectRoot, boardPath), {
        version: '1.0',
        cards: []
      });
      
      // Update all references
      await this.updateAllReferences(documentPath, newDocPath);
      
      return { newPath: newDocPath, boardPath };
      
    } catch (error) {
      // Rollback on any failure
      await this.rollback(folderPath, documentPath, newDocPath);
      throw error;
    }
  }
  
  /**
   * Updates all board JSON files that reference the old path
   */
  async updateAllReferences(oldPath, newPath) {
    const boardFiles = await this.findAllBoardFiles(projectRoot);
    let updatedCount = 0;
    
    for (const boardFile of boardFiles) {
      const board = await fs.readJSON(boardFile);
      let modified = false;
      
      // Update card references
      if (board.cards) {
        for (const card of board.cards) {
          if (card.markdownPath === oldPath) {
            card.markdownPath = newPath;
            modified = true;
          }
        }
      }
      
      if (modified) {
        await fs.writeJSON(boardFile, board, { spaces: 2 });
        updatedCount++;
      }
    }
    
    return updatedCount;
  }
  
  /**
   * Recursively finds all .board.json files
   */
  async findAllBoardFiles(directory) {
    const files = [];
    const items = await fs.readdir(directory, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        // Recurse into subdirectories
        files.push(...await this.findAllBoardFiles(fullPath));
      } else if (item.name.endsWith('.board.json')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  /**
   * Rollback changes if promotion fails
   */
  async rollback(folderPath, oldPath, newPath) {
    try {
      // Move document back if it was moved
      if (await fs.exists(path.join(projectRoot, newPath))) {
        await fs.rename(
          path.join(projectRoot, newPath),
          path.join(projectRoot, oldPath)
        );
      }
      
      // Remove folder if it was created
      if (await fs.exists(path.join(projectRoot, folderPath))) {
        await fs.rmdir(path.join(projectRoot, folderPath), { recursive: true });
      }
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
      // Log for manual recovery
    }
  }
}
```

### When Promotion Happens

**Trigger**: User creates first child card for a document

**Card Creation Flow**:
```javascript
async createCard(parentDocumentPath, cardTitle) {
  // 1. Check if parent document needs promotion
  const parentBoardPath = parentDocumentPath.replace('.md', '.board.json');
  const needsPromotion = !await fs.exists(parentBoardPath);
  
  if (needsPromotion) {
    // 2. Promote parent document first
    const { newPath, boardPath } = await documentPromotion.promoteToParent(parentDocumentPath);
    parentDocumentPath = newPath; // Update to new path
  }
  
  // 3. Create child markdown file
  const childFilename = slugify(cardTitle) + '.md';
  const parentDir = path.dirname(parentDocumentPath);
  const childPath = path.join(parentDir, childFilename);
  
  await fs.writeFile(childPath, `# ${cardTitle}\n\n---\n\n`);
  
  // 4. Add card to parent's board
  const board = await fs.readJSON(boardPath);
  board.cards.push({
    id: uuid(),
    markdownPath: childPath,
    x: viewportCenterX,
    y: viewportCenterY,
    width: 300,
    height: 200
  });
  await fs.writeJSON(boardPath, board);
  
  return { childPath, cardId: board.cards[board.cards.length - 1].id };
}
```

### Edge Cases & Safeguards

1. **Root Document**: `myboard.md` never gets promoted (always stays at root)
2. **Folder Exists**: If folder already exists, throw error (manual intervention required)
3. **Atomic Operation**: If any step fails, rollback all changes
4. **Reference Updates**: Scan ALL board files, not just parent
5. **Deep Nesting**: Algorithm works recursively at any depth
6. **Concurrent Edits**: Lock file system during promotion

### User Notifications

```javascript
// Show toast notification after successful promotion
notify({
  type: 'info',
  message: `Promoted "${documentName}" to parent folder`,
  details: `Updated ${updatedCount} board references`
});
```

---

## Feature Roadmap

### Phase 1: MVP Core

- [ ] Load root markdown document
- [ ] Parse markdown (title, description, body)
- [ ] Display document in left panel
- [ ] Display empty board in right panel
- [ ] Create new card (links to new markdown file)
- [ ] **Document promotion system**:
  - [ ] Auto-create folder when adding first child
  - [ ] Move parent document into folder
  - [ ] Create parent's board JSON
  - [ ] Update all board JSON references
  - [ ] Atomic operation with rollback
- [ ] Card with auto-height based on description (max 4 lines)
- [ ] Show expand button on cards with overflow
- [ ] Drag card to reposition
- [ ] Save board JSON (debounced 1s)
- [ ] Click card to navigate (drill down)
- [ ] iOS-style slide animations for navigation

### Phase 2: Quick View & Enhanced Navigation

- [ ] Quick View modal on card expand button
- [ ] Scrollable full document in Quick View
- [ ] "Open" button in Quick View to drill down
- [ ] Breadcrumb navigation with animation
- [ ] Navigate up (back to parent) with right slide
- [ ] Smooth transitions between views
- [ ] History stack management

### Phase 3: Connections & Board Editing

- [ ] Draw connections between cards
- [ ] Connection types (to/from/bidirectional)
- [ ] Delete cards (with confirmation)
- [ ] Delete connections
- [ ] Multi-select cards (stretch goal)

### Phase 4: Markdown Editing

- [ ] Milkdown WYSIWYG editor integration
- [ ] Edit mode toggle
- [ ] Auto-save markdown changes (debounced 1s)
- [ ] Undo/redo in editor
- [ ] Card description live updates

### Phase 5: Polish & Advanced Features

- [ ] Canvas zoom and pan
- [ ] Search across all documents
- [ ] Export to static HTML site
- [ ] Settings/preferences panel
- [ ] Connection routing (avoid card overlaps)
- [ ] Card color/styling options
- [ ] File watching for external changes (optional)
- [ ] Future keyboard shortcuts (Cmd+N, Cmd+E, etc.)

---

## Open Questions & Decisions Needed

### ✅ Resolved Decisions

1. **Entry Point**: `myboard.board.json` - root board with extended properties
   - Associated markdown: `myboard.md` (created automatically)
2. **Platform**: Electron desktop app
3. **File Management**: User manages files however they want (git, svn, manual backups, etc.)
   - App just creates/edits markdown and JSON files
   - No built-in version control
4. **No Separator Handling**: First paragraph after title becomes description
5. **Connection Types**: Visual only (no semantic meaning)
6. **Card Creation Flow**: 
   - Prompt for title
   - Create markdown file with title as filename (slugified, kebab-case)
   - Create card on board at center of viewport
   - Left panel switches to WYSIWYG markdown editor with cursor in description
7. **Filename Convention**: Lowercase with dashes (kebab-case)
   - "API Gateway Strategy" → `api-gateway-strategy.md`
   - Collision handling: Auto-append number (`-2`, `-3`, etc.)
8. **Board Persistence**: Auto-save with 1-second debounce
9. **Markdown Editor**: WYSIWYG editor in left panel (replaces document view when editing)
   - Using Milkdown - built-in undo/redo support (ProseMirror-based)
   - ProseMirror history can integrate with global undo/redo later if needed
   - May add mobx-keystone for app-level undo later
10. **Card Dimensions**:
    - Fixed width: 300px
    - Auto-height based on description length (up to 4 lines max visible)
    - If description exceeds 4 lines, show "expand" button
    - No resize handles in MVP
11. **Card Interactions**:
    - **Single-click card**: Opens Quick View modal
    - **Double-click card**: Drills down (navigation with slide animation)
    - **Expand button**: Opens Quick View (same as single-click)
12. **Quick View Modal**:
    - Opens on single-click or expand button
    - Full-size overlay with complete document content (scrollable)
    - Rest of UI darkens (modal backdrop)
    - "Open" button to drill down (triggers navigation)
    - ESC or backdrop click to close
13. **Navigation Animation**: iOS-style slide transitions
    - Drill down (double-click or Quick View "Open"): entire view slides LEFT
    - Go back (breadcrumb): entire view slides RIGHT
    - Smooth, native-feeling transitions (300ms ease-out)
    - Whole split-view animates together
14. **Default Markdown Template**: Include `---` separator by default
    ```markdown
    # {Title}
    
    ---
    
    [cursor positioned here for body content]
    ```
15. **Keyboard Shortcuts**: ESC only for MVP
    - ESC closes Quick View modal
    - ESC exits edit mode back to read mode
16. **Folder Structure**: Auto-promotion with true nesting
    - Documents without children stay in parent folder (flat)
    - Adding first child triggers automatic folder creation
    - Parent document moves into new folder
    - All board JSON references updated automatically
    - True nesting: promotion applies recursively at any depth
    - Root (`myboard.md`) never moves
17. **Bundler**: Vite (fast dev experience)
18. **Visual Design**:
    - Aesthetic: Notion-like, clean and minimal
    - Background: Soft, light tan (inspired by Claude web interface)
    - Typography: Sans-serif fonts
19. **Empty Board State**: Show a "Create Card" button centered in the canvas
20. **Canvas Bounds**: 4000×4000px with scrollbars to indicate position
21. **Title Extraction Fallback**: If no `#` heading exists:
    - First line becomes the title
    - Second line becomes the description
22. **Testing Framework**: Vitest (when testing is added)
23. **TypeScript Config**: Relaxed strict mode (practical, not overly permissive)

### File System & Persistence

1. **File watching conflicts**: How to handle when markdown file is edited externally while board is open?
   - Prompt to reload?
   - Auto-merge changes?
   - Show diff?
   - Or just let the user handle it manually?

### Markdown Parsing

2. **Markdown renderer for read-only view**: 
   - Use `marked` + `marked-react` for rendering?
   - Support GitHub Flavored Markdown (GFM)?
   - Syntax highlighting for code blocks?

3. ~~**Title extraction edge cases**~~: ✅ Resolved (see #21 above)
   - ~~What if markdown has no `#` heading?~~ → Use first line as title, second line as description
   - Multiple `#` headings? (first one only?)

### Board Behavior

4. **Connection routing**: 
   - Straight lines only?
   - Should lines avoid overlapping cards?

5. **Multi-select**: Should users be able to select multiple cards for bulk operations?

6. ~~**Canvas bounds**~~: ✅ Resolved - 4000×4000px with scrollbars (see #20)

7. **Card Interactions**:
   - Should there be a visual "selected" state for cards?
   - Click-and-drag to create connections between cards?

### Card Creation Details

8. **Default markdown template structure**:
   - Any boilerplate sections besides title and separator?
   - Template customization per project?

### UX Details

9. ~~**Empty state**~~: ✅ Resolved - "Create Card" button centered in canvas (see #19)

10. **Keyboard shortcuts for later**: Future shortcuts to plan for?
    - `Cmd+N` for new card?
    - `Cmd+E` to toggle edit mode?
    - Arrow keys for canvas navigation?

11. **Edit mode transitions**:
    - How to exit WYSIWYG editor back to read-only view?
    - ESC (✅ decided), click elsewhere, or explicit "Done" button?

### Performance

12. **Large boards**: Strategy for boards with 50+ cards?
    - Virtualization?
    - Performance limits?

13. **Document loading**: Load all documents upfront or on-demand?

---

## Technical Considerations

### Linaria Setup

- Configure bundler (Webpack/Vite) for Linaria
- Set up Linaria theme if needed
- Use `styled` HOC or `css` prop for styling

### MobX Configuration

- Enable `useStrict` for enforcing actions
- Configure `observer` batching for React
- Set up dev tools integration

### Testing Strategy

- Unit tests for stores (parsing, state management)
- Integration tests for navigation flow
- Visual regression tests for board layout?

---

## Electron App Structure

### Directory Layout

```
/
├── electron/
│   ├── main.js              # Electron main process
│   └── preload.js           # Preload script for IPC
├── src/
│   ├── stores/              # MobX stores
│   ├── components/          # React components
│   ├── utils/               # Utilities (markdown parser, etc.)
│   └── index.tsx            # React app entry
├── package.json
└── electron-builder.json    # Build configuration
```

### Key Dependencies

**Production**:
- `electron`
- `react`, `react-dom`
- `mobx`, `mobx-react-lite`
- `@linaria/core`, `@linaria/react`
- `@milkdown/core`, `@milkdown/react`, `@milkdown/preset-commonmark`, `@milkdown/plugin-history` (WYSIWYG editor)
- `marked` or `remark` (markdown parsing and rendering in read mode)
- `prismjs` or `highlight.js` (syntax highlighting)
- `uuid` (card ID generation)
- `slugify` (generate filenames from titles)
- `framer-motion` (optional - for advanced animations, can use CSS transforms initially)

**Development**:
- `@linaria/vite` (CSS extraction)
- `electron-builder` (app packaging)
- `vite` + `vite-plugin-electron` (bundler)
- `typescript`, `@types/react`, `@types/node`
- `vitest` (testing, when needed)

**Animation Strategy**:
- Start with CSS transforms and transitions for slide animations (performant)
- Consider adding `framer-motion` later for more complex animations or gestures
- Keep it simple initially: pure CSS for MVP

### IPC Security

Use `contextBridge` in preload script to safely expose APIs:

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path) => ipcRenderer.invoke('file:read', path),
  writeFile: (path, content) => ipcRenderer.invoke('file:write', path, content),
  onFileChanged: (callback) => ipcRenderer.on('file:changed', callback)
});
```

---

## Next Steps

### Immediate Actions

1. **Finalize remaining open questions** (see above)
2. **Set up project structure**:
   - Initialize Electron + React + TypeScript project
   - Configure Linaria with bundler
   - Set up MobX with React
3. **Create project scaffolding**:
   - Electron main process boilerplate
   - React app shell with split-view layout
   - Basic IPC channels

### Phase 1: Core File Operations (Week 1-2)

- [ ] Implement markdown parser (title/description/body extraction)
- [ ] Create DocumentStore (load, parse, cache documents)
- [ ] Create BoardStore (load/save board JSON)
- [ ] **Implement document promotion system**:
  - [ ] Detection: check if parent needs promotion
  - [ ] Folder creation and file moving
  - [ ] Reference updating across all board JSONs
  - [ ] Atomic operation with rollback
  - [ ] Root document exception handling
- [ ] Electron file system integration
- [ ] Open project dialog (select `myboard.board.json`)
- [ ] Display root board metadata or root document

### Phase 2: Basic Board UI (Week 2-3)

- [ ] Implement `<BoardPanel>` with card rendering
- [ ] Card component with title + description display
- [ ] Basic drag-and-drop for card repositioning
- [ ] Save board state on changes
- [ ] Simple SVG connection lines (straight)
- [ ] "Create Card" dialog with title input
- [ ] Markdown file creation on card creation

### Phase 3: Navigation & Document Display (Week 3-4)

- [ ] `<DocumentPanel>` with markdown rendering
- [ ] NavigationStore with breadcrumb trail
- [ ] Click card → navigate to its document
- [ ] Load child board for navigated document
- [ ] Breadcrumb component with back navigation
- [ ] Handle documents with no child board (empty right panel)

### Phase 4: Editing & Refinement (Week 4-5)

- [ ] Inline or modal markdown editor
- [ ] Live description updates on card
- [ ] Connection creation UI (click + drag between cards)
- [ ] Connection type selection (to/from/bidirectional)
- [ ] Delete card (+ confirm dialog)
- [ ] Delete connection

### Phase 5: Polish & Advanced Features (Week 5+)

- [ ] Keyboard shortcuts
- [ ] Undo/redo for board operations
- [ ] Card resize handles
- [ ] Canvas zoom and pan
- [ ] Search across all documents
- [ ] Export to static HTML site
- [ ] Settings/preferences panel
- [ ] File watching for external changes (optional)
