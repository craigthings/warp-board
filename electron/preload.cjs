const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Project operations
  openProject: () => ipcRenderer.invoke('project:open'),
  createProject: (projectName) => ipcRenderer.invoke('project:create', projectName),

  // File operations
  readFile: (path) => ipcRenderer.invoke('file:read', path),
  writeFile: (path, content) => ipcRenderer.invoke('file:write', path, content),
  fileExists: (path) => ipcRenderer.invoke('file:exists', path),
  mkdir: (path) => ipcRenderer.invoke('file:mkdir', path),
  rename: (oldPath, newPath) => ipcRenderer.invoke('file:rename', oldPath, newPath),
  readdir: (path) => ipcRenderer.invoke('file:readdir', path),
  stat: (path) => ipcRenderer.invoke('file:stat', path),
})

