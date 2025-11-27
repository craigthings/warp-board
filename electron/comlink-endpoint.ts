/**
 * ElectronEndpoint
 * 
 * A Comlink-compatible endpoint for Electron IPC.
 * Inspired by electron-comlink by @mikehall314
 * 
 * Usage (Main Process):
 *   const endpoint = new ElectronEndpoint(win, 'main')
 *   expose(api, endpoint)  // or wrap(endpoint)
 * 
 * Usage (Renderer - via preload):
 *   const mainAPI = wrap(window.endpoints.main)
 *   expose(rendererAPI, window.endpoints.renderer)
 */

import type { Endpoint } from 'comlink'
import { ipcMain, type BrowserWindow, type IpcMainEvent } from 'electron'

const PREFIX = 'electron-comlink-'

type Listener = EventListenerOrEventListenerObject
type Handler = (event: IpcMainEvent, data: unknown) => void

export class ElectronEndpoint implements Endpoint {
  private listeners = new Map<Listener, Handler>()
  private channel: string
  private webContents: Electron.WebContents

  constructor(win: BrowserWindow, channel: string = 'default') {
    this.channel = PREFIX + channel
    this.webContents = win.webContents
  }

  postMessage(message: unknown): void {
    this.webContents.send(this.channel, message)
  }

  addEventListener(_type: string, listener: Listener): void {
    if (this.listeners.has(listener)) return

    const handler: Handler = (_event, data) => {
      const messageEvent = { data } as MessageEvent
      if (typeof listener === 'function') {
        listener(messageEvent)
      } else {
        listener.handleEvent(messageEvent)
      }
    }

    this.listeners.set(listener, handler)
    ipcMain.on(this.channel, handler)
  }

  removeEventListener(_type: string, listener: Listener): void {
    const handler = this.listeners.get(listener)
    if (handler) {
      ipcMain.off(this.channel, handler)
      this.listeners.delete(listener)
    }
  }
}

