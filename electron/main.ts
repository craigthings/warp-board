import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { readFile, writeFile, mkdir, rename, readdir, stat, access } from 'fs/promises'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#F5F0E8', // Light tan background
  })

  // Load the app
  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// ============ IPC Handlers ============

// Open project dialog - select a .board.json file
ipcMain.handle('project:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Open Warp Board Project',
    filters: [{ name: 'Board Files', extensions: ['board.json'] }],
    properties: ['openFile'],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
})

// Read file contents
ipcMain.handle('file:read', async (_event, filePath: string) => {
  try {
    const content = await readFile(filePath, 'utf-8')
    return { success: true, content }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Write file contents
ipcMain.handle('file:write', async (_event, filePath: string, content: string) => {
  try {
    await writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Check if file/directory exists
ipcMain.handle('file:exists', async (_event, filePath: string) => {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
})

// Create directory
ipcMain.handle('file:mkdir', async (_event, dirPath: string) => {
  try {
    await mkdir(dirPath, { recursive: true })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Rename/move file
ipcMain.handle('file:rename', async (_event, oldPath: string, newPath: string) => {
  try {
    await rename(oldPath, newPath)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// List directory contents
ipcMain.handle('file:readdir', async (_event, dirPath: string) => {
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
})

// Get file stats
ipcMain.handle('file:stat', async (_event, filePath: string) => {
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
})

