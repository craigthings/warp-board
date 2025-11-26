import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Project operations
  openProject: () => ipcRenderer.invoke('project:open'),
  createProject: (projectName: string) => ipcRenderer.invoke('project:create', projectName),

  // File operations
  readFile: (path: string) => ipcRenderer.invoke('file:read', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('file:write', path, content),
  fileExists: (path: string) => ipcRenderer.invoke('file:exists', path),
  mkdir: (path: string) => ipcRenderer.invoke('file:mkdir', path),
  rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('file:rename', oldPath, newPath),
  readdir: (path: string) => ipcRenderer.invoke('file:readdir', path),
  stat: (path: string) => ipcRenderer.invoke('file:stat', path),
})

// Type declarations for the renderer
export interface ElectronAPI {
  openProject: () => Promise<string | null>
  createProject: (projectName: string) => Promise<string | null>
  readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>
  writeFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>
  fileExists: (path: string) => Promise<boolean>
  mkdir: (path: string) => Promise<{ success: boolean; error?: string }>
  rename: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>
  readdir: (path: string) => Promise<{
    success: boolean
    items?: { name: string; isDirectory: boolean; isFile: boolean }[]
    error?: string
  }>
  stat: (path: string) => Promise<{
    success: boolean
    stats?: { isDirectory: boolean; isFile: boolean; size: number; mtime: string }
    error?: string
  }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

