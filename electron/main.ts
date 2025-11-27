import { app, BrowserWindow } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { expose, wrap, type Remote } from 'comlink'
import { ElectronEndpoint } from './comlink-endpoint'
import { MainAPI } from './api'
import type { RendererAPI } from '../src/api/rendererAPI'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow: BrowserWindow | null = null
let rendererAPI: Remote<RendererAPI> | null = null

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
    backgroundColor: '#F5F0E8',
  })

  // Expose MainAPI for renderer to call
  const mainAPI = new MainAPI(() => mainWindow)
  expose(mainAPI, new ElectronEndpoint(mainWindow, 'main'))

  // Wrap RendererAPI to call from main
  rendererAPI = wrap<RendererAPI>(new ElectronEndpoint(mainWindow, 'renderer'))

  // Load the app
  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    rendererAPI = null
  })
}

/**
 * Get the renderer API proxy
 * Use this to call methods on the renderer from main
 */
export function getRendererAPI(): Remote<RendererAPI> | null {
  return rendererAPI
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
