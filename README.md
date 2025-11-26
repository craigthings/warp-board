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

- Node.js 18+ 
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

## Tech Stack

- **Electron** - Desktop app framework
- **React** - UI framework
- **Vite** - Build tool
- **MobX** - State management
- **Linaria** - CSS-in-JS (zero runtime)
- **Marked** - Markdown parsing

## License

MIT
