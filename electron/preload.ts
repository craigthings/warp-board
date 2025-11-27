/**
 * Preload script - exposes Comlink-compatible endpoints to the renderer
 */

const { contextBridge, ipcRenderer } = require('electron')

const PREFIX = 'electron-comlink-'

function createEndpoint(channel: string) {
  const fullChannel = PREFIX + channel

  return {
    postMessage(message: unknown) {
      ipcRenderer.send(fullChannel, message)
    },

    addEventListener(type: string, listener: any) {
      if (type !== 'message') return

      const handler = (_event: any, data: unknown) => {
        listener({ data })
      }
      listener._ipcHandler = handler
      ipcRenderer.on(fullChannel, handler)
    },

    removeEventListener(type: string, listener: any) {
      if (type !== 'message') return

      if (listener._ipcHandler) {
        ipcRenderer.off(fullChannel, listener._ipcHandler)
        delete listener._ipcHandler
      }
    },
  }
}

contextBridge.exposeInMainWorld('endpoints', {
  main: createEndpoint('main'),
  renderer: createEndpoint('renderer'),
})

