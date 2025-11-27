# Warp Board

A spatial, hierarchical documentation system where each markdown document can have an associated board of child cards. Navigate by drilling down: click a card to see its full markdown content on the left, and its child cards on the right.

**Git-native**: All content lives in your repository as markdown + JSON files that can be committed and versioned.

## Features

- 📄 **Markdown-powered**: All content stored as plain markdown files
- 🎨 **Spatial canvas**: Arrange and connect cards visually
- 🔗 **Hierarchical navigation**: Drill down into nested documents
- 💾 **Git-native**: Everything is just files—commit, branch, and merge your docs
- ⚡ **Fast**: Built with Vite + Electron

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Creating a Project

1. Create a `myboard.board.json` file in your project root:

```json
{
  "version": "1.0",
  "projectName": "My Project",
  "rootMarkdown": "myboard.md",
  "defaultCardWidth": 300,
  "defaultCardHeight": 200,
  "cards": []
}
```

2. Create a `myboard.md` file for your root document:

```markdown
# My Project

Welcome to my documentation board!

---

Add more content here...
```

3. Open Warp Board and select your `myboard.board.json` file

## File Structure

```
my-project/
├── myboard.board.json     # Root board (entry point)
├── myboard.md             # Root document
└── topics/
    ├── topics.md          # Parent document
    ├── topics.board.json  # Board for topics
    └── subtopic.md        # Child document
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build
```

## IPC Architecture

Main and renderer communicate via [Comlink](https://github.com/GoogleChromeLabs/comlink) over Electron IPC. Both sides expose typed APIs that the other can call directly.

### Renderer → Main

```ts
import { mainAPI } from './api/mainAPI'

const result = await mainAPI.readFile('/path/to/file')
await mainAPI.writeFile('/path/to/file', content)
```

### Main → Renderer

```ts
import { getRendererAPI } from './main'

const rendererAPI = getRendererAPI()
await rendererAPI.showNotification('File saved!', 'success')
await rendererAPI.navigateToCard(cardId)
```

### Setup

The renderer must call `initRendererAPI()` at startup to expose its API to main:

```ts
import { initRendererAPI } from './api/rendererAPI'

initRendererAPI()
```

## Architecture Patterns

### Stores for Business Logic

All data fetching, caching, and business logic belongs in MobX stores, not components.

**Stores handle:**
- Loading and caching data (documents, boards)
- Data transformations and derived state
- Async operations (file I/O, API calls)
- Cross-cutting concerns (e.g., updating references when paths change)

**Components handle:**
- Rendering UI based on store state
- User interactions (clicks, drags, inputs)
- Local UI state only (hover, animation, form inputs)

```ts
// ✓ Good: Store handles loading
class BoardStore {
  async loadBoard(path: string) {
    const board = await api.readFile(path)
    this.boards.set(path, board)
    this.loadCardDocuments(board)  // Trigger related data loading
  }
}

// ✗ Bad: Component handles loading
const BoardPanel = observer(() => {
  useEffect(() => {
    board.cards.forEach(card => documentStore.loadDocument(card.path))
  }, [board])
})
```

### Store Structure

- **RootStore** - Owns all stores, provides project-level state
- **BoardStore** - Board data, card CRUD, connections
- **DocumentStore** - Markdown content, parsing, caching
- **NavigationStore** - Navigation stack, breadcrumbs, current view

## Tech Stack

- **Electron 39** - Desktop app framework
- **React 19** - UI framework
- **Vite 7** - Build tool
- **MobX** - State management
- **Emotion** - CSS-in-JS
- **Marked** - Markdown parsing
- **TypeScript** - Type safety

## License

MIT
