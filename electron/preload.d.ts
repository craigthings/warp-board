// Type declarations for the Electron API
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

export {}

