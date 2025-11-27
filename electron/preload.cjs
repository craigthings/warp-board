const { contextBridge, ipcRenderer } = require('electron')

const CHANNEL = 'comlink-rpc'

/**
 * Expose a Comlink-compatible endpoint to the renderer
 * This bridges ipcRenderer to Comlink's message-based API
 */
contextBridge.exposeInMainWorld('comlinkEndpoint', {
  postMessage: (message) => {
    ipcRenderer.send(CHANNEL, message)
  },
  addEventListener: (type, listener) => {
    if (type === 'message') {
      const handler = (_event, data) => {
        listener({ data })
      }
      // Store handler reference for removal
      listener._handler = handler
      ipcRenderer.on(CHANNEL, handler)
    }
  },
  removeEventListener: (type, listener) => {
    if (type === 'message' && listener._handler) {
      ipcRenderer.off(CHANNEL, listener._handler)
    }
  },
})
