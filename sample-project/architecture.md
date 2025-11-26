# Architecture

High-level overview of the system architecture and design decisions.

---

## Overview

The application follows a clean separation of concerns:

- **Main Process**: Electron's main process handles file system operations
- **Renderer Process**: React application for the UI
- **State Management**: MobX stores for reactive state

## Data Flow

```
User Action → MobX Store → File System → Store Update → UI Re-render
```

## Key Components

### DocumentStore
Manages loading and caching of markdown documents.

### BoardStore
Handles board state, card positions, and connections.

### NavigationStore
Tracks navigation history and breadcrumb trail.

## File Format

All data is stored in human-readable formats:
- Documents: Markdown (`.md`)
- Board layouts: JSON (`.board.json`)

