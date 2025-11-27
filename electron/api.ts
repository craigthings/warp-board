/**
 * MainAPI - The API exposed from main process to renderer
 * 
 * This class contains all methods that the renderer can call.
 * Using Comlink, these methods can be called as if they were local.
 */

import { dialog, type BrowserWindow } from 'electron'
import { dirname, join } from 'path'
import { readFile, writeFile, mkdir, rename, readdir, stat, access } from 'fs/promises'

// Result types for file operations
export interface FileResult {
  success: boolean
  error?: string
}

export interface ReadResult extends FileResult {
  content?: string
}

export interface ReadDirResult extends FileResult {
  items?: Array<{
    name: string
    isDirectory: boolean
    isFile: boolean
  }>
}

export interface StatResult extends FileResult {
  stats?: {
    isDirectory: boolean
    isFile: boolean
    size: number
    mtime: string
  }
}

/**
 * The main API class exposed to the renderer process via Comlink
 */
export class MainAPI {
  constructor(private getWindow: () => BrowserWindow | null) {}

  // ============ Project Operations ============

  /**
   * Open a file dialog to select a .board.json project file
   */
  async openProject(): Promise<string | null> {
    const win = this.getWindow()
    if (!win) return null

    const result = await dialog.showOpenDialog(win, {
      title: 'Open Warp Board Project',
      filters: [{ name: 'Board Files', extensions: ['board.json'] }],
      properties: ['openFile'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  }

  /**
   * Create a new project with the given name
   */
  async createProject(projectName: string): Promise<string | null> {
    const win = this.getWindow()
    if (!win) return null

    const result = await dialog.showSaveDialog(win, {
      title: 'Create New Warp Board Project',
      defaultPath: `${projectName.toLowerCase().replace(/\s+/g, '-')}.board.json`,
      filters: [{ name: 'Board Files', extensions: ['board.json'] }],
    })

    if (result.canceled || !result.filePath) {
      return null
    }

    const boardPath = result.filePath
    // Ensure it ends with .board.json
    const finalBoardPath = boardPath.endsWith('.board.json')
      ? boardPath
      : boardPath.replace(/\.json$/, '.board.json').replace(/([^.]+)$/, '$1.board.json')

    // Derive the markdown filename from the board filename
    const boardFilename = finalBoardPath.split(/[/\\]/).pop() || 'myboard.board.json'
    const mdFilename = boardFilename.replace('.board.json', '.md')
    const boardDir = dirname(finalBoardPath)
    const mdPath = join(boardDir, mdFilename)

    // Create the board JSON
    const boardContent = {
      version: '1.0',
      projectName: projectName,
      rootMarkdown: mdFilename,
      defaultCardWidth: 300,
      defaultCardHeight: 200,
      cards: [],
    }

    // Create the root markdown file
    const mdContent = `# ${projectName}

Welcome to your new Warp Board project!

---

Start adding cards to build your spatial documentation.
`

    // Write both files
    await writeFile(finalBoardPath, JSON.stringify(boardContent, null, 2), 'utf-8')
    await writeFile(mdPath, mdContent, 'utf-8')
    return finalBoardPath
  }

  // ============ File Operations ============

  /**
   * Read file contents
   */
  async readFile(filePath: string): Promise<ReadResult> {
    try {
      const content = await readFile(filePath, 'utf-8')
      return { success: true, content }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Write content to a file
   */
  async writeFile(filePath: string, content: string): Promise<FileResult> {
    try {
      await writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Check if a file or directory exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Create a directory (recursively)
   */
  async mkdir(dirPath: string): Promise<FileResult> {
    try {
      await mkdir(dirPath, { recursive: true })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Rename or move a file
   */
  async rename(oldPath: string, newPath: string): Promise<FileResult> {
    try {
      await rename(oldPath, newPath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * List directory contents
   */
  async readdir(dirPath: string): Promise<ReadDirResult> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true })
      const items = entries.map((entry) => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
      }))
      return { success: true, items }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get file or directory stats
   */
  async stat(filePath: string): Promise<StatResult> {
    try {
      const stats = await stat(filePath)
      return {
        success: true,
        stats: {
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          size: stats.size,
          mtime: stats.mtime.toISOString(),
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

