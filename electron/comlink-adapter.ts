/**
 * Comlink adapter for Electron IPC
 * 
 * This creates endpoints that Comlink can use to communicate
 * between the main process and renderer process.
 */

import type { Endpoint } from 'comlink'
import { ipcMain, type BrowserWindow, type IpcMainEvent } from 'electron'

const CHANNEL = 'comlink-rpc'

/**
 * Creates a Comlink endpoint for the MAIN process
 * This allows the main process to expose an API to the renderer
 */
export function createMainEndpoint(win: BrowserWindow): Endpoint {
  const listeners = new Map<EventListener, (event: IpcMainEvent, data: unknown) => void>()

  return {
    postMessage(message: unknown) {
      win.webContents.send(CHANNEL, message)
    },

    addEventListener(_type: string, listener: EventListenerOrEventListenerObject) {
      const handler = (_event: IpcMainEvent, data: unknown) => {
        if (typeof listener === 'function') {
          listener({ data } as MessageEvent)
        } else {
          listener.handleEvent({ data } as MessageEvent)
        }
      }
      listeners.set(listener as EventListener, handler)
      ipcMain.on(CHANNEL, handler)
    },

    removeEventListener(_type: string, listener: EventListenerOrEventListenerObject) {
      const handler = listeners.get(listener as EventListener)
      if (handler) {
        ipcMain.off(CHANNEL, handler)
        listeners.delete(listener as EventListener)
      }
    },
  }
}

export { CHANNEL }

